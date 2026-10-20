import { PHASE1B_PROMPT } from "../_lib/prompts";
import { callWithRetry } from "../_lib/openrouter";
import { readBody, readEvents, requireScenario } from "../_lib/validate";
import { buildEventContext } from "../_lib/context";
import { asArray, asObject } from "../_lib/normalize";
import { jsonError, jsonOk } from "../_lib/errors";

export const maxDuration = 60;

/** Phase 1b — tweets, Reddit posts, and one Facebook share. */
export async function POST(request) {
  try {
    const body = await readBody(request);
    const scenario = requireScenario(body);
    const events = readEvents(body);

    const eventContext = buildEventContext(scenario, events);

    const data = await callWithRetry({
      system: PHASE1B_PROMPT,
      user: `${eventContext}\n\nGenerate 6 tweets, 4 Reddit posts, and 1 Facebook post reacting to these events.`,
      maxTokens: 6500,
      timeoutMs: 35000,
      totalBudgetMs: 42000,
      retries: 1,
      signal: request.signal,
      label: "social",
      expectedKeys: ["tweets", "reddit_posts", "facebook_post"],
    });

    return jsonOk({
      tweets: asArray(data?.tweets),
      reddit_posts: asArray(data?.reddit_posts),
      facebook_post: asObject(data?.facebook_post),
    });
  } catch (err) {
    console.error(`[social] ${err?.code ?? "ERR"}: ${err?.message}`);
    return jsonError(err);
  }
}
