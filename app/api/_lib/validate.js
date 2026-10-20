import { AppError } from "./errors";
import { MAX_SCENARIO_LENGTH } from "./constants";

/** Parse the request body, rejecting non-object/array payloads. */
export async function readBody(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw new AppError("INVALID_BODY", "Request body must be valid JSON.", { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError("INVALID_BODY", "Request body must be a JSON object.", { status: 400 });
  }

  return body;
}

/** Validate and normalise the scenario string. Returns the trimmed value. */
export function requireScenario(body) {
  const raw = body?.scenario;

  if (typeof raw !== "string") {
    throw new AppError("INVALID_SCENARIO", "Please enter a scenario.", { status: 400 });
  }

  const scenario = raw.trim();

  if (!scenario) {
    throw new AppError("INVALID_SCENARIO", "Please enter a scenario.", { status: 400 });
  }

  if (scenario.length > MAX_SCENARIO_LENGTH) {
    throw new AppError(
      "INVALID_SCENARIO",
      `Scenarios are limited to ${MAX_SCENARIO_LENGTH} characters (got ${scenario.length}).`,
      { status: 400 }
    );
  }

  return scenario;
}

/** Optional chronology passed between phases. Invalid input degrades to []. */
export function readEvents(body) {
  return Array.isArray(body?.events) ? body.events : [];
}

/** Optional article headline strings built by the client. */
export function readHeadlines(body) {
  if (!Array.isArray(body?.headlines)) return [];
  return body.headlines
    .filter((line) => typeof line === "string" && line.trim())
    .map((line) => line.trim().slice(0, 300))
    .slice(0, 20);
}
