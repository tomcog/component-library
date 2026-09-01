import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

/**
 * Wrap the emitted CSS in `@layer ui`.
 *
 * Without a layer, whether a consuming app can override these components comes
 * down to CSS import order - if the app's stylesheet happens to load first, the
 * library wins and the app's overrides silently stop working. That order is not
 * reliably controllable in Next.js App Router, where CSS is pulled in across
 * layouts and routes.
 *
 * Any unlayered CSS beats any layered CSS regardless of source order, so this
 * makes "the app can always override the library" a guarantee rather than a
 * convention. It also means an app's own `--ui-*` token overrides (declared
 * unlayered on :root) reliably beat the defaults in tokens.css.
 *
 * Done at generateBundle rather than by wrapping the source, so every future
 * component is covered without each .module.css remembering to opt in.
 */
function wrapCssInLayer(layer = "ui") {
  return {
    name: "wrap-css-in-layer",
    apply: "build" as const,
    // Vite emits style.css from its own generateBundle (vite:css-post). Without
    // enforce:"post" this hook runs first and the asset is not in the bundle yet.
    enforce: "post" as const,
    generateBundle(_options: unknown, bundle: Record<string, any>) {
      for (const file of Object.values(bundle)) {
        if (file.type !== "asset" || !file.fileName.endsWith(".css")) continue;
        const css = String(file.source);
        // @import and @charset are only valid at the top of a file, so they
        // cannot be moved inside a layer block. Neither is emitted today; bail
        // loudly rather than shipping silently broken CSS if that changes.
        if (/@(import|charset)\b/.test(css)) {
          this.error(
            `wrap-css-in-layer: ${file.fileName} contains @import or @charset, ` +
              `which cannot be nested in @layer. Hoist it before wrapping.`,
          );
        }
        file.source = `@layer ${layer}{${css}}`;
      }
    },
  };
}

export default defineConfig({
  // Keep process.env.NODE_ENV as-is instead of inlining "production" at our
  // build time - the consumer's bundler substitutes it, so dev-only warnings
  // fire in their dev build and vanish from their production build.
  define: { "process.env.NODE_ENV": "process.env.NODE_ENV" },
  plugins: [react(), dts({ include: ["src"], rollupTypes: true }), wrapCssInLayer()],
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
