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
from the component the moment its DOM changes. It has theme and live primary-colour
controls, so a recolour can be auditioned without editing a file.

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

**0.8.0 -> 0.9.0 adds a type scale and renames Button's largest size.**
Three breaking changes, all small but none silent:

- **`size="jumbo"` is now `size="xl"`**, on both `Button` and `ButtonRound`.
  TypeScript catches it; the CSS tokens moved with it
  (`--ui-button-jumbo-*` -> `--ui-button-xl-*`, likewise
  `--ui-button-round-jumbo-*`). The prop union is now
  `"xl" | "large" | "medium" | "small"` - mixed, because only the largest
  size was renamed. Finishing the job (`lg`/`md`/`sm`) is a bigger break
  across four apps and has not been done.
- **Pill is 3px taller** (31 -> 34). It moved from 13/17 to 14/20 to sit on
  the same scale step as everything else at that size, and it has no height
  token by design, so height is padding plus leading.
- **`--ui-nav-rail-line-height` means 20, not 32.** The 32 was the slat's
  box, not its leading; it is now `--ui-nav-rail-slat-height`. An app
  overriding the old token to resize the rail must move to the new one. The
  rail renders identically otherwise - verified slat, pipe and pitch.

Additive alongside those: **four `--ui-type-label-*` steps** that every
component's type tokens now alias, and six -> four Figma text styles. An app
that overrides no type tokens needs no edit.

**0.7.0 -> 0.8.0 adds LeftRail and NavSlat sub items, and moves NavRail's
geometry.** Not additive: the `NavSlat` set was redrawn in Figma and the code
followed, so **any app already using `NavRail` will see its rail change** -
slats 20 -> 32 tall, gap 14 -> 8, inline padding 12 -> 0, and the icon chip
40 -> 32 (Button/Round Large -> Medium). Nothing renamed, so no theme file
breaks, but the rhythm is visibly different; check a rail after bumping.

It also adds a **14th semantic token**, `--ui-surface-pale`. An app that
mapped the other thirteen keeps working - it silently falls back to the
library's `#f5f5f5`, which is right in light and wrong in dark, so map it
before shipping a dark theme.

**0.6.0 -> 0.7.0 adds Pill and Logo.** Purely additive — no token renamed or
removed, so an app on 0.6.0 needs no theme edits and nothing already rendered
changes.

**0.5.0 -> 0.6.0 makes elevation and ButtonRound's pressed state theme-aware,
and adds ButtonRound.** No token was renamed or removed, so an app on 0.5.0
needs no theme edits. Two values move in dark mode only: the float shadows
deepen to 50% black, and a pressed ButtonRound flips to `--ui-surface-inverse`
instead of staying near-black. ButtonRound's icons also grew (24/20/16 from
22/16/12).

**0.2.0 -> 0.3.0 adds Card and moves colour values.** The greys were neutralised
(`--ui-ink` `#282523` -> `#262626`) and the dark-side neutrals renumbered
(`600/700/800/850` -> `550/650/700/800`) — an app aliasing a primitive by
number would be affected, though none should be. NextJob's
The semantic contract stays at 12 names: `--ui-border-subtle` was added with
Card and removed again when the flat variant lost its rule.

**0.1.x -> 0.2.0 renamed three public tokens.** `--ui-brand` ->
`--ui-primary`, `--ui-text-on-brand` -> `--ui-text-on-primary`, and the
primitive `--ui-red-500` -> `--ui-tc-red`. An app still setting `--ui-brand`
does not error — it silently falls back to the library default, i.e. reverts
to TC Red. Apps pin a tag, so nothing breaks until a ref is bumped: update
the app's theme file in the same commit that moves it to `#v0.2.0`.
NextJob's `src/styles/theme.css` maps this token and needs that edit.

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

- **Two-layer styling.** `src/tokens.css` defines global CSS custom properties on `:root`; component `*.module.css` files consume those variables and never hardcode values. A new visual constant means adding a token first. Neutral token values are still the brief's placeholders; `--ui-tc-red` is real.
- **A token name carries its type whenever the name alone is ambiguous.**
  `--ui-nav-accent-size` (a length) sits beside `--ui-nav-accent-color` (a
  colour); `--ui-button-lg-font-size` beside `--ui-font-family` and
  `--ui-button-font-weight`. An earlier pass had `--ui-nav-accent: 4px` next
  to `--ui-nav-accent-color`, so the shorter, more obvious name held the
  length — read `height: var(--ui-nav-accent)` and you assume a colour. Don't
  reintroduce bare `-accent`, `-font` or `-line` names.
- **Motion is system-level, not per component.** `--ui-motion-fast` (150ms,
  state changes) and `--ui-motion-base` (200ms, travelling motion) live in
  `tokens.css` and are used by both Button and Nav. A per-component
  `--ui-nav-motion` existed briefly; two components inventing their own
  timings is how interaction feel drifts apart. Component CSS must not
  hardcode a transition duration.
- **All tokens are `--ui-` prefixed** (`--ui-color-primary`, `--ui-space-2`). This is deliberate: `:root` is global, and unprefixed names like `--color-primary` would collide with a consuming app's own tokens, with load order deciding the winner. Never add an unprefixed token.
- **Barrel exports.** `src/index.ts` is the single public entry (`lib.entry` in `vite.config.ts`). Each component directory has its own `index.ts` re-export; `src/index.ts` re-exports those and imports `tokens.css`.
- **CSS is not auto-injected.** Styles are emitted to a separate `dist/style.css`, exposed as the `@tomcoggia/ui/styles.css` subpath export. **Consumers must import it once** (`import "@tomcoggia/ui/styles.css"`) or components render unstyled. This is deliberate, per the brief.
- **`"use client"` banner.** `rollupOptions.output.banner` stamps `"use client";` on `dist/index.js`. Four consuming apps (AndreasPalms, CampPal, PodcastPal, discovery-brief-builder) are Next.js App Router; without the directive, a Server Component passing `onClick` to `<Button>` throws. This makes the whole library client-only — fine for UI components, but it means no RSC-compatible server components can live here.
- **Peer dependencies.** React/React-DOM are peers (`>=18`) and externalized in the Rollup config alongside `react/jsx-runtime` — never promote them to `dependencies`.
- **`src/css-modules.d.ts`** provides the `*.module.css` ambient types. Without it, `tsc` fails on the style imports.

### The theming contract: 14 semantic tokens

`tokens.css` has a primitive tier and a semantic tier. **The semantic tier is
the public API** — those 14 names are what a consuming app overrides to make
these components look like its own. The primitives are internal; an app should
never alias `--ui-tc-red`.

#### Identity vs role: `--ui-tc-red` and `--ui-primary`

These two are easy to conflate and must not be.

- **`--ui-tc-red` (primitive) is the brand.** `#e51a38`, Tom Coggia's brand
  red. It is a fixed fact and never varies per app or per theme.
- **`--ui-primary` (semantic) is the role** — the colour scheme an app owns.
  It defaults to `--ui-tc-red`, and an app recolours everything primary
  (buttons, active nav, focus rings) by overriding this one name.

An earlier version called the overridable token `--ui-brand`, which had the
mutability backwards: it asked consumers to "override the brand colour with
your brand colour". Don't reintroduce `--ui-brand` in either tier, and don't
let an app alias `--ui-tc-red` — overriding the primitive moves every role
built on it, which today is `--ui-primary` but need not stay that way.

Declare them unlayered on `:root` (the library's defaults live inside
`@layer ui`, so any unlayered declaration wins regardless of import order):

```css
:root {
  --ui-primary:                /* primary fill                          */;
  --ui-primary-lighter:        /* subtle primary fill                   */;
  --ui-text-on-primary:        /* text on a solid fill                  */;

  --ui-surface-inverse:      /* secondary: dark fill                  */;
  --ui-text-on-inverse:      /* text on that dark fill                */;

  --ui-surface-muted:        /* tertiary: grey fill                   */;
  --ui-surface-muted-hover:  /* tertiary hover                        */;
  --ui-surface-muted-active: /* tertiary pressed                      */;
  --ui-text-default:         /* text on a light/neutral fill          */;
  --ui-text-muted:           /* de-emphasised text (nav sub items)    */;
  --ui-surface-raised:       /* floating panel fill (nav dropdown)    */;
  --ui-surface-pale:         /* the page under a rail or panel        */;

  --ui-surface-disabled:     /* disabled fill                         */;
  --ui-text-disabled:        /* disabled text, and ghost's border     */;
}
```

**Leave one out and it does not fail — it silently keeps the library's own
placeholder neutral.** That looks plausible in isolation, which is exactly why
it goes unnoticed; the app's palette and the component's drift apart one variant
at a time. Map all 14 or none.

`--ui-surface-pale` was added with `LeftRail`, the first component to paint
its own ground. It is the counterpart of `--ui-surface-raised`, not a synonym:
`raised` is what floats (a dropdown, a card), `pale` is what those float over.
The pair keeps that order in both themes — in dark, `pale` is `--ui-ink`
(`#262626`) *below* `raised`'s `#2e2e2e`, rather than inverting. An app that
themed the library before `LeftRail` existed will not have mapped it, and per
the rule above that fails silently.

`--ui-text-muted` (Figma `TextSecondary`, `#737373`) and `--ui-surface-raised`
(the dropdown panel's fill) were both added with Nav. They are the only
semantic tokens no Button variant uses, so a consuming app that themed
the library before Nav existed will not have mapped it — and per the rule above
it fails silently, leaving dropdown sub items in the library's placeholder grey.
Check it when adopting Nav.

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

### Typography: the label scale

Every string this library renders is a UI label — DM Sans Medium, no body
copy and no headings — so the scale is one ramp of six label sizes, and each
component's type tokens alias into it rather than restating a size. The same
thing `--ui-bottom-nav-chip-size` already does with ButtonRound's geometry.

| Figma text style | size / leading | used by |
|---|---|---|
| `Type/Label SM` | 10 / 12 | Button Small, BottomNav caption |
| `Type/Label MD` | 12 / 16 | Button Medium |
| `Type/Label LG` | 14 / 20 | Button Large, Nav item, Nav dropdown item, NavSlat, Pill |
| `Type/Label XL` | 18 / 24 | Button XL |

**The steps carry Button's own size names**, so `--ui-button-md-font-size`
resolving to `--ui-type-label-md-font-size` needs no lookup table. That is why
Button's fourth size was renamed from `Jumbo` to `XL`: one vocabulary rather
than two that have to be mentally mapped.

Weight is **one token for the whole scale**, `--ui-type-label-font-weight`,
not one per step. Every component in the library is Medium, and a scale that
restated 500 six times would take six edits to move it.

**Four steps, and a step exists only where something uses it.** The scale
started at six; two were removed on the same principle, and both are worth
recording because they are the two ways a type scale grows fat. They are named
below by value rather than by label, because the labels shifted when the scale
was renamed onto Button's axis and the old names now mean other sizes.

**14/32** was a spacing decision wearing type's clothes. The 32 was
the `NavSlat` box, expressed as leading because leading made the slat hug to 32
for free — one number doing type and geometry at once, which then forced a
second 14px step to exist beside `LG` differing only in leading. The box is now
`--ui-nav-rail-slat-height`, a `min-height` on the slat, and the pipe takes its
height from that rather than from the leading. Verified after the split: slats
still 32, pipes still 32, pitch still 40, type now a plain 14/20. Nothing moved
— only the decomposition changed. **Don't reintroduce a scale step that exists
to size a container.**

**13/17** was an orphan. Pill was its only consumer, and Pill moved onto
`LG` at the user's call, so the step had nothing left using it. Pill is 3px
taller as a result (31 → 34): it has no height token by design, so its height is
padding plus leading, and 20 replaced 17.

**These are the library's first text styles, and they are bound, not loose.**
Each style's `fontSize`, `lineHeight` and `fontStyle` bind to the matching
`Type/Label */*` variable, so the style *is* those variables rather than a
second copy of them. That matters because Button's 80 variants already bind
`Button Size/*/Font Size`: an unbound text style carrying its own 14 would be
a second source of truth for a number those variants depend on, which is the
same defect shape as a component variant binding straight to a primitive.
**Don't unbind them.**

The 13 `Type/*` variables hold **identical values in Light and Dark**, by
construction. Type is never themed — the same rule Pill's geometry follows.
Given that 12 of the file's existing geometry variables currently break that
rule (see Open divergences), assert it after any edit rather than assuming it.

The scale was added code-first and pushed, per the direction rule. Verified
after the change: all 21 component tokens resolve to the values they had
before, and the playground renders exactly six combinations at weight 500 —
10/12, 12/16, 13/17, 14/20, 14/32, 18/24. A green build does not show this;
it was measured off computed styles.

The playground has a **Type scale** section beside the colour tiers, reading
live values off the themed element and rendering each specimen at the tokens
themselves — so a change to the scale moves the samples rather than letting the
panel drift from them. Building it surfaced that the colour panel listed only
13 semantic tokens: `--ui-surface-pale` was never added when it became the
14th. Fixed there too.

**Both sides now carry the four steps**, pushed and verified: each Figma style
resolves through its bound variables to the same numbers as the CSS tokens, in
DM Sans Medium, identical in Light and Dark.

**Not applied to any node yet.** The styles exist and are correct, but no
component's text is using one — Button's labels still carry their own
`fontSize` binding with a raw leading. Applying them is a separate pass; see
Open divergences.

### Verifying a build

A green `npm run build` does not mean the CSS pipeline works. After any change to the build or styling setup, confirm in `dist/index.js` that the CSS module object has real hashed class names (not `{}`), and that `dist/style.css` selectors are scoped (not bare `.button`). The end-to-end check is `npm pack` into a scratch consumer and server-rendering a component to inspect the emitted `class` attribute.

## Figma sync

Source of truth is the `Button` component set (`135:9598`) in the **component-library** file (key `l0022oDH82HhLclD3s3q9z`; formerly named *iconAtomic Components* — a rename does not change the key), page `Components`. It is edited via the Figma Console MCP Desktop Bridge plugin, which needs Figma Desktop open with the plugin running. The REST token is expired, so `figma-console`'s REST-backed tools (`figma_get_component_for_development`, component images) fail with 403 — use `figma_execute` and `figma_capture_screenshot`, which go through the plugin and need no token.

**For reading, prefer the official Figma MCP server instead** (`get_design_context`, `get_screenshot`, `get_variable_defs`). It is authenticated separately, needs neither the Desktop Bridge nor the expired REST token, and returns the variant matrix, component properties and bound variable values in one call — that is how the Nav spec was read. The Desktop Bridge is still required for *writing*, and is worth the setup only then; it also binds to a fallback port when stale instances hold 9223, so `figma_get_status` reporting "no plugin connected" while the plugin looks open usually means it attached to a different port.

**This paragraph was stale and is corrected here.** It recorded a
reconciliation from before commit `919b801` ("Add a Jumbo size and BottomNav,
and move spacing to base 8"), and neither `jumbo` nor `BottomNav` was ever
written up. Verified against the file: Figma's **Light** mode now matches the
code — heights 48/40/32/24, padding X 24/16/12/8, gaps 10/8/8/4, radii all 4,
font 18/14/12/10 DM Sans **Medium**, line heights 24/20/16/12. The old numbers
this paragraph carried (gaps 6/5/4, radii 4/3/2, font …/9, padding X 14) are
what Figma's **Dark** mode still holds — see Open divergences #11.

Figma's variables were restructured to mirror `tokens.css`: every Button variant now binds to a `Button/*` token which aliases a semantic token which aliases a primitive (e.g. `Button/Tertiary/Hover -> Surface/Muted Hover -> Neutral/350`). Before this, hover/pressed states bound straight to `Brand/Dark` and `Neutral/*`, skipping the component tier — that was the inconsistency that motivated the whole token design. **Don't reintroduce direct primitive bindings on component variants.**

The Nav sets were reconciled the same way later: `Nav/Item` Default and Hover
text had been bound to a variable literally named `"Black"` (`#171717`, quote
characters included) rather than `Text/Default` (`#282523`), and `State=On`
bound straight to the `Color/TC Red` primitive. Both were repointed onto the
semantic tier. `"Black"` itself was left alone — 589 nodes across the file use it, so
changing its value reaches well beyond this library and is the user's call
rather than a side effect of a library change. Fixing its malformed name
costs nothing and is safe either way.

`NavSlat` was reconciled the same way when it was fetched into code. As drawn
it bound four things it should not have, none of which looked wrong on the
canvas because every one resolved to the right colour *in Light*:

    Primary Default icon    Button/Tertiary/Label     -> Text/Default
    Primary Active icon     Color/White               -> Text/OnPrimary
    Secondary Default icon  Button/Secondary/Default  -> Text/Default
    Secondary Hover icon    IconDefault               -> Text/Default
    Secondary Active icon   IconDefault               -> Primary/Base

Three lessons, each already recorded elsewhere and each repeated here:

- **`Button/Tertiary/Label` and `Button/Secondary/Default` are Button's
  component tokens.** Reusing either would have made NavSlat's appearance a
  side effect of Button's - exactly the trap Pill hit, with the very same
  `Button/Secondary/Default`. It reappeared here mid-session, which is a fair
  sign this is the easiest binding in the file to reach for by accident.
- **`Color/White` is a primitive**, so it could not follow the theme - the
  same reason ButtonRound's pressed state was moved off `Color/Ink`.
- **`IconDefault` aliases `Neutral/500` in *both* modes**, so it is frozen
  against the theme, and its name cannot be produced by the transform rule
  (it has no group). It is **not** the same thing as `Text/Muted`, which is
  `Neutral/500` in Light but `Neutral/400` in Dark - so in dark mode the sub
  item icons would have sat at `#737373` while every other muted thing moved
  to `#8c8c8c`. Verified after the fix: they now resolve to `#8c8c8c`.

**A sub item's glyph is a single `Union`, and only its fill paints.** The
three vectors beneath it are the boolean operation's operands and never render
on their own - so reading their bindings tells you nothing about what the icon
looks like, and an early pass here "fixed" them while the colour that actually
showed sat elsewhere. Check `children` before trusting a binding list. They
were set to match the Union anyway, so un-grouping it cannot surprise anyone.

`IconDefault` itself was **left alone** - 4443 nodes across the file bind it,
so it belongs to the other projects sharing this file and repointing it is the
user's call. Only NavSlat's own bindings moved. Likewise `Button/Tertiary/Label`
(38 bindings) and `Color/White` (602) were not touched as variables.

Secondary Active was also internally inconsistent: its icon's `Union` fill was
on `Primary/Base` while the three stroke shapes under it were still on
`IconDefault`. Invisible, because the Union is drawn over them - but it would
have surfaced the moment anyone edited the glyph. Checked that all four nodes
were visible before touching them, per the rule below about not assuming an
unfamiliar node is scaffolding.

The semantic tier was also renamed to match the code's identity/role split:
`Brand/*` -> `Primary/*` and `Text/OnBrand` -> `Text/OnPrimary`,
`TextSecondary` -> `Text/Muted`. `Surface/Raised`, ten `Nav/*` geometry floats
and `Motion/Fast` / `Motion/Base` were added. **`Color/TC Red` already existed
and was not renamed** — it is the Figma counterpart of `--ui-tc-red`, and
`Primary/Base` aliases to it exactly as `--ui-primary` does in code.

#### Names need not match, but they must be *derivable*

The two sides keep their own conventions — Figma `Group/Title Case`, CSS
`--ui-kebab-case`. What matters is the tier, the alias target and the value.
But a name that cannot be transformed by rule has to be hand-mapped forever,
and hand-maps are where drift starts — it is how the file ended up with
`Color/Black` at `#282523` and `"Black"` at `#171717`, Button on one and Nav
on the other.

The transform is: lowercase, spaces and `/` to `-`, prefix `--ui-`, drop a
trailing `-base`.

    Color/TC Red          -> --ui-tc-red
    Surface/Muted Hover   -> --ui-surface-muted-hover
    Text/OnPrimary        -> --ui-text-on-primary
    Primary/Base          -> --ui-primary

Three pairs used to break that rule and were fixed by renaming the *Figma*
side: `TextSecondary` -> `Text/Muted`, `Surface/Muted Pressed` ->
`Surface/Muted Active` (CSS is stuck with `active`, the pseudo-class), and
`Color/Black` -> `Color/Ink` (the value `#282523` is not black; Figma keeps a
separate `True Black` at `#000000`). `Color/Ink` had 1209 dependants — a
rename preserves every binding, so this was safe. Don't reintroduce a name
that has to be hand-mapped.

**Only one colour is fixed: `--ui-tc-red`.** Everything else is a value that
can be revised like any other design decision — see the identity/role split
above. An earlier version of this file said `Color/Ink` must "never change its
value". That was not an instruction from the user; it was inferred from the
1209-dependant count and overstated into a rule, and it then sat here
contradicting a legitimate request to revise the palette. The dependant count
is a **blast radius, not a prohibition**: changing Ink recolours most of the
Figma file, so it wants the user out of the file and a deliberate push — which
is a reason to be careful, not a reason to refuse.

Ink has since been neutralised to `#262626` on both sides, which is exactly
the change that rule would have blocked.

### The greys are neutral, deliberately

Every grey in the palette is a true neutral — `R = G = B`. The palette used to
be split: the light-side neutrals (`100`-`500`) were neutral, while `--ui-ink`
and the four dark-side neutrals (`600`-`850`) carried a warm tint (`#282523`,
`#6b6764`, `#4a4643`, `#3a3735`, `#302d2b`). Mixing the two families is what
made a dark surface read slightly brown next to a light one.

Each was replaced by the neutral of the **same perceptual lightness** (CIE
L*), so only hue moved and nothing changed weight:

    #282523 -> #262626   L* 14.9    (--ui-ink)
    #6b6764 -> #686868   L* 43.9
    #4a4643 -> #474747   L* 30.0
    #302d2b -> #2e2e2e   L* 18.7

`--ui-neutral-800` is the exception: its neutral equivalent is `#383838`, and
it ships as `#3d3d3d` — that value lightened again by ~10% in L* (23.3 ->
25.8), because it carries the dark tertiary fill and read too heavy.

**It cannot go much lighter.** `--ui-surface-muted-hover` is `--ui-neutral-700`
at L* 30.0, so a fill much above L* ~27 would be lighter than its own hover
state and the interaction would read backwards. Lightening it further means
restructuring the whole dark muted ramp, not editing one value.

The playground chrome was neutralised to match. It deliberately does not use
library tokens, so its greys are separate literals and drift on their own.

### Geometry is variable-bound too

`Button Size/{Large|Medium|Small}/{Padding X, Padding Y, Gap, Radius, Font Size}` are FLOAT variables, bound across all 48 variants (480 bindings). Changing radius, padding, gap or font size in Figma is now **one variable edit**, not 48 node edits — verified by setting `Button Size/Large/Radius` to 0 and watching all 16 Large variants follow.

Corner radius binds per-corner (`topLeftRadius` etc.), not via `cornerRadius`. Height is *not* a variable: the frames hug vertically, so height is derived from Padding Y plus line height. The code expresses the same geometry as explicit `height` plus `padding-inline`; both produce 40/32/24.

### The two sides must match

**The library and the Figma file are meant to be identical, to the extent the
two media allow.** This is the user's standing instruction, not a preference to
be traded off. Any change to a token — a value, a name, a new one, a deleted
one — is only half done until the other side carries it too. A divergence is a
defect with a fix pending, never a resting state, and it must be recorded in
this file with the direction it still has to travel.

Only a handful of things genuinely cannot match, and each is listed under the
component that owns it: focus rings (Figma models no focus state) and
`asChild` (an element change, not a visual one). Everything else that differs
is drift.

Note this Figma file is shared with other work — `PacketEditorHeader`,
`StepperWell`, `Checkbox`, `TabBarBG` and friends belong to other projects.
"Identical" covers the design-system subset (`Color/*`, `Neutral/*`,
`Primary/*`, `Text/*`, `Surface/*`, `Button*`, `Nav/*`, `NavSlat`, `Motion/*`,
`Card*`), not the whole file. One explicit exception inside that pattern:
`Button/Round-Deprecated` is used by the file's own screens but is **not part
of the library**, so its absence from the code is not drift and must not be
"fixed" by building a component for it.

### A component's Figma description is part of the spec

`Button/Round` carries a description in the file; it surfaces in every
`get_design_context` read, so it is what a consuming designer - or a later
fetch - actually sees. Pushing property values across is only half of a sync:
**a component whose values match but whose description is empty is still only
half documented.** `NavSlat`, `Card` and `Pill` were all empty and have since
been written.

What belongs in one: the React usage line, the states and the tokens each
binds, the geometry, and - most valuable - the things that read as odd in the
file and are not. NavSlat's hidden pipe rectangles, Card's unmodelled 350x200
frame, Pill's absent height token. Those are exactly what someone would
otherwise "fix".

### There is a third copy: the published library

Editing the Figma file is only half of a Figma-side change. **A consuming file
sees the last *published* snapshot, not the file** — so publish after any
change to a component, variable or style, and treat that as part of the edit
rather than a later tidy-up.

This is not theoretical. The snapshot was found roughly five renames behind:
`Button` published 36 variants where the file had 60, `ButtonRound` 3 where it
had 12, `Card` was absent entirely, and `Primary/Base` and `Color/Ink` still
resolved to their pre-rename names `Brand/Brand` and `Color/"Black"` — the
quote bug included. None of it was visible from either the code or the Figma
file; it only showed up when a consuming file tried to import by key.

Two follow-ons, both easy to miss:

- **Publishing does not update consumers.** A file that already has instances
  keeps rendering the old ones until someone accepts the update in its Assets
  panel. After changing a component, check a consumer rather than assuming.
- **The snapshot cannot be verified from inside the source file.**
  `importComponentSetByKeyAsync(key)` run in component-library resolves the
  key to the *local* set and returns it, so every variant count matches and
  the check proves nothing. Compare `imported.id` against the local node's id:
  if they are equal, that is what happened. This is why the five-renames-behind
  snapshot only surfaced when a consuming file tried to import - the check has
  to run from the consumer.
- **Publishing is UI-only.** There is no plugin API for it, so it is always a
  step to hand back to the user — as is accepting the update on the far side.

The corollary for this file's rules: "the two sides must match" is really
three, and the published one is the only one that drifts without either side
looking wrong.

### Light and dark are a semantic-tier concern

**Only the semantic tier varies by mode. Primitives are identical in Light and
Dark.** A primitive states what a colour *is* — `Neutral/300` is `#d4d4d4` —
and giving it a second value per mode moves everything built on it invisibly,
which collapses the two-tier split for the same reason an app must never alias
`--ui-tc-red`. What changes per mode is the **alias**: `Surface/Muted` points
at `Neutral/300` in Light and `Neutral/700` in Dark.

The code says this already: `:root` declares the primitives once and
`[data-theme="dark"]` re-declares only semantics. Figma's Light/Dark modes
mirror it exactly.

Eleven of the thirteen semantics move. `Primary/Base` and `Text/OnPrimary` do
not, deliberately — an app's primary colour is its primary colour in either
theme.

    Surface/Inverse       Color/Ink    -> Neutral/150
    Text/OnInverse        Color/White  -> Color/Ink
    Surface/Muted         Neutral/300  -> Neutral/700
    Surface/Muted Hover   Neutral/350  -> Neutral/650
    Surface/Muted Active  Neutral/400  -> Neutral/550
    Text/Default          Color/Ink    -> Neutral/150
    Text/Muted            Neutral/500  -> Neutral/400
    Surface/Raised        Color/White  -> Neutral/800
    Surface/Disabled      Neutral/150  -> Neutral/800
    Text/Disabled         Neutral/300  -> Neutral/550

**The structural caveat.** Modes belong to a *collection*, and this file has
one collection holding primitives, semantics, component tokens and other
projects' variables. So all 93 variables carry a Dark value whether they
should or not, and primitives staying identical is upheld by discipline rather
than by structure. The textbook arrangement is two collections — `Primitives`
with a single mode, `Semantic` with Light/Dark — which makes the invariant
impossible to break. Splitting means re-pointing every binding in a shared
file, so it has not been done; if it ever is, check the other projects first.
Until then, after any mode work, assert that no primitive differs between
modes.

### Open divergences

Kept here so they are not rediscovered. Anything on this list is a defect with
a fix pending, per the rule above.

1. ~~`Color/Ink` disagrees.~~ **Resolved, then it regressed, then resolved
   again.** Both sides are `#262626`. The first push recoloured ~1209
   dependants; the Button set was screenshotted afterwards to confirm nothing
   broke. It was later found back at `#333333` **in Light only**, with Dark
   still holding `#262626` - so it was simultaneously drift against the code
   *and* a break of the primitives-identical-across-modes invariant. Restored
   with NavRail. The lesson: that invariant is upheld by discipline, not
   structure (see the structural caveat above), so **assert it rather than
   assume it** - `Color/Ink` was the only primitive that differed, and nothing
   about either side looked wrong until it was queried.
2. ~~`Neutral/600` means two different things.~~ **Resolved.** `--ui-neutral-600`
   is now Figma's `#525252`, and the four dark-mode placeholders that had
   borrowed light-ramp numbers were renumbered to sit between the real steps by
   lightness: `600 -> 550`, `700 -> 650`, `800 -> 700`, `850 -> 800`. A pure
   rename — every dark-mode token resolves to the same colour it did before.
   `Neutral/550`, `/650`, `/700` and `/800` were then created in Figma, so
   both sides hold the same ramp even though no Figma mode uses them yet.
3. **In Figma, absent from code:** `Neutral/50`, `Neutral/200`, `Neutral/900`,
   `True Black`, `Primary/Dark`, `Primary/Darker`. No
   component uses any of them, and some may belong to the other projects
   sharing this file — so this is the one gap worth leaving open until a
   component actually needs the value. Check ownership before importing.

   `Surface/Pale` came off this list when `LeftRail` needed it, which is
   exactly the trigger the rule describes. It is now `--ui-surface-pale`, the
   14th semantic token, with a dark value (`--ui-ink`) that Figma does not
   have yet — so it travels code -> Figma on the next Bridge session.
   (`Primary/Lighter` was already in code as `--ui-primary-lighter`; it should
   not have been on this list.)
5. ~~NavRail's type and pipe moved in code and not yet in Figma.~~
   **Resolved.** Pushed once the Desktop Bridge came back: the three
   `Level=Primary` labels went to 14/20, and the Hover chip's glyph off the
   `Color/White` primitive onto `Text/OnPrimary` - the same defect fixed
   earlier in the session and reintroduced when the set was redrawn, which is
   a fair sign that binding is easy to reach for by accident.

   The pipe rectangles were also set to `layoutAlign: STRETCH`, so they take
   the label group's height instead of being pinned at a number. That is what
   the code does (`height: var(--ui-nav-rail-line-height)`), and it is why
   this particular divergence cannot recur: move the type and the pipe
   follows on both sides. The two hidden rectangles needed resizing by hand as
   well - a hidden node is out of auto-layout, so STRETCH does not reach it
   until it is shown.

   Verified after: the set uses only `Primary/Base`, `Primary/Lighter`,
   `Text/Default`, `Text/Muted` and `Text/OnPrimary` - no primitives, no
   Button component tokens - and no primitive differs between modes.
   **Still needs publishing.**
6. **`Button/Round` has a 13th variant: `Size=Large, State=Ghost`.** The set
   is documented here as `Size` x `State` = 3 x 4; the `State` axis now also
   carries `Ghost`, at Large only. It is 40x40 with no fill and no stroke, and
   its glyph binds to `Button/Tertiary/Label` - Button's component token,
   which is the binding this file keeps reaching for by accident.

   **Left alone deliberately.** An incomplete variant at one size reads as
   work in progress, and a previous session destroyed a `Level=Ghost` the user
   was creating by assuming exactly this was leftover scaffolding. Ask before
   touching it. If it is intended, the code needs a `ghost` state on
   `ButtonRound` and the glyph wants repointing to a semantic token.

8. ~~NavRail's slat gap moved in code and not yet in Figma.~~
   **Superseded.** The 14px gap lasted one session. Reading the `LeftRail`
   frames showed the `NavSlat` set had been redrawn to a 32 line box with an
   8 gap, and the code took those numbers instead - so the question of
   whether the slat box or the line box was the thing being spaced answered
   itself: both sides are now 32 + 8.

   The `Nav/Rail/Gap` **variable** is still 10 in Figma and is now used by
   nothing - the `LeftRail` frames hardcode their 8. Either repoint it to 8
   and bind the frames to it, or delete it; leaving a stale geometry variable
   in the file is how the next reader gets a wrong number confidently.

9. **Figma's `NavSlat` description is stale**, and it is the most-read
   surface on the component - it comes back with every `get_design_context`.
   It still says the chip is a Button/Round **Large** (40/24/2), the type is
   14/**20**, padding-inline is **12**, the gap is **10**, and that
   "Level=Secondary is drawn here but not yet modelled". Every one of those is
   now wrong: the artwork itself moved to 32/8/0 with a Medium chip, and the
   code models Secondary. The description was written against the old
   drawing and never updated when the set was redrawn.

   Rewriting it needs the Desktop Bridge, which was not connected this
   session. Worth doing in the same pass as #8, and worth re-reading the
   description against the artwork rather than against this file - the two
   disagreed here and the artwork was right.

10. **`LeftRail` exists only in code as a component.** Figma has two frames,
   `LeftRail-NoIcons` and `LeftRail-Icons`, neither of which is a component
   set - so there is nothing to instance, and the "two sides must match" rule
   has nothing to compare against beyond the drawn pixels (which do match,
   measured). Promoting them to a set with an `Icon?` boolean would close it;
   that is a design-shaped change, so it happens in Figma first.

18. **`Spinner` has no Figma counterpart.** It was pulled from tomcoggia.com,
   not from the file, so there is nothing to reconcile against beyond the
   `logo-tc` artwork it shares — which does match, being literally the same
   paths. Figma cannot express a continuous rotation as a component, so the
   most it could carry is a static frame plus a description; that is probably
   worth adding when someone next has the Bridge open, so a designer reaching
   for a loader finds one. Not drift in the usual sense — there is no value
   disagreeing — but recorded so it is not mistaken for an oversight.

15. ~~Pill's padding-inline disagrees: Figma 16, code 14.~~ **Resolved.**
   Figma took the code's 14, and `Pill/Padding X` and `Pill/Padding Y` now
   exist as FLOAT variables bound across both variants, so it cannot drift
   silently again — a raw value on the variants is exactly how it drifted.
   Both variants went 68x34 -> 64x34.

   **This should not have been raised as a question**, and it was, twice.
   Padding is spacing, which this file lists under token-shaped changes:
   "change the code first, then push to Figma." Design-shaped is new
   variants, layout restructure, visual exploration — not a padding value.
   The hesitation was a guess that Figma's 16 might be a deliberate edit
   worth preserving, plus a second guess that 14 might be a holdout from the
   base-8 move and therefore a real design call. The second was checked and
   is false: `--ui-bottom-nav-item-gap` is 6 and `--ui-nav-rail-pipe-gap` is
   10, so the palette was never uniformly base-8 and 14 is not an outlier.

   The lesson is narrow and worth keeping: **the direction rule already
   decides most of these.** Reach for the user when the two sides disagree
   about something the rule does not cover, not when it does.

16. ~~Pill's frame had a fixed height.~~ **Resolved, and it was a live trap.**
   `layoutSizingVertical` was `FIXED` at 32 while the code hugs, so when the
   type moved to 14/20 the Figma frame stayed 32 while its contents needed 34
   — the text overflowed rather than the pill growing. This is exactly what
   Pill's own note predicts ("set a height and the two would fight the moment
   the type scale moved"); the note was right and the file did not follow it.
   Set to `HUG`, and both variants now measure 34, matching the code.

17. ~~`logo-tc` bound a remote variable named `"Red"`.~~ **Resolved.** All five
   weights were already TC Red, so the *value* never diverged — but the fill
   bound to a **remote** variable literally named `"Red"`, quote characters
   included, owned by a different library file. Same defect as Nav's `"Black"`,
   and with the same consequence: this library's own brand mark took its
   colour from outside the file. Repointed to the local `Color/TC Red` on all
   five. Visually a no-op, both being `#e51a38`.

   Worth noting the direction here ran the other way for once — Figma was
   right and the code was the side that had drifted, defaulting the mark to
   text colour.

7. **`Button` and `logo-tc` have no Figma description**, where `NavSlat`,
   `Card`, `Pill` and `Button/Round` now do. `Button` is the 60-variant set
   and the most valuable one to document.

11. ~~12 geometry variables differ between Light and Dark.~~ **Resolved.**
   The rule is geometry-never-varies-by-mode, and it was broken at scale.
   What it was, read off the file rather than inferred:

       Button Size/Jumbo/*         Light 18/10/24/12/4  Dark 0 0 0 0 0
       Button Size/Large/Gap       8  vs 6
       Button Size/Large/Padding X 16 vs 14
       Button Size/Medium/Gap      8  vs 5
       Button Size/Medium/Radius   4  vs 3
       Button Size/Small/Radius    4  vs 2
       Nav/Panel Padding X         24 vs 20
       Nav/Pipe Radius             0  vs 1

   The Jumbo row is visible breakage: all 20 Jumbo variants collapse to zero
   padding, gap, radius and text size in Dark, because a new variable defaults
   to 0 in the second mode and these were never set.

   **It does not run one direction.** Button's Dark values are the old
   pre-base-8 numbers, so that edit landed in Light only; but `Nav/Panel
   Padding X` and `Nav/Pipe Radius` match the code in *Dark*, so those landed
   in Dark only. Geometry is mode-scoped in this collection, so every edit
   silently applies to whichever mode is active. That is the structural caveat
   this file already describes for primitives, biting somewhere it was not
   expected. Fixed with an explicit target per variable taken from
   `tokens.css` — **not a blanket Light-to-Dark copy**, which would have
   written 24 and 0 into the two Nav values and made them worse. Ten took the
   Light value; `Nav/Panel Padding X` and `Nav/Pipe Radius` took the Dark one.
   Both modes are set to the target, so re-running it is a no-op.

   Verified after: **zero** non-colour variables differ across modes, and the
   17 colour primitives are still identical. Assert this after any Figma
   session — it is upheld by discipline, not structure, and one session's
   spacing edit broke ten variables here without either side looking wrong.

14. ~~Figma is a whole session behind the code.~~ **Resolved.** Pushed and
   verified in one pass: the two retired text styles and their four variables
   deleted, `SM` -> `MD` and `XS` -> `SM` renamed with their variables,
   Button's 20 `Size=Jumbo` variants and ButtonRound's 5 renamed to `Size=XL`
   along with the five `Button Size/Jumbo/*` variables, and Pill moved to
   14/20. Verified after: both size axes read `Large | Medium | Small | XL`,
   no `Jumbo` remains anywhere, all four styles resolve through their bindings
   to the code's numbers, and neither invariant moved — zero non-colour
   variables differ across modes, zero primitives differ.

   **Two lessons from the run itself.** A removed style poisons an array
   captured before the removal: a helper that scanned a pre-fetched list threw
   `The style with id … does not exist` and left the batch half-applied, one
   style deleted and nothing else. Re-fetch before every operation rather than
   holding a list across mutations. And **order the deletes before the
   renames** — `Type/Label MD` (13/17) had to go before `SM` could take that
   name, or the file would carry two.

12. **The text styles are not applied to any node.** `Type/Label *` exist and
   are bound, but Button, Nav, NavSlat, Pill and BottomNav labels still carry
   a `fontSize` variable binding plus a raw `lineHeight` and a raw `Medium`.
   Applying a style to Button's 80 variants is the risky half — it needs to
   not disturb the existing `Button Size/*/Font Size` bindings — so it was
   left as its own pass rather than bundled into the style creation.

13. **Button's line height and weight are unbound in Figma.** Read directly
   off the labels: `fontSize` is bound, `lineHeight` is a raw PIXELS value and
   `fontName.style` is a raw `"Medium"`. That is Pill's old `AUTO` problem —
   the two sides agree by luck, and a type change moves one and not the other.
   The `Type/Label */Line Height` and `Type/Label/Font Weight` variables now
   exist to bind them to.

4. ~~Dark mode.~~ **Resolved.** The collection has Light and Dark modes and
   the eleven semantics that move are aliased to the same primitives
   `tokens.css` uses. Verified: no primitive differs between the modes.

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

- **Focus is code-only.** `.button:focus-visible` has a 2px primary outline with 2px offset. Figma models no Focus state, and the buttons carry **no strokes in any variant** — that is the design's intent. Figma also has no equivalent of `outline-offset`, so an `OUTSIDE` stroke misrepresents the ring (it reads as invisible on Primary, primary-on-primary). Don't add focus variants or strokes to the Figma file.
- ~~Dark mode is code-only.~~ No longer true: the Figma collection has Light and Dark modes, carrying the same mapping as `tokens.css`. See "Light and dark are a semantic-tier concern" below.

### Editing the Figma file safely

Plugin edits are undoable from the canvas, and the user may be working in the file at the same time — node state can change between calls. Never bulk-delete by name pattern or assume an unfamiliar variant is leftover scaffolding (doing so destroyed a `Level=Ghost` variant the user was creating). Remove only ids created in the same call, and re-read state rather than trusting a previous call's snapshot.

## Nav

Sitewide navigation. Figma: `Navigation Components` (node `342:4239`) — the
component sets `Nav`, `Nav/Item`, `Nav/Dropdown`, `Nav/Dropdown/Item`.
**The logo is not part of it** — it sits beside the nav in the page header.

```tsx
<Nav aria-label="Main">
  <NavItem asChild active={pathname === "/"}><Link href="/">Home</Link></NavItem>
  <NavDropdown label="My work">
    <NavDropdownItem asChild><Link href="/simplescreen">SimpleScreen</Link></NavDropdownItem>
  </NavDropdown>
</Nav>
```

### NavDropdown is a hover/focus disclosure

Figma shows only a static column, so the behaviour was taken from the working
implementation on tomcoggia.com (dev server, port 5170) and matches it:

| | value |
|---|---|
| panel enter | `opacity 0 -> 1`, `translateY(-4px) -> 0` |
| panel | `right: -20px`, `12px` below trigger, white, `16px 20px` padding, `12px` gap, right-aligned |
| sub item hover | label indents `8px`; red pipe **drawn top to bottom** (`scale: 1 0 -> 1 1`, `transform-origin: top`), `4px` wide, `20px` tall, `1px` radius |
| sub item current | red label **only** — no pipe, no indent |
| duration | `150ms` (`--ui-nav-motion`) |

Three things not to "simplify":

- **The trigger-to-panel offset is padding on the panel, not a `top` gap.** A
  real gap leaves a strip where the pointer is over neither element, so the
  menu closes as you reach for it. Transparent `padding-top` keeps the hover
  region contiguous and needs no close-timer.
- **The indent lives on the label, not as padding on the link.** Padding would
  slide the pipe with the text; the pipe has to stay pinned to the right edge.
- **The pipe is drawn top to bottom** — it scales vertically from its top edge
  like a stroke being laid down. Use the standalone `scale` property with
  `transform-origin: top`, not `transform`, so it composes with anything a
  consumer sets on `transform`. Width animates `0 -> 4px` alongside it so the
  pipe takes no horizontal room until drawn. Note Tailwind v4 emits `scale-y-*`
  as the `scale` property: reading `transform` on the reference implementation
  shows `none` and makes the vertical draw look absent when it is not.
- **The current sub item is red text only** — no pipe, no indent, and hovering
  it adds neither, so the two states never compound. Mirrors NavItem's
  `State=Current`, which likewise drops its rule.

The panel is hidden with `visibility`, not `display`, so it stays out of the
tab order while closed *and* can still transition out — the same trick Button
uses for its loading content.

### State names

| Figma | Code |
|---|---|
| `State=Default` | resting |
| `State=Hover` | `:hover`, or `underlined` to pin it (NavDropdown pins it while open) |
| `State=Current` | `active` — primary-coloured label, rule suppressed |

The prop is `active`; the CSS class and component token are `current`
(`.current`, `--ui-nav-item-text-current`). Not an oversight: `-active` was
unavailable because in CSS it already means *pressed* (`:active`), so a token
named `-active` would read as the pressed state. `current` matches the
`aria-current` the prop emits. `active` stays as the public prop because that
is what a nav prop is conventionally called. Figma's variant was renamed from
`State=On` to `State=Current` to match, so there are now two vocabularies, not
three: `active` at the API boundary, `current` everywhere else.

`active` also sets **`aria-current="page"`**. Active detection is the app's job
(`active={pathname === "/resume"}`), not a `currentPath` prop: with `asChild`
the `href` lives on the `next/link` child, so `Nav` cannot read it, and
per-app matching rules don't belong in a library. A `currentPath` layer could
be added over `active` later; the reverse cannot.

### Divergences — do not "fix" these

- **There is no icon variant, deliberately.** `Nav/Item` used to carry an
  `Icon?` boolean and a `Nav Icon` instance swap, and an earlier pass modelled
  them in code. No nav in use has an icon, so the prop, its CSS slot and the
  `--ui-nav-icon-size` / `--ui-nav-item-gap` tokens were removed — and the
  property and its three icon layers were then deleted from Figma too. Neither
  side has it now; don't add it back to either.
- **The dropdown trigger is a `<button>`** with `aria-expanded`/`aria-haspopup`,
  and the panel opens on focus as well as hover, with Escape closing it and
  restoring focus. tomcoggia.com uses a `<span>`, which no keyboard user can
  reach. Don't downgrade it to match.
- **Sub items rest at `--ui-text-muted` and darken to `--ui-text-default` on
  hover**, per Figma; the current one is `--ui-primary`.
  tomcoggia.com rests them at `#1c1917` and hovers to `#171717` — a transition
  too small to see, which looks like an oversight rather than a decision.
- **Three different blacks exist.** Figma's nav binds to a variable literally
  named `"Black"` (with the quote characters — a naming bug in the file) =
  `#171717`; tomcoggia.com uses `#1c1917`; the library's `--ui-text-default`
  is `#282523`. The component uses `--ui-text-default` so a themed app's nav
  matches its Buttons. Reconciling Figma is a token-shaped change.
- **The top-level rule sits directly under the line box** (`top: 100%`), per
  Figma. tomcoggia.com sits it 2px lower; reproduce that with
  `--ui-nav-item-underline-offset: 2px`.
- **No mobile/hamburger.** tomcoggia.com has `hidden md:flex` plus a toggle
  button; Figma specs neither. Design it before building it.
- **Focus rings are code-only**, matching Button.


## NavRail

Left rail navigation - a vertical column of links. Figma: the `NavSlat` set
(`444:791`) at `Level=Primary`, assembled text-only at `458:2467`.

```tsx
<NavRail aria-label="Sections">
  <NavSlat asChild active={pathname === "/"}><Link href="/">Home</Link></NavSlat>
  <NavSlat asChild><Link href="/work">Work</Link></NavSlat>
</NavRail>
```

**Sub items are modelled**, as `level="secondary"` plus a `NavSlatGroup`
wrapper. An early pass built them as a hover-disclosed group and was deleted;
this one was built fresh off the redrawn set rather than restored from
history, which is what that warning was for.

`icon` is optional. Without one the slat is text alone and closes up, which is
what hiding the layer does to Figma's auto-layout. It no longer changes the
slat's height: the line box and the chip are both 32.

    gap       8    between slats
    padding   0    inline - the rail's own padding sets the inset
    type      DM Sans Medium 14 / 32
    height         none - the slat hugs its line box: 32, with a chip or without
    chip      32   a Button/Round Medium; icon 20 at stroke 1.5
    chip gap  8    chip -> label
    pipe      4 wide, the height of the label's line box, --ui-primary
    indent    14   = pipe width + the 10 gap Figma sets after it
    sub       16   indent, or 32 + 8 = 40 once icons are on; 0 gap within a group

| Figma state | here | label | pipe | indent |
|---|---|---|---|---|
| Default | resting | `--ui-text-default` | - | - |
| Hover | `:hover`, `:focus-visible` | unchanged | drawn | 12px |
| Active | `active` | `--ui-primary` | - | - |

### The geometry moved when the set was redrawn

The numbers above are not the ones this component was first built to. The
`NavSlat` set was redrawn in Figma between the first fetch and `LeftRail`, and
all four variants are now 32 tall where they were 20 on their own and 40 with
a chip. Three things followed from that one change:

- **The chip dropped a size.** A 40px `Button/Round` Large no longer fits a 32
  line, so it is Medium (32/20/1.5) and the slat is one height throughout -
  `--ui-nav-rail-chip-*` alias the `-md-` tokens now, not `-lg-`.
- **The gap went 14 -> 8**, and padding-inline 12 -> 0. Both were read off the
  `LeftRail` frames, where the slats sit flush against the rail's own 24
  padding and the hover pipe wants the slat's leading edge to *be* that inset.
- **A brief 34px pitch agreement is gone.** For one session the code stacked a
  20 line box on a 14 gap while Figma stacked a 24 box on a 10, and every slat
  top still landed on the same pixel. That coincidence is what made the two
  gap numbers look like a divergence when the rhythm actually matched. Both
  sides are now 32 + 8 = 40 outright, so the agreement is stated rather than
  arrived at.

Verified live against both `LeftRail` frames: slat tops `0/40/72/104/136/176/
216/256` and sub labels at 40 (text-only) / 64 (icons) from the rail's edge,
which is what Figma draws at `pl-16` and `pl-40` inside its 24 padding.

### The pipe is out of flow

Figma draws it in flow, before the label, because that is how Figma has to
draw it. **In code it is absolutely positioned**, and the label's own
`margin-inline-start` does the indenting.

In flow, a 2px bar plus its gap would already be holding the label 12px over
before anything is hovered, and there would be nothing left to indent. Out of
flow the pipe costs no layout at rest, and the two halves of the effect
animate independently: the pipe draws over `--ui-motion-base`, the label
slides over `--ui-motion-fast`.

It draws with the standalone `scale` property (`1 0` -> `1 1`,
`transform-origin: top`), not `transform`, so it composes with anything a
consumer sets on `transform` - the same rule as the dropdown's pipe.

**The indent is `calc(pipe-width + pipe-gap)`**, not a flat number, so
widening the pipe keeps the gap after it rather than eating into it. That is
not academic - the pipe went 2px -> 4px to match the horizontal nav's accent
rule, and the indent followed to 14px on its own.

The pipe is 4px because `--ui-nav-accent-size` is, but it is **its own token,
not an alias**. The two are the same figure today; one component's thickness
should not move because another's did.

### The chip borrows ButtonRound, but is not one

Figma composes an actual instance of `Button/Round` here. **In code it is an
inert `<span>`, not `<ButtonRound>`** - a slat is an `<a>`, and a `<button>`
cannot be nested inside one. That is invalid HTML rather than a style
preference: interactive content does not nest, the button would swallow the
link's clicks, and the accessible name gets confused. `asChild` does not
rescue it either, since it replaces the button with its child rather than
making the chip passive.

**The geometry is aliased, the colours are not**, and that split mirrors what
Figma does with the instance:

    --ui-nav-rail-chip-size        -> --ui-button-round-lg-size
    --ui-nav-rail-chip-icon-size   -> --ui-button-round-lg-icon-size
    --ui-nav-rail-chip-icon-stroke -> --ui-button-round-lg-icon-stroke

Resize ButtonRound and the rail's chip follows, exactly as the instance does.
The fills are overridden per state on the Figma instance, so in code they are
the rail's own - which they have to be, because **the states sit one step off
ButtonRound's**:

| slat state | chip | ButtonRound's equivalent |
|---|---|---|
| Default | transparent, `--ui-text-muted` glyph | none - ButtonRound has no transparent state |
| Hover | `--ui-primary` / `--ui-text-on-primary` | its Hover |
| Active | `--ui-primary-lighter` / `--ui-primary` | its Default |

The glyph takes the chip's colour by inheritance and sets none of its own -
otherwise it wins inside the chip and draws a text-coloured icon on a red
circle.

### Divergences - do not "fix" these

- **`:focus-visible` gets the hover treatment too**, not just the outline. A
  keyboard user should see the same "this row is highlighted" affordance a
  pointer user gets. Figma models no focus state, so this is code-only,
  matching Nav and Button.
- **Current suppresses hover entirely** - hovering the current page adds
  neither pipe nor indent, so the two states never compound. Figma has no
  hovered-current variant; this mirrors what `NavItem` and `NavDropdownItem`
  already do.
- **The rail stretches its slats**, where the Figma component hugs its text.
  Figma sets `w-full` on the instances, which is the same intent - and a slat
  that fills the rail is hoverable across the whole row rather than only
  where its text reaches.
- **The pipe is the height of the label's line box, not the slat's.** With an
  icon the slat is 40 tall and the pipe stays 20, centred - the pipe lives in
  the label's group in Figma, not in the slat, and its rectangles are
  `layoutAlign: STRETCH` so they follow the type on that side too. It is
  centred with a margin rather than a translate so the standalone `scale`
  stays the only transform.
- **Default and Active carry a hidden pipe rectangle in Figma**, which is how
  Figma expresses "no pipe" inside an auto-layout - hiding it removes it from
  the flow, which is why those variants are 177 wide against Hover's 191
  (4 + the 10 gap). They are not grey pipes; don't model them.
- **The example frame's `Surface/Pale` background is not modelled.** It is the
  page the rail sits on, not part of the rail - same call as Card's 350x200
  frame.
- **`prefers-reduced-motion` is honoured**, which is still new for this
  library: the states all still apply, the pipe just stops drawing and the
  label stops sliding. Button and Nav do not have it yet.
- **A sub item's hover and current are code-only.** The set draws exactly one
  secondary variant, `Level=Secondary, State=Default`. Left literally, a sub
  item would not respond to the pointer at all, which reads as disabled rather
  than quiet - so they rest at `--ui-text-muted` and darken to
  `--ui-text-default`, which is what `NavDropdownItem` already does with the
  horizontal nav's sub items, and go `--ui-primary` when current.
- **A sub item draws the hover pipe, exactly as a primary slat does** - the
  same 4px bar drawn top to bottom, the same 14px indent after it. Figma has
  no hovered secondary variant, so this is code-only, and it is a deliberate
  request rather than an inference: an earlier pass left sub items with a
  colour change alone, on the reasoning that a second pipe under the parent's
  would read as a nested rule. In practice the pipe is what makes a row feel
  live, and dropping it made sub items feel like labels rather than links.

  It needs no rules of its own. The pipe is positioned from the slat's own
  leading edge, and a sub item's leading edge is already the indented one, so
  the bar lands against its own label rather than under the parent's - which
  is what that earlier reasoning was actually worried about.

  The current sub item still suppresses both, so hover and current never
  compound - the same rule primary slats and `NavDropdownItem` follow.
- **A sub item drops an `icon` if one is passed.** Figma draws no chip on
  `Level=Secondary` and offers no variant carrying one, so the slot is
  dropped rather than rendered at some smaller size.

### `NavSlatGroup` picks its own indent

Figma expresses the sub indent as two hand-set frames - `pl-16` on the
text-only rail, `pl-40` on the one with icons, that 40 being the chip plus its
gap. Copying both numbers into code would mean a prop saying which rail this
is, and a rail that gains icons would then be wrong until someone remembered
to change it.

The group reads the condition off its own contents instead:

    .group:has(.withIcon) .secondary { margin-inline-start: calc(chip + gap) }

So the sub labels line up under the parent's label either way - verified at
64/64 with icons on. The group also sets `gap: 0`, which is the other half of
its job: a parent and its children want to read as one block, and the rail's
own 8 still separates the group from its neighbours.


## LeftRail

The app shell's left column - a brand slot over a `NavRail`. Figma:
`LeftRail-NoIcons` (`482:2517`) and `LeftRail-Icons` (`458:2612`).

```tsx
<LeftRail brand={<Logo weight="medium" size={50} label="Acme" />}>
  <NavRail aria-label="Sections">
    <NavSlat asChild icon={<Home />}><Link href="/">Dashboard</Link></NavSlat>
    <NavSlatGroup>
      <NavSlat asChild active icon={<Settings />}><Link href="/settings">Settings</Link></NavSlat>
      <NavSlat asChild level="secondary"><Link href="/settings/members">Members</Link></NavSlat>
    </NavSlatGroup>
  </NavRail>
</LeftRail>
```

    padding    24   all round
    brand      50   min-height, then 32 to the nav
    fill            --ui-surface-pale
    width           none - whatever column the layout gives it

### It is a shell, not a nav

It renders a `<div>` and takes the `NavRail` as **children** rather than
building one internally. Two reasons, and neither is style:

- The `<nav>` landmark and its `aria-label` belong on the element that holds
  the links. Wrapping would have meant forwarding a `navLabel` prop down, and
  a page with more than one nav needs that label to be obvious, not plumbed.
- The column carries more than nav sooner or later - a workspace switcher
  under the brand, a user block pinned to the bottom. Children leave room for
  that; a `items` prop would not.

`brand` is a **slot, not a `logo` prop**. What belongs there varies per app:
the mark alone, a mark beside a wordmark, or a link home. The slot is rendered
even when empty and collapsed with `:empty`, so omitting it leaves no 32px
hole and no second code path.

### The fill is the one place a frame background IS the component

`Card`'s 350x200 frame and `NavRail`'s own example frame are both "the page
the design sits on", and neither is modelled. This one is different and the
distinction is worth keeping straight: the pale ground travels with the rail,
and it is the thing separating the rail from the content beside it. A left
rail with no fill is not a left rail, it is a list.

That is what made `--ui-surface-pale` worth adding to code - it had sat in
Figma unused, as open divergence #3 records, precisely because no component
had needed it.

**`--ui-left-rail-bg` is deliberately not declared in `tokens.css`.** Composing
it there as `var(--ui-surface-pale)` looks tidier and is wrong: a `var()`
inside a custom property resolves at the element that *declares* it, so the
fill would freeze against `:root`'s light value and `[data-theme="dark"]` on a
subtree could not move it. This was caught by rendering it, not by reading it
- the build is green either way and light mode looks perfect. The module
carries `var(--ui-left-rail-bg, var(--ui-surface-pale))` instead, resolving at
the rail, which is what every other component colour in this library already
does. Card's shadow tokens describe the same trap and solve it the other way,
by redeclaring in the dark block; the fallback form is preferred where a
component token has no reason to exist on `:root` at all.

### The spacer is not modelled

Figma reaches the 32px between brand and nav as an 8 gap, a 16 `Spacer`
rectangle and another 8 gap. The spacer is an auto-layout idiom for "leave a
hole here", the same class of thing as `NavSlat`'s hidden pipe rectangles, so
code carries one number - `--ui-left-rail-brand-gap: 32px` - rather than
three nodes. Measured live at 32.

### Divergences - do not "fix" these

- **The 200x500 frame is not modelled.** Same call as `Card`: the rail has no
  width and no height, and stretches to the column it is given. Figma poses it
  at 200x500 because a frame must have a size.
- **`LeftRail` is a plain frame in Figma, not a component set.** There is
  nothing to instance and no variant axis; the two frames are `Icon?` on and
  off, which in code is just whether the caller passes `icon`. If it is ever
  promoted to a component, the code name already matches.

## ButtonRound

Circular icon-only action button. Figma: the `Button/Round` set (`220:11857`),
axes `Size` = Large | Medium | Small and `State` = Default | Hover | Active |
Disabled.

    box    icon   stroke
    40     24     2
    32     20     1.5
    24     16     1

The icon grows faster than the container (60% / 62.5% / 67%) so the glyph
stays legible at Small — that ratio is deliberate, not a rounding artefact.

**Stroke is set on the shapes, not just the `<svg>`.** Lucide puts
`stroke-width` on the root and lets it inherit, but plenty of icons set it on
each `<path>`, and a presentation attribute on an element beats a value
inherited from its parent — an svg-only rule loses to those silently.
`vector-effect: non-scaling-stroke` then pins the weight to rendered px
whatever the icon's viewBox, so a 24-viewBox glyph drawn at 12px does not
halve its stroke.

### There are two round-button sets; only one is live

`Button/Round` (`220:11857`, `Size` x `State`, 12 variants) is the one this
component models. Beside it sits `Button/Round-Deprecated` (`66:2077`,
`Level` x `State` — Primary, Secondary, Tertiary, Ghost, Destroy).

**That one is deliberately not in the library.** It is used by the file's own
screens — ~247 instances against the live set's 9 — and the user has said it
will not be part of the library, so there is nothing to model in code and no
divergence to close. Do not build a `Level`-based round button to "match" it,
and do not delete it: those instances are real, and it is the set that carries
the `Level=Ghost` variant a previous session destroyed by assuming exactly
this kind of thing was leftover scaffolding.

The two shared the name `Button/Round` until the deprecated one was renamed,
and that ambiguity is the likely reason consuming files resolved the key to a
third, older shape (a `State=On` axis) no matter how often the library was
published. Re-check a consumer after any publish rather than assuming it took.

### Every colour is on the semantic tier, deliberately

    Default   --ui-primary-lighter  / --ui-primary
    Hover     --ui-primary          / --ui-text-on-primary
    Active    --ui-surface-inverse  / --ui-text-on-inverse
    Disabled  --ui-surface-disabled / --ui-text-disabled

Active used to be `--ui-ink` / `--ui-white`, and Figma likewise bound it to
`Color/Ink` / `Color/White`. The two sides agreed, so it did not read as
drift — but both skipped the semantic tier, and a primitive does not move with
the theme. In dark mode that put a `#262626` circle on a `#2e2e2e` panel:
present, and invisible. `--ui-surface-inverse` is `--ui-ink` in light, so the
swap changed nothing there, and flips to `--ui-neutral-150` in dark. Don't
reintroduce the primitives; the same reasoning is why Button's `secondary`
uses this pair.


## Logo

Tom Coggia's brand mark. Figma: the `logo-tc` set (`107:7630`), one axis
`Weight` = `x-light` | `light` | `medium` | `heavy` | `x-heavy`.

```tsx
<Logo weight="medium" size={40} label="Tom Coggia" />
```

**The paths are exported from Figma, not redrawn.** Each weight is two paths —
the open ring and the T — pulled straight out of the component with
`exportAsync`, so the curves are the artwork's. If a weight is ever redrawn in
Figma, re-export rather than nudging the `d` strings by hand.

### TC Red by default

The mark defaults to `--ui-tc-red`. It is Tom Coggia's brand mark and red is
what the brand is; `--ui-logo-color` overrides it, and that property inherits,
so any ancestor can reverse the mark on ink or knock it back to text colour.

**`--ui-tc-red`, deliberately not `--ui-primary`.** Primary is the role an app
owns and recolours. An app recolouring its own primary to blue must not turn
someone else's logo blue — so this is the identity half of the identity/role
split, and the one component that legitimately reaches for the primitive.
Confirmed live: the mark stays red in dark mode and when the playground's
primary picker is moved.

**This reverses an earlier decision, at the user's instruction.** This section
used to argue the opposite — that the mark "carries no colour of its own",
that it should inherit, and that `--ui-tc-red` "would be the *wrong* default
even though the mark is the brand". That was a defensible reading, but it was
not the user's, and it is now settled the other way. Don't re-derive the old
argument and revert it; if it changes again it will be because the user says
so.

**The old section also described behaviour the component never had.** It said
the mark "takes its colour from context via currentColor". It does not:
`.logo` declares `color` on the element itself, so its own declaration beats
anything inherited, and `currentColor` on the fill just points back at that
declaration. Measured before the change — an ancestor setting `color: blue`
left the mark at `#262626`. Only `--ui-logo-color` ever worked, or `style` on
the element itself (which is why the playground's reversed-on-ink specimen
appeared to work). The playground demo now overrides through the custom
property, so it demonstrates the supported route rather than the accidental
one.

### Naming is opt-in

`label` sets `role="img"` and `aria-label`; without it the mark renders
`aria-hidden`. A logo beside a wordmark is decorative and should not be
announced twice, but one standing alone as the page's identity must be — the
component cannot tell which, so the caller says.


## Spinner

The brand mark as a loading indicator — the ring turns, the T stays put.
Taken from `LoadingSpinner` on tomcoggia.com (`src/app/components/`), the same
way Nav's dropdown behaviour was.

```tsx
<Spinner size={64} label="Loading" />
```

Two props: `size` and `label`. `--ui-spinner-color` stays as the override
hook — the playground demos only sizes now, but a spinner on a dark surface
still needs to be able to reverse.

### It shares Logo's artwork, it does not copy it

The site's spinner draws two `d` strings that are **byte-identical to
`Logo`'s `medium` weight** — it is the mark, not a lookalike. So the paths
moved to `src/internal/logoPaths.ts` and both components import them.

Two copies would mean two things to re-export the next time the mark is
redrawn in Figma, and only one of them would get done. That is the same
reasoning the Logo section already gives for exporting rather than redrawing.

**Medium weight only, and there is no `weight` prop.** Sharing the artwork
made all five available for nothing, and offering them was still wrong:
`Logo` has five because a mark is set at whatever weight its surroundings
want, whereas a spinner is the one thing an app shows while it waits. Five
ways to draw it is a choice nobody needs to make. The cost of reversing this
is a prop, not an export — the other four paths are already imported.

### It is not Button's loader, deliberately

`Button` spins three pulsing dots, because at button sizes a ring has too few
pixels to read — that reasoning is in the Button section and it still holds.
This is the page- and section-level loader. **Don't unify them**; they look
like duplicates and are not.

### What did not come across

- **The `py-[80px]` centring wrapper.** That is the page's layout, not the
  component — same call as `Card`'s 350x200 frame and `NavRail`'s example
  frame. A consumer centres it in whatever space it has.
- **The hardcoded `#E51A38`.** It is `--ui-spinner-color`, defaulting to
  `--ui-tc-red`. Its own token rather than reusing `--ui-logo-color`: the two
  are the same red today, but a spinner tinted to match a surface should not
  drag the logo with it — the same call as `--ui-nav-rail-pipe-width` versus
  `--ui-nav-accent-size`.
- **Tailwind's `animate-spin` and `origin-center`.** This library has no
  Tailwind.

### The motion tokens are periods, not transitions

`--ui-spinner-duration` (800ms) and `--ui-spinner-duration-reduced` (2400ms)
sit beside the component sizing tokens and deliberately do **not** reuse
`--ui-motion-fast` / `--ui-motion-base`. Those two describe how quickly a
thing settles after an interaction; a loop that never settles is a different
quantity, and 150ms would spin it absurdly. This is the one legitimate
exception to "component CSS must not hardcode a duration" — it doesn't
hardcode one, it just has its own scale.

### `prefers-reduced-motion` slows it, it does not stop it

Everywhere else in this library the reduced-motion branch removes the effect
outright — the rail's pipe stops drawing, its label stops sliding — because
those are decoration. **Here the motion is the information.** A frozen
spinner reads as a hung app rather than a calm one, so it keeps turning at
2400ms, well below the vestibular trigger threshold.

### `transform-box` is load-bearing

The ring rotates via the standalone `rotate` property (not `transform`, so it
composes with anything a consumer sets — the rule the nav and rail pipes
already follow). It needs `transform-box: view-box` with
`transform-origin: 50% 50%`: without it an SVG child resolves
`transform-origin` against its own bounding box, and the ring visibly wobbles
instead of spinning true. Verified resolved to `50px 50px`.

Naming follows `Logo`: `label` sets `role="status"` and `aria-label`, and
without it the spinner is `aria-hidden`. A spinner standing alone should pass
one — the opt-in exists for when something beside it already announces the
wait, not as a default to leave.

### Divergence — no Figma counterpart

`Spinner` exists only in code. Figma has the `logo-tc` set but nothing
modelling the animation, and Figma cannot express a continuous rotation as a
component anyway. See Open divergences.


## Pill

A filter toggle — the row of choices above a list. Figma: the `Pill` set
(`432:17267`), one axis `State` = `On` | `Off`.

```tsx
<Pill selected={filter === "Remote"} onClick={() => setFilter("Remote")}>Remote</Pill>
```

Renders a real `<button>` with `aria-pressed`, so it is announced as a toggle
rather than a link or a tab. The prop is `selected`, not `on`: that is what the
control means to a caller and what `aria-pressed` reports. The class stays
`.on`, so `State=On` still transforms.

**No height token.** Figma draws the pill 31px tall, but that is 7px padding
plus a 17px line box — set a height and the two would fight the moment the
type scale moved.

**`Pill/Radius` (999) and `Pill/Line Height` (17) are FLOAT variables**, bound
across both variants - four corners and the label - so each is one edit rather
than several nodes, matching how `Card/Radius` and the `Button Size/*` set
already work. Both hold the same value in Light and Dark: geometry never
varies by mode, only the semantic colour tier does.

The line height was `AUTO` until then. It *resolved* to 17 for DM Sans Medium
13, so the two sides agreed - by luck. A font change would have moved Figma
and not the code, and nothing would have looked wrong on either side. Pinning
it is what makes the agreement real rather than coincidental.

`Pill/Padding X` (14), `Pill/Padding Y` (7) and `Pill/Font Size` (13) are
still raw values on the variants. Worth binding if Pill's geometry ever needs
editing as a set; nothing depends on it today.

Note when reading bindings back: **a text node's `lineHeight` binding is an
array**, where a corner radius binding is a single object. A check written for
the scalar shape reads `undefined` and reports the binding missing when it is
in fact there.

### It was rebound to the semantic tier on arrival

As drawn, `State=Off` filled with `Color/White` and `State=On` with
`Button/Secondary/Default`. Both were repointed in Figma — Off to
`Surface/Raised`, On to `Surface/Inverse` — and the code uses those.

Two separate problems, worth recognising again elsewhere:

- `Color/White` is a **primitive**, so it could not follow the theme; the pill
  would have stayed white on a dark page. `Surface/Raised` is `#ffffff` in
  light, so nothing changed there.
- `Button/Secondary/Default` is **Button's component token**. Reusing it would
  have made Pill's appearance a side effect of Button's, so that a later change
  to the secondary button silently moved the filter row. It resolved to
  `Surface/Inverse` anyway; Pill now says so directly.


## Card

A raised surface that groups content. Figma: the `Card` component set
(`395:14848`), one variant axis `Style` = `Float1` | `Float2` | `Flat`.

```tsx
<Card variant="float1">…</Card>
```

**Container only.** It sets a fill, a radius and an elevation, and nothing
else. No padding, no internal layout, no width or height.

### Divergences — do not "fix" these

- **The 350x200 frame is not modelled.** Figma poses all three variants at that
  size; it is the frame the design sits in, not a property of the component. A
  card in an app is whatever size its grid cell gives it, so `Card` has no
  width or height and stretches to its parent.
- **No padding.** What goes inside has not been designed yet. Adding padding
  now would be inventing a decision the Figma file has not made, and every
  consumer would then have to undo it.
- **Flat has no rule at all** - fill and radius only. It carried a 3px
  hairline briefly; that went, and `--ui-border-subtle` and
  `--ui-card-border-width` went with it since nothing else used them. `flat`
  still sets `box-shadow: none` rather than being an empty rule, so the
  variant always puts a class on the element.

### `float1` / `float2` are Figma's names, not good ones

The variants say nothing about what they are for; they are elevation steps,
and `Style=Float1` reads as a style rather than a height. They are kept
because the transform rule holds - `Style=Float1` -> `variant="float1"` -
and renaming one side alone is how the two drift apart. If they are ever
renamed (`raised`/`lifted`, say), rename the **Figma** side first: that is a
design-shaped change, and the code follows.

The two shadows are `--ui-shadow-float-1` / `--ui-shadow-float-2` in
`tokens.css`, alongside motion rather than in a component tier: elevation is
system-level, and a second component inventing its own shadow is how depth
drifts apart. Both are two-layer - a soft cast plus a tight contact shadow -
so a card reads as lifted rather than blurred.

Figma shadows cannot be variables — variables are only BOOLEAN, FLOAT, STRING
and COLOR — so the two elevations are **effect styles**, `Shadow/Float 1` and
`Shadow/Float 2`, named so the transform still holds
(`Shadow/Float 1` -> `--ui-shadow-float-1`). Effect styles are the Figma-native
equivalent of a shadow token; don't try to model them as variables.

**The shadow colour is a variable, though**, and that is what makes elevation
theme-aware. `--ui-shadow-color` / `Shadow/Color` is `rgb(0 0 0 / 0.1)` in
light and `0.5` in dark: a 10% black shadow does almost nothing on a dark
surface, where the card and its shadow are already close in lightness. The
geometry is identical in both modes; only the alpha moves. In Figma each
effect's colour is bound to that variable, so the two modes follow it.

**The composed tokens must be redeclared in the `[data-theme="dark"]` block.**
A `var()` inside a custom property resolves at the element that *declares* it,
so `--ui-shadow-float-1: … var(--ui-shadow-color) …` written once on `:root`
freezes against `:root`'s colour and a `[data-theme]` on a subtree cannot move
it — the same trap the header of `tokens.css` describes for the component
tier. Repeating the two lines in the dark block is the cost of keeping one
public token name; don't "tidy" them away.

The component set is fully bound: fill -> `Surface/Raised`, all four corners ->
`Card/Radius`. Flat carries no stroke at all. No property on any variant is a
raw value.

Flat's stroke was briefly `CENTER`-aligned (1.5px of it outside the frame,
making the variant 353x203 against the float variants' 350x200), then
`INSIDE`, and is now removed entirely along with the rule it drew.

## Component API conventions

- Props extend the corresponding intrinsic element props (e.g. `ButtonHTMLAttributes<HTMLButtonElement>`) and spread `...props` onto the DOM node.
- Accept an external `className` and merge it **after** the internal module classes so consumers can override.
- Variants map to CSS Module class names (`styles[variant]`), so a new variant is a new class in the module plus a union member on the prop type.
- Export the props interface alongside the component from both the component `index.ts` and the root barrel.
- `verbatimModuleSyntax` is on: type-only imports must use `import type`.
- The Button API is still the brief's placeholder. Before finalizing any component's props, audit how the consuming apps implement that component today (sizes, loading, icon-only, etc.) and model real usage instead of guessing.
