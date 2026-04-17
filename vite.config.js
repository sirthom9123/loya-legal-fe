import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = (env.VITE_SITE_URL || "").trim().replace(/\/$/, "");

  return {
    plugins: [
      react(),
      {
        name: "html-seo-urls",
        transformIndexHtml(html) {
          const ogImage = siteUrl ? `${siteUrl}/nomorae-og.png` : "/nomorae-og.png";
          let out = html.replace(/__OG_IMAGE__/g, ogImage);
          if (siteUrl) {
            out = out.replace("__OG_URL__", `${siteUrl}/`);
            out = out.replace("__CANONICAL__", `${siteUrl}/`);
          } else {
            out = out.replace(/\s*<meta property="og:url" content="__OG_URL__" \/>\r?\n/, "\n");
            out = out.replace(/\s*<link rel="canonical" href="__CANONICAL__" \/>\r?\n/, "\n");
          }
          return out;
        },
      },
    ],
    server: {
      port: 5173,
      proxy: {
        // Let the frontend call `/api/...` without CORS hassle.
        "/api": "http://localhost:8000",
      },
      // To allow requests from "3367-197-184-124-248.ngrok-free.app", add it to allowedHosts
      allowedHosts: ["a601-197-184-124-248.ngrok-free.app"],
    },
  };
});
