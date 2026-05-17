import { NextResponse } from "next/server";

// ---- Configuration ----
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "deepseek-v4-flash";

// ---- PHASE 0: Event Chronology ----
const PHASE0_PROMPT = `You are an alternative-history planner. Given a scenario, generate a detailed chronological sequence of events as if the scenario really happened.

Generate 6-8 distinct events in chronological order, covering:
1. The initial trigger (announcement, incident, result, decision)
2. Immediate reactions (official statements, denials, confirmations)
3. Escalation (a key figure steps down, a new candidate enters, protests begin)
4. Polling data / internal reactions (leaked memos, poll results, factional splits)
5. Major development (resignation, endorsement, dramatic reversal)
6-8. Fallout, analysis, and long-term implications

Each event must be SPECIFIC and DETAILED — include real-sounding names, quotes, numbers, and locations. Descriptions should be 2-3 sentences with enough detail that someone reading them could write news articles about each one.

Return this EXACT JSON:
{
  "events": [
    {
      "title": "Shadow Chancellor Resigns with Scathing Letter",
      "description": "The Shadow Chancellor has resigned from the frontbench, releasing a letter that says the party is 'choosing purity over power'. In a statement to the press, she accused the leading candidate of 'running a campaign based on personal loyalty rather than policy'. The resignation has triggered an immediate reshuffle and thrown the contest into chaos."
    },
    {
      "title": "Leading Candidate Secures UNITE Endorsement",
      "description": "The frontrunner has secured the backing of UNITE, the party's largest affiliated union, in what is seen as a decisive blow to rivals. The union's general secretary praised the candidate's 'consistent commitment to working people' at a joint press conference in Manchester. Rival campaigns described the endorsement as 'a coronation, not a contest'."
    },
    {
      "title": "Televised Debate Descends into Chaos",
      "description": "The first televised leadership debate was cut short after the leading candidates clashed over economic policy. One candidate accused another of 'rewriting history' on austerity, prompting loud interruptions from the audience. The broadcaster later apologised for 'technical difficulties' that cut the feed during the most heated exchange."
    }
  ]
}`;

// ---- PHASE 1a: Articles + Op-Ed + Developments ----
const PHASE1A_PROMPT = `You are an alternative-history content generator. Given a scenario and a sequence of events, generate news articles, an op-ed, and breaking developments as if this really happened.

CRITICAL: Each piece of content must cover a DIFFERENT event from the chronology. NEVER duplicate an event. NEVER write the same story twice.

## NEWS ARTICLES (exactly 8 — ALL MUST BE ABOUT DIFFERENT EVENTS)
Pick from: NYT, BBC, Fox News, The Guardian, CNN, Al Jazeera, Reuters, Daily Mail, Washington Post, The Times, Sky News, New York Post, The Onion, Le Monde, The Economist, Politico, The Spectator, Der Spiegel, El Pais

Each article MUST have a distinct article_type:
- "breaking_news" — Urgent, new information, just in
- "analysis" — Deep-dive, "what this means" tone
- "feature" — Longer-form with colour and insider quotes
- "wire_report" — Dry, factual Reuters-style, no commentary
- "foreign_reaction" — How other countries/capitals are reacting
- "tabloid_take" — Punchy, dramatic, wordplay
- "poll_result" — New polling data
- "satire" — The Onion-style absurdist humour
- "investigation" — Behind-the-scenes details
- "profile" — Profile of a key figure

ARTICLE REQUIREMENTS:
- Match each publication's real editorial voice, bias, and writing style.
- Tabloids: punchy, dramatic, wordplay, short sentences, ALL CAPS for emphasis.
- Broadsheets: measured, authoritative, complex sentences, named sources.
- Wire services: dry, factual, no adjectives, just the facts.
- Satire: deadpan, ridiculous premise stated as fact (like real Onion).
- Foreign papers: write in English with their national perspective.
- Include 2-3 international publications for global perspective.
- VARY THE TIMESTAMPS: some "2 hours ago", some "yesterday", some "3 days ago".
- Each subheadline must be 2-4 sentences adding NEW information, not repeating the headline.

## OP-ED / COLUMN (exactly 1)
A long-form opinion piece from a named columnist:
- Full name and title/role (e.g. "Political Editor", "Chief Commentator")
- Publication (use a real broadsheet or magazine)
- A provocative headline that takes a clear stance
- 3-5 sentences with sharp analysis and a clear argument
- Use the columnist's well-known voice and ideological position

## DEVELOPMENTS / BREAKING STATEMENTS (exactly 2-3)
Self-contained breaking events, each with a type:
- "resignation" — A key figure steps down
- "statement" — Official press release or public statement
- "endorsement" — Major figure endorses a candidate
- "campaign_suspension" — A candidate suspends their campaign
- "poll_release" — A major poll showing dramatic results
- "leak" — A leaked document/memo/recording
- "ruling" — Court or regulatory ruling
- "protest_announcement" — Protests announced or beginning

Each has: title (breaking news chyron), content (1-2 paragraph detail), source attribution, timestamp.

## IMAGE SEARCH
Provide a highly specific Google Image search query for real-world photos of this scenario — include key names, locations, and year.

Return this EXACT JSON structure:
{
  "image_search_query": "Keir Starmer 2024 Labour leadership election victory speech",
  "articles": [
    {
      "publication": "The Guardian",
      "article_type": "analysis",
      "headline": "What Rayner's Surprise Endorsement Means for the Labour Leadership Race",
      "subheadline": "The deputy leader's decision to back the left-wing candidate has reshaped the contest overnight. Party insiders say the move was planned for weeks — but the timing caught even the frontrunner's team off guard. Labour MPs are now scrambling to declare their allegiances before the next round of nominations closes at midnight.",
      "timestamp": "4 hours ago"
    },
    {
      "publication": "Daily Mail",
      "article_type": "tabloid_take",
      "headline": "CIVIL WAR! Labour Big Beast QUITS With Blistering Attack on 'Woke' Leadership Hopeful",
      "subheadline": "In a resignation letter that has sent shockwaves through Westminster, the Shadow Chancellor accused the leading candidate of running a 'personality cult' rather than a serious campaign for government. 'They'd rather be right than win,' the letter reads. Tory MPs are already circulating it around the tea room.",
      "timestamp": "2 hours ago"
    },
    {
      "publication": "Reuters",
      "article_type": "wire_report",
      "headline": "UK Labour leadership contest narrows to three candidates after elimination",
      "subheadline": "The Labour Party confirmed on Tuesday that the field of candidates for its leadership election has been reduced to three following the first round of MP nominations. The remaining contenders represent the party's left, centrist, and soft-left factions. A fourth candidate failed to secure the required 33 nominations from fellow parliamentarians and has been eliminated.",
      "timestamp": "Yesterday at 09:14"
    }
  ],
  "oped": {
    "publication": "The Spectator",
    "author": "Andrew Neil",
    "author_title": "Chairman",
    "headline": "The Labour Party Is Eating Itself — And We Should Let It",
    "content": "What we are witnessing is not a leadership election. It is a slow-motion implosion of a party that has forgotten what it stands for. The membership is demanding purity at the exact moment the electorate is crying out for competence. I have covered Labour politics for four decades and I have never seen a contest this self-destructive. If the party wants to spend the next year debating socialism versus social democracy while the country faces a cost-of-living crisis, that is their prerogative — but don't expect the voters to wait around.",
    "timestamp": "12 hours ago"
  },
  "developments": [
    {
      "type": "resignation",
      "title": "Shadow Chancellor Resigns, Says Party 'Unrecognisable'",
      "content": "The Shadow Chancellor has resigned from the frontbench with immediate effect, issuing a scathing resignation letter that warns the party is being captured by 'a faction that cares more about internal control than winning elections'. The letter, obtained by the BBC, describes the current leadership contest as 'a race to the margins'.",
      "source": "Official Resignation Letter / BBC News",
      "timestamp": "1 hour ago"
    },
    {
      "type": "endorsement",
      "title": "UNITE Union Endorses Left-Wing Candidate in Blow to Centrists",
      "content": "UNITE, Britain's largest trade union, has formally endorsed the left-wing candidate in the Labour leadership contest. The endorsement delivers thousands of affiliated member votes and significant organisational resources. The union's general secretary said the candidate had 'the best plan to rebuild Britain'.",
      "source": "UNITE Press Office",
      "timestamp": "3 hours ago"
    }
  ]
}`;

// ---- PHASE 1b: Social Content ----
const PHASE1B_PROMPT = `You are an alternative-history content generator. Given a scenario and a sequence of events, generate social media content as if this really happened.

## TWEETS (exactly 6)
From real public figures who would plausibly comment. Each tweet must sound EXACTLY like that person actually writes:
- Include their real @handle
- Capture their vocabulary, tone, use of caps, punctuation quirks, typical tweet structure
- NEVER make all tweets sound the same — DISTINCT voices for each
- Mix of tones:
  1. Official/establishment response (formal, measured)
  2. Hot take / pundit analysis (sharp, provocative, numbered points)
  3. Sarcastic/witty/dunk (cutting humour, ratio potential)
  4. Emotional/viral reaction (genuine anger, shock, celebration)
  5. Self-interested take (politician spinning for their faction)
  6. Journalist reporting (scoop tone, "I understand that...")
- Tweets should be 1-3 sentences. Some ALL CAPS. Some very short.
- Vary engagement: one MASSIVE (50K+ retweets), others smaller.
- Set verified status realistically.

## REDDIT POSTS (exactly 4)
From real subreddits: r/worldnews, r/politics, r/unitedkingdom, r/europe, r/news, r/OutOfTheLoop, r/ukpolitics, r/LabourUK, r/tories, r/GreenAndPleasant, r/AskReddit, r/Fauxmoi, r/nottheonion, r/agedlikemilk, etc.
- Titles must sound like real Reddit: some editorialized, some link titles, some questions, some meta/humorous
- Upvotes: major news 40k-120k, niche 2k-15k, humorous 5k-30k
- Comment counts: big threads 3000-15000, smaller 200-2000
- Include appropriate flair (e.g. "UK Politics", "BREAKING", "Megathread")
- At least one post from an OPPOSING viewpoint subreddit

## FACEBOOK POST (exactly 1)
- A shared news article from a realistic fictional person.
- Personal comment above the shared link (1-3 sentences, casual Facebook voice).
- The shared article must reference a real-sounding headline and source.
- Include realistic reaction mix and a top comment with reply feel.

## IMAGE SEARCH
Provide a highly specific Google Image search query for real-world photos — include key names, locations, and year.

Return this EXACT JSON structure:
{
  "image_search_query": "Jeremy Corbyn 2024 Labour conference speech",
  "tweets": [
    {
      "author_name": "Piers Morgan",
      "author_handle": "@piersmorgan",
      "verified": true,
      "content": "This Labour leadership contest is the greatest political comedy show on television. And they're not even in government. Imagine letting these people near actual power. 😂",
      "timestamp": "2h",
      "retweets": 23400,
      "likes": 108000,
      "views": 4200000,
      "replies": 12300
    },
    {
      "author_name": "Keir Starmer",
      "author_handle": "@Keir_Starmer",
      "verified": true,
      "content": "I will not be endorsing any candidate in this leadership election. My focus remains on holding this government to account. The party must choose its own path forward.",
      "timestamp": "4h",
      "retweets": 8900,
      "likes": 45200,
      "views": 1800000,
      "replies": 5600
    }
  ],
  "reddit_posts": [
    {
      "subreddit": "ukpolitics",
      "title": "Shadow Chancellor resigns with devastating letter — 'a race to the margins'",
      "upvotes": 28700,
      "comment_count": 4200,
      "author": "MildredBonk",
      "timestamp": "45 minutes ago",
      "flair": "BREAKING"
    },
    {
      "subreddit": "LabourUK",
      "title": "Can we talk about how this leadership contest is genuinely tearing families apart?",
      "upvotes": 12400,
      "comment_count": 890,
      "author": "red_labour",
      "timestamp": "6 hours ago",
      "flair": "Discussion"
    }
  ],
  "facebook_post": {
    "sharer_name": "Dave Thompson",
    "sharer_comment": "Honestly at this point I've stopped watching the news. Every time I look someone else has resigned or launched a campaign. Absolute chaos lmao",
    "shared_headline": "Shadow Chancellor Resigns in Blow to Labour Leadership",
    "shared_source": "BBC News",
    "shared_description": "The Shadow Chancellor has quit the frontbench, calling the leadership contest a 'race to the margins' in a resignation letter seen by the BBC.",
    "reactions": { "like": 234, "love": 45, "wow": 89, "angry": 34, "sad": 12, "haha": 78 },
    "shares": 67,
    "top_comment_author": "Sarah Jennings",
    "top_comment": "Dave mate you need to switch off and watch some telly this is doing you no good 😂",
    "timestamp": "3 hours ago"
  }
}`;

// ---- PHASE 2: Reference ----
const PHASE2_PROMPT = `You are an alternative-history content generator. Given a scenario, an event chronology, and article headlines, generate Wikipedia, Google search results, and YouTube videos as if this event really happened.

## WIKIPEDIA ARTICLE (exactly 1)
Write a comprehensive Wikipedia-style article about the central event.
- Strictly neutral encyclopedic tone. No opinion. Attribute all claims.
- Use "reportedly", "according to", "analysts noted" language.
- Write in past tense. Include [citation needed] markers for realism.
- Infobox: 5-7 fields including dates, key figures, locations, outcomes
- Lead: 3-4 sentences introducing the event and its significance
- Sections (3-4):
  1. "Background" (3-4 sentences) — Context and what led to this
  2. "Key Events" or "Campaign" (4-5 sentences) — Chronological account with specific dates, turning points, resignations
  3. "Reactions" (3-4 sentences) — Domestic, international, media, market reactions
  4. "Aftermath" (2-3 sentences) — What happened next, long-term significance
- Categories: at least 5

## GOOGLE SEARCH RESULTS (exactly 4)
Natural search query. Mix of:
- 1 Wikipedia article
- 1-2 major news sites
- 1 specialist/opinion site
- 1 social media aggregator or forum
Each result: realistic URL, clickable title, 2-line snippet.

## YOUTUBE VIDEOS (exactly 2)
1. Mainstream news report (BBC News, Sky News, CNN, etc.)
2. Commentary/analysis (Novara Media, TLDR News, Vox, The Rest Is Politics, etc.)
Each: real channel name, clickbaity YouTube-style title, realistic views (500K-3M / 100K-800K), duration, description preview.

Return this EXACT JSON structure:
{
  "wikipedia": {
    "title": "2028 Labour Party Leadership Election",
    "infobox": {
      "type": "Leadership election",
      "image_caption": "The winning candidate speaking at a victory rally in London",
      "fields": [
        { "label": "Date", "value": "15 September 2028" },
        { "label": "Turnout", "value": "62.4%" },
        { "label": "Winner", "value": "Candidate Name" },
        { "label": "Runner-up", "value": "Candidate Name" },
        { "label": "Predecessor", "value": "Previous Leader" },
        { "label": "Location", "value": "United Kingdom" }
      ]
    },
    "lead": "The 2028 Labour Party leadership election was triggered by the resignation of the previous leader following the party's defeat in the 2027 general election. It was the fourth leadership contest in a decade, reflecting deep divisions within the party over electoral strategy and ideological direction.",
    "sections": [
      { "heading": "Background", "content": "Following the party's worst electoral performance since 2019, the outgoing leader announced their resignation, triggering a contest that would determine the future direction of the party. The election took place against a backdrop of declining membership numbers..." },
      { "heading": "Campaign", "content": "The campaign period saw three candidates secure enough MP nominations to appear on the ballot. The contest was marked by several key moments including the Shadow Chancellor's dramatic resignation, a televised debate that descended into personal attacks..." },
      { "heading": "Reactions", "content": "The result was met with sharply divided reactions across the political spectrum. The Conservative Party described the outcome as proof that Labour had 'learned nothing'. Meanwhile, international observers noted the significance of..." },
      { "heading": "Aftermath", "content": "The newly elected leader immediately set about appointing a Shadow Cabinet widely described as an attempted 'unity ticket'. However, early opinion polls suggested that..." }
    ],
    "categories": [
      "2028 in British politics",
      "Labour Party (UK) leadership elections",
      "September 2028 events in the United Kingdom",
      "2028 elections in the United Kingdom",
      "Political party leadership elections in the United Kingdom"
    ]
  },
  "google_results": {
    "query": "who won labour leadership election 2028",
    "results": [
      {
        "title": "2028 Labour Party Leadership Election - Wikipedia",
        "url": "https://en.wikipedia.org/wiki/2028_Labour_Party_leadership_election",
        "snippet": "The 2028 Labour Party leadership election was held in September 2028 following the resignation of the previous leader. The contest was won by..."
      },
      {
        "title": "Labour leadership: [Winner] elected as new party leader — BBC News",
        "url": "https://www.bbc.co.uk/news/uk-politics-62908712",
        "snippet": "[Winner] has been elected as the new leader of the Labour Party, defeating [runner-up] in a closely-fought contest. The result was announced at a special conference in London..."
      },
      {
        "title": "What [Winner's] victory means for British politics — The Spectator",
        "url": "https://www.spectator.co.uk/article/labour-leadership-winner-analysis",
        "snippet": "The new Labour leader inherits a divided party and a sceptical electorate. Our political editor analyses what the result means for the next general election..."
      },
      {
        "title": "r/LabourUK - Labour Leadership Results Megathread",
        "url": "https://www.reddit.com/r/LabourUK/comments/leadership_results_2028/",
        "snippet": "Official results megathread for the 2028 Labour leadership election. All reactions, analysis, and discussion here."
      }
    ]
  },
  "youtube_videos": [
    {
      "title": "BREAKING: [Winner] Elected New Labour Leader | BBC News Special",
      "channel": "BBC News",
      "views": "1.2M views",
      "timestamp": "8 hours ago",
      "duration": "6:42",
      "description_preview": "Full coverage of the Labour leadership result. Includes the winner's victory speech, reaction from Westminster, and analysis from the BBC's political editor."
    },
    {
      "title": "How Labour's New Leader Changes Everything | Novara Media",
      "channel": "Novara Media",
      "views": "340K views",
      "timestamp": "2 days ago",
      "duration": "28:15",
      "description_preview": "Aaron Bastani and guests discuss the Labour leadership contest and what it means for the future of British politics."
    }
  ]
}`;

export const maxDuration = 120;

// ---- Serper.dev Google Image Search ----
async function fetchSerperImages(query, count = 10) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.images || !Array.isArray(data.images)) return [];
    const blocked = ["lookaside.instagram.com", "scontent.cdninstagram.com", "lookaside.fbsbx.com", "www.tiktok.com", "fbcdn.net"];
    return data.images.filter((img) => !blocked.some((b) => img.imageUrl.toLowerCase().includes(b))).slice(0, count).map((img) => img.imageUrl);
  } catch {
    return [];
  }
}

// ---- Call OpenRouter LLM ----
async function callLLM(systemPrompt, userMessage, maxTokens = 3000) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  const res = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://allegedly.news",
      "X-Title": "Allegedly News",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.9,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenRouter error (${res.status}): ${errText.substring(0, 200)}`);
  }

  let rawText;
  try {
    rawText = await res.text();
  } catch {
    throw new Error("Failed to read OpenRouter response");
  }

  if (!rawText || !rawText.trim()) throw new Error("OpenRouter returned empty response");

  let json;
  try {
    json = JSON.parse(rawText);
  } catch {
    throw new Error(`OpenRouter returned invalid JSON: "${rawText.substring(0, 100)}..."`);
  }

  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`LLM returned no content. Keys: ${Object.keys(json).join(", ")}`);

  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`LLM returned malformed JSON: "${content.substring(0, 200)}"`);
  }
}

// ---- Retry wrapper ----
async function callWithRetry(systemPrompt, userMessage, maxTokens, retries = 1) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await callLLM(systemPrompt, userMessage, maxTokens);
    } catch (err) {
      lastErr = err;
      if (i < retries) await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastErr;
}

// ---- SSE helpers ----
const encoder = new TextEncoder();

function sseEvent(controller, event, data) {
  try {
    controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
  } catch {}
}

function sseStatus(controller, message, phase, progress) {
  sseEvent(controller, "status", { message, phase, progress });
}

// ---- Main SSE handler ----
export async function POST(request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { scenario } = body;
  if (!scenario || typeof scenario !== "string" || !scenario.trim()) {
    return NextResponse.json({ error: "Please provide a scenario" }, { status: 400 });
  }

  const trimmedScenario = scenario.trim();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (event, data) => { if (!closed) sseEvent(controller, event, data); };
      const status = (msg, phase, progress) => { if (!closed) sseStatus(controller, msg, phase, progress); };

      // Accumulated state for the frontend
      let result = {
        articles: [],
        oped: null,
        developments: [],
        tweets: [],
        reddit_posts: [],
        facebook_post: null,
        wikipedia: null,
        google_results: null,
        youtube_videos: [],
        image_urls: [],
      };

      // Whether a "fatal" error occurred before any data — means we should show just the error
      let gotData = false;

      try {
        // ===== PHASE 0: Event Chronology =====
        status("Creating event timeline…", "planning", 5);
        const phase0 = await callWithRetry(
          PHASE0_PROMPT,
          `Generate an event chronology for this alternative-history scenario: "${trimmedScenario}"`,
          2000,
          2
        );
        const events = phase0?.events || [];
        const eventsSummary = events.map((e, i) =>
          `${i + 1}. ${e.title}: ${e.description}`
        ).join("\n\n");
        const eventContext = `Scenario: "${trimmedScenario}"\n\nEvent Chronology:\n${eventsSummary}`;

        // ===== PHASE 1a + 1b (PARALLEL) =====
        status("Writing articles and social posts…", "generating", 20);

        const [phase1aResult, phase1bResult] = await Promise.allSettled([
          callWithRetry(
            PHASE1A_PROMPT,
            `${eventContext}\n\nGenerate 8 news articles, 1 op-ed, and 2-3 breaking developments. Each must cover a DIFFERENT event from the chronology above.`,
            7000,
            1
          ),
          callWithRetry(
            PHASE1B_PROMPT,
            `${eventContext}\n\nGenerate 6 tweets, 4 Reddit posts, and 1 Facebook post reacting to these events.`,
            5000,
            1
          ),
        ]);

        // Process Phase 1a (articles + op-ed + developments)
        if (phase1aResult.status === "fulfilled") {
          const d = phase1aResult.value;
          if (d.articles) {
            result.articles = d.articles;
            gotData = true;
          }
          if (d.oped) { result.oped = d.oped; }
          if (d.developments) { result.developments = d.developments; }
          send("data", {
            articles: result.articles,
            oped: result.oped,
            developments: result.developments,
          });
        } else {
          console.error("[Phase 1a] Failed:", phase1aResult.reason.message);
          send("error", { phase: "content", message: "Failed to generate articles. Other content may still appear." });
        }

        // Process Phase 1b (tweets + reddit + facebook)
        if (phase1bResult.status === "fulfilled") {
          const d = phase1bResult.value;
          if (d.tweets) { result.tweets = d.tweets; gotData = true; }
          if (d.reddit_posts) { result.reddit_posts = d.reddit_posts; }
          if (d.facebook_post) { result.facebook_post = d.facebook_post; }
          send("data", {
            tweets: result.tweets,
            reddit_posts: result.reddit_posts,
            facebook_post: result.facebook_post,
          });
        } else {
          console.error("[Phase 1b] Failed:", phase1bResult.reason.message);
          send("error", { phase: "social", message: "Failed to generate social content." });
        }

        // ===== PHASE 2: Reference + Images (PARALLEL) =====
        const articleHeadlines = result.articles.length > 0
          ? result.articles.map((a) => `${a.publication}: "${a.headline}"`).join("; ")
          : "No articles were generated — generate reference based on the event chronology alone.";

        const refContext = `${eventContext}\n\nArticle headlines:\n${articleHeadlines}`;

        status("Building Wikipedia, Google, and YouTube pages…", "reference", 60);

        const [phase2Result, imageUrls] = await Promise.allSettled([
          callWithRetry(
            PHASE2_PROMPT,
            `Generate Wikipedia, Google search results, and YouTube videos for this scenario.\n\n${refContext}`,
            5000,
            1
          ),
          fetchSerperImages(
            phase1aResult.status === "fulfilled" && phase1aResult.value.image_search_query
              ? phase1aResult.value.image_search_query
              : trimmedScenario,
            10
          ),
        ]);

        if (phase2Result.status === "fulfilled") {
          const d = phase2Result.value;
          if (d.youtube_videos) { result.youtube_videos = d.youtube_videos; }
          if (d.wikipedia) { result.wikipedia = d.wikipedia; }
          if (d.google_results) { result.google_results = d.google_results; }
          send("data", {
            youtube_videos: result.youtube_videos,
            wikipedia: result.wikipedia,
            google_results: result.google_results,
          });
          gotData = true;
        } else {
          console.error("[Phase 2] Failed:", phase2Result.reason.message);
          send("error", { phase: "reference", message: "Failed to generate reference pages." });
        }

        // Process images
        const urls = imageUrls.status === "fulfilled" ? imageUrls.value : [];
        result.image_urls = urls;

        if (urls.length > 0 && result.articles.length > 0) {
          // Assign images to articles
          const articlesWithImages = result.articles.map((article, i) => ({
            ...article,
            image_url: urls[i % urls.length] || null,
          }));
          result.articles = articlesWithImages;
          const opedImage = result.oped ? { ...result.oped, image_url: urls[Math.min(result.articles.length, urls.length - 1)] || null } : null;
          if (result.oped) result.oped = opedImage;
          send("data", {
            articles: result.articles,
            oped: result.oped,
            image_urls: urls,
          });
        } else if (urls.length > 0) {
          send("data", { image_urls: urls });
        }

        status("Finalising timeline…", "done", 100);
        send("done", {});
      } catch (err) {
        console.error("[Fatal] Generation failed:", err.message);
        if (!gotData) {
          send("fatal_error", { message: err.message });
        } else {
          send("error", { phase: "fatal", message: err.message });
          send("done", {});
        }
      } finally {
        closed = true;
        try { controller.close(); } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
