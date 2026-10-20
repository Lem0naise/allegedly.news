import { NextResponse } from "next/server";
import { NO_STORE_HEADERS } from "./constants";

/**
 * A structured, client-safe error.
 *
 * Routes never leak raw upstream payloads: the `message` is written for humans and
 * `retryable` tells the client whether offering a Retry button makes sense.
 */
export class AppError extends Error {
  constructor(code, message, { status = 500, retryable = false, details } = {}) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.retryable = retryable;
    this.details = details;
  }
}

/** Map an unknown thrown value onto an AppError (never throws). */
export function toAppError(err) {
  if (err instanceof AppError) return err;

  if (err?.name === "AbortError") {
    return new AppError("ABORTED", "The request was cancelled.", { status: 499, retryable: false });
  }

  // `fetch` throws TypeError for DNS failures, resets, and offline conditions.
  if (err instanceof TypeError) {
    return new AppError("UPSTREAM_ERROR", `Could not reach the AI provider (${err.message}).`, {
      status: 502,
      retryable: true,
    });
  }

  return new AppError("INTERNAL_ERROR", "Something went wrong while generating this section.", {
    status: 500,
    retryable: true,
  });
}

/** Serialise an error for a Response body. */
export function toJsonError(err) {
  const appError = toAppError(err);
  return {
    status: appError.status,
    body: {
      error: {
        code: appError.code,
        message: appError.message,
        retryable: appError.retryable,
        ...(appError.details ? { details: String(appError.details).slice(0, 300) } : {}),
      },
    },
  };
}

/** Build a JSON error Response. */
export function jsonError(err) {
  const { status, body } = toJsonError(err);
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

/** Build a JSON success Response. */
export function jsonOk(body) {
  return NextResponse.json(body, { headers: NO_STORE_HEADERS });
}
