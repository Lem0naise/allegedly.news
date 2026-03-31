"use client";

import { useState } from "react";
import NewspaperLayout from "./NewspaperLayout";

const LOADING_MESSAGES = [
  "Dispatching reporters…",
  "Interviewing sources…",
  "Writing headlines…",
  "Checking facts (just kidding)…",
  "Setting the type…",
  "Laying out the front page…",
];

export default function ScenarioForm() {
  const [scenario, setScenario] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [articles, setArticles] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedScenario, setSubmittedScenario] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!scenario.trim()) return;

    setStatus("loading");
    setSubmittedScenario(scenario.trim());
    setErrorMessage("");
    setArticles(null);

    // Cycle through loading messages
    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIndex]);
    }, 2500);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenario.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (!data.articles || !Array.isArray(data.articles)) {
        throw new Error("Invalid response format from server");
      }

      setArticles(data.articles);
      setStatus("done");
    } catch (err) {
      setErrorMessage(err.message);
      setStatus("error");
    } finally {
      clearInterval(interval);
    }
  }

  function handleReset() {
    setStatus("idle");
    setScenario("");
    setArticles(null);
    setErrorMessage("");
    setSubmittedScenario("");
  }

  // ---- IDLE: show landing with form ----
  if (status === "idle") {
    return (
      <div className="landing-container">
        <img
          src="/icons/icon.webp"
          alt="Allegedly News"
          className="landing-icon"
        />
        <h1>Generate a Front Page</h1>
        <p className="landing-subtitle">
          Enter an alternative-history scenario and we&apos;ll generate satirical
          headlines from major publications.
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
            Generate Front Page
          </button>
        </form>
      </div>
    );
  }

  // ---- LOADING ----
  if (status === "loading") {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">{loadingMsg}</p>
        <p className="loading-subtext">
          This may take 10–20 seconds. We&apos;re generating articles from
          multiple publications for &ldquo;{submittedScenario}&rdquo;.
        </p>
      </div>
    );
  }

  // ---- ERROR ----
  if (status === "error") {
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

  // ---- DONE: show newspaper ----
  return (
    <>
      <div className="reset-bar">
        <button onClick={handleReset} id="new-scenario-btn">
          New Scenario
        </button>
      </div>
      <NewspaperLayout articles={articles} />
      <p className="scenario-label">
        Scenario: <strong>&ldquo;{submittedScenario}&rdquo;</strong>
      </p>
    </>
  );
}
