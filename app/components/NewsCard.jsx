"use client";

/**
 * NewsCard — publication-specific styled news headline card
 * Supports: NYT, BBC, Fox News, The Guardian, CNN, Al Jazeera, Reuters,
 *           Daily Mail, Washington Post, The Times, Sky News, New York Post,
 *           The Onion, Le Monde
 */

const PUBLICATION_STYLES = {
  nyt: {
    key: "nyt",
    name: "The New York Times",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    headlineFont: "'Georgia', 'Times New Roman', serif",
    bg: "#FFFFFF",
    fg: "#121212",
    accent: "#121212",
    border: "#E2E2E2",
    logoBg: "transparent",
    logoColor: "#121212",
    style: "broadsheet",
  },
  bbc: {
    key: "bbc",
    name: "BBC News",
    fontFamily: "'Arial', 'Helvetica', sans-serif",
    headlineFont: "'Arial', 'Helvetica', sans-serif",
    bg: "#FFFFFF",
    fg: "#1A1A1A",
    accent: "#BB1919",
    border: "#E6E8EA",
    logoBg: "#BB1919",
    logoColor: "#FFFFFF",
    style: "broadcaster",
  },
  fox: {
    key: "fox",
    name: "Fox News",
    fontFamily: "'Arial', 'Helvetica', sans-serif",
    headlineFont: "'Arial Black', 'Arial', sans-serif",
    bg: "#FFFFFF",
    fg: "#222222",
    accent: "#003366",
    border: "#003366",
    logoBg: "#003366",
    logoColor: "#FFFFFF",
    style: "tabloid",
  },
  guardian: {
    key: "guardian",
    name: "The Guardian",
    fontFamily: "'Georgia', serif",
    headlineFont: "'Georgia', serif",
    bg: "#052962",
    fg: "#FFFFFF",
    accent: "#FFE500",
    border: "#506991",
    logoBg: "#052962",
    logoColor: "#FFFFFF",
    style: "broadsheet",
  },
  cnn: {
    key: "cnn",
    name: "CNN",
    fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
    headlineFont: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
    bg: "#FFFFFF",
    fg: "#1A1A1A",
    accent: "#CC0000",
    border: "#E8E8E8",
    logoBg: "#CC0000",
    logoColor: "#FFFFFF",
    style: "broadcaster",
  },
  aljazeera: {
    key: "aljazeera",
    name: "Al Jazeera",
    fontFamily: "'Georgia', serif",
    headlineFont: "'Georgia', serif",
    bg: "#FFFFFF",
    fg: "#1A1A1A",
    accent: "#D2A44E",
    border: "#D2A44E",
    logoBg: "#D2A44E",
    logoColor: "#FFFFFF",
    style: "broadsheet",
  },
  reuters: {
    key: "reuters",
    name: "Reuters",
    fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
    headlineFont: "'Helvetica Neue', 'Arial', sans-serif",
    bg: "#FFFFFF",
    fg: "#1A1A1A",
    accent: "#FF8000",
    border: "#E5E5E5",
    logoBg: "#FF8000",
    logoColor: "#FFFFFF",
    style: "wire",
  },
  dailymail: {
    key: "dailymail",
    name: "Daily Mail",
    fontFamily: "'Arial', sans-serif",
    headlineFont: "'Arial Black', 'Impact', sans-serif",
    bg: "#FFFFFF",
    fg: "#1A1A1A",
    accent: "#004DB3",
    border: "#004DB3",
    logoBg: "#004DB3",
    logoColor: "#FFFFFF",
    style: "tabloid",
  },
  washpost: {
    key: "washpost",
    name: "The Washington Post",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    headlineFont: "'Georgia', 'Times New Roman', serif",
    bg: "#FFFFFF",
    fg: "#1A1A1A",
    accent: "#1A1A1A",
    border: "#E9E9E9",
    logoBg: "transparent",
    logoColor: "#1A1A1A",
    style: "broadsheet",
  },
  thetimes: {
    key: "thetimes",
    name: "The Times",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    headlineFont: "'Georgia', 'Times New Roman', serif",
    bg: "#FFFFFF",
    fg: "#1D1D1B",
    accent: "#1D1D1B",
    border: "#CCC",
    logoBg: "#1D1D1B",
    logoColor: "#FFFFFF",
    style: "broadsheet",
  },
  skynews: {
    key: "skynews",
    name: "Sky News",
    fontFamily: "'Arial', 'Helvetica', sans-serif",
    headlineFont: "'Arial', 'Helvetica', sans-serif",
    bg: "#FFFFFF",
    fg: "#1A1A1A",
    accent: "#9E0000",
    border: "#E0E0E0",
    logoBg: "#9E0000",
    logoColor: "#FFFFFF",
    style: "broadcaster",
  },
  nypost: {
    key: "nypost",
    name: "New York Post",
    fontFamily: "'Arial', sans-serif",
    headlineFont: "'Impact', 'Arial Black', sans-serif",
    bg: "#FFFFFF",
    fg: "#1A1A1A",
    accent: "#CF1920",
    border: "#CF1920",
    logoBg: "#CF1920",
    logoColor: "#FFFFFF",
    style: "tabloid",
  },
  theonion: {
    key: "theonion",
    name: "The Onion",
    fontFamily: "'Georgia', serif",
    headlineFont: "'Georgia', serif",
    bg: "#FFFFFF",
    fg: "#1A1A1A",
    accent: "#1A6826",
    border: "#1A6826",
    logoBg: "#1A6826",
    logoColor: "#FFFFFF",
    style: "satirical",
  },
  lemonde: {
    key: "lemonde",
    name: "Le Monde",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    headlineFont: "'Georgia', 'Times New Roman', serif",
    bg: "#FFFFFF",
    fg: "#1A1A1A",
    accent: "#1A1A1A",
    border: "#D9D9D9",
    logoBg: "#1A1A1A",
    logoColor: "#FFFFFF",
    style: "broadsheet",
  },
};

function matchPublication(name) {
  const lower = (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (lower.includes("newyorktimes") || lower === "nyt") return PUBLICATION_STYLES.nyt;
  if (lower.includes("bbc")) return PUBLICATION_STYLES.bbc;
  if (lower.includes("foxnews") || lower === "fox") return PUBLICATION_STYLES.fox;
  if (lower.includes("guardian")) return PUBLICATION_STYLES.guardian;
  if (lower.includes("cnn")) return PUBLICATION_STYLES.cnn;
  if (lower.includes("aljazeera")) return PUBLICATION_STYLES.aljazeera;
  if (lower.includes("reuters")) return PUBLICATION_STYLES.reuters;
  if (lower.includes("dailymail")) return PUBLICATION_STYLES.dailymail;
  if (lower.includes("washingtonpost") || lower.includes("wapo")) return PUBLICATION_STYLES.washpost;
  if (lower.includes("thetimes") || (lower.includes("times") && !lower.includes("newyork"))) return PUBLICATION_STYLES.thetimes;
  if (lower.includes("skynews") || lower.includes("sky")) return PUBLICATION_STYLES.skynews;
  if (lower.includes("newyorkpost") || lower.includes("nypost")) return PUBLICATION_STYLES.nypost;
  if (lower.includes("onion")) return PUBLICATION_STYLES.theonion;
  if (lower.includes("lemonde") || lower.includes("monde")) return PUBLICATION_STYLES.lemonde;

  // Fallback: generic news card
  return {
    key: "generic",
    name: name,
    fontFamily: "'Georgia', serif",
    headlineFont: "'Georgia', serif",
    bg: "#FFFFFF",
    fg: "#1A1A1A",
    accent: "#333333",
    border: "#E0E0E0",
    logoBg: "#333333",
    logoColor: "#FFFFFF",
    style: "broadsheet",
  };
}

export default function NewsCard({ article }) {
  if (!article) return null;

  const pub = matchPublication(article.publication);
  const isGuardian = pub.key === "guardian";
  const isTabStyle = pub.style === "tabloid";

  return (
    <div
      className={`news-card news-card--${pub.key} ${isTabStyle ? "news-card--tabloid" : ""}`}
      style={{
        "--nc-bg": pub.bg,
        "--nc-fg": pub.fg,
        "--nc-accent": pub.accent,
        "--nc-border": pub.border,
        "--nc-logo-bg": pub.logoBg,
        "--nc-logo-color": pub.logoColor,
        "--nc-headline-font": pub.headlineFont,
        "--nc-body-font": pub.fontFamily,
      }}
    >
      {/* Publication header */}
      <div className="news-card__header">
        <span className="news-card__pub-name">{article.publication}</span>
        {article.timestamp && (
          <span className="news-card__timestamp">{article.timestamp}</span>
        )}
      </div>

      {/* Image */}
      {article.image_url && (
        <div className="news-card__image-wrap">
          <img src={article.image_url} alt={article.headline} className="news-card__image" />
        </div>
      )}

      {/* Headline */}
      <h3 className={`news-card__headline ${isGuardian ? "news-card__headline--guardian" : ""}`}>
        {article.headline}
      </h3>

      {/* Subheadline / excerpt */}
      {article.subheadline && (
        <p className="news-card__subheadline">{article.subheadline}</p>
      )}
    </div>
  );
}
