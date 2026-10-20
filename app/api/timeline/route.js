import { PHASE0_PROMPT } from "../_lib/prompts";
import { callWithRetry } from "../_lib/openrouter";
import { readBody, requireScenario } from "../_lib/validate";
import { normalizeEvents } from "../_lib/context";
import { AppError, jsonError, jsonOk } from "../_lib/errors";

export const maxDuration = 60;

/**
 * Phase 0 — build the event chronology that every later phase is written from.
 * Kept short (~25s) so the function never approaches its duration limit.
 */
export async function POST(request) {
  try {
    const body = await readBody(request);
    const scenario = requireScenario(body);

    const data = await callWithRetry({
      system: PHASE0_PROMPT,
      user: `Generate an event chronology for this alternative-history scenario: "${scenario}"`,
      maxTokens: 2500,
      timeoutMs: 28000,
      totalBudgetMs: 40000,
      retries: 2,
      signal: request.signal,
      label: "timeline",
      expectedKeys: ["events"],
    });

    const events = normalizeEvents(data?.events);

    if (events.length === 0) {
      throw new AppError("BAD_MODEL_OUTPUT", "The model did not return any timeline events.", {
        status: 502,
        retryable: true,
      });
    }

    return jsonOk({ events });
  } catch (err) {
    console.error(`[timeline] ${err?.code ?? "ERR"}: ${err?.message}`);
    return jsonError(err);
  }
}
