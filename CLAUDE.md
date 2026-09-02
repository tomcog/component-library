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

### The theming contract: 13 semantic tokens

`tokens.css` has a primitive tier and a semantic tier. **The semantic tier is
the public API** — those 13 names are what a consuming app overrides to make
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
  --ui-text-on-primary:        /* text on a solid fill                  */;

  --ui-surface-inverse:      /* secondary: dark fill                  */;
  --ui-text-on-inverse:      /* text on that dark fill                */;

  --ui-surface-muted:        /* tertiary: grey fill                   */;
  --ui-surface-muted-hover:  /* tertiary hover                        */;
  --ui-surface-muted-active: /* tertiary pressed                      */;
  --ui-text-default:         /* text on a light/neutral fill          */;
  --ui-text-muted:           /* de-emphasised text (nav sub items)    */;
  --ui-surface-raised:       /* floating panel fill (nav dropdown)    */;
  --ui-border-subtle:        /* hairline rule (flat Card)             */;

  --ui-surface-disabled:     /* disabled fill                         */;
  --ui-text-disabled:        /* disabled text, and ghost's border     */;
}
```

**Leave one out and it does not fail — it silently keeps the library's own
placeholder neutral.** That looks plausible in isolation, which is exactly why
it goes unnoticed; the app's palette and the component's drift apart one variant
at a time. Map all 13 or none.

`--ui-border-subtle` (`#f5f5f5`) was added with Card, and is the 13th name -
an app themed against the Nav-era contract will not have it.

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

### Verifying a build

A green `npm run build` does not mean the CSS pipeline works. After any change to the build or styling setup, confirm in `dist/index.js` that the CSS module object has real hashed class names (not `{}`), and that `dist/style.css` selectors are scoped (not bare `.button`). The end-to-end check is `npm pack` into a scratch consumer and server-rendering a component to inspect the emitted `class` attribute.

## Figma sync

Source of truth is the `Button` component set (`135:9598`) in the **iconAtomic Components** file, page `Components`. It is edited via the Figma Console MCP Desktop Bridge plugin, which needs Figma Desktop open with the plugin running. The REST token is expired, so `figma-console`'s REST-backed tools (`figma_get_component_for_development`, component images) fail with 403 — use `figma_execute` and `figma_capture_screenshot`, which go through the plugin and need no token.

**For reading, prefer the official Figma MCP server instead** (`get_design_context`, `get_screenshot`, `get_variable_defs`). It is authenticated separately, needs neither the Desktop Bridge nor the expired REST token, and returns the variant matrix, component properties and bound variable values in one call — that is how the Nav spec was read. The Desktop Bridge is still required for *writing*, and is worth the setup only then; it also binds to a fallback port when stale instances hold 9223, so `figma_get_status` reporting "no plugin connected" while the plugin looks open usually means it attached to a different port.

Code and Figma were reconciled and currently match on every modelled property: heights 40/32/24, padding 14/10, 12/8, 8/6, gaps 6/5/4, radii 4/3/2, font 14/12/9 DM Sans **Medium**, line heights 20/16/12, icon 16/12/9 at 0.65 opacity.

Figma's variables were restructured to mirror `tokens.css`: every Button variant now binds to a `Button/*` token which aliases a semantic token which aliases a primitive (e.g. `Button/Tertiary/Hover -> Surface/Muted Hover -> Neutral/350`). Before this, hover/pressed states bound straight to `Brand/Dark` and `Neutral/*`, skipping the component tier — that was the inconsistency that motivated the whole token design. **Don't reintroduce direct primitive bindings on component variants.**

The Nav sets were reconciled the same way later: `Nav/Item` Default and Hover
text had been bound to a variable literally named `"Black"` (`#171717`, quote
characters included) rather than `Text/Default` (`#282523`), and `State=On`
bound straight to the `Color/TC Red` primitive. Both were repointed onto the
semantic tier. `"Black"` itself was left alone — 589 nodes across the file use it, so
changing its value reaches well beyond this library and is the user's call
rather than a side effect of a library change. Fixing its malformed name
costs nothing and is safe either way.

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
`Primary/*`, `Text/*`, `Surface/*`, `Button*`, `Nav/*`, `Motion/*`, `Card*`),
not the whole file.

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
    Border/Subtle         Neutral/100  -> Neutral/700
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

1. ~~`Color/Ink` disagrees.~~ **Resolved.** Both sides are `#262626`. The push
   recoloured ~1209 dependants; the Button set was screenshotted afterwards to
   confirm nothing broke.
2. ~~`Neutral/600` means two different things.~~ **Resolved.** `--ui-neutral-600`
   is now Figma's `#525252`, and the four dark-mode placeholders that had
   borrowed light-ramp numbers were renumbered to sit between the real steps by
   lightness: `600 -> 550`, `700 -> 650`, `800 -> 700`, `850 -> 800`. A pure
   rename — every dark-mode token resolves to the same colour it did before.
   `Neutral/550`, `/650`, `/700` and `/800` were then created in Figma, so
   both sides hold the same ramp even though no Figma mode uses them yet.
3. **In Figma, absent from code:** `Neutral/50`, `Neutral/200`, `Neutral/900`,
   `True Black`, `Primary/Dark`, `Primary/Lighter`, `Primary/Darker`. No
   component uses any of them, and some may belong to the other projects
   sharing this file — so this is the one gap worth leaving open until a
   component actually needs the value. Check ownership before importing.
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
- **The flat variant's 3px rule is an inset `box-shadow`, not a `border`** -
  same reasoning as Button's ghost. It costs no layout, so a flat card and a
  floating one are exactly the same size, and it does not depend on the
  consuming app's `box-sizing`, which this library never sets.

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

The component set is fully bound: fill -> `Surface/Raised`, all four corners ->
`Card/Radius`, and on flat, stroke -> `Border/Subtle` with weight ->
`Card/Border Width`. No property on any variant is a raw value.

**Flat's stroke was `CENTER`-aligned and is now `INSIDE`.** At 3px, centred put
1.5px outside the frame, so the flat variant measured 353x203 against the float
variants' 350x200. The code draws the rule fully inside (an inset box-shadow),
so Figma was the side that moved.

## Component API conventions

- Props extend the corresponding intrinsic element props (e.g. `ButtonHTMLAttributes<HTMLButtonElement>`) and spread `...props` onto the DOM node.
- Accept an external `className` and merge it **after** the internal module classes so consumers can override.
- Variants map to CSS Module class names (`styles[variant]`), so a new variant is a new class in the module plus a union member on the prop type.
- Export the props interface alongside the component from both the component `index.ts` and the root barrel.
- `verbatimModuleSyntax` is on: type-only imports must use `import type`.
- The Button API is still the brief's placeholder. Before finalizing any component's props, audit how the consuming apps implement that component today (sizes, loading, icon-only, etc.) and model real usage instead of guessing.
