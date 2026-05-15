import { NextResponse } from "next/server";

// ---- Configuration ----
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "deepseek-v4-flash";

// ---- PASS 1 PROMPT: News headlines + Social media + Op-Eds + Developments ----
const PASS1_SYSTEM_PROMPT = `You are an alternative-history content generator. Given a scenario, generate a realistic, dynamic, and deeply varied media timeline as if this scenario really happened.

CRITICAL RULE: YOU MUST GENERATE A CHRONOLOGICAL SEQUENCE OF EVENTS. Events should unfold over hours/days — NOT all be the same moment. The timeline must feel like a real breaking news cycle with cause-and-effect.

## STEP 1: FIRST, IMAGINE THE EVENT CHRONOLOGY
Before generating content, mentally outline 6-8 distinct events that would unfold:
- Event 1: The initial trigger (announcement, incident, result, decision)
- Event 2-3: Immediate reactions (official statements, denials, confirmations)
- Event 4: Escalation (a key figure steps down, a new candidate enters, protests begin)
- Event 5: Polling data / internal reactions (leaked memos, poll results, factional splits)
- Event 6: Major development (resignation, endorsement, dramatic reversal)
- Event 7-8: Fallout and analysis (what it means, historical context, long-term implications)

CRITICAL: Each piece of content must cover a DIFFERENT event from this chronology. NEVER duplicate an event. NEVER write the same story twice.

## STEP 2: GENERATE THE FOLLOWING CONTENT

### NEWS ARTICLES (exactly 8 — EACH MUST BE ABOUT A DIFFERENT EVENT/ANGLE)
Pick from: NYT, BBC, Fox News, The Guardian, CNN, Al Jazeera, Reuters, Daily Mail, Washington Post, The Times, Sky News, New York Post, The Onion, Le Monde, The Economist, Politico, The Spectator, Der Spiegel, El Pais

Each article MUST have a distinct article_type to ensure variety:
- "breaking_news" — Initial report of a fresh development, urgent tone, new information
- "analysis" — Deep-dive analysis by a political correspondent, "what this means" tone
- "feature" — Longer-form piece with colour, quotes from insiders, narrative feel
- "op_ed" — Opinion/editorial arguing a specific position, clearly taking sides
- "wire_report" — Dry, factual Reuters/AP-style straight news, no commentary
- "foreign_reaction" — How other countries/capitals are reacting (e.g. "Brussels / Washington / Moscow responds")
- "tabloid_take" — Punchy, dramatic, personality-driven tabloid angle with wordplay
- "poll_result" — Reporting on new polling data showing who's leading/trailing
- "satire" — The Onion-style satirical take on the events
- "investigation" — In-depth investigative piece uncovering behind-the-scenes details
- "profile" — Profile piece on a key figure in the scenario

ARTICLE REQUIREMENTS:
- Match each publication's real editorial voice, bias, writing style, and formatting.
- Tabloids: punchy, dramatic, wordplay, short sentences, ALL CAPS for emphasis.
- Broadsheets: measured, authoritative, complex sentences, named sources.
- Wire services: dry, factual, no adjectives, just the facts.
- Satire: absurdist humour mimicking real Onion style (deadpan, ridiculous premise stated as fact).
- FOREIGN PAPERS MUST WRITE IN ENGLISH but with their national perspective.
- CRITICAL GEOGRAPHY: Choose primarily publications from the scenario's country. Include 2-3 international publications for foreign reaction and global perspective.
- AT LEAST 2 articles must be from different countries' newspapers (e.g. if UK scenario: include Le Monde and NYT representing French and American views).
- VARY THE TIMESTAMPS across the timeline — some "2 hours ago", some "yesterday", some "3 days ago" — to create a sense of unfolding events.
- Each article's subheadline must be 2-4 sentences that add NEW information, not just repeat the headline.

### OP-ED / COLUMN (exactly 1)
A long-form opinion piece from a named columnist at a major publication. This is NOT a news article — it is an argumentative, persuasive piece:
- Include the columnist's full name and their title/role (e.g. "Political Editor", "Chief Commentator")
- Publication name (pick from the list above or use The Spectator, The New Statesman, The Atlantic, etc.)
- A provocative, opinionated headline that takes a clear stance
- Body text of 3-5 sentences with sharp analysis, rhetorical questions, and a clear argument
- Use the columnist's well-known voice and ideological position
- Write in first-person occasionally ("I believe", "We must")

### DEVELOPMENTS / BREAKING STATEMENTS (exactly 2-3)
These are NOT news articles. They are distinct events: official statements, resignations, announcements, leaked documents, poll releases, campaign suspensions. Each one is a self-contained development:
- "resignation" — A key figure steps down (e.g. "X Resigns as Party Leader")
- "statement" — An official press release or public statement from an organization/individual
- "endorsement" — A major figure endorses a candidate
- "campaign_suspension" — A candidate suspends their campaign
- "poll_release" — A major poll is released showing dramatic results
- "leak" — A leaked document/memo/recording surfaces
- "ruling" — A court or regulatory body makes a ruling affecting the scenario
- "protest_announcement" — Protests are announced or begin

Each development has a title (like a breaking news chyron), a short paragraph of detail, a source attribution, and a timestamp.

### TWEETS (exactly 6 — MORE VARIETY THAN BEFORE)
From real public figures who would plausibly comment. Each tweet must sound EXACTLY like that person actually writes:
- Include their real @handle
- Capture their vocabulary, tone, use of caps, punctuation quirks, typical tweet structure
- NEVER make all tweets sound the same — they must have DISTINCT voices
- Mix of tones:
  1. Official/establishment response (formal, measured)
  2. Hot take / pundit analysis (sharp, provocative, "thread incoming" or numbered points)
  3. Sarcastic/witty/dunk (cutting humour, ratio potential)
  4. Emotional/viral reaction (genuine anger, shock, celebration)
  5. Self-interested take (politician spinning for their faction/career)
  6. Journalist reporting what they're hearing (scoop tone, "I understand that...")
- Tweets should be 1-3 sentences. Some can use ALL CAPS. Some can be very short (just a few words + emoji).
- Vary engagement numbers — one should be MASSIVE (going viral, 50K+ retweets), others smaller.
- Set verified status based on reality (most public figures are verified, but some parody accounts aren't).

### REDDIT POSTS (exactly 4)
From real subreddits that would discuss this topic:
- r/worldnews, r/politics, r/unitedkingdom, r/europe, r/news, r/OutOfTheLoop, r/ukpolitics, r/LabourUK, r/tories, r/GreenAndPleasant, r/AskReddit, r/Fauxmoi, r/nottheonion, r/agedlikemilk, etc.
- Reddit titles must sound like real Reddit posts:
  - Some editorialized ("This is an absolute disgrace")
  - Some link titles (matching a real news headline)
  - Some questions ("What does this mean for...?")
  - Some meta/humorous ("Can we talk about how...")
- Realistic upvote counts (major news = 40k-120k, niche political = 2k-15k, humorous = 5k-30k)
- Realistic comment counts (big threads = 3000-15000, smaller = 200-2000)
- Include appropriate flair (e.g. "UK Politics", "BREAKING", "Discussion", "Megathread")
- At least one post should be from a subreddit representing an OPPOSING viewpoint to the dominant narrative

### FACEBOOK POST (exactly 1)
- A shared news article from a realistic fictional person.
- Include a personal comment above the shared link (1-3 sentences, natural Facebook voice with perhaps a typo or casual formatting).
- The shared article must reference one of the news headlines generated above.
- Include realistic reaction mix and a top comment from another fictional person (with a reply thread feel).

### IMAGE SEARCH
- Provide a highly specific Google Image search query that would return real-world photos for this scenario. Include key names, locations, and year.

Return this EXACT JSON structure:
{
  "image_search_query": "highly specific photo search query with names location year",
  "articles": [
    {
      "publication": "The Guardian",
      "article_type": "analysis",
      "headline": "What Rayner's Surprise Endorsement Means for the Labour Leadership Race",
      "subheadline": "The deputy leader's decision to back the left-wing candidate has reshaped the contest overnight. Party insiders say the move was planned for weeks — but the timing caught even the frontrunner's team off guard. Here's what happens next.",
      "timestamp": "4 hours ago"
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
      "source": "Official Resignation Letter",
      "timestamp": "1 hour ago"
    }
  ],
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

// ---- PASS 2 PROMPT: Wikipedia + Google + YouTube ----
const PASS2_SYSTEM_PROMPT = `You are an alternative-history content generator. You will be given a scenario AND a summary of already-generated news/social content about it. Generate Wikipedia, Google search results, and YouTube video cards as if this event really happened.

IMPORTANT: You are generating the REFERENCE layer — wiki articles, search results, video coverage. These should complement (not repeat) the news content. Reference different events and angles.

## WIKIPEDIA ARTICLE (exactly 1)
Write a comprehensive Wikipedia-style article about the central event, election, or political development in this scenario.

WIKIPEDIA TONE RULES:
- Strictly neutral encyclopedic tone. No opinion. Attribute all claims.
- Use "reportedly", "according to", "analysts noted" language.
- Write in past tense as if the event has already concluded.
- Include [citation needed] markers in at least one place for realism.
- The article should feel like a real Wikipedia entry — formal, well-structured, with appropriate level of detail.

INFOBOX:
- Include a rich infobox with type classification and 5-7 relevant fields.
- Fields should include dates, key figures, locations, outcomes, turnout (if election), predecessor/successor (if applicable).
- Include a realistic image caption describing what a photo would show.

LEAD PARAGRAPH:
- 3-4 sentences introducing the event, its significance, and outcome.
- Start with "The [year] [event name] was..." Wikipedia style.

SECTIONS (exactly 3-4, rich content):
1. "Background" (3-4 sentences) — Context, what led to this, historical parallels
2. "Key Events" or "Campaign" or "Timeline" (4-5 sentences) — Chronological account of what happened. Include specific dates, turning points, candidate declarations, resignations, debates.
3. "Reactions" (3-4 sentences) — How different groups reacted: domestic political parties, international leaders, media, public, markets
4. "Aftermath" or "Legacy" (2-3 sentences) — What happened next, long-term significance

CATEGORIES: At least 5 relevant Wikipedia-style categories (e.g. "2028 in British politics", "Labour Party (UK) leadership elections", etc.)

## GOOGLE SEARCH RESULTS (exactly 4)
Simulate a Google SERP with a realistic mix of source types:
- 1 Wikipedia article
- 1-2 major news sites (BBC, Guardian, NYT, etc.)
- 1 specialist/opinion site (Spectator, New Statesman, Politico, etc.)
- 1 social media aggregator or forum (Reddit, Twitter moment)

The search query must be in natural language as a real person would type (e.g. "who won labour leadership 2028" or "labour leader 2028 results").
Each result needs: realistic URL path (with date slugs), clickable-looking title, and a 2-line Google snippet (may include date in snippet).

## YOUTUBE VIDEOS (exactly 2)
Two distinct YouTube videos covering different angles:
1. A mainstream news report (BBC News, Sky News, CNN, etc.) — straight reporting of events
2. A commentary/analysis video (Novara Media, TLDR News, Vox, Vice News, The Rest Is Politics, etc.) — more analytical, longer-form

Each video needs:
- Real channel name (use real YouTube news/politics channels)
- YouTube-style title (slightly clickbaity, uses caps for emphasis, includes key names)
- Realistic view counts (mainstream = 500K-3M, analysis = 100K-800K depending on channel size)
- Upload timestamp (within the last day for breaking news, within a week for analysis)
- Duration (news clips 3-12 min, analysis 12-45 min)
- Short description preview (1-2 lines, includes key topics covered)

## IMAGE SEARCH
- Provide another image search query for Wikipedia/YouTube visuals.

Return this EXACT JSON structure:
{
  "image_search_query": "specific photo search for wikipedia/youtube visuals",
  "wikipedia": {
    "title": "2028 Labour Party Leadership Election",
    "infobox": {
      "type": "Leadership election",
      "image_caption": "The winning candidate speaking at a victory rally in London",
      "fields": [
        { "label": "Date", "value": "15 September 2028" },
        { "label": "Turnout", "value": "62.4% of party membership" },
        { "label": "Winner", "value": "Candidate Name" },
        { "label": "Runner-up", "value": "Candidate Name" },
        { "label": "Predecessor", "value": "Previous Leader Name" },
        { "label": "Location", "value": "United Kingdom" }
      ]
    },
    "lead": "The 2028 Labour Party leadership election was triggered by...",
    "sections": [
      {
        "heading": "Background",
        "content": "The election was triggered following the resignation of [previous leader] after the party's defeat in the [year] general election. It was the [nth] leadership contest in [n] years, reflecting deep divisions within the party over direction and electability..."
      },
      {
        "heading": "Campaign",
        "content": "The campaign period saw [n] candidates secure enough nominations from MPs to appear on the ballot. Key moments included [candidate]'s surprise entry into the race, the televised debate on [date] where [key moment], and [candidate]'s withdrawal following poor polling..."
      },
      {
        "heading": "Reactions",
        "content": "Domestic reaction was sharply divided. The [opposition party] described the result as [quote]. International leaders including [names] offered congratulations. Financial markets [reacted positively/negatively], with the pound [rising/falling]..."
      },
      {
        "heading": "Aftermath",
        "content": "Following the result, [winner] appointed a new Shadow Cabinet that... The party saw an immediate [rise/fall] in opinion polls. Commentators noted that..."
      }
    ],
    "categories": [
      "2028 in British politics",
      "Labour Party (UK) leadership elections",
      "September 2028 events in the United Kingdom",
      "2028 elections in the United Kingdom",
      "Political party leadership elections"
    ]
  },
  "google_results": {
    "query": "who won labour leadership election 2028",
    "results": [
      {
        "title": "2028 Labour Party Leadership Election - Wikipedia",
        "url": "https://en.wikipedia.org/wiki/2028_Labour_Party_leadership_election",
        "snippet": "The 2028 Labour Party leadership election was held in September 2028 following the resignation of..."
      },
      {
        "title": "Labour leadership: [Winner] elected as new party leader — BBC News",
        "url": "https://www.bbc.co.uk/news/uk-politics-2028-labour-leader",
        "snippet": "[Winner] has been elected as the new leader of the Labour Party, defeating [runner-up] in a closely-fought contest. The result was announced..."
      },
      {
        "title": "What [Winner's] victory means for British politics — The Spectator",
        "url": "https://www.spectator.co.uk/article/labour-leadership-2028-winner-analysis",
        "snippet": "The new Labour leader inherits a party divided and a country sceptical. Here's our analysis of what the result means for the next general election..."
      },
      {
        "title": "Reddit · r/LabourUK · Labour leadership results megathread",
        "url": "https://www.reddit.com/r/LabourUK/comments/leadership_results",
        "snippet": "Official results thread for the 2028 Labour leadership election. All discussion, reactions, and analysis here. Sort by new for live updates."
      }
    ]
  },
  "youtube_videos": [
    {
      "title": "[Winner] elected Labour leader: BBC News Special Report",
      "channel": "BBC News",
      "views": "1.2M views",
      "timestamp": "8 hours ago",
      "duration": "6:42",
      "description_preview": "Full coverage of the Labour leadership result as [winner] is elected the new leader of the Labour Party. Includes the victory speech, reaction from Westminster, and analysis from our political editor."
    },
    {
      "title": "Dan CORDER to Break Down Labour's New Leader | The Rest Is Politics",
      "channel": "The Rest Is Politics",
      "views": "420K views",
      "timestamp": "2 days ago",
      "duration": "42:15",
      "description_preview": "Rory and Alastair discuss the Labour leadership contest, what the candidates are offering, and who is likely to come out on top — recorded before the result was announced."
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
    // ---- PASS 1: News + Social Media (more content, higher tokens) ----
    const pass1Data = await callLLM(
      PASS1_SYSTEM_PROMPT,
      `Generate content for this alternative-history scenario: "${trimmedScenario}"`,
      8000
    );

    // Validate pass 1
    if (!pass1Data.articles || !Array.isArray(pass1Data.articles)) {
      throw new Error("Pass 1: missing articles array");
    }

    // ---- PASS 2: Wikipedia + Google + YouTube (in parallel with image fetch) ----
    const pass2Summary = `Scenario: "${trimmedScenario}"
    
News headlines generated so far: ${pass1Data.articles
      .map((a) => `${a.publication}: "${a.headline}" (${a.article_type || "news"})`)
      .join("; ")}

Op-ed: ${pass1Data.oped?.publication}: "${pass1Data.oped?.headline || "none"}"

Developments: ${(pass1Data.developments || []).map((d) => `${d.type}: "${d.title}"`).join("; ") || "none"}`;

    const [pass2Data, imageUrls] = await Promise.all([
      callLLM(
        PASS2_SYSTEM_PROMPT,
        `Generate Wikipedia, Google results, and YouTube content for this scenario.\n\n${pass2Summary}`,
        5000
      ),
      fetchSerperImages(
        pass1Data.image_search_query || trimmedScenario,
        10
      ),
    ]);

    // ---- Assign images to news articles ----
    const articles = pass1Data.articles.map((article, i) => ({
      ...article,
      image_url: imageUrls[i % Math.max(imageUrls.length, 1)] || null,
    }));

    // Give the op-ed an image too
    const oped = pass1Data.oped ? {
      ...pass1Data.oped,
      image_url: imageUrls[Math.min(articles.length, imageUrls.length - 1)] || null,
    } : null;

    // ---- Compile full response ----
    return NextResponse.json({
      articles,
      oped,
      developments: pass1Data.developments || [],
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
