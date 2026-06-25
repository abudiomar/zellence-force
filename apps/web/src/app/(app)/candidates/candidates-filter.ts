import type { ApplicantReviewQueueItem } from "@zellforce/contracts";
import { matchesGender, splitListValue, type GenderFilter } from "../_workspace/filter-core";

export type ScreeningFilters = {
  search: string;
  gender: GenderFilter;
  canTravel: boolean;
  minAge: string;
  maxAge: string;
  cities: string[];
  nationalities: string[];
  languages: string[];
  experiences: string[];
};

export const EMPTY_FILTERS: ScreeningFilters = {
  search: "",
  gender: "",
  canTravel: false,
  minAge: "",
  maxAge: "",
  cities: [],
  nationalities: [],
  languages: [],
  experiences: []
};

function matchesAny(value: string | null | undefined, selected: string[]): boolean {
  if (selected.length === 0) return true;
  const items = splitListValue(value ?? "").map((part) => part.toLowerCase());
  return selected.some((key) => items.includes(key));
}

export function matchesScreeningFilters(row: ApplicantReviewQueueItem, filters: ScreeningFilters): boolean {
  if (filters.search) {
    const query = filters.search.trim().toLowerCase();
    if (query && !`${row.fullName ?? ""} ${row.phone ?? ""}`.toLowerCase().includes(query)) {
      return false;
    }
  }
  if (filters.canTravel && row.canTravel !== true) return false;
  if (!matchesGender(row.gender, filters.gender)) return false;

  const min = filters.minAge.trim() ? Number(filters.minAge) : null;
  const max = filters.maxAge.trim() ? Number(filters.maxAge) : null;
  if (min !== null && Number.isFinite(min) && (row.age == null || row.age < min)) return false;
  if (max !== null && Number.isFinite(max) && (row.age == null || row.age > max)) return false;

  if (filters.cities.length > 0 && !filters.cities.includes((row.city ?? "").trim().toLowerCase())) {
    return false;
  }
  if (
    filters.nationalities.length > 0 &&
    !filters.nationalities.includes((row.nationality ?? "").trim().toLowerCase())
  ) {
    return false;
  }
  if (!matchesAny(row.languages, filters.languages)) return false;
  if (!matchesAny(row.experience, filters.experiences)) return false;
  return true;
}

export function screeningFiltersActive(filters: ScreeningFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.gender !== "" ||
    filters.canTravel ||
    filters.minAge.trim() !== "" ||
    filters.maxAge.trim() !== "" ||
    filters.cities.length > 0 ||
    filters.nationalities.length > 0 ||
    filters.languages.length > 0 ||
    filters.experiences.length > 0
  );
}
