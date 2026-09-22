# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@tomcoggia/ui` — a standalone React component package distributing components as ESM + type
declarations, styled with CSS Modules on top of a global design-token layer. Consumed by the
apps in `~/Sites` as a git dependency. NextJob is the main consumer.

`component-library-brief.md` is the original spec and is partly out of date (see Build).

## Where the rest lives

Read these when the task touches them; they are not needed to start work.

| File | Read before |
|---|---|
| `docs/components/<Name>.md` | **changing an existing component** — its "do not fix these" lists are decisions, not bugs |
| `CHANGELOG.md` | cutting a release, or moving an app's ref (renamed tokens fail silently) |
| `docs/theming.md` | adding or changing a colour token, dark mode, or an app's theme mapping |
| `docs/typography.md` | touching the font, `--ui-font-*`, or the label type scale |
| `docs/build.md` | changing `vite.config.ts`, the layer wrapper, or the stylesheet shape |
| `docs/figma.md` | any Figma write — API gotchas, publishing, the icon-flattening repair |
| `docs/divergences.md` | Figma work — the open code/Figma drift; closed ones are in `divergences-resolved.md` |

`BottomNav` has no doc yet; its module CSS comments carry its notes. Code comments in
`src/tokens.css` and the module CSS are often the most detailed record of a decision.

**Keep this file short.** A decision about one component goes in that component's doc, a
release note goes in `CHANGELOG.md`, a Figma lesson goes in `docs/figma.md`. Only rules that
apply to *new* work belong here.

## Commands

```bash
npm install
npm run dev          # playground dev server - the visual component browser
npm run build        # dist/index.js, dist/index.d.ts, dist/style.css, dist/fonts/
npm run build:watch  # rebuild dist on change (for npm link into an app)
npm run typecheck    # tsc --noEmit
```

`npm run dev` serves `playground/` (`vite.playground.config.ts`, separate from the library
build). It imports from `src/`, renders the real components, and has theme and live
primary-colour controls. Every component gets a section there; verify visual work by
measuring the rendered playground, not by reading the CSS.

There is no test or lint setup; don't reference scripts that aren't in `package.json`.
Consuming apps use npm and React 18.3.1 — don't introduce another package manager.

### Releasing

Apps depend on a tag: `"@tomcoggia/ui": "github:tomcog/component-library#vX.Y.Z"`.
`dist/` is gitignored, so `"prepare": "npm run build"` is what builds it on install —
removing it silently ships an empty package.

**Releasing is one command, and it includes the apps: `npm run release`.** Once library
changes are committed on `main`, it typechecks, builds, bumps the version (minor by
default; `-- patch` / `-- major`), stamps `CHANGELOG.md`, commits, tags, pushes, then runs
`npm run sync-consumers`: every app under `~/Sites` depending on `@tomcoggia/ui` gets the
new tag installed, checked for a built `dist/`, and a local commit touching only
`package.json` + lockfile. It never pushes an app (pushing can deploy) unless given
`-- --push`. `-- --dry-run` shows the plan. When the user asks for a library change to be
usable in their apps, finish by running this — don't hand-edit refs.

Write an `**Unreleased**` changelog entry by hand when a change renames or removes a token
or visibly changes an existing component; otherwise the script writes one from commit
subjects. Never point an app at `#main`.

Semver in practice: a new component or optional prop is **minor**; a visible change to an
existing component (padding, shadow, colour) is also **minor**, never patch; a renamed or
removed token is breaking and must be listed in the changelog with the old -> new names.
Before calling something unused, check NextJob rather than assuming.

For local work: `npm link` here, `npm link @tomcoggia/ui` in the app, and `npm run build:watch`.

## Architecture

- **Two-layer styling.** `src/tokens.css` defines custom properties on `:root`; component
  `*.module.css` files consume them and never hardcode values. A new visual constant means
  adding a token first.
- **All tokens are `--ui-` prefixed.** `:root` is global; unprefixed names collide with an
  app's own. Never add an unprefixed token.
- **A token name carries its type when the name alone is ambiguous**: `--ui-nav-accent-size`
  beside `--ui-nav-accent-color`. Don't add bare `-accent`, `-font` or `-line` names.
- **Motion is system-level.** Use `--ui-motion-fast` (150ms, state changes) and
  `--ui-motion-base` (200ms, travelling motion). No per-component durations. Honour
  `prefers-reduced-motion` — remove decorative motion; slow (don't stop) motion that *is*
  information, like a spinner.
- **Elevation is system-level** too: `--ui-shadow-float-1` / `-2`. Don't invent a shadow.
- **Barrel exports.** `src/index.ts` is the single entry; each component directory has an
  `index.ts` re-export, and `src/index.ts` re-exports those and imports `tokens.css`.
- **CSS is not auto-injected.** Consumers import `@tomcoggia/ui/styles.css` once (and
  optionally `@tomcoggia/ui/fonts.css`).
- **`"use client"`** is stamped on `dist/index.js` for the Next.js App Router apps, so the
  whole library is client-only.
- **React/React-DOM are peers** (`>=18`), externalized alongside `react/jsx-runtime`. Never
  move them to `dependencies`.
- **`sideEffects: ["**/*.css"]`** is what lets JS tree-shake. Don't break it.
- `src/css-modules.d.ts` types the `*.module.css` imports. Shared helpers live in
  `src/internal/` (`assignRef`, `logoPaths`, `visuallyHidden.module.css`).

### Tokens: the rules that bite

- **The semantic tier is the public API.** 26 colour names (`--ui-action`, `--ui-brand`,
  `--ui-surface-*`,
  `--ui-text-*`, `--ui-border-default`, …) are what an app overrides. Primitives
  (`--ui-tc-red`, `--ui-neutral-*`) are internal — components read semantics, not primitives.
  The one deliberate exception is `Logo`/`Spinner` reading `--ui-tc-red`.
- **Pick the role by what the element *is*:**
  `--ui-action` for a control/CTA (and every focus ring), `--ui-brand` for chrome — a rule,
  divider, decorative border, a label that doesn't act — `--ui-danger` for destructive actions
  and errors, `--ui-safety` for the affirmative action. Each has its own `--ui-text-on-*`,
  and danger and safety each carry a `-lighter` and `-darker` ground as well.
  They mostly resolve to the same red today, so a wrong pick is invisible until an app splits
  them.
- **`var()` inside a custom property resolves where it is *declared*.** A component token
  composed on `:root` as `var(--ui-surface-pale)` freezes against `:root`, and
  `[data-theme="dark"]` or a scoped `--ui-action` on a subtree can't move it. So either don't
  declare the component token and read it with a fallback at the element —
  `background: var(--ui-left-rail-bg, var(--ui-surface-pale))` — or redeclare it in the dark
  block. A tint **composed from a semantic** is derived at the element with `color-mix()`,
  never declared on `:root` — that is what freezes. A tint that is its own hand-picked value
  holds no `var()`, so it goes on the primitive tier like any other literal and the semantic
  aliases it: `--ui-safety-lighter: var(--ui-tc-green-lighter)`. The cost is that repointing
  a role no longer moves its tints, so such a role is repointed as a trio.
  The build is green and light mode looks right either way; check a scoped theme.
- **Only semantics change in dark mode.** Primitives are identical in both themes; the dark
  block re-points semantics. Role colours (primary, accent, danger, safety) do not move.
- **Every component colour reads an override hook first**: `var(--ui-<component>-<part>,
  var(--ui-<semantic>))`, so an app can retune one component without moving the semantic.
- **Geometry that is the same object is shared, not copied**: read the other component's
  token via fallback (`InputSelect` reads InputText's; `Tag` reads `--ui-pill-radius`), or
  alias it when a name of its own is needed (`--ui-nav-rail-chip-size`).
- **Type aliases the label scale** — `--ui-type-label-{sm,md,lg,xl}-*` (10/12, 12/16, 14/20,
  18/24), weight `--ui-type-label-font-weight` (Medium). A step exists only where something
  uses it; don't add a step to size a container. Component `font-family` is always
  `var(--ui-font-family, var(--ui-font-primary), var(--ui-font-fallback))`.
  **Never write the scale's number out by hand** — a raw `14px` that happens to equal
  Label LG is a value that has stopped being shared without anyone touching it, and it does
  not move when an app retunes the scale. Checkbox, Tabs and InputText each carried one until
  0.46.0. A value that is genuinely off-scale is fine; mark it `OFF-SCALE` with the reason
  and what the scale says, so the next reader can tell intent from drift.
- Size vocabulary is two-letter everywhere: `xl | lg | md | sm`. A size exists only when
  something uses it.
- **A size step is a shared ladder, and it has tokens: `--ui-control-{xl,lg,md,sm}-height`
  (48/40/32/24).** Everything at one step stands the same height and sets the same label
  size, so a UI pattern built at LG lines up without anyone checking. Only the characters,
  whether label or icon shows, and the colours differ. A new component with a size axis
  **aliases** these — it does not restate the number, which is how SegmentedControl spent
  five releases at 44/34/26. `Button`, `ButtonRound`, `ConfirmButton` and `SegmentedControl`
  all read them. A component that genuinely cannot take these heights keeps its own and says
  why in its doc.
  There are **two icon ladders** and picking the wrong one is visible from LG down.
  `--ui-control-*-icon-size` (28/24/20/16) is the glyph sized off the CONTROL, where the box
  is the subject — `ButtonRound` and `SegmentedControl`. `Button`'s icon is sized off the
  TYPE instead (24/20/16/12, its line box) so glyph and label sit on one optical line; those
  stay literals **deliberately**, and the note in `tokens.css` says why — geometry riding on
  the type scale is the coupling `--ui-nav-rail-slat-height` was split out to undo. The
  "never write the scale's number by hand" rule above is about type tokens, not geometry.
  **The input family is the known exception to the ladder** — `InputText` (and
  `InputSelect`/`InputTextarea`, which alias its size type) draws `lg` at 32 and `md` at 24,
  one step short at both, so an LG field beside an LG button steps by 8. Undecided whether
  the heights move or the steps are renamed; don't copy it.

### Build

- **Vite library mode, not tsup.** tsup/esbuild has no CSS Modules support and "succeeds"
  with an empty class map and unscoped selectors. Don't go back. Vite is pinned to v5.
- **All CSS ships inside `@layer ui`** (`wrapCssInLayer()` in `vite.config.ts`, needs
  `enforce: "post"`), so any unlayered app CSS wins. Tailwind apps must declare
  `@layer theme, base, ui, components, utilities;` before importing the stylesheet, or
  preflight strips button backgrounds.
- **A green build proves nothing about CSS.** After touching the build or styling setup:
  `head -c 40 dist/style.css` starts with `@layer ui{`, `dist/index.js` has real hashed class
  maps (not `{}`), and selectors are scoped (`ui-[name]-[local]-[hash]`, not bare `.button`).

## Component conventions

- Props extend the intrinsic element's props and spread `...props` onto the DOM node.
- `className` is merged **after** the internal module classes.
- Variants map to module classes (`styles[variant]`): a new variant is a class plus a union
  member on the prop type.
- Export the props interface beside the component from both the component `index.ts` and
  the root barrel. `verbatimModuleSyntax` is on — use `import type`.
- **Model real usage.** Before settling a component's props, look at how the consuming apps
  (NextJob first) implement that thing today.
- **Real elements and real ARIA.** Native controls where one exists (`<select>`,
  `<input type="radio">`); a hidden input stays in the focus order (tiny, never
  `display: none`). Choose the pattern by meaning: `tablist` swaps views, `radiogroup` is one
  of N, `aria-pressed` is an independent toggle, `aria-current` marks the page. A pattern
  that claims arrow keys must implement them (roving `tabIndex`, wrap, Home/End), and
  selection stays the consumer's (the handler calls the item's own `click()`).
- **`asChild`** (not `as`) on anything that may be a link, so `next/link` composes; omit
  `type` when it is set. Buttons inside forms default `type="button"`.
- **Focus rings are code-only**: 2px `--ui-action` outline, 2px offset (inset when clipped
  by a container). Input fields are the exception — the rule turning primary is their focus
  state. Figma models no focus state.
- **Icons are slots** (`icon`, `iconEnd`: `ReactNode`, `aria-hidden`), drawn in
  `currentColor`. The library has no icon dependency. Icon-only controls need an accessible
  name; warn in dev with the exact expression `process.env.NODE_ENV !== "production"`.
- **Names are opt-in on decorative graphics**: `label` sets the role and `aria-label`,
  otherwise `aria-hidden`.
- **Hidden-but-named labels** use `src/internal/visuallyHidden.module.css`, never
  `display: none` (see `hideLabel` on the input controls).
- **Don't invent design decisions.** A Figma frame's pose size is not a width; undrawn
  padding, error states or hover states aren't added. Derive states Figma lacks (disabled,
  focus) from the nearest existing component and record them as code-only.
- **Keep states from compounding**: current/selected suppresses hover.
- **Keep layout stable across states**: hide with `visibility`/opacity, keep borders
  transparent rather than absent, and use the standalone `scale`/`rotate` properties rather
  than `transform`.

When a component is added: its directory with `index.ts`, the barrel export, a playground
section, a `docs/components/<Name>.md` (usage, geometry, token and Figma mapping, and a
"Divergences - do not fix these" list), and a `CHANGELOG.md` entry.

## Figma sync

The **component-library** Figma file (key `l0022oDH82HhLclD3s3q9z`, page `Components`) and
this code are meant to be **identical**, to the extent the two media allow. That is a
standing instruction. A change to a token or component is half done until the other side
carries it; any disagreement is a defect recorded in `docs/divergences.md` with the
direction it still has to travel.

- **Reading**: use the official Figma MCP (`get_design_context`, `get_variable_defs`,
  `get_screenshot`). **Writing**: needs the Figma Console Desktop Bridge plugin running
  (`figma_execute`); its REST-backed tools fail because the token is expired.
- **Direction.** Token-shaped changes (values, spacing, radius, colour) go code-first, then
  push. Design-shaped changes (new variants, layout, new components) go Figma-first, then
  fetch. Never change both sides independently in one session; fetching what the user just
  drew is the exception. The rule decides most disagreements — ask only when it doesn't.
- **Tiers in Figma mirror the code**: component variables alias semantics, semantics alias
  primitives. Never bind a variant straight to a primitive (`Color/White`, `Neutral/*`),
  to another component's token (`Button/*`), or to `IconDefault` (frozen across modes).
  This mistake has recurred on nearly every fetched component — check for it on arrival.
- **Names must be derivable**: lowercase, spaces and `/` to `-`, prefix `--ui-`, drop a
  trailing `-base` (`Surface/Muted Hover` -> `--ui-surface-muted-hover`). Set every new
  variable's Dev Mode code syntax to its `var(--ui-*)` name. Bind geometry to variables;
  a raw value is how drift starts.
- **Say which kind of finding it is.** A DEFECT names a wrong value, a binding that will
  break, or a wrong render. TIDYING is structure that renders correctly but is untidy —
  empty cells, an inert variable, a set nothing instantiates. Both are worth raising; what
  is not acceptable is dressing the second up as the first. Three entries were withdrawn on
  2026-09-22 because they were tidying argued at defect volume, which buries the findings
  that matter. Lead with which it is and how much it costs, then the detail.
- **The component sets and the variables ARE the library; nothing else on the canvas is.**
  Loose frames, mock-ups and worked examples are sketches — never the spec, never a
  divergence, and not to be reported as problems however stale they look. If a set cannot
  state something about itself (`SegmentedTrack` cannot express its own layout, #42), the
  fix is to make the set able to say it, not to read a frame that happens to show it.
- **After any Figma session, assert both invariants**: zero non-colour variables and zero
  primitives differ between Light and Dark. The single collection doesn't enforce it.
- **Walk every variant** when auditing; a set-level read can't tell "bound everywhere" from
  "bound on a few". Screenshot to verify colour — stored and rendered values have disagreed.
- **Publishing is part of the edit**, and UI-only: hand it to the user. Check with
  `node.getPublishStatusAsync()` (`CURRENT` / `CHANGED`), not by importing by key.
- **A component's Figma description is part of the spec** — update it with the component.
- **Edit safely**: the user may be in the file. Never delete by name pattern or assume an
  unfamiliar variant is scaffolding — ask. Remove only ids created in the same call, and
  re-read state rather than trusting an earlier snapshot. The file is shared with other
  projects; only the design-system subset (`Color/*`, `Neutral/*`, `Primary/*`, `Text/*`,
  `Surface/*`, `Button*`, `Nav/*`, `NavSlat`, `Motion/*`, `Card*`, and the library's
  component sets) is ours. `Button/Round-Deprecated` is not part of the library.
