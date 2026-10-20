// Pure constants shared by the API routes and the client.
// This module must stay dependency-free: client components import from it.

/** Maximum accepted scenario length (characters, after trimming). */
export const MAX_SCENARIO_LENGTH = 280;

/** Maximum number of search-result images retained per generation. */
export const MAX_IMAGES = 10;

/** Maximum number of chronology events passed between phases. */
export const MAX_EVENTS = 10;

/**
 * Default OpenRouter model when OPENROUTER_MODEL is not set.
 *
 * DeepSeek V4 Flash is the cheapest model that is fast enough for the phase budgets
 * (measured ~0.0003 USD per full generation through OpenRouter's cheapest endpoint).
 * A newer alternative is "deepseek/deepseek-v4.1-flash" — see AGENTS.md §9 for the
 * cost/speed trade-off.
 */
export const DEFAULT_MODEL = "deepseek/deepseek-v4-flash";

/** Response headers applied to every JSON route response. */
export const NO_STORE_HEADERS = { "Cache-Control": "no-store" };
