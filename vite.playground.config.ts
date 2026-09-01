import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev-only config for the component playground. Separate from vite.config.ts,
// which is library-build config and would fight a dev server.
export default defineConfig({
  root: "playground",
  plugins: [react()],
  css: {
    // Same scoping as the published build, so what you see here is what ships.
    modules: { generateScopedName: "ui-[name]-[local]-[hash:base64:5]" },
  },
  server: { open: true },
});
