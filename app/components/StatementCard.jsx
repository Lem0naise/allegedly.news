"use client";

/**
 * StatementCard — breaking development statement, resignation, poll release,
 * endorsement, leaked document, official announcement, etc.
 */

const TYPE_STYLES = {
  resignation: {
    label: "RESIGNATION",
    accent: "#CC0000",
    bg: "#FFF5F5",
    border: "#CC0000",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="#CC0000">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
    ),
  },
  statement: {
    label: "STATEMENT",
    accent: "#1A73E8",
    bg: "#F5F9FF",
    border: "#1A73E8",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="#1A73E8">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zm-6-5.4l3 2.4V7l-3 2.4L11 7v6l3-2.4z" />
      </svg>
    ),
  },
  endorsement: {
    label: "ENDORSEMENT",
    accent: "#0A7E00",
    bg: "#F5FFF6",
    border: "#0A7E00",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="#0A7E00">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    ),
  },
  campaign_suspension: {
    label: "CAMPAIGN SUSPENDED",
    accent: "#E67E00",
    bg: "#FFF9F2",
    border: "#E67E00",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="#E67E00">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z" />
      </svg>
    ),
  },
  poll_release: {
    label: "POLL RELEASE",
    accent: "#7B1FA2",
    bg: "#FBF5FF",
    border: "#7B1FA2",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="#7B1FA2">
        <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z" />
      </svg>
    ),
  },
  leak: {
    label: "LEAKED DOCUMENT",
    accent: "#D44637",
    bg: "#FFF8F5",
    border: "#D44637",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="#D44637">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-6-7l-4 4H3l5-5 1.5 1.5L14 8l4 4H13z" />
      </svg>
    ),
  },
  ruling: {
    label: "RULING",
    accent: "#3E2723",
    bg: "#F5F3F2",
    border: "#3E2723",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="#3E2723">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 14v-2.47l6.88-6.88c.2-.2.51-.2.71 0l1.77 1.77c.2.2.2.51 0 .71L8.47 14H6zm12 0h-6.5l2-2H18v2z" />
      </svg>
    ),
  },
  protest_announcement: {
    label: "BREAKING",
    accent: "#FF6D00",
    bg: "#FFF8F0",
    border: "#FF6D00",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="#FF6D00">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
    ),
  },
};

const FALLBACK_STYLE = {
  label: "DEVELOPING",
  accent: "#666",
  bg: "#F9F9F9",
  border: "#999",
  icon: null,
};

export default function StatementCard({ development }) {
  if (!development) return null;

  const style = TYPE_STYLES[development.type] || FALLBACK_STYLE;

  return (
    <div
      className="statement-card"
      style={{
        "--st-accent": style.accent,
        "--st-bg": style.bg,
        "--st-border": style.border,
      }}
    >
      {/* Label + Icon */}
      <div className="statement-card__badge">
        {style.icon}
        <span>{style.label}</span>
      </div>

      {/* Title */}
      <h3 className="statement-card__title">{development.title}</h3>

      {/* Content */}
      {development.content && (
        <p className="statement-card__content">{development.content}</p>
      )}

      {/* Source + timestamp footer */}
      <div className="statement-card__footer">
        {development.source && (
          <span className="statement-card__source">{development.source}</span>
        )}
        {development.timestamp && (
          <span className="statement-card__timestamp">{development.timestamp}</span>
        )}
      </div>
    </div>
  );
}
