import { MAX_IMAGES } from "./constants";

const SERPER_IMAGES_URL = "https://google.serper.dev/images";

// Hosts that serve hotlink-protected or mixed-content images; drop them early.
const BLOCKED_HOSTS = [
  "lookaside.instagram.com",
  "scontent.cdninstagram.com",
  "lookaside.fbsbx.com",
  "fbcdn.net",
  "tiktok.com",
];

/**
 * Keep only usable image URLs: https, not blocked, de-duplicated, capped.
 * Applied server-side so the client never receives a URL it cannot render.
 */
export function normalizeImageUrls(urls, count = MAX_IMAGES) {
  if (!Array.isArray(urls)) return [];

  const seen = new Set();
  const result = [];

  for (const value of urls) {
    if (typeof value !== "string" || !value.trim()) continue;

    let parsed;
    try {
      parsed = new URL(value);
    } catch {
      continue;
    }

    if (parsed.protocol !== "https:") continue;

    const host = parsed.hostname.toLowerCase();
    if (BLOCKED_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))) continue;

    const href = parsed.href;
    if (seen.has(href)) continue;

    seen.add(href);
    result.push(href);
    if (result.length >= count) break;
  }

  return result;
}

/**
 * Google image search via Serper.dev.
 * Returns [] when the key is missing or the upstream call fails — images are optional.
 */
export async function fetchSerperImages(query, count = MAX_IMAGES) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return [];

  const q = typeof query === "string" ? query.trim() : "";
  if (!q) return [];

  try {
    const res = await fetch(SERPER_IMAGES_URL, {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      console.warn(`[images] serper returned HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    const candidates = Array.isArray(data?.images)
      ? data.images.map((image) => image?.imageUrl ?? image?.thumbnailUrl)
      : [];

    return normalizeImageUrls(candidates, count);
  } catch (err) {
    console.warn(`[images] search failed: ${err?.message ?? err}`);
    return [];
  }
}
