"use client";

import { useEffect, useState } from "react";

/**
 * An <img> that degrades to a neutral placeholder.
 *
 * Generated image URLs are arbitrary third-party links: they can be dead, hotlink
 * protected, or mixed content. Rather than show a broken-image icon, we drop the
 * image. `referrerPolicy="no-referrer"` avoids the most common hotlink blocks and
 * keeps the canvas untainted for the screenshot export.
 */
export default function SafeImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);

  // A retry can hand this component a new URL; give it a fresh chance.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src) return null;

  if (failed) {
    return <div className={`image-fallback ${className ?? ""}`.trim()} aria-hidden="true" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
