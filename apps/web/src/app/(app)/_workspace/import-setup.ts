import type { GoogleSheetMapping, SheetTab } from "@zellforce/contracts";

const columnAliases: Record<keyof GoogleSheetMapping, string[]> = {
  fullName: ["full name", "name", "candidate name", "applicant name", "الاسم", "الاسم الكامل"],
  phone: ["phone", "mobile", "whatsapp", "whatsapp number", "number", "رقم الجوال", "الجوال"],
  email: ["email", "email address", "البريد", "البريد الإلكتروني"],
  city: ["city", "location", "area", "المدينة", "الموقع"],
  gender: ["gender", "sex", "الجنس"],
  nationality: ["nationality", "country", "الجنسية"],
  nationalId: ["national id", "id number", "iqama", "هوية", "الإقامة"],
  dateOfBirth: ["date of birth", "birth date", "dob", "تاريخ الميلاد"],
  age: ["age", "العمر"],
  canTravel: [
    "travel",
    "traveling",
    "travelling",
    "relocate",
    "relocation",
    "willing to travel",
    "other cities",
    "capable of traveling",
    "السفر",
    "التنقل",
    "الانتقال"
  ],
  photoUrl: ["photo", "image", "picture", "profile photo", "professional images", "headshot", "الصورة"],
  cvUrl: ["cv", "resume", "your resume", "السيرة الذاتية"],
  experience: ["experience", "work experience", "الخبرة"],
  englishLevel: ["english level", "rate your english", "english", "spoken english", "مستوى الإنجليزية", "الإنجليزية"],
  languages: ["languages", "language", "languages you speak", "spoken languages", "اللغات"],
  submittedAt: ["timestamp", "submitted", "submission time", "الطابع الزمني", "وقت الإرسال"],
  notes: ["notes", "comments", "ملاحظات"]
};

export const applicantMappingFields: Array<{
  key: keyof GoogleSheetMapping;
  label: string;
  required?: boolean;
}> = [
  { key: "fullName", label: "Candidate name", required: true },
  { key: "phone", label: "WhatsApp number", required: true },
  { key: "email", label: "Email" },
  { key: "city", label: "City/location" },
  { key: "gender", label: "Gender" },
  { key: "nationality", label: "Nationality" },
  { key: "age", label: "Age" },
  { key: "dateOfBirth", label: "Date of birth" },
  { key: "canTravel", label: "Can travel to other cities" },
  { key: "photoUrl", label: "Photo" },
  { key: "cvUrl", label: "CV" },
  { key: "experience", label: "Experience" },
  { key: "englishLevel", label: "English level" },
  { key: "languages", label: "Languages spoken" },
  { key: "submittedAt", label: "Submitted at" },
  { key: "notes", label: "Notes" }
];

export function parseGoogleSheetReference(value: string): string {
  const trimmed = value.trim();
  const match = /\/spreadsheets\/d\/([^/?#]+)/.exec(trimmed);
  return match?.[1] ?? trimmed;
}

export function parseGoogleSheetGid(value: string): string {
  const trimmed = value.trim();
  const queryMatch = /[?&]gid=([^&#]+)/.exec(trimmed);
  const hashMatch = /[#&]gid=([^&#]+)/.exec(trimmed);
  return queryMatch?.[1] ?? hashMatch?.[1] ?? "";
}

export function buildGoogleSheetRange(tabName: string): string {
  const trimmed = tabName.trim();
  if (!trimmed) return "A:Z";
  const escaped = trimmed.replaceAll("'", "''");
  return /\s/.test(trimmed) ? `'${escaped}'!A:Z` : `${escaped}!A:Z`;
}

export function chooseDefaultSheetTab(tabs: SheetTab[]): string {
  return [...tabs].sort((left, right) => left.index - right.index)[0]?.title ?? "";
}

export function chooseInitialSheetTab(tabs: SheetTab[], gid: string): string {
  const matchingTab = tabs.find((tab) => tab.id === gid);
  return matchingTab?.title ?? chooseDefaultSheetTab(tabs);
}

export function autoMapGoogleSheetColumns(headers: string[]): GoogleSheetMapping {
  const mapping: Partial<GoogleSheetMapping> = {};
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalizeColumn(header)
  }));

  for (const field of applicantMappingFields) {
    const aliases = columnAliases[field.key].map(normalizeColumn);
    const exact = normalizedHeaders.find((header) => aliases.includes(header.normalized));
    const fuzzy = exact ?? normalizedHeaders.find((header) =>
      aliases.some((alias) => header.normalized.includes(alias) || alias.includes(header.normalized))
    );
    if (fuzzy) {
      mapping[field.key] = fuzzy.original;
    }
  }

  return mapping as GoogleSheetMapping;
}

export function getImportReadiness(mapping: Partial<GoogleSheetMapping>): {
  ready: boolean;
  missing: string[];
} {
  const missing = applicantMappingFields
    .filter((field) => field.required && !mapping[field.key]?.trim())
    .map((field) => field.label);
  return { ready: missing.length === 0, missing };
}

export function normalizeColumn(value: string): string {
  return value.trim().toLowerCase().replaceAll(/[_-]+/g, " ").replaceAll(/\s+/g, " ");
}
