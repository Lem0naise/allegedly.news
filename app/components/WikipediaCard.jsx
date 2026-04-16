"use client";

/**
 * WikipediaCard — Wikipedia article with infobox + lead paragraph
 */

export default function WikipediaCard({ data }) {
  if (!data) return null;

  return (
    <div className="wiki-card">
      {/* Wikipedia header bar */}
      <div className="wiki-header">
        <div className="wiki-logo-area">
          <svg viewBox="0 0 24 24" width="24" height="24" className="wiki-globe">
            <path fill="#000" d="M12.29 2C6.73 2 2.25 6.48 2.25 12.04s4.48 10.04 10.04 10.04 10.04-4.48 10.04-10.04S17.85 2 12.29 2zm6.93 6.02h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.9 4.33 3.56zm-6.93-3.73c.83 1.2 1.48 2.53 1.91 3.73h-3.82c.43-1.2 1.08-2.53 1.91-3.73zM5.67 14.06c-.17-.66-.27-1.34-.27-2.04s.1-1.38.27-2.04h3.38c-.08.66-.13 1.34-.13 2.04s.05 1.38.13 2.04H5.67zm.91 2.02h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8.08H6.58c.96-1.66 2.49-2.93 4.33-3.56-.6 1.11-1.06 2.31-1.38 3.56zM12.29 19.77c-.83-1.2-1.48-2.53-1.91-3.73h3.82c-.43 1.2-1.08 2.53-1.91 3.73zM14.54 14.06H10.04c-.09-.66-.15-1.34-.15-2.04s.06-1.38.15-2.04h4.5c.09.66.15 1.34.15 2.04s-.06 1.38-.15 2.04zm.24 5.58c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.66-2.49 2.93-4.33 3.56zm1.76-5.58c.08-.66.13-1.34.13-2.04s-.05-1.38-.13-2.04h3.38c.17.66.27 1.34.27 2.04s-.1 1.38-.27 2.04h-3.38z" />
          </svg>
          <span className="wiki-wordmark">Wikipedia</span>
        </div>
        <span className="wiki-lang">The Free Encyclopedia</span>
      </div>

      {/* Article title */}
      <h2 className="wiki-title">{data.title}</h2>
      <div className="wiki-title-underline" />

      {/* Article notice */}
      <div className="wiki-notice">
        <em>From Wikipedia, the free encyclopedia</em>
      </div>

      <div className="wiki-body">
        {/* Infobox (if present) */}
        {data.infobox && (
          <div className="wiki-infobox">
            <div className="wiki-infobox-header">{data.title}</div>
            {data.infobox.image_caption && (
              <div className="wiki-infobox-image-area">
                <div className="wiki-infobox-image-placeholder" />
                <div className="wiki-infobox-caption">{data.infobox.image_caption}</div>
              </div>
            )}
            {data.infobox.type && (
              <div className="wiki-infobox-row wiki-infobox-type">
                <span className="wiki-infobox-label">Type</span>
                <span className="wiki-infobox-value">{data.infobox.type}</span>
              </div>
            )}
            {data.infobox.fields?.map((field, i) => (
              <div key={i} className="wiki-infobox-row">
                <span className="wiki-infobox-label">{field.label}</span>
                <span className="wiki-infobox-value">{field.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Lead paragraph */}
        <p className="wiki-lead">{data.lead}</p>

        {/* Sections */}
        {data.sections?.map((section, i) => (
          <div key={i} className="wiki-section">
            <h3 className="wiki-section-heading">
              <span className="wiki-edit-link">[edit]</span>
              {section.heading}
            </h3>
            <p className="wiki-section-content">{section.content}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      {data.categories && data.categories.length > 0 && (
        <div className="wiki-categories">
          <span className="wiki-cat-label">Categories:</span>
          {data.categories.map((cat, i) => (
            <span key={i} className="wiki-cat-tag">
              {cat}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
