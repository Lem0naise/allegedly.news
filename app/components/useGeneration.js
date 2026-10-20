"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_SCENARIO_LENGTH } from "../api/_lib/constants";

export { MAX_SCENARIO_LENGTH };

/** Relative weight of each phase in the progress bar (sums to 100). */
export const SECTION_WEIGHTS = { timeline: 15, content: 45, social: 25, reference: 15 };

export const SECTION_LABELS = {
  timeline: "Event timeline",
  content: "Articles & op-ed",
  social: "Social posts",
  reference: "Reference pages",
};

/** Client-side hard timeouts. Each is above the server's internal budget. */
const SECTION_TIMEOUTS = { timeline: 45000, content: 60000, social: 50000, reference: 50000 };

/** Error codes worth one automatic client-side retry. */
const AUTO_RETRY_CODES = new Set([
  "TIMEOUT",
  "NETWORK",
  "UPSTREAM_ERROR",
  "UPSTREAM_RATE_LIMIT",
  "BAD_MODEL_OUTPUT",
  "EMPTY_RESULT",
]);

const EMPTY_DATA = {
  articles: [],
  oped: null,
  notifications: [],
  tweets: [],
  reddit_posts: [],
  facebook_post: null,
  wikipedia: null,
  google_results: null,
  youtube_videos: [],
  image_urls: [],
};

const ERROR_MESSAGES = {
  TIMEOUT: "The AI took too long to respond. Try again — shorter scenarios usually generate faster.",
  NETWORK: "Lost connection to the server. Check your network and try again.",
  MISSING_API_KEY: "The site is missing its OpenRouter key. The owner needs to configure it.",
  UPSTREAM_AUTH: "The AI provider rejected our credentials. The site owner needs to check the API key.",
  UPSTREAM_RATE_LIMIT: "The AI provider is rate-limiting us. Wait a few seconds, then retry.",
  UPSTREAM_ERROR: "The AI provider returned an error. Retry — this is usually temporary.",
  MODEL_NOT_FOUND: "The configured model doesn’t exist.",
  BAD_MODEL_OUTPUT: "The model returned malformed output. Retrying usually fixes this.",
  EMPTY_RESULT: "The model returned an empty section. Try again or rephrase the scenario.",
  INVALID_SCENARIO: "That scenario can’t be used.",
  INVALID_BODY: "The request was malformed. Reload the page and try again.",
  ABORTED: "Cancelled.",
  INTERNAL_ERROR: "Something went wrong while generating this section.",
};

const ERROR_HINTS = {
  MISSING_API_KEY: "Add OPENROUTER_API_KEY to .env and redeploy.",
  UPSTREAM_AUTH: "Check that OPENROUTER_API_KEY is valid and has credit.",
  MODEL_NOT_FOUND: "Set OPENROUTER_MODEL to a model your key can access.",
  INVALID_SCENARIO: `Keep the scenario under ${MAX_SCENARIO_LENGTH} characters.`,
};

class GenerationError extends Error {
  constructor(code, message, { retryable = false, details } = {}) {
    super(message);
    this.name = "GenerationError";
    this.code = code;
    this.retryable = retryable;
    this.details = details;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function emptySections() {
  return {
    timeline: { status: "pending" },
    content: { status: "pending" },
    social: { status: "pending" },
    reference: { status: "pending" },
  };
}

function statusToCode(status) {
  if (status === 400) return "INVALID_BODY";
  if (status === 401 || status === 403) return "UPSTREAM_AUTH";
  if (status === 404) return "MODEL_NOT_FOUND";
  if (status === 429) return "UPSTREAM_RATE_LIMIT";
  if (status === 504) return "TIMEOUT";
  if (status >= 500) return "UPSTREAM_ERROR";
  return "INTERNAL_ERROR";
}

/** POST JSON with a hard timeout and correct abort/timeout/network classification. */
async function fetchJson(url, payload, { timeoutMs, signal }) {
  const controller = new AbortController();
  let timedOut = false;

  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // Non-JSON body (platform error page, proxy HTML): handled below.
    }

    if (!res.ok) {
      const error = json?.error;
      throw new GenerationError(error?.code ?? statusToCode(res.status), error?.message ?? `Request failed (HTTP ${res.status}).`, {
        retryable: error?.retryable ?? res.status >= 500,
        details: error?.details,
      });
    }

    if (!json || typeof json !== "object") {
      throw new GenerationError("NETWORK", "The server returned an unreadable response.", { retryable: true });
    }

    return json;
  } catch (err) {
    if (err instanceof GenerationError) throw err;
    if (timedOut) {
      throw new GenerationError("TIMEOUT", `The request timed out after ${Math.round(timeoutMs / 1000)}s.`, {
        retryable: true,
      });
    }
    if (signal?.aborted) {
      throw new GenerationError("ABORTED", "The request was cancelled.", { retryable: false });
    }
    throw new GenerationError("NETWORK", err?.message || "Network request failed.", { retryable: true });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

async function requestSection(section, payload, signal) {
  const attempt = async () => {
    const result = await fetchJson(`/api/${section}`, payload, { timeoutMs: SECTION_TIMEOUTS[section], signal });

    // A 200 with nothing renderable is a failure as far as the user is concerned.
    if (section !== "timeline" && countItems(pickSectionData(section, result)) === 0) {
      throw new GenerationError("EMPTY_RESULT", `The ${section} section came back empty.`, { retryable: true });
    }

    return result;
  };

  try {
    return await attempt();
  } catch (err) {
    if (signal?.aborted || !AUTO_RETRY_CODES.has(err.code)) throw err;
    await sleep(900);
    if (signal?.aborted) throw err;
    return attempt();
  }
}

function describeError(err) {
  const code = err?.code ?? "INTERNAL_ERROR";
  return {
    code,
    message: ERROR_MESSAGES[code] ?? ERROR_MESSAGES.INTERNAL_ERROR,
    hint: ERROR_HINTS[code] ?? null,
    retryable: err?.retryable ?? false,
    raw: err?.details ?? err?.message ?? String(err),
  };
}

/** Count the renderable items in a merged result (or one section's payload). */
export function countItems(data) {
  if (!data) return 0;
  return (
    (data.articles?.length ?? 0) +
    (data.oped ? 1 : 0) +
    (data.notifications?.length ?? 0) +
    (data.tweets?.length ?? 0) +
    (data.reddit_posts?.length ?? 0) +
    (data.facebook_post ? 1 : 0) +
    (data.wikipedia ? 1 : 0) +
    (data.google_results ? 1 : 0) +
    (data.youtube_videos?.length ?? 0)
  );
}

function buildHeadlines(articles) {
  if (!Array.isArray(articles)) return [];
  return articles
    .filter((article) => article && typeof article.publication === "string" && typeof article.headline === "string")
    .map((article) => `${article.publication}: "${article.headline}"`)
    .slice(0, 20);
}

/**
 * Attach the generation's image URLs to the cards that can show one.
 * Articles round-robin, the op-ed takes the next slot, Wikipedia takes the last.
 */
function attachImages(data) {
  const urls = Array.isArray(data.image_urls) ? data.image_urls : [];
  if (urls.length === 0) return data;

  const articles = (Array.isArray(data.articles) ? data.articles : []).map((article, index) => ({
    ...article,
    image_url: article.image_url ?? urls[index % urls.length],
  }));

  const oped = data.oped
    ? { ...data.oped, image_url: data.oped.image_url ?? urls[Math.min(articles.length, urls.length - 1)] }
    : null;

  const wikipedia = data.wikipedia
    ? { ...data.wikipedia, image_url: data.wikipedia.image_url ?? urls[urls.length - 1] }
    : null;

  return { ...data, articles, oped, wikipedia };
}

function pickSectionData(section, payload) {
  if (section === "content") {
    return {
      articles: payload.articles ?? [],
      oped: payload.oped ?? null,
      notifications: payload.notifications ?? [],
      image_urls: payload.image_urls ?? [],
    };
  }
  if (section === "social") {
    return {
      tweets: payload.tweets ?? [],
      reddit_posts: payload.reddit_posts ?? [],
      facebook_post: payload.facebook_post ?? null,
    };
  }
  if (section === "reference") {
    return {
      wikipedia: payload.wikipedia ?? null,
      google_results: payload.google_results ?? null,
      youtube_videos: payload.youtube_videos ?? [],
    };
  }
  return {};
}

/**
 * Orchestrates the four short generation endpoints and exposes the state the UI
 * renders. Each section can fail (and be retried) without losing the others.
 */
export function useGeneration() {
  const [phase, setPhase] = useState("idle"); // idle | loading | streaming | done | error
  const [data, setData] = useState(null);
  const [sections, setSections] = useState(emptySections);
  const [statusMessage, setStatusMessage] = useState("");
  const [fatalError, setFatalError] = useState(null);
  const [submittedScenario, setSubmittedScenario] = useState("");

  const runRef = useRef({ id: 0, controller: null, scenario: "", events: [], headlines: [] });

  const isCurrent = (runId, controller) => runRef.current.id === runId && !controller.signal.aborted;

  useEffect(() => {
    return () => {
      runRef.current.id += 1;
      runRef.current.controller?.abort();
    };
  }, []);

  async function runSection(name, payload, runId, controller) {
    try {
      const result = await requestSection(name, payload, controller.signal);
      if (!isCurrent(runId, controller)) return { ok: false, aborted: true };

      if (name === "timeline") runRef.current.events = Array.isArray(result.events) ? result.events : [];

      setSections((prev) => ({ ...prev, [name]: { status: "ok" } }));
      setData((prev) => attachImages({ ...(prev ?? EMPTY_DATA), ...pickSectionData(name, result) }));

      if (name === "content") runRef.current.headlines = buildHeadlines(result.articles);

      // Stay on the loading screen until there is something to show.
      if (name !== "timeline") setPhase((prev) => (prev === "loading" ? "streaming" : prev));
      return { ok: true, data: result };
    } catch (err) {
      if (controller.signal.aborted || !isCurrent(runId, controller)) return { ok: false, aborted: true };

      const described = describeError(err);
      setSections((prev) => ({ ...prev, [name]: { status: "error", error: described } }));
      console.error(`[useGeneration] ${name} failed: ${described.code} — ${described.raw}`);
      return { ok: false, error: described };
    }
  }

  async function generate(input) {
    const scenario = String(input ?? "").trim();
    if (!scenario) return;

    runRef.current.controller?.abort();
    runRef.current.id += 1;

    const runId = runRef.current.id;
    const controller = new AbortController();
    runRef.current = { id: runId, controller, scenario, events: [], headlines: [] };

    setSubmittedScenario(scenario);
    setData(null);
    setFatalError(null);
    setSections({ timeline: { status: "running" }, content: { status: "pending" }, social: { status: "pending" }, reference: { status: "pending" } });
    setPhase("loading");
    setStatusMessage("Creating event timeline…");

    const timeline = await runSection("timeline", { scenario }, runId, controller);
    if (!isCurrent(runId, controller)) return;

    if (!timeline.ok) {
      setFatalError(timeline.error ?? describeError(new Error("Timeline failed")));
      setPhase("error");
      setStatusMessage("");
      return;
    }

    setSections((prev) => ({ ...prev, content: { status: "running" }, social: { status: "running" } }));
    setStatusMessage("Writing articles, op-ed, and social posts…");

    const [content, social] = await Promise.all([
      runSection("content", { scenario, events: runRef.current.events }, runId, controller),
      runSection("social", { scenario, events: runRef.current.events }, runId, controller),
    ]);
    if (!isCurrent(runId, controller)) return;

    setSections((prev) => ({ ...prev, reference: { status: "running" } }));
    setStatusMessage("Building Wikipedia, Google, and YouTube…");

    const reference = await runSection(
      "reference",
      { scenario, events: runRef.current.events, headlines: runRef.current.headlines },
      runId,
      controller
    );
    if (!isCurrent(runId, controller)) return;

    const anyContent = content.ok || social.ok || reference.ok;
    setStatusMessage("");

    if (anyContent) {
      setPhase("done");
    } else {
      setFatalError(content.error ?? social.error ?? reference.error ?? describeError(new Error("Generation failed")));
      setPhase("error");
    }
  }

  async function retrySection(name) {
    const current = runRef.current;
    if (!current.scenario) return;

    const runId = current.id + 1;
    const controller = new AbortController();
    runRef.current = { ...current, id: runId, controller };

    if (name === "timeline") {
      await generate(current.scenario);
      return;
    }

    setSections((prev) => ({ ...prev, [name]: { status: "running" } }));
    setFatalError(null);

    const payload = {
      scenario: current.scenario,
      events: current.events,
      ...(name === "reference" ? { headlines: current.headlines } : {}),
    };

    const result = await runSection(name, payload, runId, controller);
    if (!isCurrent(runId, controller)) return;

    if (result.ok) {
      setPhase((prev) => (prev === "error" ? "done" : prev));
    }
  }

  function cancel() {
    runRef.current.id += 1;
    runRef.current.controller?.abort();
    runRef.current.controller = null;
  }

  function reset() {
    cancel();
    setPhase("idle");
    setData(null);
    setSections(emptySections());
    setStatusMessage("");
    setFatalError(null);
    setSubmittedScenario("");
  }

  const progress = Object.entries(SECTION_WEIGHTS).reduce(
    (total, [name, weight]) => total + (sections[name]?.status === "ok" ? weight : 0),
    0
  );

  const failedSections = Object.entries(sections)
    .filter(([, section]) => section.status === "error")
    .map(([name, section]) => ({ name, label: SECTION_LABELS[name], ...section.error }));

  const isPending = Object.values(sections).some((section) => section.status === "running");

  return {
    phase,
    data,
    sections,
    failedSections,
    isPending,
    progress,
    statusMessage,
    fatalError,
    submittedScenario,
    generate,
    retrySection,
    cancel,
    reset,
  };
}
