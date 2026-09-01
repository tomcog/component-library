# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@tomcoggia/ui` — a standalone, publishable React component package distributing components as ESM + type declarations, styled with CSS Modules on top of a global design-token layer. Consumed by the apps in `~/Sites` via `npm link` during development, published to npm later.

`component-library-brief.md` is the original spec. It is now partly out of date: see "Build" below for where the implementation deliberately diverges.

## Commands

```bash
npm install
npm run dev          # playground dev server - the visual component browser
npm run build        # dist/index.js, dist/index.d.ts, dist/style.css, dist/fonts/
npm run build:watch  # rebuild dist on change (for npm link into an app)
npm run typecheck    # tsc --noEmit
```

`npm run dev` serves `playground/` (config: `vite.playground.config.ts`, separate
from the library build config). It imports from `src/`, not `dist/`, so edits
hot-reload, and it renders the real components — a hand-written preview drifts
from the component the moment its DOM changes. It has theme and live brand-colour
controls, so a rebrand can be auditioned without editing a file.

Use `build:watch` only when `npm link`ed into a consuming app.

There is no test or lint setup yet; don't reference scripts that aren't in `package.json`.

### Consumed as a git dependency

Apps depend on this repo directly rather than on a registry:

```json
"@tomcoggia/ui": "github:tomcog/component-library#v0.1.0"
```

`dist/` is gitignored, so there is nothing to install straight from a clone -
hence `"prepare": "npm run build"`. npm clones the repo, installs devDeps, runs
`prepare`, then packs what `files: ["dist"]` names. Removing `prepare` silently
ships an empty package.

**Releasing is a tag.** Bump `version`, commit, `git tag vX.Y.Z`, push with
`--tags`, then move each app's `#vX.Y.Z` ref. Apps pinned to an old tag keep
working; a moving `#main` ref would rebuild them unpredictably, so don't.

Local consumption in a target app:

```bash
npm link                   # from this repo
npm link @tomcoggia/ui     # from the consuming app
```

Consuming apps use npm and React 18.3.1 — match that rather than introducing a different package manager.

## Architecture

- **Two-layer styling.** `src/tokens.css` defines global CSS custom properties on `:root`; component `*.module.css` files consume those variables and never hardcode values. A new visual constant means adding a token first. Token values are still the brief's placeholders — replace with real brand values.
- **All tokens are `--ui-` prefixed** (`--ui-color-primary`, `--ui-space-2`). This is deliberate: `:root` is global, and unprefixed names like `--color-primary` would collide with a consuming app's own tokens, with load order deciding the winner. Never add an unprefixed token.
- **Barrel exports.** `src/index.ts` is the single public entry (`lib.entry` in `vite.config.ts`). Each component directory has its own `index.ts` re-export; `src/index.ts` re-exports those and imports `tokens.css`.
- **CSS is not auto-injected.** Styles are emitted to a separate `dist/style.css`, exposed as the `@tomcoggia/ui/styles.css` subpath export. **Consumers must import it once** (`import "@tomcoggia/ui/styles.css"`) or components render unstyled. This is deliberate, per the brief.
- **`"use client"` banner.** `rollupOptions.output.banner` stamps `"use client";` on `dist/index.js`. Four consuming apps (AndreasPalms, CampPal, PodcastPal, discovery-brief-builder) are Next.js App Router; without the directive, a Server Component passing `onClick` to `<Button>` throws. This makes the whole library client-only — fine for UI components, but it means no RSC-compatible server components can live here.
- **Peer dependencies.** React/React-DOM are peers (`>=18`) and externalized in the Rollup config alongside `react/jsx-runtime` — never promote them to `dependencies`.
- **`src/css-modules.d.ts`** provides the `*.module.css` ambient types. Without it, `tsc` fails on the style imports.

### The theming contract: 10 semantic tokens

`tokens.css` has a primitive tier and a semantic tier. **The semantic tier is
the public API** — those 10 names are what a consuming app overrides to make
these components look like its own. The primitives are internal; an app should
never alias `--ui-red-500`.

Declare them unlayered on `:root` (the library's defaults live inside
`@layer ui`, so any unlayered declaration wins regardless of import order):

```css
:root {
  --ui-brand:                /* primary fill                          */;
  --ui-text-on-brand:        /* text on a solid fill                  */;

  --ui-surface-inverse:      /* secondary: dark fill                  */;
  --ui-text-on-inverse:      /* text on that dark fill                */;

  --ui-surface-muted:        /* tertiary: grey fill                   */;
  --ui-surface-muted-hover:  /* tertiary hover                        */;
  --ui-surface-muted-active: /* tertiary pressed                      */;
  --ui-text-default:         /* text on a light/neutral fill          */;

  --ui-surface-disabled:     /* disabled fill                         */;
  --ui-text-disabled:        /* disabled text, and ghost's border     */;
}
```

**Leave one out and it does not fail — it silently keeps the library's own
placeholder neutral.** That looks plausible in isolation, which is exactly why
it goes unnoticed; the app's palette and the component's drift apart one variant
at a time. Map all 10 or none.

Most palettes lack a muted hover/active pair and a disabled surface. Deriving
them is fine and keeps the interaction feel: the library's own steps are
`#d4d4d4 -> #b8b8b8 -> #8c8c8c`, i.e. roughly 14% and 34% black, so
`color-mix(in srgb, var(--your-muted), black 14%)` reproduces it.

Only `primary` is exercised by NextJob today, so a wrong mapping shows up later,
in whichever app first uses `secondary`/`tertiary`/`ghost`. Check a new app by
rendering all four variants plus a disabled one side by side, not just the one
the app happens to use. NextJob's mapping in `src/styles/theme.css` is a worked
example.

### Build: Vite lib mode, not tsup

The brief specifies tsup with a `.module.css: "copy"` loader. **That was tried and it fails silently** — do not go back to it. esbuild (tsup's core) has no CSS Modules support, so the build "succeeds" while producing:

- `var Button_default = {}` — the class map is empty, so every `styles.x` is `undefined` and no class is ever applied
- global, unscoped `.button` / `.primary` selectors in the CSS, which collide with the consuming app

The brief pre-authorized the fallback, so the build is Vite library mode with `vite-plugin-dts`. Scoped names are configured via `css.modules.generateScopedName` as `ui-[name]-[local]-[hash:base64:5]`, which keeps output readable when debugging in an app's devtools.

Vite is pinned to v5. `build.cssFileName` is a Vite 6+ option and is silently ignored on 5 — hence the CSS output is `style.css`, and `exports["./styles.css"]` points there. If Vite is upgraded to 6+, that filename can change; re-check the export path.

### CSS ships inside `@layer ui`

`wrapCssInLayer()` in `vite.config.ts` wraps `dist/style.css` in `@layer ui{...}`
at `generateBundle`. **Any unlayered CSS beats any layered CSS regardless of
source order**, so a consuming app can always override these components without
having to get its stylesheet import order right - which is not reliably
controllable in Next.js App Router anyway.

- It also means an app's own `--ui-*` overrides on `:root` (declared unlayered)
  beat the defaults in `tokens.css`, which is what makes per-app theming work.
- The plugin needs `enforce: "post"`. Vite emits the CSS asset from its own
  `generateBundle` (`vite:css-post`); without it this hook runs first and finds
  no CSS in the bundle - it fails silently, producing unwrapped output.
- `@import`/`@charset` cannot be nested in a layer. Neither is emitted today and
  the plugin errors if one appears, rather than shipping broken CSS.
- Verify with `head -c 40 dist/style.css` - a green build proves nothing here.

**Tailwind apps must declare the layer order, or the Button loses its
background.** Tailwind's preflight resets `button { background: transparent }`
inside `@layer base`. Layer order beats specificity, and a layer's position is
fixed the first time its name is seen - so if `@layer ui` is imported before
Tailwind, `ui` sits below `base` and the reset wins. Components render with
correct geometry and no colour, which reads like a broken build rather than a
cascade problem. The consuming app needs, before any other CSS:

```css
@layer theme, base, ui, components, utilities;
```

`ui` after `base` so preflight cannot clobber components; before `utilities` so
Tailwind classes passed via `className` still override them. The file carrying
that line must be imported **before** `@tomcoggia/ui/styles.css`. Non-Tailwind
apps need nothing: unlayered CSS beats layered, so their styles win anyway.
Verified in NextJob - `<Button className="bg-black">` renders black.

### Decided: one bundled stylesheet, not per-component CSS

`dist/style.css` is a single file containing every component's CSS. An app that imports only `Button` still ships all of it. **This is a deliberate decision — don't "optimize" it without the trigger below.**

- **JS already tree-shakes correctly.** Verified: with a two-component build, an app importing only `Button` drops the unused component's code entirely. This works because `dist/index.js` has named ESM exports and `package.json` declares `sideEffects: ["**/*.css"]`. Don't break that declaration.
- **CSS does not tree-shake**, because `import "@tomcoggia/ui/styles.css"` is one side-effectful import of a concatenated file. Projected cost at ~50 components is roughly 8-25KB gzipped — a projection from one component, not a measurement.
- **Rejected:** `output.preserveModules` + per-component subpath exports. It complicates the build, needs a generated exports map, and interacts badly with `rollupTypes: true` in vite-plugin-dts — for a saving no one will notice in these apps.
- **Safe to defer** because the migration is *additive*: per-component subpath exports can be added later alongside `.` and `./styles.css`, and no consuming app has to change. This is why deciding now was unnecessary.

**Revisit only if** a consumer appears where CSS payload is load-bearing — a marketing/landing page with a performance budget, not an app behind a login — and it imports only a component or two.

### Typography: DM Sans, bundled but opt-in

The font is self-hosted in the package, not linked from Google's CDN — browsers partitioned the HTTP cache in 2020, so the shared-cache argument for the CDN is dead, and hotlinking discloses visitor IPs to Google (a live GDPR issue in the EU). More practically, a library that names a font it doesn't ship fails silently: the CSS stays valid and components quietly render in `system-ui`.

- `src/fonts/` holds `dm-sans-latin-var.woff2` (variable, weights 100-1000, latin subset, ~61KB), `fonts.css`, and `OFL.txt`. DM Sans is SIL OFL 1.1, so redistribution inside the package is permitted **provided `OFL.txt` ships with it** — don't drop it.
- `scripts/copy-fonts.mjs` copies `src/fonts` to `dist/fonts` verbatim after `vite build`. Deliberately not run through Vite: the woff2 keeps a stable filename and `fonts.css` keeps its relative `url()`, so no asset hashing to reason about.
- Consumers opt in with `import "@tomcoggia/ui/fonts.css"` alongside the main stylesheet. Apps that self-host or use another face simply omit it and override `--ui-font-family`.
- Because it is a **variable** font, adding weights (400/500/700) later costs zero extra bytes — only 600 is used today.

`--ui-font-family` carries a real fallback stack, so a missing font import degrades to `system-ui` rather than breaking. Verify a font change by rendering text in `var(--ui-font-family)` next to a forced `system-ui` and confirming the metrics differ — a silent fallback looks fine in isolation.

### Verifying a build

A green `npm run build` does not mean the CSS pipeline works. After any change to the build or styling setup, confirm in `dist/index.js` that the CSS module object has real hashed class names (not `{}`), and that `dist/style.css` selectors are scoped (not bare `.button`). The end-to-end check is `npm pack` into a scratch consumer and server-rendering a component to inspect the emitted `class` attribute.

## Figma sync

Source of truth is the `Button` component set (`135:9598`) in the **iconAtomic Components** file, page `Components`. It is edited via the Figma Console MCP Desktop Bridge plugin, which needs Figma Desktop open with the plugin running. The REST token is expired, so REST-backed tools (`figma_get_component_for_development`, component images) fail with 403 — use `figma_execute` and `figma_capture_screenshot`, which go through the plugin and need no token.

Code and Figma were reconciled and currently match on every modelled property: heights 40/32/24, padding 14/10, 12/8, 8/6, gaps 6/5/4, radii 4/3/2, font 14/12/9 DM Sans **Medium**, line heights 20/16/12, icon 16/12/9 at 0.65 opacity.

Figma's variables were restructured to mirror `tokens.css`: every Button variant now binds to a `Button/*` token which aliases a semantic token which aliases a primitive (e.g. `Button/Tertiary/Hover -> Surface/Muted Hover -> Neutral/350`). Before this, hover/pressed states bound straight to `Brand/Dark` and `Neutral/*`, skipping the component tier — that was the inconsistency that motivated the whole token design. **Don't reintroduce direct primitive bindings on component variants.**

### Geometry is variable-bound too

`Button Size/{Large|Medium|Small}/{Padding X, Padding Y, Gap, Radius, Font Size}` are FLOAT variables, bound across all 48 variants (480 bindings). Changing radius, padding, gap or font size in Figma is now **one variable edit**, not 48 node edits — verified by setting `Button Size/Large/Radius` to 0 and watching all 16 Large variants follow.

Corner radius binds per-corner (`topLeftRadius` etc.), not via `cornerRadius`. Height is *not* a variable: the frames hug vertically, so height is derived from Padding Y plus line height. The code expresses the same geometry as explicit `height` plus `padding-inline`; both produce 40/32/24.

### Which direction to make a change

- **Token-shaped changes** (radius, spacing, weights, colour values, sizing): change the code first, then push to Figma. One token edit, provable via build + screenshot + pixel measurement, then synced.
- **Design-shaped changes** (new variants, layout restructure, visual exploration): do them in Figma first, then fetch into code.
- **Never change both sides in the same session** — there is no way to merge that.
- Reading Figma is safe and needs nothing from the user; writing to Figma needs the plugin running and the user out of the file.

### Icons: two slots, not a position enum

`icon` (leading) and `iconEnd` (trailing) are independent slots, mirroring Figma's two boolean properties:

| Code | Figma |
|---|---|
| `icon` | `Icon Start?` (default **true**) |
| `iconEnd` | `Icon End?` (default **false**) |
| the icon node itself | `ButtonIcon` instance-swap, referenced by **both** layers |

Setting both is allowed on purpose — rare, but the design system permits it, so the API does too.

Two things not to "simplify":

- **Icon position was briefly a variant axis in Figma and an `iconPosition` enum in code. Both were wrong.** A fourth variant axis doubled the set to 96 variants to express what component properties already handle; the enum then couldn't express both-sides. Don't reintroduce either.
- **Slots are separate DOM nodes, not one node flipped with `flex-direction: row-reverse`.** Reversing in CSS desynchronises visual order from DOM/reading order, which breaks screen-reader and keyboard sequence.

Both icons are `aria-hidden`, so a Button with icons and no children has no accessible name. A dev-only `console.warn` catches this; it relies on the exact expression `process.env.NODE_ENV` (bundlers substitute that literal — an optional chain does **not** match their define and silently disables the warning), and on `define: { "process.env.NODE_ENV": "process.env.NODE_ENV" }` in `vite.config.ts` keeping Vite from inlining it at our build time.

### Loading and asChild

**`loading`** — spinner is three pulsing dots, not a ring: at the small size a 10px ring has too few pixels to read. Content sits in a single `.content` wrapper hidden with `visibility: hidden` (**not** `display: none`) so it keeps its layout box; the dots are absolutely positioned. The button is therefore byte-identical in width loading or not — verified across sizes and icon counts. The label text is never rewritten by the component; "Save" → "Saving…" is the caller's choice and the caller's resize.

Loading uses `aria-disabled` + `aria-busy` and a click guard, **not** the `disabled` attribute — a disabled control loses focus and leaves the tab order mid-interaction. It also keeps its variant colours rather than going grey; loading is not "unavailable".

In Figma this is `State=Loading` (60 variants), **not** a boolean. A Figma boolean can only drive `visible`, and hiding a layer removes it from auto-layout, shrinking the button. Opacity 0 preserves the layout box — Figma's equivalent of `visibility: hidden` — so the Loading variants are the Default variants with content at opacity 0 plus an absolutely-positioned dots frame. Widths match Default exactly (130/110/86).

**`asChild`** — renders the single child element instead of a `<button>`, merging classes, props, refs and handlers into it. Chosen over an `as` prop because it composes with `next/link` and other framework link components without per-element typing, and four consuming apps are Next.js App Router. Navigation must be a real `<a>`: cmd-click, "open in new tab", status-bar preview and the "link" role are all lost on a `<button>`. `type` is omitted when `asChild` is set (an `<a type="button">` is wrong). No Figma counterpart — the element changes, the visuals do not.

**CSS Modules scopes `@keyframes` too** (`ui-button-pulse` ships as `ui-Button-module-ui-button-pulse-…`). That is correct and prevents collisions with a consuming app; don't "fix" a test that expects the unscoped name.

### Deliberate divergences — do not "fix" these

- **Focus is code-only.** `.button:focus-visible` has a 2px brand outline with 2px offset. Figma models no Focus state, and the buttons carry **no strokes in any variant** — that is the design's intent. Figma also has no equivalent of `outline-offset`, so an `OUTSIDE` stroke misrepresents the ring (it reads as invisible on Primary, brand-on-brand). Don't add focus variants or strokes to the Figma file.
- **Dark mode is code-only.** `tokens.css` has a `[data-theme="dark"]` block; the Figma collection has a single mode, and its dark values would need to be designed rather than invented.

### Editing the Figma file safely

Plugin edits are undoable from the canvas, and the user may be working in the file at the same time — node state can change between calls. Never bulk-delete by name pattern or assume an unfamiliar variant is leftover scaffolding (doing so destroyed a `Level=Ghost` variant the user was creating). Remove only ids created in the same call, and re-read state rather than trusting a previous call's snapshot.

## Component API conventions

- Props extend the corresponding intrinsic element props (e.g. `ButtonHTMLAttributes<HTMLButtonElement>`) and spread `...props` onto the DOM node.
- Accept an external `className` and merge it **after** the internal module classes so consumers can override.
- Variants map to CSS Module class names (`styles[variant]`), so a new variant is a new class in the module plus a union member on the prop type.
- Export the props interface alongside the component from both the component `index.ts` and the root barrel.
- `verbatimModuleSyntax` is on: type-only imports must use `import type`.
- The Button API is still the brief's placeholder. Before finalizing any component's props, audit how the consuming apps implement that component today (sizes, loading, icon-only, etc.) and model real usage instead of guessing.
