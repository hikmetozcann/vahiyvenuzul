import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * basePath is set when deploying to GitHub Pages under a project URL
 * (e.g. https://<user>.github.io/<repo>/). The deploy workflow sets
 * NEXT_PUBLIC_BASE_PATH; local dev leaves it empty.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
};

export default withNextIntl(nextConfig);
