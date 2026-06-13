import type { Metadata } from "next";
import { cookies } from "next/headers";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Zell-force",
  description: "Event staffing operations"
};

const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic"
});

const latinFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-latin"
});

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const store = await cookies();
  const locale = getLocaleFromCookieValue(store.get(LOCALE_COOKIE)?.value);
  const messages = await getMessages();

  return (
    <html lang={locale} dir={getTextDirectionForLocale(locale)} data-density="comfortable">
      <body className={`${arabicFont.variable} ${latinFont.variable}`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
