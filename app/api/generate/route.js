import { NextResponse } from "next/server";

// ---- Configuration ----
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "x-ai/grok-4-fast";

// ---- PASS 1 PROMPT: News headlines + Social media ----
const PASS1_SYSTEM_PROMPT = `You are an alternative-history content generator. Given a scenario, generate a realistic collection of news headlines, tweets, Reddit posts, and a Facebook post — as if this scenario really happened.

CORE PRINCIPLE: Simulate the DOMINO EFFECT. Don't just repeat the scenario. Generate secondary consequences, reactions, scandals, protests, market reactions, hot takes, viral moments.

Generate ALL of the following content in a single JSON response:

## NEWS ARTICLES (exactly 5)
- Use real-world publications from this EXACT list (pick 5 that fit the scenario's geography):
  NYT, BBC, Fox News, The Guardian, CNN, Al Jazeera, Reuters, Daily Mail, Washington Post, The Times, Sky News, New York Post, The Onion, Le Monde
- Mix tabloids and broadsheets. Match each publication's real editorial voice, bias, and writing style.
- Tabloid headlines: punchy, dramatic, wordplay. Broadsheet headlines: measured, authoritative.
- Foreign publications write in English.
- CRITICAL GEOGRAPHY: Choose publications native to the scenario's country. Include 1-2 international papers if it's global news.

## TWEETS (exactly 4)
- From real public figures who would plausibly comment (politicians, journalists, celebrities, business leaders).
- Each tweet must sound EXACTLY like that person writes — capture their vocabulary, tone, use of caps, punctuation quirks.
- Include a mix: one establishment/official response, one hot take/pundit, one sarcastic/witty comment, one emotional/viral reaction.
- Tweets should be 1-3 sentences max, like real tweets. Some can use ALL CAPS for emphasis.
- Pick a verified status for each (most public figures are verified).

## REDDIT POSTS (exactly 3)
- Pick real subreddits that would discuss this (e.g., r/worldnews, r/politics, r/unitedkingdom, r/news, r/OutOfTheLoop, r/AskReddit, etc.)
- Reddit titles should sound like real Reddit — sometimes editorialized, sometimes a link title, sometimes a question.
- Include realistic upvote counts (big news = 40k-120k, niche = 2k-15k).
- Comment counts should be realistic too (big threads = 3000-15000, smaller = 200-2000).

## FACEBOOK POST (exactly 1)
- A shared news article card — someone sharing a news link with their own commentary.
- The sharer should be a realistic fictional person name.
- Include a brief personal comment above the shared link (1-2 sentences, casual Facebook voice).
- The shared article should have a headline and source publication.
- Include realistic reaction counts and a top comment from another fictional person.

## IMAGE SEARCH
- Provide a Google Image search query that would return relevant real-world photos for this scenario.

Return this EXACT JSON structure:
{
  "image_search_query": "descriptive search for real news photos related to the scenario",
  "articles": [
    {
      "publication": "PUBLICATION NAME",
      "headline": "HEADLINE TEXT",
      "subheadline": "1-3 sentence excerpt in the publication's voice and bias.",
      "timestamp": "relative time like '2 hours ago' or 'Yesterday at 14:32'"
    }
  ],
  "tweets": [
    {
      "author_name": "Real Person Name",
      "author_handle": "realhandle",
      "verified": true,
      "content": "Tweet text here. Keep it authentic to how this person actually tweets.",
      "timestamp": "relative time like '4h' or '12m'",
      "retweets": 15400,
      "likes": 89200,
      "views": 2400000,
      "replies": 8900
    }
  ],
  "reddit_posts": [
    {
      "subreddit": "worldnews",
      "title": "Reddit post title",
      "upvotes": 87400,
      "comment_count": 12300,
      "author": "realistic_reddit_username",
      "timestamp": "5 hours ago",
      "flair": "optional flair text or null"
    }
  ],
  "facebook_post": {
    "sharer_name": "Fictional Person Name",
    "sharer_comment": "Their personal take on the shared article",
    "shared_headline": "The headline of the article they're sharing",
    "shared_source": "Publication Name",
    "shared_description": "Brief article description/preview text",
    "reactions": { "like": 234, "love": 45, "wow": 89, "angry": 12, "sad": 5, "haha": 23 },
    "shares": 67,
    "top_comment_author": "Another Fictional Person",
    "top_comment": "A realistic Facebook comment",
    "timestamp": "3 hours ago"
  }
}`;

// ---- PASS 2 PROMPT: Wikipedia + Google + YouTube ----
const PASS2_SYSTEM_PROMPT = `You are an alternative-history content generator. You will be given a scenario AND a summary of already-generated news/social content about it. Generate Wikipedia, Google search results, and YouTube video cards as if this event really happened.

## WIKIPEDIA ARTICLE (exactly 1)
- Write a Wikipedia-style article about the key event or person central to this scenario.
- Include an infobox with relevant structured data (dates, key figures, locations, outcomes).
- Write a lead paragraph (2-3 sentences) in neutral, encyclopedic Wikipedia tone.
- Include a "Background" section (2-3 sentences).
- Include a "Reactions" or "Aftermath" section (2-3 sentences).
- The article should read like a real Wikipedia article — neutral point of view, formal, well-sourced feel.

## GOOGLE SEARCH RESULTS (exactly 3)
- Simulate what Google would show if someone searched for this event.
- Each result has a URL, title, and description snippet.
- Mix of news sites, Wikipedia, and other sources.
- The search query should be what a normal person would type (plain language, not formal).

## YOUTUBE VIDEOS (exactly 1)
- Simulate YouTube video cards that would appear about this event.
- Include channel names (use real channels that would cover this: BBC News, CNN, Vice, Vox, Sky News, etc.)
- Include realistic view counts, upload timestamps.
- Video titles should be YouTube-style: slightly clickbaity but plausible for news channels.

Return this EXACT JSON structure:
{
  "wikipedia": {
    "title": "Article Title",
    "infobox": {
      "type": "Event or Person or Organization etc.",
      "image_caption": "A brief caption describing what image would appear",
      "fields": [
        { "label": "Date", "value": "The date" },
        { "label": "Location", "value": "The location" }
      ]
    },
    "lead": "The opening paragraph in encyclopedic tone...",
    "sections": [
      {
        "heading": "Background",
        "content": "Section content..."
      },
      {
        "heading": "Reactions",
        "content": "Section content..."
      }
    ],
    "categories": ["Category 1", "Category 2", "Category 3"]
  },
  "google_results": {
    "query": "what a normal person would search",
    "results": [
      {
        "title": "Result title as it appears on Google",
        "url": "https://example.com/realistic-url-path",
        "snippet": "The description snippet shown under the result, 1-2 sentences."
      }
    ]
  },
  "youtube_videos": [
    {
      "title": "Video Title - YouTube Style",
      "channel": "Channel Name",
      "views": "2.4M views",
      "timestamp": "6 hours ago",
      "duration": "12:34",
      "description_preview": "Brief video description preview text"
    }
  ]
}`;

export const maxDuration = 120;

// ---- Serper.dev Google Image Search ----
async function fetchSerperImages(query, count = 7) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.error("Missing SERPER_API_KEY environment variable");
    return [];
  }

  try {
    const res = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query }),
    });

    if (!res.ok) {
      console.error("Serper API error:", res.status);
      return [];
    }

    const data = await res.json();

    if (!data.images || !Array.isArray(data.images)) {
      return [];
    }

    const validImages = data.images.filter((img) => {
      const url = img.imageUrl.toLowerCase();
      return (
        !url.includes("lookaside.instagram.com") &&
        !url.includes("scontent.cdninstagram.com") &&
        !url.includes("lookaside.fbsbx.com") &&
        !url.includes("www.tiktok.com") &&
        !url.includes("fbcdn.net")
      );
    });

    return validImages.slice(0, count).map((img) => img.imageUrl);
  } catch (err) {
    console.error("Serper fetch failed:", err.message);
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
    const errText = await res.text();
    console.error("OpenRouter error:", res.status, errText);
    throw new Error(`LLM service error (${res.status})`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("LLM returned an empty response");
  }

  try {
    return JSON.parse(content);
  } catch {
    console.error("Failed to parse LLM JSON:", content.substring(0, 500));
    throw new Error("LLM returned malformed JSON");
  }
}

// ---- Main handler ----
export async function POST(request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error: missing OPENROUTER_API_KEY" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { scenario } = body;
  if (!scenario || typeof scenario !== "string" || !scenario.trim()) {
    return NextResponse.json(
      { error: "Please provide a scenario" },
      { status: 400 }
    );
  }

  const trimmedScenario = scenario.trim();

  try {
    // ---- PASS 1: News + Social Media ----
    const pass1Data = await callLLM(
      PASS1_SYSTEM_PROMPT,
      `Generate content for this alternative-history scenario: "${trimmedScenario}"`,
      4000
    );

    // Validate pass 1
    if (!pass1Data.articles || !Array.isArray(pass1Data.articles)) {
      throw new Error("Pass 1: missing articles array");
    }

    // ---- PASS 2: Wikipedia + Google + YouTube (in parallel with image fetch) ----
    const pass2Summary = `Scenario: "${trimmedScenario}"\n\nAlready generated headlines: ${pass1Data.articles
      .map((a) => `${a.publication}: "${a.headline}"`)
      .join("; ")}`;

    const [pass2Data, imageUrls] = await Promise.all([
      callLLM(
        PASS2_SYSTEM_PROMPT,
        `Generate Wikipedia, Google results, and YouTube content for this scenario.\n\n${pass2Summary}`,
        3000
      ),
      fetchSerperImages(
        pass1Data.image_search_query || trimmedScenario,
        7
      ),
    ]);

    // ---- Assign images to news articles ----
    const articles = pass1Data.articles.map((article, i) => ({
      ...article,
      image_url: imageUrls[i % Math.max(imageUrls.length, 1)] || null,
    }));

    // ---- Compile full response ----
    return NextResponse.json({
      articles,
      tweets: pass1Data.tweets || [],
      reddit_posts: pass1Data.reddit_posts || [],
      facebook_post: pass1Data.facebook_post || null,
      wikipedia: pass2Data.wikipedia || null,
      google_results: pass2Data.google_results || null,
      youtube_videos: pass2Data.youtube_videos || [],
      image_urls: imageUrls,
    });
  } catch (err) {
    console.error("Generation failed:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to generate content. Please try again." },
      { status: 502 }
    );
  }
}
