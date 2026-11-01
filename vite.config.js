import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/anikoto": {
        target: "https://anikotoapi.site",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anikoto/, ""),
      },
    },
  },
});