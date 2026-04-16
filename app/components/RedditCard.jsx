"use client";

/**
 * RedditCard — realistic Reddit feed card
 */

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(num);
}

export default function RedditCard({ post }) {
  if (!post) return null;

  return (
    <div className="reddit-card">
      {/* Vote column */}
      <div className="reddit-vote-col">
        <svg viewBox="0 0 20 20" width="20" height="20" className="reddit-upvote">
          <path fill="#878A8C" d="M12.877 19H7.123A1.125 1.125 0 016 17.877V11H2.126a1.114 1.114 0 01-1.007-.7 1.249 1.249 0 01.171-1.343L9.166.368a1.128 1.128 0 011.668.004l7.872 8.581a1.252 1.252 0 01.176 1.348 1.114 1.114 0 01-1.005.7H14v6.877A1.125 1.125 0 0112.877 19zM7.25 17.75h5.5v-8h4.934L10 1.31 2.258 9.75H7.25v8zM2.227 9.784l-.012.016c.01-.006.014-.01.012-.016z" />
        </svg>
        <span className="reddit-vote-count">{formatNumber(post.upvotes)}</span>
        <svg viewBox="0 0 20 20" width="20" height="20" className="reddit-downvote">
          <path fill="#878A8C" d="M10 20a1.122 1.122 0 01-.834-.372l-7.872-8.581A1.251 1.251 0 011.118 9.7 1.114 1.114 0 012.123 9H6V2.123A1.125 1.125 0 017.123 1h5.754A1.125 1.125 0 0114 2.123V9h3.874a1.114 1.114 0 011.007.7 1.25 1.25 0 01-.171 1.345l-7.876 8.589A1.128 1.128 0 0110 20zm-7.684-9.25L10 18.69l7.741-7.94H12.75v-8h-5.5v8H2.316zm15.469-.05c-.01 0-.014.007-.012.013l.012-.013z" />
        </svg>
      </div>

      {/* Content */}
      <div className="reddit-content">
        {/* Meta line */}
        <div className="reddit-meta">
          {/* Subreddit icon (small colored circle) */}
          <div
            className="reddit-sub-icon"
            style={{
              backgroundColor: getSubredditColor(post.subreddit),
            }}
          >
            <span>r/</span>
          </div>
          <span className="reddit-subreddit">r/{post.subreddit}</span>
          <span className="reddit-dot">·</span>
          <span className="reddit-posted-by">
            Posted by u/{post.author} {post.timestamp}
          </span>
        </div>

        {/* Flair */}
        {post.flair && (
          <span className="reddit-flair">{post.flair}</span>
        )}

        {/* Title */}
        <h3 className="reddit-title">{post.title}</h3>

        {/* Action bar */}
        <div className="reddit-actions">
          <div className="reddit-action">
            <svg viewBox="0 0 20 20" width="16" height="16">
              <path fill="#878A8C" d="M7.725 19.872a.718.718 0 01-.607-.328.725.725 0 01-.118-.397V16H3.625A2.63 2.63 0 011 13.375v-9.75A2.629 2.629 0 013.625 1h12.75A2.63 2.63 0 0119 3.625v9.75A2.63 2.63 0 0116.375 16h-4.161l-4 3.681a.725.725 0 01-.489.191zM3.625 2.25A1.377 1.377 0 002.25 3.625v9.75a1.377 1.377 0 001.375 1.375h4.5v3.469l3.619-3.336.169-.133h4.462a1.377 1.377 0 001.375-1.375v-9.75a1.377 1.377 0 00-1.375-1.375H3.625z" />
            </svg>
            <span>{formatNumber(post.comment_count)} Comments</span>
          </div>
          <div className="reddit-action">
            <svg viewBox="0 0 20 20" width="16" height="16">
              <path fill="#878A8C" d="M18.898 14.047l-4.388-4.376.707-.707 3.535 3.523V3h1v9.487l3.536-3.523.707.707-4.389 4.376a.5.5 0 01-.708 0zM5.304 5.947l4.389 4.376-.707.707L5.45 7.507V17h-1V7.507L.914 11.03l-.707-.707 4.389-4.376a.5.5 0 01.708 0z" transform="rotate(90 10 10)" />
            </svg>
            <span>Share</span>
          </div>
          <div className="reddit-action">
            <svg viewBox="0 0 20 20" width="16" height="16">
              <path fill="#878A8C" d="M4 4.5C4 3.12 5.119 2 6.5 2h7C14.881 2 16 3.12 16 4.5v15.003l-6-3.428-6 3.428V4.5zM6.5 3.5c-.276 0-.5.224-.5.5v12.81l4.5-2.571L15 16.81V4.5c0-.276-.224-.5-.5-.5h-7z" />
            </svg>
            <span>Save</span>
          </div>
          <div className="reddit-action">
            <span>···</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSubredditColor(subreddit) {
  const colors = {
    worldnews: "#FF4500",
    politics: "#0079D3",
    news: "#FF4500",
    unitedkingdom: "#012169",
    europe: "#003399",
    OutOfTheLoop: "#46D160",
    AskReddit: "#FF6314",
    technology: "#00A6A6",
    economics: "#2E8B57",
    science: "#0B7A75",
  };
  const sub = subreddit.toLowerCase();
  for (const [key, color] of Object.entries(colors)) {
    if (sub.includes(key.toLowerCase())) return color;
  }
  // Deterministic color from name
  const hash = subreddit.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const fallback = ["#FF4500", "#0079D3", "#46D160", "#FFB000", "#7B68EE", "#FF6314", "#00A6A6"];
  return fallback[hash % fallback.length];
}
