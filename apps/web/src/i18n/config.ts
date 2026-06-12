import {
  DEFAULT_LANGUAGE,
  LANGUAGE_SCHEMA,
  getTextDirection,
  type SupportedLanguage
} from "@zellforce/domain";

export type AppLocale = SupportedLanguage;
export const LOCALE_COOKIE = "zf_locale";
export const DENSITY_COOKIE = "zf_density";
export const DEFAULT_LOCALE: AppLocale = DEFAULT_LANGUAGE;

export function getLocaleFromCookieValue(value: string | undefined): AppLocale {
  const result = LANGUAGE_SCHEMA.safeParse(value);
  return result.success ? result.data : DEFAULT_LOCALE;
}

export function getTextDirectionForLocale(locale: AppLocale): "rtl" | "ltr" {
  return getTextDirection(locale);
}
