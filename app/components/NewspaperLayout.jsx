/**
 * NewspaperLayout — renders the generated articles in the existing
 * newspaper grid structure (featured article + side cards + bottom columns).
 *
 * Expects `articles` array of 5+ objects:
 *   { publication, headline, subheadline, category, image_url? }
 *
 * Layout mapping:
 *   articles[0]      → Featured (centre)
 *   articles[1..3]   → Left side cards
 *   articles[4..6]   → Right side cards  (overflow → bottom columns)
 *   articles[7+]     → Bottom columns grid
 */

function ArticleCard({ article, isFeature = false }) {
  if (isFeature) {
    return (
      <section className="featured-article">
        <article className="main-story">
          <span className="publication-badge">{article.publication}</span>
          <h1>
            <span>{article.headline}</span>
          </h1>
          {article.image_url ? (
            <div className="story-image-container">
              <img
                src={article.image_url}
                alt={article.headline}
                className="story-image taller"
              />
            </div>
          ) : null}
          <p className="story-excerpt">{article.subheadline}</p>
        </article>
      </section>
    );
  }

  return null;
}

function SideCard({ article }) {
  return (
    <article className="side-card">
      {article.image_url ? (
        <img
          src={article.image_url}
          alt={article.headline}
          className="card-image"
        />
      ) : (
        <div className="card-image-placeholder" />
      )}
      <div className="card-content">
        <span className="publication-badge">{article.publication}</span>
        <h3>
          <span>{article.headline}</span>
        </h3>

        <p className="story-excerpt">{article.subheadline}</p>
      </div>
    </article>
  );
}

function ColumnStory({ article }) {
  return (
    <article className="column-story">
      {article.image_url ? (
        <img
          src={article.image_url}
          alt={article.headline}
          className="card-image"
        />
      ) : (
        <div className="card-image-placeholder" />
      )}
      <div className="card-content">
        <span className="publication-badge">{article.publication}</span>
        <h3>
          <span>{article.headline}</span>
        </h3>
        <p className="card-meta">{article.category}</p>
      </div>
    </article>
  );
}

export default function NewspaperLayout({ articles }) {
  if (!articles || articles.length === 0) return null;

  const featured = articles[0];
  const leftCards = articles.slice(1, 4);
  const rightCards = articles.slice(4, 7);
  const bottomStories = articles.slice(7);

  return (
    <>
      {/* Top Section: side cards + featured */}
      <div className="newspaper-layout">
        {/* Left Side Cards */}
        <aside className="side-cards left-cards">
          {leftCards.map((a, i) => (
            <SideCard key={`left-${i}`} article={a} />
          ))}
        </aside>

        {/* Main Featured Article */}
        <ArticleCard article={featured} isFeature />

        {/* Right Side Cards */}
        <aside className="side-cards right-cards">
          {rightCards.map((a, i) => (
            <SideCard key={`right-${i}`} article={a} />
          ))}
        </aside>
      </div>

      {/* Bottom Columns */}
      {bottomStories.length > 0 && (
        <section className="newspaper-columns">
          <div className="columns-grid">
            {bottomStories.map((a, i) => (
              <ColumnStory key={`col-${i}`} article={a} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
