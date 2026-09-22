# Typography

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

## Typography: DM Sans, bundled but opt-in

The font is self-hosted in the package, not linked from Google's CDN — browsers partitioned the HTTP cache in 2020, so the shared-cache argument for the CDN is dead, and hotlinking discloses visitor IPs to Google (a live GDPR issue in the EU). More practically, a library that names a font it doesn't ship fails silently: the CSS stays valid and components quietly render in `system-ui`.

- `src/fonts/` holds `dm-sans-latin-var.woff2` (variable, weights 100-1000, latin subset, ~61KB), `fonts.css`, and `OFL.txt`. DM Sans is SIL OFL 1.1, so redistribution inside the package is permitted **provided `OFL.txt` ships with it** — don't drop it.
- `scripts/copy-fonts.mjs` copies `src/fonts` to `dist/fonts` verbatim after `vite build`. Deliberately not run through Vite: the woff2 keeps a stable filename and `fonts.css` keeps its relative `url()`, so no asset hashing to reason about.
- Consumers opt in with `import "@tomcoggia/ui/fonts.css"` alongside the main stylesheet. Apps that self-host or use another face simply omit it and set `--ui-font-primary` — see below.
- Because it is a **variable** font, adding weights (400/500/700) later costs zero extra bytes — only 600 is used today.

`--ui-font-family` carries a real fallback stack, so a missing font import degrades to `system-ui` rather than breaking. Verify a font change by rendering text in `var(--ui-font-family)` next to a forced `system-ui` and confirming the metrics differ — a silent fallback looks fine in isolation.

## The typeface: one name, the same shape as `--ui-action`

`--ui-font-family` used to be a single flat token holding the face *and* its
fallbacks. Changing the face meant restating the whole list, so an app that
changed it and forgot the tail silently shipped with no safety net. It is now
the same identity/role split the colours have:

| | colour | typeface |
|---|---|---|
| identity — what this package ships | `--ui-tc-red` | `--ui-dm-sans` |
| role — **what an app overrides** | `--ui-action` | `--ui-font-primary` |

```css
:root { --ui-font-primary: "Inter", "Inter Fallback"; }
```

One line, and every component follows. `--ui-font-fallback` carries
`system-ui, -apple-system, "Segoe UI", sans-serif` and is appended for you, so
a face swap cannot drop it.

**This is NOT a semantic token.** The semantic tier in `tokens.css` is
colour and only colour — "what a colour *means*" — and the 21 in the theming
contract above are all colours. The typeface is its own small tier beside it.
Don't fold it into that count.

### `--ui-font-family` is no longer declared

It survives as the **override hook** each component reads first, exactly like
`--ui-button-primary-bg`, so an app that already sets it keeps working. But it
is not declared on `:root` any more, and that is deliberate: a `var()` inside a
custom property resolves at the element that DECLARES it, so composing the face
and the fallback together on `:root` would freeze the pair there and
`<div style="--ui-font-primary: Georgia">` could never move it. Same trap
`--ui-action-lighter` documents. Every component composes it at the element:

```css
font-family: var(--ui-font-family, var(--ui-font-primary), var(--ui-font-fallback));
```

Verified in the playground: a scoped `--ui-font-primary` moves that subtree and
nothing else, and the fallback tail survives.

**Breaking for apps that READ `var(--ui-font-family)` in their own CSS** — with
nothing declared, that now resolves to nothing rather than to DM Sans. Apps
that *set* it are unaffected. The fix is one line, and it is the better shape
anyway: use the class below, or read `var(--ui-font-primary), var(--ui-font-fallback)`.
The playground's own `.page` rule hit exactly this and is the worked example.

### App text: a base default, plus a class

`src/typography.css` carries both, and they compose.

**`:where(body)`** sets the app's base typeface, so importing
`@tomcoggia/ui/styles.css` is enough and one `--ui-font-primary` line then
moves the components *and* the app's own headings, prose and tables with no
markup change.

This is the library deliberately reaching past its own components, which is an
opinion worth naming — it is what Tailwind's preflight does, and the same two
escape hatches apply. `:where()` contributes **zero specificity**, so a bare
`body { font-family: X }` in the app beats it with no `!important` and no
specificity war; and it ships inside `@layer ui`, so any unlayered app rule
beats it whatever the import order. Both verified in the playground.

**Form controls are deliberately excluded.** `input`, `select`, `textarea` and
`button` do not inherit `font-family` from the UA, and pulling them in would
mean restyling every control in the consuming app — a much larger claim than
setting a base face. This library's own controls set their face explicitly, so
they are unaffected either way.

**`.ui-font-primary`** is the narrower tool, for a subtree rather than the
document:

```html
<section class="ui-font-primary">
```

Keeping both is the point: the base rule means an app gets the typeface for
free, and the class means "text already set to use the primary typeface" stays
a real distinction — text with its own face does not move when the token does.
Verified: a `<p style="font-family: Impact">` holds Impact through a face swap.

## Typography: the label scale

Every string this library renders is a UI label — DM Sans Medium, no body
copy and no headings — so the scale is one ramp of four label sizes, and each
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
