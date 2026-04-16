"use client";

/**
 * FacebookCard — shared article card on Facebook
 */

function formatReactions(reactions) {
  if (!reactions) return 0;
  return Object.values(reactions).reduce((a, b) => a + b, 0);
}

export default function FacebookCard({ post }) {
  if (!post) return null;

  const totalReactions = formatReactions(post.reactions);

  return (
    <div className="fb-card">
      {/* Post header: sharer info */}
      <div className="fb-header">
        <div className="fb-avatar">
          {post.sharer_name?.charAt(0).toUpperCase()}
        </div>
        <div className="fb-header-text">
          <span className="fb-sharer-name">{post.sharer_name}</span>
          <div className="fb-timestamp-row">
            <span className="fb-timestamp">{post.timestamp}</span>
            <span className="fb-privacy">·</span>
            <svg viewBox="0 0 16 16" width="12" height="12" className="fb-globe">
              <path fill="#65676B" d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zm.75 2.25h-1.5v1.5H5.5v1.5h1.75v1.5H5.5v1.5h1.75v1.75h1.5V9.75h1.75v-1.5H8.75v-1.5h1.75v-1.5H8.75V3.75z" />
            </svg>
          </div>
        </div>
        <svg viewBox="0 0 20 20" width="20" height="20" className="fb-more">
          <path fill="#65676B" d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
        </svg>
      </div>

      {/* Sharer's comment */}
      {post.sharer_comment && (
        <p className="fb-sharer-comment">{post.sharer_comment}</p>
      )}

      {/* Shared article preview */}
      <div className="fb-shared-article">
        <div className="fb-shared-image-area">
          <div className="fb-shared-image-placeholder" />
        </div>
        <div className="fb-shared-info">
          <span className="fb-shared-source">{post.shared_source}</span>
          <h4 className="fb-shared-headline">{post.shared_headline}</h4>
          {post.shared_description && (
            <p className="fb-shared-desc">{post.shared_description}</p>
          )}
        </div>
      </div>

      {/* Reactions bar */}
      <div className="fb-reactions-bar">
        <div className="fb-reaction-icons">
          {post.reactions?.like > 0 && <span className="fb-react-emoji">👍</span>}
          {post.reactions?.love > 0 && <span className="fb-react-emoji">❤️</span>}
          {post.reactions?.wow > 0 && <span className="fb-react-emoji">😮</span>}
          {post.reactions?.angry > 0 && <span className="fb-react-emoji">😡</span>}
          {post.reactions?.haha > 0 && <span className="fb-react-emoji">😂</span>}
          {post.reactions?.sad > 0 && <span className="fb-react-emoji">😢</span>}
          <span className="fb-reaction-count">{totalReactions}</span>
        </div>
        <div className="fb-engagement-counts">
          {post.shares > 0 && <span>{post.shares} shares</span>}
        </div>
      </div>

      {/* Action buttons */}
      <div className="fb-action-bar">
        <button className="fb-action-btn">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#65676B" d="M15.642 7.262l.483-2.423c.15-.743.03-1.506-.334-2.145A3.172 3.172 0 0013.09 1.18c-.59 0-1.09.382-1.268.912l-1.095 3.27a2.632 2.632 0 01-.482.833L7.83 9.038a1.742 1.742 0 00-.46 1.178v8.91c0 .978.793 1.771 1.772 1.771h6.664c.725 0 1.386-.414 1.702-1.066l3.104-6.415c.128-.263.195-.55.195-.842V10.89c0-1.267-1.027-2.294-2.294-2.294h-2.87z" />
            <path fill="#65676B" d="M4.5 9.25a1.25 1.25 0 00-1.25 1.25v10a1.25 1.25 0 001.25 1.25h.5c.69 0 1.25-.56 1.25-1.25v-10c0-.69-.56-1.25-1.25-1.25h-.5z" />
          </svg>
          <span>Like</span>
        </button>
        <button className="fb-action-btn">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#65676B" d="M7.725 19.872a.718.718 0 01-.607-.328.725.725 0 01-.118-.397V16H3.625A2.63 2.63 0 011 13.375v-9.75A2.629 2.629 0 013.625 1h16.75A2.63 2.63 0 0123 3.625v9.75A2.63 2.63 0 0120.375 16h-8.161l-4 3.681a.725.725 0 01-.489.191z" />
          </svg>
          <span>Comment</span>
        </button>
        <button className="fb-action-btn">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#65676B" d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" />
          </svg>
          <span>Share</span>
        </button>
      </div>

      {/* Top comment */}
      {post.top_comment && (
        <div className="fb-comment-section">
          <div className="fb-comment">
            <div className="fb-comment-avatar">
              {post.top_comment_author?.charAt(0).toUpperCase()}
            </div>
            <div className="fb-comment-body">
              <span className="fb-comment-author">{post.top_comment_author}</span>
              <p className="fb-comment-text">{post.top_comment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
