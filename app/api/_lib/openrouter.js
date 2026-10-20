import { AppError } from "./errors";
import { DEFAULT_MODEL } from "./constants";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

function currentModel() {
  return process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
}

/**
 * Reasoning tokens count against `max_tokens`. On reasoning-capable models a long
 * chain of thought can consume the whole budget and truncate the JSON, so reasoning
 * is disabled by default for this creative/structured-output workload.
 * Set OPENROUTER_REASONING=on to let the provider decide.
 */
function reasoningParam() {
  const setting = (process.env.OPENROUTER_REASONING || "off").trim().toLowerCase();
  if (setting === "on" || setting === "auto" || setting === "default") return {};
  return { reasoning: { enabled: false } };
}

/**
 * OpenRouter routes each request to one of many hosting providers, and their prices
 * and speeds differ a lot for the same model (often by 10x or more). Pinning a
 * preferred provider keeps cost and latency predictable; `allow_fallbacks` still
 * lets OpenRouter pick another provider when the preferred one is unavailable.
 *
 * Set OPENROUTER_PROVIDER_ORDER to a comma-separated list, e.g. "Decart,Sail Research".
 * Leave it unset (or "none") for OpenRouter's default routing.
 */
function providerParam() {
  const raw = (process.env.OPENROUTER_PROVIDER_ORDER || "").trim();
  if (!raw || raw.toLowerCase() === "none") return {};

  const order = raw
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  if (order.length === 0) return {};
  return { provider: { order, allow_fallbacks: true } };
}

function badOutput(message) {
  return new AppError("BAD_MODEL_OUTPUT", message, { status: 502, retryable: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Remove Markdown code fences that some models wrap JSON in. */
export function stripCodeFence(content) {
  return String(content)
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

/**
 * Parse a model reply into an object.
 *
 * Tries the fenced body first, then a brace slice (handles prose around the JSON).
 * Throws BAD_MODEL_OUTPUT (retryable) when nothing parses or the expected key is absent.
 */
export function parseModelJson(content, expectedKeys = []) {
  if (typeof content !== "string" || !content.trim()) {
    throw badOutput("The model returned an empty response.");
  }

  const candidates = [stripCodeFence(content)];
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(content.slice(firstBrace, lastBrace + 1));
  }

  let parseError;
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const hasExpectedKey =
        expectedKeys.length === 0 ||
        (parsed && typeof parsed === "object" && expectedKeys.some((key) => key in parsed));
      if (!hasExpectedKey) {
        parseError = new Error(`missing expected key (${expectedKeys.join(" | ")})`);
        continue;
      }
      return parsed;
    } catch (err) {
      parseError = err;
    }
  }

  throw badOutput(`The model returned malformed JSON (${parseError?.message ?? "unknown parse error"}).`);
}

/** Prefer the provider's own error message over the raw body (avoids leaking ids). */
function upstreamSnippet(text) {
  try {
    const parsed = JSON.parse(text);
    const message = parsed?.error?.message ?? parsed?.message;
    if (typeof message === "string" && message.trim()) {
      return message.replace(/\s+/g, " ").slice(0, 200);
    }
  } catch {
    // Not JSON — fall through to the raw body.
  }
  return String(text || "").replace(/\s+/g, " ").slice(0, 200);
}

/** Translate a non-OK OpenRouter response into an AppError. */
function upstreamError(status, text) {
  const snippet = upstreamSnippet(text);
  const lower = snippet.toLowerCase();

  if (status === 401 || status === 403) {
    return new AppError("UPSTREAM_AUTH", "The AI provider rejected the API key.", {
      status: 502,
      details: snippet,
    });
  }

  const looksLikeModelProblem =
    lower.includes("model") &&
    /invalid|unknown|unsupported|not a valid|not found|no such|does not exist/.test(lower);

  if (status === 404 || (status === 400 && looksLikeModelProblem)) {
    return new AppError("MODEL_NOT_FOUND", `The configured model "${currentModel()}" is unavailable.`, {
      status: 502,
      details: snippet,
    });
  }

  if (status === 429) {
    return new AppError("UPSTREAM_RATE_LIMIT", "The AI provider is rate-limiting requests.", {
      status: 502,
      retryable: true,
      details: snippet,
    });
  }

  if (status >= 500 || status === 408) {
    return new AppError("UPSTREAM_ERROR", "The AI provider returned an error.", {
      status: 502,
      retryable: true,
      details: snippet,
    });
  }

  // Remaining 4xx: only retry when the wording suggests a transient/schema issue.
  return new AppError("UPSTREAM_ERROR", `The AI provider rejected the request (HTTP ${status}).`, {
    status: 502,
    retryable: /response_format|json|temporar|overload|try again/.test(lower),
    details: snippet,
  });
}

/** Parse Retry-After (seconds or HTTP date) into a capped millisecond delay. */
function retryAfterMs(headers) {
  const raw = headers?.get?.("retry-after");
  if (!raw) return null;

  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.min(Math.max(seconds * 1000, 0), 5000);

  const timestamp = Date.parse(raw);
  if (!Number.isNaN(timestamp)) return Math.min(Math.max(timestamp - Date.now(), 0), 5000);

  return null;
}

/** One OpenRouter request with its own timeout and abort wiring. */
async function callOnce({ system, user, maxTokens, timeoutMs, signal, label, expectedKeys, useReasoning = true }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new AppError("MISSING_API_KEY", "OPENROUTER_API_KEY is not configured on the server.", { status: 500 });
  }

  if (signal?.aborted) {
    throw new AppError("ABORTED", "The request was cancelled.", { status: 499 });
  }

  const controller = new AbortController();
  let timedOut = false;
  const onAbort = () => controller.abort();

  signal?.addEventListener("abort", onAbort, { once: true });
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, Math.max(timeoutMs, 1000));

  const startedAt = Date.now();

  try {
    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://allegedly.news",
        "X-Title": "Allegedly News",
      },
      body: JSON.stringify({
        model: currentModel(),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: 0.9,
        max_tokens: maxTokens,
        ...(useReasoning ? reasoningParam() : {}),
        ...providerParam(),
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const error = upstreamError(res.status, text);
      if (/reasoning/i.test(text)) error.reasoningUnsupported = true;
      const wait = retryAfterMs(res.headers);
      if (wait != null) error.retryAfterMs = wait;
      throw error;
    }

    const raw = await res.text();
    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new AppError("UPSTREAM_ERROR", "The AI provider returned an unreadable response.", {
        status: 502,
        retryable: true,
      });
    }

    const choice = json?.choices?.[0];
    if (!choice) {
      throw new AppError("UPSTREAM_ERROR", "The AI provider returned an empty response.", {
        status: 502,
        retryable: true,
      });
    }

    if (choice.finish_reason === "length") {
      throw badOutput("The model's reply was cut off at the token limit.");
    }

    const parsed = parseModelJson(choice.message?.content, expectedKeys);
    console.log(`[${label}] ok ${Date.now() - startedAt}ms keys=${Object.keys(parsed).join(",")}`);
    return parsed;
  } catch (err) {
    if (signal?.aborted) {
      throw new AppError("ABORTED", "The request was cancelled.", { status: 499 });
    }
    if (timedOut) {
      throw new AppError(
        "TIMEOUT",
        `The AI provider did not respond within ${Math.round(timeoutMs / 1000)}s.`,
        { status: 504, retryable: true }
      );
    }
    if (err instanceof AppError) throw err;
    if (err instanceof TypeError) {
      throw new AppError("UPSTREAM_ERROR", `Could not reach the AI provider (${err.message}).`, {
        status: 502,
        retryable: true,
      });
    }
    throw err;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

/**
 * Call the model with bounded retries.
 *
 * `totalBudgetMs` guards the whole phase: no attempt starts with less than 5s left,
 * and the per-attempt timeout is clamped to the remaining budget.
 */
export async function callWithRetry({
  system,
  user,
  maxTokens = 3000,
  timeoutMs = 45000,
  totalBudgetMs = 55000,
  retries = 1,
  signal,
  label = "llm",
  expectedKeys = [],
}) {
  const phaseStartedAt = Date.now();
  const deadline = phaseStartedAt + totalBudgetMs;
  let lastError;
  // Some models reject the `reasoning` field; fall back to omitting it.
  let sendReasoning = true;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (signal?.aborted) {
      throw new AppError("ABORTED", "The request was cancelled.", { status: 499 });
    }

    const remaining = deadline - Date.now();
    if (remaining < 5000) {
      throw (
        lastError ??
        new AppError("TIMEOUT", "Ran out of time before the model responded.", { status: 504, retryable: true })
      );
    }

    const attemptTimeout = Math.min(timeoutMs, remaining - 1000);
    // Truncated replies are retried with more headroom.
    const attemptTokens = attempt === 0 ? maxTokens : Math.min(Math.round(maxTokens * 1.5), 12000);

    try {
      return await callOnce({
        system,
        user,
        maxTokens: attemptTokens,
        timeoutMs: attemptTimeout,
        signal,
        label,
        expectedKeys,
        useReasoning: sendReasoning,
      });
    } catch (err) {
      lastError = err;

      if (err?.reasoningUnsupported && sendReasoning) {
        console.log(`[${label}] model rejected the reasoning parameter; retrying without it`);
        sendReasoning = false;
        err.retryable = true;
      }

      const canRetry = err instanceof AppError ? err.retryable : true;
      const isLast = attempt === retries;

      console.log(
        `[${label}] attempt ${attempt + 1}/${retries + 1} failed (${Date.now() - phaseStartedAt}ms): ${err?.code ?? "ERR"} ${err?.message}`
      );

      if (isLast || !canRetry || signal?.aborted) throw err;

      const backoff = err.retryAfterMs ?? Math.min(1000 * 2 ** attempt, 5000);
      const sleepFor = Math.min(backoff, Math.max(deadline - Date.now() - 1000, 0));
      if (sleepFor > 0) await sleep(sleepFor);
    }
  }

  throw lastError;
}
