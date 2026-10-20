"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TimelineMosaic from "./TimelineMosaic";
import { useGeneration, countItems, MAX_SCENARIO_LENGTH } from "./useGeneration";

export default function ScenarioForm() {
  const {
    phase,
    data,
    failedSections,
    isPending,
    progress,
    statusMessage,
    fatalError,
    submittedScenario,
    generate,
    retrySection,
    reset,
  } = useGeneration();

  const [scenario, setScenario] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [waitTime, setWaitTime] = useState(0);
  const [screenshotError, setScreenshotError] = useState("");
  const timelineRef = useRef(null);

  // Elapsed-time counter for the loading/streaming states.
  useEffect(() => {
    if (phase !== "loading" && phase !== "streaming") {
      setWaitTime(0);
      return undefined;
    }

    const startedAt = Date.now();
    const id = setInterval(() => setWaitTime(Math.round((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  function handleSubmit(e) {
    e.preventDefault();
    const value = scenario.trim();
    if (!value) return;
    setScreenshotError("");
    setShowScenario(false);
    generate(value);
  }

  function handleReset() {
    reset();
    setScenario("");
    setScreenshotError("");
    setShowScenario(false);
  }

  async function retryAllFailed() {
    setScreenshotError("");
    for (const section of failedSections) {
      // Sequential so the reference retry can reuse refreshed headlines.
      await retrySection(section.name);
    }
  }

  const handleScreenshot = useCallback(async () => {
    if (!timelineRef.current) return;

    setScreenshotError("");

    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(timelineRef.current, {
        backgroundColor: darkMode ? "#15202B" : "#F0F2F5",
        scale: 2,
        useCORS: true,
        // Tainting the canvas makes toDataURL throw; skip CORS-blocked images instead.
        allowTaint: false,
        imageTimeout: 15000,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `allegedly-${submittedScenario.slice(0, 30).replace(/[^a-z0-9]/gi, "-") || "timeline"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Screenshot failed:", err);
      setScreenshotError("Screenshot failed — some images may not allow embedding. You can still screenshot the page manually.");
    }
  }, [darkMode, submittedScenario]);

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
          <textarea
            id="scenario-input"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (scenario.trim()) handleSubmit(e);
              }
            }}
            maxLength={MAX_SCENARIO_LENGTH}
            aria-describedby="scenario-hint"
            placeholder="If Jeremy Corbyn won in 2017..."
            autoFocus
            rows={1}
          />
          <button type="submit" id="generate-btn" disabled={!scenario.trim()}>
            Generate Timeline
          </button>
        </form>
        <p id="scenario-hint" className="scenario-hint">
          <span className={scenario.length >= MAX_SCENARIO_LENGTH ? "scenario-hint__count--limit" : undefined}>
            {scenario.length}/{MAX_SCENARIO_LENGTH}
          </span>{" "}
          characters · Enter to generate, Shift+Enter for a new line
        </p>
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
        <p className="loading-text" role="status" aria-live="polite">
          {statusMessage || "Starting…"}
        </p>
        {waitTime > 15 && (
          <p className="loading-warning">
            Taking longer than expected&hellip; ({waitTime}s)
            {waitTime > 40 && <span> The model is under load. Still working&hellip;</span>}
          </p>
        )}
        <p className="loading-subtext">
          Generating news articles, op-eds, statements, tweets, Reddit threads,
          Wikipedia entries, and YouTube videos for &ldquo;{submittedScenario}&rdquo;.
        </p>
        <button onClick={handleReset} className="toolbar-btn loading-cancel">
          Cancel
        </button>
      </div>
    );
  }

  // ---- ERROR (nothing generated) ----
  if (phase === "error") {
    return (
      <div className="error-banner" role="alert">
        <h3>Generation Failed</h3>
        <p>{fatalError?.message ?? "Something went wrong while generating the timeline."}</p>
        {fatalError?.hint && <p className="error-banner__hint">{fatalError.hint}</p>}
        {fatalError?.raw && (
          <details className="error-banner__details">
            <summary>Technical details</summary>
            <code>{fatalError.raw}</code>
          </details>
        )}
        <button onClick={handleReset} id="try-again-btn">
          Try Again
        </button>
      </div>
    );
  }

  // ---- STREAMING + DONE: show timeline ----
  const isStreaming = phase === "streaming" || isPending;
  const hasFailed = failedSections.length > 0;

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
            <span className="streaming-status" role="status" aria-live="polite">
              {statusMessage || "Finishing up…"}
            </span>
            <span className="streaming-count">{countItems(data)} items generated</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="timeline-toolbar">
        <div className="toolbar-left">
          <button
            className="scenario-toggle"
            onClick={() => setShowScenario(!showScenario)}
            title={showScenario ? "Hide scenario" : "Show scenario"}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              style={{ transform: showScenario ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            >
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
            <span className="scenario-toggle-label">Scenario</span>
          </button>
          {showScenario && (
            <p className="scenario-label">{submittedScenario}</p>
          )}
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
          <button
            onClick={handleScreenshot}
            className="toolbar-btn"
            title="Download as image"
            disabled={isStreaming}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" />
            </svg>
          </button>
          <button onClick={handleReset} className="toolbar-btn toolbar-btn--primary">
            {isStreaming ? "Cancel" : "New Scenario"}
          </button>
        </div>
      </div>

      {/* Section failures — keep whatever succeeded, offer targeted retries */}
      {hasFailed && (
        <div className="section-errors" role="alert">
          <div className="section-errors__head">
            <span>
              {failedSections.length === 1
                ? "One section failed. The rest of the timeline is still here."
                : `${failedSections.length} sections failed. The rest of the timeline is still here.`}
            </span>
            {failedSections.length > 1 && (
              <button onClick={retryAllFailed} disabled={isPending} className="section-errors__retry-all">
                Retry all
              </button>
            )}
          </div>
          <ul className="section-errors__list">
            {failedSections.map((section) => (
              <li key={section.name} className="section-error">
                <div className="section-error__text">
                  <strong>{section.label}</strong>
                  <p>{section.message}</p>
                  {section.hint && <p className="section-error__hint">{section.hint}</p>}
                  {section.raw && (
                    <details className="section-error__details">
                      <summary>Technical details</summary>
                      <code>{section.raw}</code>
                    </details>
                  )}
                </div>
                <button
                  onClick={() => retrySection(section.name)}
                  disabled={isPending}
                  className="section-error__retry"
                >
                  Retry
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {screenshotError && (
        <div className="streaming-error streaming-error--banner" role="status">
          {screenshotError}
        </div>
      )}

      {/* Timeline content */}
      <div ref={timelineRef} className="timeline-content">
        {data ? (
          <TimelineMosaic data={data} />
        ) : (
          <p className="timeline-empty">Waiting for the first section…</p>
        )}
      </div>
    </div>
  );
}
