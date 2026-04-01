import { NextResponse } from "next/server";

// ---- Configuration ----
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "x-ai/grok-4-fast";
// "openai/gpt-4o";

const SYSTEM_PROMPT = `You are a satirical newspaper headline generator. Given an alternative-history scenario, you must generate a fake newspaper front page with articles from different real-world publications, as if that alternative-history was entirely true.

INSTRUCTION: Do not just repeat the user's scenario in every headline. Instead, simulate the DOMINO EFFECT. If the scenario happens, what are the secondary consequences? 
- What are the scandalous reactions from relevant people? 
- Are there protests? 
- Is the stock market crashing? 
- What is the 'hot take' from a tabloid vs the 'analysis' from a broadsheet?
- At least 3 of the 7 articles should be about CONSEQUENCES or REACTIONS, not the event itself.

IMPORTANT RULES:
1. Return ONLY valid JSON, no markdown, no code fences, no extra text.
2. Generate exactly 7 articles from different publications. Use a mix of relevant country's tabloids and broadsheets (and some foreign media if it would be international news) CRITICAL GEOGRAPHY RULE: You must analyze the scenario and choose publications native to the country where the scenario takes place (e.g., for a USA scenario, use NY Post, Fox News, Washington Post; for a French scenario, use Le Figaro, Libération, Le Parisien). Include 3 or 4 major foreign/international papers if the event has global impact.
3. Always use a mix of low-brow, sensationalist tabloids and high-brow, serious broadsheets to show different political biases. 
4. Each article must match the editorial voice and style of its publication. Tabloid headlines should be punchy, dramatic, and use wordplay. Broadsheet headlines should be measured and authoritative. 
5. Foreign publications should have their headlines and text written in English.
6. For the 'image_search_query' field: Provide a high-quality Google Image search string. Since we are using a real-world search API, provide a descriptive "news photo" query that captures the mood of the scenario, but will return real-life images.

Return this exact JSON structure:
{
  "image_search_query": "Entity Name",
  "articles": [
    {
      "publication": "PUBLICATION NAME",
      "headline": "PUNCHY HEADLINE HERE",
      "subheadline": "For the First article, it should be six sentences. For all the rest, it should be a short 1-2 sentences. It must sound exactly like the actual publication would write it, capturing their political bias and stylistic tone perfectly."
    }
  ]
}`;

export const maxDuration = 60;

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

    // Check if we got valid image results back
    if (!data.images || !Array.isArray(data.images)) {
      return [];
    }

    const validImages = data.images.filter(img => {
      const url = img.imageUrl.toLowerCase();
      return (
        !url.includes('lookaside.instagram.com') &&
        !url.includes('scontent.cdninstagram.com') &&
        !url.includes('lookaside.fbsbx.com') &&
        !url.includes("www.tiktok.com") &&
        !url.includes('fbcdn.net') // Throws out Facebook's strict hotlink blockers too
      );
    });

    // Extract just the image URLs, limited to the count we need
    return validImages.slice(0, count).map(img => img.imageUrl);

  } catch (err) {
    console.error("Serper fetch failed:", err.message);
    return [];
  }
}

// ---- Wikimedia Commons image search ----
async function fetchWikimediaImages(query, count = 5) {
  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrnamespace: "6", // File namespace
      gsrsearch: query,
      gsrlimit: String(count),
      prop: "imageinfo",
      iiprop: "url|mime",
      iiurlwidth: "800",
      format: "json",
      origin: "*",
    });

    const res = await fetch(
      `https://commons.wikimedia.org/w/api.php?${params.toString()}`,
      {
        headers: {
          "User-Agent": "AllegedlyNews/1.0 (https://allegedly.news)",
        },
      }
    );

    if (!res.ok) {
      console.error("Wikimedia API error:", res.status);
      return [];
    }

    const data = await res.json();
    const pages = data?.query?.pages;

    if (!pages) return [];

    const imageUrls = [];
    for (const page of Object.values(pages)) {
      const info = page?.imageinfo?.[0];
      if (!info) continue;

      // Only use actual images (skip SVG, PDF, etc.)
      const mime = info.mime || "";
      if (
        mime.startsWith("image/") &&
        !mime.includes("svg") &&
        !mime.includes("tiff")
      ) {
        // Prefer the thumbnail (resized) URL for performance
        const url = info.thumburl || info.url;
        if (url) imageUrls.push(url);
      }
    }

    return imageUrls;
  } catch (err) {
    console.error("Wikimedia fetch failed:", err.message);
    return [];
  }
}

// ---- Main handler ----
export async function POST(request) {
  // Validate API key exists
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error: missing OPENROUTER_API_KEY" },
      { status: 500 }
    );
  }

  // Parse request body
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

  // ---- Step A: Call OpenRouter LLM ----
  let llmData;
  try {
    const llmRes = await fetch(OPENROUTER_API_URL, {
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
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Generate a newspaper front page for this scenario: "${scenario.trim()}"`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.9,
        max_tokens: 2000,
      }),
    });

    if (!llmRes.ok) {
      const errText = await llmRes.text();
      console.error("OpenRouter error:", llmRes.status, errText);
      return NextResponse.json(
        {
          error: `LLM service error (${llmRes.status}). Please try again.`,
        },
        { status: 502 }
      );
    }

    const llmJson = await llmRes.json();
    const content = llmJson?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "LLM returned an empty response" },
        { status: 502 }
      );
    }

    // Parse the LLM's JSON output
    try {
      llmData = JSON.parse(content);
    } catch {
      console.error("Failed to parse LLM JSON:", content.substring(0, 500));
      return NextResponse.json(
        { error: "LLM returned malformed JSON. Please try again." },
        { status: 502 }
      );
    }

    // Validate structure
    if (!llmData.articles || !Array.isArray(llmData.articles)) {
      return NextResponse.json(
        { error: "LLM response missing articles array" },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("LLM call failed:", err.message);
    return NextResponse.json(
      { error: "Failed to contact LLM service. Please try again." },
      { status: 502 }
    );
  }

  // // ---- Step B: Fetch images from Wikimedia ----
  // const imageQuery = llmData.image_search_query || scenario.trim();
  // const imageUrls = await fetchWikimediaImages(
  //   imageQuery,
  //   llmData.articles.length
  // );

  // ---- Step B: Fetch exactly 7 images from Serper using the master query ----
  // Fallback to the raw scenario text if the LLM forgot to generate the master query
  const imageQuery = llmData.master_image_search_query || scenario.trim();
  const imageUrls = await fetchSerperImages(imageQuery, 7);

  // Assign images to articles (round-robin if fewer images than articles)
  const articles = llmData.articles.map((article, i) => ({
    publication: article.publication || "Unknown",
    headline: article.headline || "Untitled",
    subheadline: article.subheadline || "",
    image_url: imageUrls[i % Math.max(imageUrls.length, 1)] || null,
  }));

  // ---- Step C: Return compiled response ----
  return NextResponse.json({ articles });
}
