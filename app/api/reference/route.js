import { PHASE2_PROMPT } from "../_lib/prompts";
import { callWithRetry } from "../_lib/openrouter";
import { readBody, readEvents, readHeadlines, requireScenario } from "../_lib/validate";
import { buildReferenceContext } from "../_lib/context";
import { asArray, asGoogleResults, asObject } from "../_lib/normalize";
import { jsonError, jsonOk } from "../_lib/errors";

export const maxDuration = 60;

/** Phase 2 — Wikipedia article, Google SERP, and a YouTube video. */
export async function POST(request) {
  try {
    const body = await readBody(request);
    const scenario = requireScenario(body);
    const events = readEvents(body);
    const headlines = readHeadlines(body);

    const context = buildReferenceContext(scenario, events, headlines);

    const data = await callWithRetry({
      system: PHASE2_PROMPT,
      user: `Generate Wikipedia, Google search results, and YouTube videos for this scenario.\n\n${context}`,
      maxTokens: 3500,
      timeoutMs: 35000,
      totalBudgetMs: 42000,
      retries: 1,
      signal: request.signal,
      label: "reference",
      expectedKeys: ["wikipedia", "google_results", "youtube_videos"],
    });

    return jsonOk({
      wikipedia: asObject(data?.wikipedia),
      google_results: asGoogleResults(data?.google_results),
      youtube_videos: asArray(data?.youtube_videos),
    });
  } catch (err) {
    console.error(`[reference] ${err?.code ?? "ERR"}: ${err?.message}`);
    return jsonError(err);
  }
}
