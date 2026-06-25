// Google Form file uploads (CVs, headshots) land in Drive, and the linked Sheet
// cell holds a Drive URL — not a directly renderable image/PDF URL. To show the
// file inside our app we extract the Drive file id and rebuild it into the
// endpoint that actually embeds:
//   - images  -> https://drive.google.com/thumbnail?id=ID&sz=w1600  (works in <img>)
//   - docs/PDF -> https://drive.google.com/file/d/ID/preview         (works in <iframe>)
// Non-Drive URLs are passed through and classified by extension, so a direct
// image or PDF link still previews. Anything we can't embed falls back to a link.

export type MediaKind = "image" | "document" | "unknown";

export type ResolvedMedia = {
  /** Original URL, always safe to use as an "open in new tab" link. */
  href: string;
  kind: MediaKind;
  /** URL to put in an <img> src, when the asset is a previewable image. */
  imageSrc: string | null;
  /** URL to put in an <iframe> src, when the asset is a previewable document. */
  embedSrc: string | null;
  /** True when the URL is a Google Drive link we transformed. */
  isDrive: boolean;
};

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "heic", "heif"];
const DOCUMENT_EXTENSIONS = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "rtf", "odt"];

export function extractDriveFileId(url: string): string | null {
  // https://drive.google.com/file/d/<id>/view
  const pathMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (pathMatch?.[1]) return pathMatch[1];
  // https://drive.google.com/open?id=<id>  |  uc?id=<id>  |  ?id=<id>
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch?.[1]) return idMatch[1];
  return null;
}

function extensionOf(url: string): string | null {
  const withoutQuery = url.split(/[?#]/)[0] ?? url;
  const lastSegment = withoutQuery.split("/").pop() ?? "";
  const dot = lastSegment.lastIndexOf(".");
  if (dot === -1) return null;
  return lastSegment.slice(dot + 1).toLowerCase();
}

function kindFromExtension(ext: string | null): MediaKind {
  if (!ext) return "unknown";
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (DOCUMENT_EXTENSIONS.includes(ext)) return "document";
  return "unknown";
}

// `hint` lets the caller bias classification when the extension is missing
// (Drive links rarely carry one): a photo field hints "image", a CV field
// hints "document".
export function resolveMedia(url: string | null | undefined, hint: MediaKind = "unknown"): ResolvedMedia | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const driveId = trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com")
    ? extractDriveFileId(trimmed)
    : null;

  if (driveId) {
    const kind = kindFromExtension(extensionOf(trimmed));
    const effectiveKind = kind === "unknown" ? hint : kind;
    if (effectiveKind === "image") {
      return {
        href: trimmed,
        kind: "image",
        imageSrc: `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`,
        embedSrc: null,
        isDrive: true
      };
    }
    // Default Drive files to the document preview iframe — it renders PDFs,
    // Office docs and images alike, so it's the safe general embed.
    return {
      href: trimmed,
      kind: effectiveKind === "unknown" ? "document" : effectiveKind,
      imageSrc: null,
      embedSrc: `https://drive.google.com/file/d/${driveId}/preview`,
      isDrive: true
    };
  }

  const kind = kindFromExtension(extensionOf(trimmed));
  const effectiveKind = kind === "unknown" ? hint : kind;
  if (effectiveKind === "image") {
    return { href: trimmed, kind: "image", imageSrc: trimmed, embedSrc: null, isDrive: false };
  }
  if (effectiveKind === "document") {
    return { href: trimmed, kind: "document", imageSrc: null, embedSrc: trimmed, isDrive: false };
  }
  return { href: trimmed, kind: "unknown", imageSrc: null, embedSrc: null, isDrive: false };
}
