"use client";

/**
 * OpEdCard — opinion piece / editorial card with author byline and publication
 */

export default function OpEdCard({ oped }) {
  if (!oped) return null;

  return (
    <div className="oped-card">
      {/* Publication header */}
      <div className="oped-card__header">
        <span className="oped-card__label">OPINION</span>
        {oped.publication && (
          <span className="oped-card__pub">{oped.publication}</span>
        )}
      </div>

      {/* Author byline */}
      <div className="oped-card__byline">
        <div className="oped-card__author-avatar">
          {oped.author?.charAt(0).toUpperCase()}
        </div>
        <div className="oped-card__author-info">
          <span className="oped-card__author-name">{oped.author}</span>
          {oped.author_title && (
            <span className="oped-card__author-title">{oped.author_title}</span>
          )}
        </div>
        {oped.timestamp && (
          <span className="oped-card__timestamp">{oped.timestamp}</span>
        )}
      </div>

      {/* Image */}
      {oped.image_url && (
        <div className="oped-card__image-wrap">
          <img src={oped.image_url} alt={oped.headline} className="oped-card__image" />
        </div>
      )}

      {/* Headline */}
      <h3 className="oped-card__headline">{oped.headline}</h3>

      {/* Divider */}
      <div className="oped-card__divider" />

      {/* Body text */}
      <div className="oped-card__body">
        <p>{oped.content}</p>
      </div>
    </div>
  );
}
