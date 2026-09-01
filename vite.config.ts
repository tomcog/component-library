import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  // Keep process.env.NODE_ENV as-is instead of inlining "production" at our
  // build time - the consumer's bundler substitutes it, so dev-only warnings
  // fire in their dev build and vanish from their production build.
  define: { "process.env.NODE_ENV": "process.env.NODE_ENV" },
  plugins: [react(), dts({ include: ["src"], rollupTypes: true })],
  css: {
    modules: {
      // Readable but collision-proof: ui-Button-button-a1b2c3
      generateScopedName: "ui-[name]-[local]-[hash:base64:5]",
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        // Marks the whole library as client-side for Next.js App Router.
        // Without this, a Server Component passing onClick to <Button> throws.
        banner: '"use client";',
      },
    },
  },
});
