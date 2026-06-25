import { describe, expect, test } from "vitest";
import { extractDriveFileId, resolveMedia } from "./drive-media";

describe("drive-media", () => {
  test("extracts file id from the common Drive URL shapes", () => {
    expect(extractDriveFileId("https://drive.google.com/open?id=ABC123_xyz")).toBe("ABC123_xyz");
    expect(extractDriveFileId("https://drive.google.com/file/d/ABC123_xyz/view?usp=sharing")).toBe("ABC123_xyz");
    expect(extractDriveFileId("https://drive.google.com/uc?id=ABC123_xyz&export=download")).toBe("ABC123_xyz");
    expect(extractDriveFileId("https://example.com/photo.png")).toBeNull();
  });

  test("renders a Drive photo field as an inline image thumbnail", () => {
    const media = resolveMedia("https://drive.google.com/open?id=FILE1", "image");
    expect(media?.kind).toBe("image");
    expect(media?.imageSrc).toBe("https://drive.google.com/thumbnail?id=FILE1&sz=w1600");
    expect(media?.embedSrc).toBeNull();
    expect(media?.href).toBe("https://drive.google.com/open?id=FILE1");
  });

  test("renders a Drive CV field as a preview iframe", () => {
    const media = resolveMedia("https://drive.google.com/file/d/FILE2/view", "document");
    expect(media?.kind).toBe("document");
    expect(media?.embedSrc).toBe("https://drive.google.com/file/d/FILE2/preview");
    expect(media?.imageSrc).toBeNull();
  });

  test("previews a direct image URL without transformation", () => {
    const media = resolveMedia("https://cdn.example.com/headshot.jpg");
    expect(media?.kind).toBe("image");
    expect(media?.imageSrc).toBe("https://cdn.example.com/headshot.jpg");
    expect(media?.isDrive).toBe(false);
  });

  test("previews a direct PDF URL in an iframe", () => {
    const media = resolveMedia("https://cdn.example.com/resume.pdf");
    expect(media?.kind).toBe("document");
    expect(media?.embedSrc).toBe("https://cdn.example.com/resume.pdf");
  });

  test("falls back to a plain link for unknown non-Drive URLs", () => {
    const media = resolveMedia("https://example.com/profile");
    expect(media?.kind).toBe("unknown");
    expect(media?.imageSrc).toBeNull();
    expect(media?.embedSrc).toBeNull();
    expect(media?.href).toBe("https://example.com/profile");
  });

  test("returns null for empty input", () => {
    expect(resolveMedia(null)).toBeNull();
    expect(resolveMedia("   ")).toBeNull();
  });
});
