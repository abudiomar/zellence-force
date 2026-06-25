"use client";

import React from "react";
import { resolveMedia } from "./drive-media";

// Renders a candidate headshot from a (possibly Google Drive) URL. Drive links
// like `.../open?id=ID` aren't directly renderable in an <img>, so we resolve
// them to the Drive thumbnail endpoint first (same transform the detail dialog
// uses). Falls back to `fallback` when there's no usable source or the image
// fails to load. `failed` resets whenever the source changes, so a reused
// instance (e.g. the side panel switching candidates) retries on the new photo.
export function CandidatePhoto({
  url,
  className,
  alt = "",
  fallback
}: {
  url: string | null | undefined;
  className?: string;
  alt?: string;
  fallback: React.ReactNode;
}) {
  const src = resolveMedia(url, "image")?.imageSrc ?? null;
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) return <>{fallback}</>;
  return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />;
}
