# AGENTS.md — Allegedly News

A maintainer's and contributor's guide to this repository. Read this before changing
anything; it explains what the project is, which file does what, how data flows, how
failures are handled, and where the sharp edges are.

---

## 1. What this project is

**allegedly.news** is a satirical "alternative history" news generator. You type a
counterfactual scenario (e.g. *"If Jeremy Corbyn won in 2017…"*), and the app
generates a full media ecosystem around it: newspaper front pages, an op-ed, phone
push alerts, tweets, Reddit posts, a Facebook share, a Wikipedia article, Google
search results, and a YouTube video — then lays them out as a Pinterest-style
masonry timeline that can be downloaded as a PNG.

It is a **single-page Next.js App Router application** with four small JSON API
routes. There is no database, no auth, no CMS, and no server-side state. Content is
produced on demand by an LLM (via OpenRouter) and image search (via Serper.dev),
rendered client-side, and never persisted.

### A note on the `readme.md`

The old readme described the site's previous Jekyll incarnation (Markdown posts in
`_posts/`). That architecture was removed in commit `dcc45a6` (2026-03-31) — the
Jekyll config, `_layouts/`, `_includes/`, `_posts/`, Gemfile, and CNAME were all
deleted. **`_posts/` does not exist**; adding Markdown articles does nothing. The
readme now reflects the current product.

---

## 2. Quick start

```bash
# Node 20+ (developed on Node 26). npm is the only package manager in use.
npm ci                 # installs from package-lock.json (node_modules is gitignored)

# Configure secrets (see §9). .env is gitignored.
cp .env.example .env   # then fill in OPENROUTER_API_KEY (SERPER_API_KEY optional)

npm run dev            # http://localhost:3000
```

Available scripts (that's all of them — there is no lint, test, or typecheck script):

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server with Fast Refresh on port 3000 |
| `npm run build` | Production build; the main automated gate for a change |
| `npm start` | Serve the production build (requires `npm run build` first) |

There is **no test suite, no ESLint config, no Prettier config, and no TypeScript**.
`.next/` is stale build output, gitignored, and safe to delete.

If `npm ci` fails with `EROFS`/`EACCES` on the npm cache (common in sandboxes), point
the cache somewhere writable: `npm ci --cache /tmp/npm-cache`.

---

## 3. Technology stack

| Layer | Technology | Version / notes |
| --- | --- | --- |
| Framework | **Next.js** (App Router) | `^15.3.0` (lockfile resolves 15.5.x) |
| UI runtime | **React 19** | `^19.0.0`; Server Components for page/header/footer, Client Components for generation & cards |
| Language | **JavaScript (JSX)** | No TypeScript. `jsconfig.json` defines `@/*` → repo root (unused by source) |
| Styling | **Hand-written global CSS** | One `app/globals.css` (~2.7k lines); no Tailwind, no CSS modules, no CSS-in-JS |
| Fonts | **Google Fonts** via CSS `@import` | Playfair Display, Inter, DM Serif Text, PT Serif Caption, Radley, Slabo 13px/27px |
| LLM provider | **OpenRouter** chat completions API | Model defaults to `deepseek/deepseek-v4-flash`, overridable with `OPENROUTER_MODEL` |
| Image search | **Serper.dev** Google Images API | Optional; no key ⇒ cards render without photos |
| Transport | **Plain JSON over `fetch`** | Four short POST routes; no SSE, no long-lived connections |
| Screenshot export | **html2canvas-pro** | Dynamically imported on demand |
| Icons/graphics | Hand-authored inline SVG + PNG/WEBP/ICO in `public/icons/` | No icon library |
| Hosting | **Vercel-compatible Node runtime** | `.gitignore` ignores `.vercel`; every route sets `maxDuration = 60`; no committed deployment config |

The dependency surface is deliberately tiny: four production dependencies. **Do not
add a package without a strong reason.**

---

## 4. Repository map

```
allegedly.news/
├── app/                          # Next.js App Router root (the entire app)
│   ├── layout.js                 # Root layout: metadata, favicons, OG/Twitter tags
│   ├── page.js                   # "/" route: <Header/> + <ScenarioForm/> + <Footer/>
│   ├── globals.css               # All styling for every card and state
│   ├── api/
│   │   ├── _lib/                 # Shared server code (private folder — not routed)
│   │   │   ├── constants.js      # MAX_SCENARIO_LENGTH, MAX_IMAGES, model default, headers
│   │   │   ├── errors.js         # AppError, JSON error/ok responses (imports NextResponse)
│   │   │   ├── validate.js       # body parsing, scenario/events/headlines validation
│   │   │   ├── prompts.js        # The four phase prompts + their JSON examples
│   │   │   ├── context.js        # prompt context builders + event normalisation
│   │   │   ├── normalize.js      # asArray / asObject / asGoogleResults guards
│   │   │   ├── openrouter.js     # LLM call, timeout, retry, truncation & JSON recovery
│   │   │   └── images.js         # Serper search + https/dedupe/blocklist filtering
│   │   ├── timeline/route.js     # Phase 0 — 6–8 event chronology
│   │   ├── content/route.js      # Phase 1a — articles + op-ed + push alerts + images
│   │   ├── social/route.js       # Phase 1b — tweets + Reddit + Facebook
│   │   └── reference/route.js    # Phase 2 — Wikipedia + Google + YouTube
│   └── components/
│       ├── ScenarioForm.jsx      # Client shell: form, loading, section errors, toolbar
│       ├── useGeneration.js      # Hook: orchestrates the 4 routes, retries, state
│       ├── SafeImage.jsx         # <img> that falls back to a neutral placeholder
│       ├── TimelineMosaic.jsx    # Orders items and maps type → card component
│       ├── NewsCard.jsx          # Publication-styled article card + PUBLICATION_STYLES
│       ├── OpEdCard.jsx          # Opinion column with byline/avatar
│       ├── PushNotificationCard.jsx # Phone lock-screen alert
│       ├── TweetCard.jsx         # X/Twitter post replica
│       ├── RedditCard.jsx        # Reddit feed card
│       ├── FacebookCard.jsx      # Shared-link post
│       ├── WikipediaCard.jsx     # Wikipedia article (infobox + lead; sections optional)
│       ├── GoogleResultsCard.jsx # Google SERP replica
│       ├── YouTubeCard.jsx       # Video card
│       ├── Header.jsx            # Server Component, no state
│       └── Footer.jsx            # Server Component, no state
├── public/icons/                 # Favicons and site logo
├── next.config.mjs               # Empty config (kept as the Next convention)
├── jsconfig.json                 # `@/*` path alias only
├── package.json / package-lock.json
├── .env.example                  # All five env vars, placeholders only
├── .env                          # Local secrets — gitignored, never commit
├── readme.md                     # Product-focused quick start
└── AGENTS.md                     # This file
```

Everything ships from `app/`. There is no `src/`, `pages/`, `lib/`, or `utils/` —
shared server helpers live in `app/api/_lib/`, client helpers in
`app/components/`.

**Why `_lib`?** Next.js does not route folders whose name starts with `_`, so this is
the idiomatic place for server-only modules next to route handlers. `constants.js` is
the one module also imported by the client (it is dependency-free); everything else in
`_lib` is server-only.

### File-by-file: what to edit for what

| I want to… | Edit |
| --- | --- |
| Change what the LLM produces (fields, counts, tone, publications) | The `PHASE*_PROMPT` strings in `app/api/_lib/prompts.js` |
| Change model, temperature, token limits, timeouts, retries | `callLLM`/`callWithRetry` and the per-route `callWithRetry({...})` arguments |
| Change validation limits | `app/api/_lib/constants.js` + `app/api/_lib/validate.js` |
| Change image search or its blocklist | `app/api/_lib/images.js` |
| Change page metadata / SEO / favicons | `app/layout.js` |
| Change the landing page, loading screen, toolbar, section errors | `app/components/ScenarioForm.jsx` |
| Change orchestration, client timeouts, retries, error copy | `app/components/useGeneration.js` |
| Change card order/interleaving | `buildTimelineItems` in `app/components/TimelineMosaic.jsx` |
| Change a publication's look | `PUBLICATION_STYLES` + `matchPublication` in `NewsCard.jsx` (colours are CSS variables, no CSS needed) |
| Add a brand-new content type | Follow the checklist in §6 |
| Change dark-mode colours | The `.dark-mode …` rules grouped with each card's block in `globals.css` |
| Change column counts / breakpoints | `.timeline-mosaic` and the `RESPONSIVE BREAKPOINTS` block at the end of `globals.css` |

---

## 5. Architecture and request lifecycle

The generation is split into four short requests so a slow model, a network blip, or
a platform timeout can only lose **one section**, never the whole page.

```
Browser (useGeneration)                     API routes (each maxDuration = 60s)
───────────────────────                     ───────────────────────────────────
POST /api/timeline  { scenario }
      │  → { events }                         Phase 0, timeout 28s, 2 retries
      │
      ├── POST /api/content { scenario, events }   ─┐  run in parallel
      └── POST /api/social  { scenario, events }   ─┘  (timeout 45s / 35s)
                    │
                    │  content → { articles, oped, notifications, image_urls }
                    │  social  → { tweets, reddit_posts, facebook_post }
                    │
                    └── POST /api/reference { scenario, events, headlines }
                               → { wikipedia, google_results, youtube_videos }
                                  (timeout 35s; headlines fall back to events)
```

Worst-case wall time is about 28 + 45 + 35 ≈ 108 s spread across four independent
requests; **no single function call is designed to exceed ~45 s** (plus a 6 s Serper
call inside `/api/content`), comfortably inside `maxDuration = 60`.

### Endpoint contracts

All routes are `POST`, JSON in / JSON out, `Cache-Control: no-store`.

| Endpoint | Request | Response | Notes |
| --- | --- | --- | --- |
| `/api/timeline` | `{ scenario }` | `{ events: [{ title, description }] }` | Rejects an empty chronology as `BAD_MODEL_OUTPUT` |
| `/api/content` | `{ scenario, events }` | `{ articles, oped, notifications, image_search_query, image_urls }` | Runs Serper after the LLM returns; image failure never fails the section |
| `/api/social` | `{ scenario, events }` | `{ tweets, reddit_posts, facebook_post }` | — |
| `/api/reference` | `{ scenario, events, headlines? }` | `{ wikipedia, google_results, youtube_videos }` | `headlines` omitted when content failed |

Every field is normalised server-side (`asArray`/`asObject`/`asGoogleResults`), so a
model that omits a key yields an empty list rather than a crash.

### Error contract

Failures always come back as `{ error: { code, message, retryable, details? } }`.
`message` is human-facing and `details` is a short upstream snippet.

| `code` | HTTP | Meaning / retryable |
| --- | --- | --- |
| `INVALID_SCENARIO` | 400 | missing/empty/too long scenario — not retryable |
| `INVALID_BODY` | 400 | unparseable or non-object body — not retryable |
| `MISSING_API_KEY` | 500 | `OPENROUTER_API_KEY` unset — not retryable |
| `MODEL_NOT_FOUND` | 502 | model id rejected by the provider — not retryable |
| `UPSTREAM_AUTH` | 502 | provider 401/403 — not retryable |
| `UPSTREAM_RATE_LIMIT` | 502 | provider 429 — retryable |
| `UPSTREAM_ERROR` | 502 | other provider error / network failure — retryable |
| `BAD_MODEL_OUTPUT` | 502 | unparseable/truncated JSON — retryable |
| `TIMEOUT` | 504 | per-call or budget timeout — retryable |
| `ABORTED` | 499 | client cancelled — not retryable |
| `INTERNAL_ERROR` | 500 | unexpected — retryable |

**Server retries** (`callWithRetry`): bounded by `retries` and `totalBudgetMs`.
Retries network errors, timeouts, 408/429/5xx, and `BAD_MODEL_OUTPUT`; never retries
400/401/403/404. Backoff is 1 s → 2 s (capped 5 s), honouring `Retry-After`. A retry
after truncation gets 1.5× the `max_tokens` (capped 12 000). Client cancellation is
propagated through `request.signal`, so cancelling stops the upstream call instead of
burning tokens.

**Client retries** (`useGeneration`): each section retries **once** automatically for
`TIMEOUT`, `NETWORK`, `UPSTREAM_ERROR`, `UPSTREAM_RATE_LIMIT`, `BAD_MODEL_OUTPUT`,
then surfaces a section error with a manual **Retry** button.

**Model-output recovery** (`parseModelJson`): strips Markdown fences, then falls back
to slicing from the first `{` to the last `}`, then checks that at least one expected
top-level key exists. `finish_reason === "length"` is treated as truncated output.

### Result data shape (the contract between routes and cards)

```js
{
  articles: [{ publication, article_type, headline, subheadline, timestamp, image_url }],
  oped:     { publication, author, author_title, headline, content, timestamp, image_url },
  notifications: [{ app_name, headline, preview, timestamp }],
  tweets:   [{ author_name, author_handle, verified, content, timestamp,
               retweets, likes, views, replies }],
  reddit_posts: [{ subreddit, title, upvotes, comment_count, author, timestamp, flair }],
  facebook_post: { sharer_name, sharer_comment, shared_headline, shared_source,
                   shared_description, reactions: { like, love, wow, angry, sad, haha },
                   shares, top_comment_author, top_comment, timestamp },
  wikipedia: { title, infobox: { type, image_caption, fields: [{ label, value }] }, lead, image_url },
  google_results: { query, results: [{ title, url, snippet }] },
  youtube_videos: [{ title, channel, views, timestamp, duration, description_preview }],
  image_urls: ["https://…"]
}
```

Notes:

* `wikipedia.sections` and `wikipedia.categories` are rendered by `WikipediaCard` but
  not requested by the prompt (it asks for infobox + lead only). Supporting them is a
  one-line prompt change.
* Images are attached **client-side** by `attachImages()`: articles round-robin, the
  op-ed takes `min(articles.length, urls.length - 1)`, Wikipedia takes the last one.
* There is deliberately no `developments` field any more (see §10).
* `image_search_query` is returned by `/api/content` for debugging; the client does not
  use it after the request.

### Phase parameters

| Phase | Route | max_tokens | timeout | budget | retries | expected key |
| --- | --- | --- | --- | --- | --- | --- |
| 0 — chronology | `timeline` | 2500 | 28 s | 40 s | 2 | `events` |
| 1a — articles/op-ed/alerts | `content` | 8000 | 45 s | 50 s | 1 | `articles` |
| 1b — social | `social` | 6500 | 35 s | 42 s | 1 | `tweets` |
| 2 — reference | `reference` | 3500 | 35 s | 42 s | 1 | `wikipedia` |

`temperature: 0.9`, `response_format: { type: "json_object" }`, and OpenRouter
attribution headers (`HTTP-Referer`, `X-Title`) are set in `callOnce`.

**Reasoning tokens are disabled by default** (`reasoning: { enabled: false }`). The
default model is reasoning-capable, and reasoning tokens count against `max_tokens`:
a long chain of thought could consume the whole budget, truncate the JSON, and turn
into a `BAD_MODEL_OUTPUT` failure. For a structured creative-writing workload,
reasoning only adds latency and cost. Set `OPENROUTER_REASONING=on` to let the
provider decide. If a model rejects the parameter, `callWithRetry` retries once
without it automatically.

---

## 6. How to add a new content type (the most likely contribution)

Example: adding "TikTok comments". Five files, in this order:

1. **`app/api/_lib/prompts.js`** — add a `## TIKTOK COMMENTS` section **and** the
   matching key to that prompt's JSON example.
2. **The relevant route** (`content`, `social`, or `reference`) — add the field to the
   response object using `asArray`/`asObject` so it is normalised.
3. **`app/components/useGeneration.js`** — add the field to `EMPTY_DATA`, to
   `pickSectionData()` for the right section, and (if it is a count-worthy item) to
   `ScenarioForm`'s `countItems`.
4. **Create `app/components/<Name>Card.jsx`** — `"use client"`, one prop, `return
   null` when missing, reuse the class-name conventions in §8.
5. **`app/components/TimelineMosaic.jsx`** — push the item in `buildTimelineItems`
   with a unique `id` and a bucket/priority, and add the type to `TimelineItem`'s
   `switch`.
6. **`app/globals.css`** — add a `<CARD> CARD` section in the existing order (card
   styles, then a `.dark-mode` cluster), plus a responsive tweak if needed.

Verify with `npm run build`, then run the §12 checklist.

### Adding a publication style

`NewsCard.jsx` has a `PUBLICATION_STYLES` map (19 publications) plus
`matchPublication()`, which lowercases, strips non-alphanumerics, and substring
matches. Anything unmatched falls back to a generic broadsheet. Colours/fonts are
passed as inline CSS variables (`--nc-*`), so a new style usually needs **no CSS**.
Watch out: `matchPublication` is order-sensitive — e.g. the `times` branch must not
shadow `newyorktimes`.

---

## 7. Frontend architecture

### `useGeneration.js` — the orchestrator

The hook owns everything network-related and exposes:

* `phase`: `idle | loading | streaming | done | error`
* `data`: the merged result shape above
* `sections`: `{ timeline, content, social, reference }` each with
  `status: pending | running | ok | error` and, on error, a described error object
* `failedSections`, `isPending`, `progress` (weighted: 15/45/25/15), `statusMessage`
* `fatalError`, `submittedScenario`
* `generate(scenario)`, `retrySection(name)`, `cancel()`, `reset()`

Key behaviours:

* **Run ids**: every run increments `runRef.current.id`; every async continuation checks
  `isCurrent(runId, controller)`, so a cancelled or superseded run can never write state.
* **Section isolation**: `runSection()` marks one section running/ok/error and merges
  only that section's data. A failure never clears the others.
* **Sequence**: timeline → (content ∥ social) → reference. Reference starts after
  content settles, so it can use the headlines when they exist.
* **Hard timeouts**: `fetchJson` wraps each request in its own `AbortController` and
  distinguishes **timeout** from **user cancel** from **network failure**.
* **Outcome**: `done` when any section produced content; `error` only when nothing did
  (so the old "blank page" state cannot occur).
* **Unmount/cancel**: an effect aborts the in-flight controller.

`ScenarioForm.jsx` is now almost entirely presentational: landing form (with a
`maxLength` counter), loading screen, fatal error screen, and the timeline view with
a **section failure banner** (one row per failed section, manual Retry, "Retry all"
when more than one failed) plus the toolbar (scenario toggle, dark mode, screenshot,
Cancel / New Scenario).

### `TimelineMosaic.jsx` — layout order

Items are tagged with a `priority`, sorted, split into four buckets (`news`, `social`,
`reference`, `developments` — the last holding the op-ed and push alerts), then
interleaved by a fixed `pattern` array. Leftover items are appended in bucket order.
The intent is editorial variety, not chronology.

Layout is pure CSS: `.timeline-mosaic { column-count: 3 }` with `break-inside: avoid`
— no JS masonry library. CSS columns fill column-by-column, so the **visual reading
order is column-major**; the array order is not a top-to-bottom reading order.

### Images

`SafeImage` is a plain `<img>` (not `next/image`) with `loading="lazy"`,
`decoding="async"`, `referrerPolicy="no-referrer"`, and an `onError` swap to a neutral
`.image-fallback` block. Reasons: URLs are arbitrary Serper results, hotlink/cors
failures are common, and html2canvas must be able to capture the node. The screenshot
uses `allowTaint: false` + `useCORS: true`, so CORS-blocked images are skipped instead
of tainting the canvas and making `toDataURL` throw.

---

## 8. Styling conventions

One global stylesheet, organised in commented blocks. Keep new CSS inside the relevant
block, in this order:

1. Font imports and `:root` design tokens (`--font-main`, `--font-meta`,
   `--primary-color`, `--accent-color`, `--page-bg`, …)
2. Reset / base / `.container`
3. Header, main content, footer
4. Scenario input + landing (+ `.scenario-hint` counter)
5. Loading, streaming progress, section failures, error state
6. Timeline wrapper + toolbar, masonry, dark-mode base
7. One block per card: X/Twitter, Reddit, Wikipedia, News (+ publication overrides),
   Op-ed, Push notification, Google, YouTube, Facebook
8. Responsive breakpoints (1200 / 768 / 480 px)

Conventions:

* **BEM-ish naming**: block `news-card`, element `news-card__headline`, modifier
  `news-card--tabloid`; per-feature prefixes `x-tweet-`, `reddit-`, `wiki-`, `fb-`,
  `yt-`, `google-`, `push-notif-`, `oped-`, `section-error`.
* **Per-card theming via CSS custom properties** set inline from JSX (see
  `NewsCard`'s `--nc-*`). Prefer this over hard-coded colours.
* **Dark mode is a class**, not a media query: `.timeline-wrapper.dark-mode` plus
  `.dark-mode …` overrides grouped inside each card block. Local toggle, not
  persisted, does not follow `prefers-color-scheme`.
* **Avatars are generated**: initials in a deterministic colour from a character-code
  hash (`InitialAvatar`, `getSubredditColor`, `getAppColor`). Reuse that instead of
  adding image assets.
* **No Tailwind / CSS modules.** One-off inline styles are fine (rotations, dynamic
  widths).
* Google Fonts load via `@import` (render-blocking); avoid adding more.

### Client vs server components

`page.js`, `layout.js`, `Header.jsx`, `Footer.jsx` are Server Components. Anything
using hooks/handlers is `"use client"`. `constants.js` is the only `app/api/_lib`
module a client may import (it has no server dependencies).

---

## 9. Environment variables

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `OPENROUTER_API_KEY` | **Yes** | every route (`MISSING_API_KEY` guard) | Server-side only; never reference it in a client module |
| `SERPER_API_KEY` | No | `images.js` | Absent ⇒ `image_urls: []` and text-only cards |
| `OPENROUTER_MODEL` | No | `openrouter.js` | Defaults to `deepseek/deepseek-v4-flash` |
| `OPENROUTER_REASONING` | No | `openrouter.js` | `off` (default) disables reasoning tokens; `on`/`auto` lets the provider decide |
| `OPENROUTER_PROVIDER_ORDER` | No | `openrouter.js` | Comma-separated provider preference, e.g. `Decart,Sail Research`; fallbacks stay enabled. Unset/none = OpenRouter default routing |

`.env` is gitignored and must never be committed. `.env.example` documents all five.

### Model and provider choice (cost)

OpenRouter serves the same model through many providers, and the effective price can
differ by ~10x and latency by ~3x. Measured on this repo's prompts (~6.3k input /
~5.6k output per full four-section generation, October 2026):

| Option | Effective in/out ($/M) | Est. cost / generation | Notes |
| --- | --- | --- | --- |
| **Default:** OpenRouter `deepseek/deepseek-v4-flash` (default routing hit Baidu) | 0.015 / 0.030 | **~$0.00026** | Cheapest measured, ~11–17 s per section. Not marked deprecated on OpenRouter (`expiration_date: null`) |
| OpenRouter `deepseek/deepseek-v4.1-flash` pinned `Decart` | 0.090 / 0.180 | ~$0.0016 | Newer model, similar speed (~17.5 s content) |
| OpenRouter `deepseek/deepseek-v4.1-flash` pinned `Sail Research` | 0.101 / 0.150 | ~$0.0015 | Newer model, slower (~27 s content) |
| OpenRouter `deepseek/deepseek-v4.1-flash` pinned `OpenInference` | 0.028 / 0.080 | ~$0.0006 | Cheapest V4.1 route, but measured **58 s** for the content phase → exceeds the 45 s budget. Do not pin without raising timeouts |
| OpenRouter `deepseek/deepseek-v4.1-flash` (default routing) | varies (~0.05–0.20 / 0.78 observed) | ~$0.0045 | Provider lottery; pin a provider |
| DeepSeek direct API, `deepseek-flash` (= V4.1-Flash-1017) | 0.15 / 0.60 off-peak; 0.30 / 1.20 peak | ~$0.0043 / ~$0.0086 | Official newest snapshot. Thinking is on by default; disable with `{"thinking":{"type":"disabled"}}`. Legacy `deepseek-v4-flash` is retired there but still served by OpenRouter providers |
| xAI Grok 4.3 | 1.25 / 2.50 | ~$0.022 | **Not cheaper** — ~85x the default |
| xAI Grok 4.5–4.7 | 2.00 / 6.00 | ~$0.046 | ~175x the default |

Guidance:

* **Default to `deepseek/deepseek-v4-flash`**: cheapest, fastest, and not deprecated on
  OpenRouter. DeepSeek retiring the name on their own platform does not remove the
  OpenRouter-hosted snapshots.
* **If you want V4.1 Flash**, set both variables so routing stays predictable:
  `OPENROUTER_MODEL=deepseek/deepseek-v4.1-flash` and
  `OPENROUTER_PROVIDER_ORDER=Decart,Sail Research`.
* **Direct DeepSeek API** only makes sense if you need the official 1017 snapshot and
  predictable precision. It is not cheaper (~7x the default routing) and needs a small
  adapter: base URL `https://api.deepseek.com`, model `deepseek-flash`,
  `DEEPSEEK_API_KEY`, and `thinking: { type: "disabled" }` instead of
  `reasoning: { enabled: false }`. Everything else is OpenAI-compatible, so
  `callOnce` is the only function that changes.
* **Grok is never the cheap option** for this workload.

---

## 10. Known limitations

1. **No tests, no lint, no types.** `npm run build` + §12 is the gate. Adding
   `eslint-config-next` and a `test` script would be welcome (see the caveat about
   `"type": "module"` before adding Node's test runner).
2. **`Math.random()` in `GoogleResultsCard`** seeds the fake result count per render.
   Harmless (client-only render, no hydration) but makes screenshots non-deterministic.
3. **`mosaic-item--<type>` classes are emitted but never styled** — hooks only.
4. **No rate limiting.** The only cost guard is the 280-character scenario cap. A
   per-IP limiter would be a sensible next step if abuse appears; note that
   per-instance memory is unreliable on serverless.
5. **No persistence.** Refreshing loses the generated timeline by design.
6. **`next.config.mjs` is intentionally empty.** `next/image` is not used (see §7);
   don't reintroduce `images.remotePatterns` without migrating the cards.
7. **Local `.next/` can be stale** and is gitignored — delete it when diagnosing
   weird build output.

---

## 11. Troubleshooting

Start with the server console: every phase logs `[timeline]`, `[content]`, `[social]`,
`[reference]`, `[images]` lines (`ok <ms>`, `attempt n/m failed`, `[code]`).

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Full-page "Generation Failed" with a key message | `OPENROUTER_API_KEY` missing/invalid | Set it in `.env`, restart `npm run dev` |
| "The configured model doesn't exist" | bad `OPENROUTER_MODEL` | Use a model your key can access |
| "The AI provider rejected our credentials" | revoked key / no credit | Check the OpenRouter dashboard |
| "rate-limiting us" | provider 429 | Wait and retry; consider a cheaper model |
| "malformed output" repeatedly | model ignoring JSON mode or truncating | Retry; keep reasoning disabled (`OPENROUTER_REASONING=off`); lower the item counts in the prompt; raise the route's `max_tokens` |
| `[content] ... cut off at the token limit` | reasoning tokens or an over-long reply consumed `max_tokens` | Reasoning is off by default — check `OPENROUTER_REASONING`; the retry already doubles the token headroom |
| "took too long to respond" | slow provider | Retry; check provider status; consider a faster model |
| "Lost connection to the server" | platform killed the function or the network dropped | Confirm each route's logs show completion; keep per-phase budgets under `maxDuration` |
| One section fails, the rest render | expected behaviour | Use the section's **Retry** button; no need to regenerate everything |
| No images | no `SERPER_API_KEY`, or all results were http/blocked | Set the key; check `[images]` logs; the blocklist is in `images.js` |
| Screenshot fails | canvas issues / huge page | Now skips CORS-blocked images; check the browser console |
| Blank timeline | should be impossible now | If it recurs, inspect `anyContent` in `useGeneration.generate` |
| `npm ci` fails with `EROFS`/`EACCES` | read-only npm cache | `npm ci --cache /tmp/npm-cache` |

Cost warning: a full generation is 4 LLM calls (up to 9 with retries) plus one image
search. Keep test scenarios short.

---

## 12. Verification checklist

There is no automated test suite. Before opening a PR, with `npm run dev` running:

1. `npm run build` passes.
2. Load `/`: landing renders; counter shows `n/280`; textarea grows; Enter submits;
   Shift+Enter adds a line; the button is disabled while empty.
3. Generate: status advances (`Creating event timeline…` → `Writing articles…` →
   `Building Wikipedia…`), cards appear in batches, and all nine content types appear.
4. Item count in the streaming bar matches what is rendered.
5. **Section failure**: temporarily make one route fail (e.g. `throw new
   AppError("UPSTREAM_ERROR", "test", { retryable: true })` in `reference/route.js`),
   regenerate, then confirm the other sections still render, the banner names only the
   failed section, and **Retry** recovers it without regenerating the rest.
6. **All sections fail**: force every route to fail → red error screen with a friendly
   message and Try Again (never a blank page).
7. **Network drop**: in DevTools go offline mid-generation → "Lost connection to the
   server", partial content preserved, section retry works after going online.
8. **Cancel**: click Cancel mid-loading → returns to the landing screen, no requests
   remain in the network panel.
9. **Over-length input**: the textarea caps at 280 characters; a direct API call with
   more returns `INVALID_SCENARIO`.
10. **No Serper key**: cards render without images and without broken-image icons.
11. **Broken image URL**: replace one `image_url` in the response (or block it in
    DevTools) → placeholder, no broken icon; the screenshot still downloads.
12. Dark mode, ≤768 px, ≤480 px, and the downloaded PNG all remain correct.

---

## 13. Conventions for changes

* **Match the existing style**: JavaScript + JSX, 2-space indent, double quotes,
  semicolons, arrow functions, early `return null` guards in cards.
* **Keep prompts, routes, and cards in sync.** A prompt/code mismatch is the most
  common source of blank cards, and it fails silently.
* **Never trust model output**: normalise it (`asArray`/`asObject`) and let
  `callWithRetry` handle failures.
* **Prefer extending an existing prompt/card** over adding a dependency or provider.
* **Keep the phase budgets under `maxDuration`.** If you add work to a route, account
  for the 60 s ceiling (internal timeout + retries + any extra fetch).
* **New routes must never throw uncaught**: wrap in `try/catch` and return
  `jsonError(err)`.
* **Client: guard late responses** with the run id / abort signal before calling a
  setter.
* **Respect the satire framing**: prompts impersonate real publications, public
  figures, and platforms. Keep output clearly fictional/absurdist rather than
  defamatory or aimed at private individuals.

---

## 14. History worth knowing

* The site began as a **Jekyll blog** (Markdown in `_posts/`, `_layouts/`,
  `_includes/`, `_config.yml`, plus a GitHub Action tweeting new posts from `feed.xml`).
* `dcc45a6` (2026-03-31) deleted all of that and replaced it with the Next.js AI
  generator.
* `0b76815` ("OVERHAUL to make social media not just newspapers") added the social,
  reference, and push-notification cards.
* `7a4e588`/`0f5a509` track model experiments; the model is now configurable.
* `9c40f94` ("improvements") reworked generation and removed `StatementCard.jsx`.
* **Reliability refactor** (the change this document was last rewritten for): replaced
  the single long-lived SSE endpoint with four short JSON routes, added per-section
  retry, abort propagation, structured error codes, image sanitisation/fallbacks, and
  removed the dead `developments` field, empty workflow, and unused config.

---

## 15. One-paragraph orientation for a new agent

> `app/page.js` renders `ScenarioForm`, which calls `useGeneration().generate()`.
> That hook POSTs `/api/timeline`, then `/api/content` and `/api/social` in parallel,
> then `/api/reference`; each route validates the body, calls OpenRouter through
> `app/api/_lib/openrouter.js` with its own timeout/retry/abort policy, normalises the
> JSON, and returns it. The hook merges each section into one result object, attaches
> images, and tracks per-section status. `TimelineMosaic` interleaves the items and
> renders one card component per type, styled by `app/globals.css`. There is no
> database, no auth, no tests, and no TypeScript. Change prompts in
> `app/api/_lib/prompts.js`, change presentation in the card + CSS, change resilience
> in `useGeneration.js` / `openrouter.js`, and keep the route response shape, the
> prompt's JSON example, and the card's props in lockstep.
