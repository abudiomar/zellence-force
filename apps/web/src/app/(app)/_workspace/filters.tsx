"use client";

// Shared, minimalist filter-bar primitives used by both the screening
// (candidates) and staff-pool workspaces, so the two read identically: a search
// pill, range pills, dynamic multi-selects, toggle chips, a gender segment, and
// a live result count. All filtering is client-side over the loaded list.

import React from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@zellforce/ui/components/dropdown-menu";
import type { FilterOption, GenderFilter } from "./filter-core";
export {
  distinctMultiOptions,
  distinctOptions,
  matchesGender,
  rangeActive,
  splitListValue,
  titleCase,
  type FilterOption,
  type GenderFilter
} from "./filter-core";

export function FilterSearch({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="filter-search">
      <Search size={16} aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}

export function RangePill({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder,
  maxPlaceholder,
  min = 0,
  max = 100,
  step
}: {
  label: string;
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  minPlaceholder: string;
  maxPlaceholder: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="filter-range" role="group" aria-label={label}>
      <span>{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={minValue}
        onChange={(event) => onMinChange(event.currentTarget.value)}
        placeholder={minPlaceholder}
        aria-label={`${label} ${minPlaceholder}`}
      />
      <span aria-hidden>–</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={maxValue}
        onChange={(event) => onMaxChange(event.currentTarget.value)}
        placeholder={maxPlaceholder}
        aria-label={`${label} ${maxPlaceholder}`}
      />
    </div>
  );
}

export function FilterChip({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="filter-chip"
      data-active={active || undefined}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Dynamic multi-select: a compact trigger opening a checklist of the options
// discovered in the data. Stays open while ticking several values.
export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  emptyLabel
}: {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  emptyLabel: string;
}) {
  const toggle = (key: string) =>
    onChange(selected.includes(key) ? selected.filter((value) => value !== key) : [...selected, key]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="filter-chip filter-select" data-active={selected.length > 0 || undefined}>
          <span>{label}</span>
          {selected.length > 0 ? <span className="filter-select__count">{selected.length}</span> : null}
          <ChevronDown size={14} aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="filter-select__menu">
        {options.length === 0 ? (
          <div className="filter-select__empty">{emptyLabel}</div>
        ) : (
          options.map((option) => (
            <DropdownMenuItem
              key={option.key}
              onSelect={(event) => {
                event.preventDefault();
                toggle(option.key);
              }}
            >
              <span className="filter-select__check">
                {selected.includes(option.key) ? <Check size={14} aria-hidden /> : null}
              </span>
              <span>{option.label}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function GenderSegment({
  value,
  onChange
}: {
  value: GenderFilter;
  onChange: (value: GenderFilter) => void;
}) {
  const t = useTranslations("app.workspace.screen");
  const genders: GenderFilter[] = ["", "male", "female"];
  return (
    <div className="filter-segment" role="group" aria-label={t("gender")}>
      {genders.map((gender) => (
        <button
          key={gender || "all"}
          type="button"
          data-active={value === gender || undefined}
          aria-pressed={value === gender}
          onClick={() => onChange(gender)}
        >
          {gender === "" ? t("genderAll") : gender === "male" ? t("male") : t("female")}
        </button>
      ))}
    </div>
  );
}

// Bar shell: search grows on the left, the filter controls group in the middle,
// and the live count + Clear affordance sit at the end.
export function FilterBar({
  search,
  children,
  shown,
  total,
  active,
  onClear
}: {
  search: React.ReactNode;
  children: React.ReactNode;
  shown: number;
  total: number;
  active: boolean;
  onClear: () => void;
}) {
  const t = useTranslations("app.workspace.screen");
  return (
    <div className="filter-bar">
      {search}
      <div className="filter-bar__controls">{children}</div>
      <div className="filter-bar__meta">
        <span className="filter-bar__count">{t("showing", { shown, total })}</span>
        {active ? (
          <button type="button" className="filter-bar__clear" onClick={onClear}>
            {t("clear")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
