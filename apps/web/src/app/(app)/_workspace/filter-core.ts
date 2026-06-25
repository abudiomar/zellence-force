export type FilterOption = { key: string; label: string };
export type GenderFilter = "" | "male" | "female";

const MALE_TOKENS = new Set(["male", "m", "man", "ذكر", "رجل"]);
const FEMALE_TOKENS = new Set(["female", "f", "woman", "أنثى", "انثى", "امرأة"]);

export function matchesGender(value: string | null | undefined, target: GenderFilter): boolean {
  if (!target) return true;
  const normalized = (value ?? "").trim().toLowerCase();
  return target === "male" ? MALE_TOKENS.has(normalized) : FEMALE_TOKENS.has(normalized);
}

// Capitalize each word for a consistent label regardless of how the applicant
// typed it ("ethiopian"/"ETHIOPIAN" -> "Ethiopian"). Arabic is case-agnostic so
// it passes through unchanged.
export function titleCase(value: string): string {
  return value.toLowerCase().replace(/(^|\s)(\p{L})/gu, (_match, lead: string, char: string) => lead + char.toUpperCase());
}

// Multi-value form answers (expertise, languages) arrive comma-separated, like
// the predefined checkbox options in the Google Form. Split on common separators.
export function splitListValue(value: string): string[] {
  return value
    .split(/[,،/;]|\s+(?:and|و)\s+/gi)
    .map((part) => part.trim())
    .filter(Boolean);
}

// Normalized, de-duplicated, sorted options from a single-value field across the
// loaded rows. Keyed by lowercase (so casings collapse), labelled in title case.
export function distinctOptions<T>(
  rows: T[],
  getValue: (row: T) => string | null | undefined
): FilterOption[] {
  const byKey = new Map<string, string>();
  for (const row of rows) {
    const trimmed = (getValue(row) ?? "").trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!byKey.has(key)) byKey.set(key, titleCase(trimmed));
  }
  return [...byKey.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// Same, for a comma-separated multi-value field (expertise, languages).
export function distinctMultiOptions<T>(
  rows: T[],
  getValue: (row: T) => string | null | undefined
): FilterOption[] {
  const byKey = new Map<string, string>();
  for (const row of rows) {
    for (const part of splitListValue(getValue(row) ?? "")) {
      const key = part.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, titleCase(part));
    }
  }
  return [...byKey.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function rangeActive(min: string, max: string): boolean {
  return min.trim() !== "" || max.trim() !== "";
}
