A satirical "alternative history" news generator hosted at [allegedly.news](https://allegedly.news).

Type a counterfactual scenario ("If Jeremy Corbyn won in 2017...") and the site generates a
full media timeline around it: newspaper front pages, an op-ed, phone push alerts, tweets,
Reddit posts, a Facebook share, a Wikipedia article, Google search results, and a YouTube
video — laid out as a masonry timeline you can download as an image.

Everything is generated on demand by an LLM (via OpenRouter) and image search (via Serper.dev).
Nothing is stored.

## Run it locally

```bash
npm ci
cp .env.example .env    # then add your keys
npm run dev             # http://localhost:3000
```

You need at least an `OPENROUTER_API_KEY`. `SERPER_API_KEY` is optional — without it the
cards simply render without photos.

## Contributing

The code is a Next.js App Router app with one folder of API routes and one stylesheet.
Before changing anything, read **[AGENTS.md](./AGENTS.md)** — it maps every file, explains
the generate → stream → render data flow, and lists the known sharp edges.

The most common contributions are:

* **Tweak the writing** — edit the prompt templates in `app/api/_lib/prompts.js`.
* **Style a publication** — add an entry to `PUBLICATION_STYLES` in `app/components/NewsCard.jsx`.
* **Add a content type** — follow the checklist in AGENTS.md §6 (prompt → route → hook → card → CSS).

There is no test suite; `npm run build` plus the manual checklist in AGENTS.md §10 is the gate.

## History

This site began as a Jekyll blog where contributors added Markdown files to `_posts/`.
That workflow was removed in March 2026 when the site became the AI generator it is today —
`_posts/` no longer exists, so please don't add articles there.
