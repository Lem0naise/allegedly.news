import { MAX_EVENTS } from "./constants";

/** Normalise an event chronology coming from the model or a previous phase. */
export function normalizeEvents(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((event) => event && typeof event === "object" && typeof event.title === "string" && event.title.trim())
    .slice(0, MAX_EVENTS)
    .map((event) => ({
      title: event.title.trim().slice(0, 200),
      description: typeof event.description === "string" ? event.description.trim().slice(0, 1200) : "",
    }));
}

/** Format the scenario + chronology as prompt context. */
export function buildEventContext(scenario, events) {
  const summary = normalizeEvents(events)
    .map((event, index) => `${index + 1}. ${event.title}: ${event.description}`)
    .join("\n\n");

  return `Scenario: "${scenario}"\n\nEvent Chronology:\n${
    summary || "(no chronology available — write from the scenario alone)"
  }`;
}

/** Build the compact headline list used by the reference phase. */
export function buildHeadlines(articles) {
  if (!Array.isArray(articles) || articles.length === 0) return [];

  return articles
    .filter((article) => article && typeof article.publication === "string" && typeof article.headline === "string")
    .map((article) => `${article.publication}: "${article.headline}"`)
    .slice(0, 20);
}

/** Format the reference-phase context from scenario, events, and headlines. */
export function buildReferenceContext(scenario, events, headlines) {
  const base = buildEventContext(scenario, events);
  const list = Array.isArray(headlines) ? headlines.filter((line) => typeof line === "string" && line.trim()) : [];

  const headlineLine =
    list.length > 0
      ? list.join("; ")
      : "No articles were generated — generate reference based on the event chronology alone.";

  return `${base}\n\nArticle headlines:\n${headlineLine}`;
}
