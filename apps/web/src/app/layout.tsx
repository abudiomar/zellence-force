import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DM_Sans, Noto_Sans_Arabic, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactNode } from "react";
import "@zellforce/ui/globals.css";
import "./globals.css";
import {
  LOCALE_COOKIE,
  getLocaleFromCookieValue,
  getTextDirectionForLocale
} from "../i18n/config";
import { ThemeProvider } from "../components/theme-provider";

// Zellence brand fonts — DM Sans (Latin UI/body), Playfair Display (display/headings),
// Noto Sans Arabic (Arabic-first RTL body). Exposed as CSS variables consumed in globals.css.
const fontBody = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body"
});

const fontHeading = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-heading"
});

const fontArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-arabic"
});

export const metadata: Metadata = {
  title: "Zell-force",
  description: "Event staffing operations"
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const store = await cookies();
  const locale = getLocaleFromCookieValue(store.get(LOCALE_COOKIE)?.value);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={getTextDirectionForLocale(locale)}
      data-density="comfortable"
      className={`${fontBody.variable} ${fontHeading.variable} ${fontArabic.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
