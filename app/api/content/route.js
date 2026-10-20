import { PHASE1A_PROMPT } from "../_lib/prompts";
import { callWithRetry } from "../_lib/openrouter";
import { readBody, readEvents, requireScenario } from "../_lib/validate";
import { buildEventContext } from "../_lib/context";
import { asArray, asObject } from "../_lib/normalize";
import { fetchSerperImages } from "../_lib/images";
import { jsonError, jsonOk } from "../_lib/errors";

export const maxDuration = 60;

/**
 * Phase 1a — news articles, one op-ed, and push alerts.
 * Also performs the image search for this generation (images are optional).
 */
export async function POST(request) {
  try {
    const body = await readBody(request);
    const scenario = requireScenario(body);
    const events = readEvents(body);

    const eventContext = buildEventContext(scenario, events);

    const data = await callWithRetry({
      system: PHASE1A_PROMPT,
      user: `${eventContext}\n\nGenerate 8 news articles, 1 op-ed, and 2-3 push notification alerts. Each must cover a DIFFERENT event from the chronology above.`,
      maxTokens: 8000,
      timeoutMs: 45000,
      totalBudgetMs: 50000,
      retries: 1,
      signal: request.signal,
      label: "content",
      expectedKeys: ["articles", "oped", "notifications"],
    });

    const articles = asArray(data?.articles);
    const oped = asObject(data?.oped);
    const notifications = asArray(data?.notifications);

    const imageQuery =
      typeof data?.image_search_query === "string" && data.image_search_query.trim()
        ? data.image_search_query.trim().slice(0, 200)
        : scenario;

    const imageUrls = await fetchSerperImages(imageQuery);

    return jsonOk({
      articles,
      oped,
      notifications,
      image_search_query: imageQuery,
      image_urls: imageUrls,
    });
  } catch (err) {
    console.error(`[content] ${err?.code ?? "ERR"}: ${err?.message}`);
    return jsonError(err);
  }
}
