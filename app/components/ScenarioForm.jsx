"use client";

import { useState, useRef, useCallback } from "react";
import TimelineMosaic from "./TimelineMosaic";

const LOADING_MESSAGES = [
  "Dispatching reporters…",
  "Interviewing sources…",
  "Writing headlines…",
  "Penning op-eds…",
  "Crafting tweets…",
  "Posting to Reddit…",
  "Writing official statements…",
  "Editing Wikipedia…",
  "Googling the aftermath…",
  "Uploading to YouTube…",
  "Laying out the timeline…",
];

const ITEM_LABELS = {
  articles: "articles",
  oped: "op-eds",
  developments: "developments",
  tweets: "tweets",
  reddit_posts: "Reddit posts",
  facebook_post: "Facebook posts",
  wikipedia: "Wikipedia pages",
  google_results: "Google results",
  youtube_videos: "YouTube videos",
};

function parseSSE(buffer) {
  const events = [];
  const parts = buffer.split("\n\n");
  const rest = parts.pop();

  for (const part of parts) {
    const lines = part.split("\n");
    let eventType = "message";
    let data = "";

    for (const line of lines) {
      if (line.startsWith("event: ")) eventType = line.slice(7).trim();
      else if (line.startsWith("data: ")) data = line.slice(6);
    }

    if (data) {
      try {
        events.push({ type: eventType, data: JSON.parse(data) });
      } catch {}
    }
  }

  return { events, rest };
}

function countItems(data) {
  let count = 0;
  if (data.articles?.length) count += data.articles.length;
  if (data.oped) count += 1;
  if (data.developments?.length) count += data.developments.length;
  if (data.tweets?.length) count += data.tweets.length;
  if (data.reddit_posts?.length) count += data.reddit_posts.length;
  if (data.facebook_post) count += 1;
  if (data.wikipedia) count += 1;
  if (data.google_results) count += 1;
  if (data.youtube_videos?.length) count += data.youtube_videos.length;
  return count;
}

export default function ScenarioForm() {
  const [scenario, setScenario] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | loading | streaming | done | error
  const [timelineData, setTimelineData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [partialError, setPartialError] = useState(null);
  const [submittedScenario, setSubmittedScenario] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const timelineRef = useRef(null);
  const abortRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!scenario.trim()) return;

    const input = scenario.trim();
    setSubmittedScenario(input);
    setPartialError(null);
    setTimelineData(null);
    setPhase("loading");
    setProgress(0);
    setStatusMessage("Starting…");

    // Spin loading messages during initial phase
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIndex]);
    }, 2500);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: input }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errMsg = `Server error (${res.status})`;
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream available");

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = {
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

      // Stop the rotating messages — we'll use SSE status messages now
      clearInterval(msgInterval);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const { events, rest } = parseSSE(buffer);
        buffer = rest;

        for (const event of events) {
          switch (event.type) {
            case "status": {
              setStatusMessage(event.data.message || "");
              setProgress(event.data.progress || 0);
              break;
            }
            case "data": {
              accumulated = { ...accumulated, ...event.data };
              setTimelineData({ ...accumulated });

              // If we have articles (the core content), switch to streaming view
              if (accumulated.articles?.length > 0 || accumulated.tweets?.length > 0) {
                setPhase("streaming");
              }
              break;
            }
            case "error": {
              setPartialError(event.data.message);
              break;
            }
            case "fatal_error": {
              throw new Error(event.data.message);
            }
            case "done": {
              setTimelineData({ ...accumulated });
              setPhase("done");
              break;
            }
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("[ScenarioForm] Generation failed:", err.message);
      setErrorMessage(err.message);
      if (timelineData && (timelineData.articles?.length > 0 || timelineData.tweets?.length > 0)) {
        setPartialError(err.message);
      } else {
        setPhase("error");
      }
    } finally {
      clearInterval(msgInterval);
      abortRef.current = null;
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    setPhase("idle");
    setScenario("");
    setTimelineData(null);
    setErrorMessage("");
    setPartialError(null);
    setSubmittedScenario("");
    setStatusMessage("");
    setProgress(0);
  }

  const handleScreenshot = useCallback(async () => {
    if (!timelineRef.current) return;
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(timelineRef.current, {
        backgroundColor: darkMode ? "#15202B" : "#F0F2F5",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `allegedly-${submittedScenario.slice(0, 30).replace(/[^a-z0-9]/gi, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Screenshot failed:", err);
      alert("Screenshot failed. Try again.");
    }
  }, [darkMode, submittedScenario]);

  function itemCount() {
    if (!timelineData) return 0;
    return countItems(timelineData);
  }

  // ---- IDLE ----
  if (phase === "idle") {
    return (
      <div className="landing-container">
        <img src="/icons/icon.webp" alt="Allegedly News" className="landing-icon" />
        <h1>Generate a Timeline</h1>
        <p className="landing-subtitle">
          Enter an alternative-history scenario and we&apos;ll generate an entire
          media timeline: news, tweets, Reddit posts, Wikipedia entries, and more.
        </p>
        <form className="scenario-form" onSubmit={handleSubmit}>
          <input
            type="text"
            id="scenario-input"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="If Jeremy Corbyn won in 2017..."
            autoFocus
          />
          <button type="submit" id="generate-btn" disabled={!scenario.trim()}>
            Generate Timeline
          </button>
        </form>
      </div>
    );
  }

  // ---- LOADING (no data yet) ----
  if (phase === "loading") {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <div className="loading-bar-track">
          <div className="loading-bar-fill" style={{ width: `${Math.min(progress, 60)}%` }} />
        </div>
        <p className="loading-text">{statusMessage || loadingMsg}</p>
        <p className="loading-subtext">
          Generating news articles, op-eds, statements, tweets, Reddit threads,
          Wikipedia entries, and YouTube videos for &ldquo;{submittedScenario}&rdquo;.
        </p>
      </div>
    );
  }

  // ---- ERROR (no data) ----
  if (phase === "error") {
    return (
      <div className="error-banner">
        <h3>Generation Failed</h3>
        <p>{errorMessage}</p>
        <button onClick={handleReset} id="try-again-btn">
          Try Again
        </button>
      </div>
    );
  }

  // ---- STREAMING + DONE: show timeline ----
  const isStreaming = phase === "streaming";

  return (
    <div className={darkMode ? "timeline-wrapper dark-mode" : "timeline-wrapper"}>
      {/* Progress bar (visible during streaming) */}
      {isStreaming && (
        <div className="streaming-progress">
          <div className="streaming-progress-bar">
            <div
              className="streaming-progress-fill"
              style={{ width: `${Math.min(progress + 10, 95)}%` }}
            />
          </div>
          <div className="streaming-info">
            <span className="streaming-status">{statusMessage}</span>
            <span className="streaming-count">{itemCount()} items generated</span>
          </div>
          {partialError && (
            <div className="streaming-error">{partialError}</div>
          )}
        </div>
      )}

      {/* Partial error banner during streaming */}
      {!isStreaming && partialError && (
        <div className="streaming-error streaming-error--banner">
          {partialError}
        </div>
      )}

      {/* Toolbar */}
      <div className="timeline-toolbar">
        <div className="toolbar-left">
          <p className="scenario-label">
            Scenario: <strong>&ldquo;{submittedScenario}&rdquo;</strong>
          </p>
        </div>
        <div className="toolbar-right">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="toolbar-btn"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M9.37 5.51A7.35 7.35 0 009.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27A7.014 7.014 0 0112 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
              </svg>
            )}
          </button>
          <button onClick={handleScreenshot} className="toolbar-btn" title="Download as image" disabled={isStreaming}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" />
            </svg>
          </button>
          <button onClick={handleReset} className="toolbar-btn toolbar-btn--primary">
            {isStreaming ? "Cancel" : "New Scenario"}
          </button>
        </div>
      </div>

      {/* Timeline content */}
      <div ref={timelineRef} className="timeline-content">
        <TimelineMosaic data={timelineData} />
      </div>
    </div>
  );
}
