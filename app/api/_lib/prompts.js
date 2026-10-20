// Prompt templates for the four generation phases.
// Extracted from the original single-endpoint generator; text kept as-is except for
// the removed phase-1b image query.
// Keep each prompt and its JSON example in sync with the route and the card props.

export const PHASE0_PROMPT = `You are an alternative-history planner. Given a scenario, generate a detailed chronological sequence of events as if the scenario really happened.

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

export const PHASE1A_PROMPT = `You are an alternative-history content generator. Given a scenario and a sequence of events, generate news articles, an op-ed, and push notification alerts as if this really happened.

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

## PUSH NOTIFICATIONS / BREAKING ALERTS (exactly 2-3)
Simulate phone push notification alerts from news apps for the key breaking events:
- "app_name" — The news app pushing the alert (BBC News, The Guardian, Sky News, CNN, Reuters, NYT, etc.)
- "headline" — The breaking alert text, short and punchy like a real push notification
- "preview" — 1-2 sentence preview text visible below the headline
- "timestamp" — Relative time like "3m ago", "12m ago"

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
  "notifications": [
    {
      "app_name": "BBC News",
      "headline": "BREAKING: Shadow Chancellor Resigns in Scathing Attack",
      "preview": "Shadow Chancellor says party is 'choosing purity over power' in resignation letter seen by the BBC.",
      "timestamp": "3m ago"
    },
    {
      "app_name": "The Guardian",
      "headline": "UNITE Union Endorses Left Candidate in Labour Leadership Race",
      "preview": "UK's largest trade union throws weight behind left-wing candidate, delivering thousands of votes and significant resources.",
      "timestamp": "12m ago"
    }
  ]
}`;

export const PHASE1B_PROMPT = `You are an alternative-history content generator. Given a scenario and a sequence of events, generate social media content as if this really happened.

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

Return this EXACT JSON structure:
{
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

export const PHASE2_PROMPT = `You are an alternative-history content generator. Given a scenario, an event chronology, and article headlines, generate Wikipedia, Google search results, and a YouTube video as if this event really happened.

## WIKIPEDIA ARTICLE (exactly 1 — SHORT, just the essentials)
- A concise infobox with 5-6 key fields (date, key figures, location, outcome)
- A lead paragraph of 3-4 sentences introducing the event in neutral, encyclopedic tone
- That's it — NO sections, NO categories. Just infobox + lead paragraph. Keep it tight.

## GOOGLE SEARCH RESULTS (exactly 2)
- Natural search query a real person would type
- 1 Wikipedia article result + 1 major news site result
- Each: realistic URL, clickable title, 2-line snippet

## YOUTUBE VIDEO (exactly 1)
- A mainstream news report (BBC News, Sky News, CNN, etc.)
- Real channel name, YouTube-style title, realistic views (500K-3M), duration (3-10 min), upload timestamp

Return EXACTLY this JSON:
{
  "wikipedia": {
    "title": "2028 Labour Party Leadership Election",
    "infobox": {
      "type": "Leadership election",
      "image_caption": "The winning candidate speaking at a victory rally in London",
      "fields": [
        { "label": "Date", "value": "15 September 2028" },
        { "label": "Winner", "value": "Candidate Name" },
        { "label": "Runner-up", "value": "Candidate Name" },
        { "label": "Turnout", "value": "62.4%" },
        { "label": "Predecessor", "value": "Previous Leader" },
        { "label": "Location", "value": "United Kingdom" }
      ]
    },
    "lead": "The 2028 Labour Party leadership election was triggered by the resignation of the previous leader following the party's defeat in the 2027 general election. The contest was won by [winner], who defeated [runner-up] with [percentage] of the membership vote. [One sentence about the significance or controversy]."
  },
  "google_results": {
    "query": "who won labour leadership election 2028",
    "results": [
      {
        "title": "2028 Labour Party Leadership Election - Wikipedia",
        "url": "https://en.wikipedia.org/wiki/2028_Labour_Party_leadership_election",
        "snippet": "The 2028 Labour Party leadership election was held in September 2028 following..."
      },
      {
        "title": "Labour leadership: [Winner] elected as new party leader — BBC News",
        "url": "https://www.bbc.co.uk/news/uk-politics-62908712",
        "snippet": "[Winner] has been elected as the new leader of the Labour Party, defeating [runner-up]. The result was announced at a special conference..."
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
      "description_preview": "Full coverage of the Labour leadership result. Includes the victory speech and reaction from Westminster."
    }
  ]
}`;

