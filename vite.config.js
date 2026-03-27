import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Let the frontend call `/api/...` without CORS hassle.
      "/api": "http://localhost:8000",
    },
    // To allow requests from "3367-197-184-124-248.ngrok-free.app", add it to allowedHosts
    allowedHosts: ['1fb2-197-184-124-248.ngrok-free.app'],
  },
});

