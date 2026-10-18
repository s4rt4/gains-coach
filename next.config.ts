import type { NextConfig } from "next";

// Demo build is a static export (GitHub Pages / Cloudflare Pages).
// Set BASE_PATH=/repo-name when deploying to a GitHub Pages project site.
// For the live product, drop `output: "export"` so API routes can call Claude server-side.
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath }, // for /public files (service worker, icons)
  trailingSlash: true,
  images: { unoptimized: true },
  // Hide the dev-only "N" badge so it doesn't cover the nav in screen recordings
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
