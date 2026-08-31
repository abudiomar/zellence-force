import type { Metadata } from "next";
import { cookies } from "next/headers";
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

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const store = await cookies();
  const locale = getLocaleFromCookieValue(store.get(LOCALE_COOKIE)?.value);
  const messages = await getMessages();

  return (
    <html lang={locale} dir={getTextDirectionForLocale(locale)} data-density="comfortable">
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
