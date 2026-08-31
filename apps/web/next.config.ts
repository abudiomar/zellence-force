import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typedRoutes: false,
  allowedDevOrigins: ["127.0.0.1"],
  transpilePackages: ["@zellforce/contracts", "@zellforce/domain", "@zellforce/ui"]
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
