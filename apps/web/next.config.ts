import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typedRoutes: false,
  transpilePackages: ["@zellforce/contracts", "@zellforce/domain", "@zellforce/ui"]
};

export default nextConfig;
