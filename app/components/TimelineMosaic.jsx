"use client";

/**
 * TimelineMosaic — Masonry/Pinterest-style layout that mixes all content types
 * into a collage. Uses CSS columns for the masonry effect (no JS layout library needed).
 */

import TweetCard from "./TweetCard";
import RedditCard from "./RedditCard";
import WikipediaCard from "./WikipediaCard";
import NewsCard from "./NewsCard";
import GoogleResultsCard from "./GoogleResultsCard";
import YouTubeCard from "./YouTubeCard";
import FacebookCard from "./FacebookCard";

/**
 * Build a shuffled array of timeline items from all content types.
 * We interleave them for a natural-feeling mosaic.
 */
function buildTimelineItems(data) {
  const items = [];

  // News articles
  if (data.articles) {
    data.articles.forEach((article, i) => {
      items.push({ type: "news", data: article, priority: i === 0 ? 0 : 2, id: `news-${i}` });
    });
  }

  // Tweets
  if (data.tweets) {
    data.tweets.forEach((tweet, i) => {
      items.push({ type: "tweet", data: tweet, priority: 3, id: `tweet-${i}` });
    });
  }

  // Reddit posts
  if (data.reddit_posts) {
    data.reddit_posts.forEach((post, i) => {
      items.push({ type: "reddit", data: post, priority: 4, id: `reddit-${i}` });
    });
  }

  // Facebook post
  if (data.facebook_post) {
    items.push({ type: "facebook", data: data.facebook_post, priority: 5, id: "facebook-0" });
  }

  // Wikipedia
  if (data.wikipedia) {
    items.push({ type: "wikipedia", data: data.wikipedia, priority: 1, id: "wiki-0" });
  }

  // Google results
  if (data.google_results) {
    items.push({ type: "google", data: data.google_results, priority: 6, id: "google-0" });
  }

  // YouTube videos
  if (data.youtube_videos) {
    data.youtube_videos.forEach((video, i) => {
      items.push({ type: "youtube", data: video, priority: 7, id: `yt-${i}` });
    });
  }

  // Sort by priority to get a good visual order, then interleave
  items.sort((a, b) => a.priority - b.priority);

  // Interleave: take items in a pattern that creates variety
  // We want: news, tweet, news, reddit, news, wiki, tweet, google, news, fb, ...
  const news = items.filter((i) => i.type === "news");
  const social = items.filter((i) => ["tweet", "reddit", "facebook"].includes(i.type));
  const reference = items.filter((i) => ["wikipedia", "google", "youtube"].includes(i.type));

  const interleaved = [];
  let ni = 0, si = 0, ri = 0;

  // Pattern: news, social, news, reference, social, news, social, reference...
  const pattern = ["news", "social", "news", "reference", "social", "news", "social", "reference", "news", "social"];

  for (const slot of pattern) {
    if (slot === "news" && ni < news.length) {
      interleaved.push(news[ni++]);
    } else if (slot === "social" && si < social.length) {
      interleaved.push(social[si++]);
    } else if (slot === "reference" && ri < reference.length) {
      interleaved.push(reference[ri++]);
    }
  }

  // Add any remaining items
  while (ni < news.length) interleaved.push(news[ni++]);
  while (si < social.length) interleaved.push(social[si++]);
  while (ri < reference.length) interleaved.push(reference[ri++]);

  return interleaved;
}

function TimelineItem({ item }) {
  switch (item.type) {
    case "news":
      return <NewsCard article={item.data} />;
    case "tweet":
      return <TweetCard tweet={item.data} />;
    case "reddit":
      return <RedditCard post={item.data} />;
    case "wikipedia":
      return <WikipediaCard data={item.data} />;
    case "google":
      return <GoogleResultsCard data={item.data} />;
    case "youtube":
      return <YouTubeCard video={item.data} />;
    case "facebook":
      return <FacebookCard post={item.data} />;
    default:
      return null;
  }
}

export default function TimelineMosaic({ data }) {
  if (!data) return null;

  const items = buildTimelineItems(data);

  if (items.length === 0) return null;

  return (
    <div className="timeline-mosaic">
      {items.map((item) => (
        <div key={item.id} className={`mosaic-item mosaic-item--${item.type}`}>
          <TimelineItem item={item} />
        </div>
      ))}
    </div>
  );
}
