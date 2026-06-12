import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { getLocaleFromCookieValue, LOCALE_COOKIE } from "./config";

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = getLocaleFromCookieValue(store.get(LOCALE_COOKIE)?.value);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
