import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = process.env.BASE_PATH || "";

// Installable web app (PWA): the first step toward the app stores.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gains Coach",
    short_name: "Gains Coach",
    description: "AI bodybuilding coach built on your training, nutrition and health data.",
    id: `${base}/`,
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0b0d",
    theme_color: "#0a0b0d",
    categories: ["health", "fitness", "sports"],
    icons: [
      { src: `${base}/icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${base}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${base}/icons/maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Ask the coach", url: `${base}/coach/`, icons: [{ src: `${base}/icons/icon-192.png`, sizes: "192x192" }] },
      { name: "Weekly check-in", url: `${base}/check-in/`, icons: [{ src: `${base}/icons/icon-192.png`, sizes: "192x192" }] },
    ],
  };
}
