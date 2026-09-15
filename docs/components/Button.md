# Button

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

Figma: the `Button` component set (`135:9598`), axes `Level` = Primary | Secondary |
Tertiary | Ghost, `Size` = XL | LG | MD | SM, and `State`.

## Icons: two slots, not a position enum

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

### Icon geometry comes from Figma's `icon size and weight` frame (553:4796)

    size   box   stroke   (label line-height)
    XL     24    2        24
    LG     20    1.5      20
    MD     16    1        16
    SM     12    1        12

LG and MD were 18 and 14 before that frame existed, and Button had **no stroke
tokens at all** — whatever weight the caller's icon set shipped is what
rendered. Both were read straight off the frame: the sizes from each glyph's
viewBox, the weights from the exported SVGs (MD and SM carry no `stroke-width`
attribute, so they are SVG's default of 1).

Each box now equals its size's line-height, so the glyph and the label are the
same height and sit on one optical line. **They are still literals**, not
aliases of `--ui-type-label-*-line-height`, even though all four agree today —
that would be geometry riding on the type scale, the coupling
`--ui-nav-rail-slat-height` was split out to undo.

`vector-effect: non-scaling-stroke` and the `svg, svg *` selector pair are the
same rules ButtonRound carries, and for the same two reasons: stroke-width is
in the icon's own user units, so without it a 24-viewBox lucide glyph drawn in
a Medium button would render at half the weight; and a presentation attribute
on a `<path>` beats one inherited from the `<svg>`, so an svg-only rule loses
to icon sets that put the width on each shape.

## Loading and asChild

**`loading`** — spinner is three pulsing dots, not a ring: at the small size a 10px ring has too few pixels to read. Content sits in a single `.content` wrapper hidden with `visibility: hidden` (**not** `display: none`) so it keeps its layout box; the dots are absolutely positioned. The button is therefore byte-identical in width loading or not — verified across sizes and icon counts. The label text is never rewritten by the component; "Save" → "Saving…" is the caller's choice and the caller's resize.

Loading uses `aria-disabled` + `aria-busy` and a click guard, **not** the `disabled` attribute — a disabled control loses focus and leaves the tab order mid-interaction. It also keeps its variant colours rather than going grey; loading is not "unavailable".

In Figma this is `State=Loading` (60 variants), **not** a boolean. A Figma boolean can only drive `visible`, and hiding a layer removes it from auto-layout, shrinking the button. Opacity 0 preserves the layout box — Figma's equivalent of `visibility: hidden` — so the Loading variants are the Default variants with content at opacity 0 plus an absolutely-positioned dots frame. Widths match Default exactly (130/110/86).

**`asChild`** — renders the single child element instead of a `<button>`, merging classes, props, refs and handlers into it. Chosen over an `as` prop because it composes with `next/link` and other framework link components without per-element typing, and four consuming apps are Next.js App Router. Navigation must be a real `<a>`: cmd-click, "open in new tab", status-bar preview and the "link" role are all lost on a `<button>`. `type` is omitted when `asChild` is set (an `<a type="button">` is wrong). No Figma counterpart — the element changes, the visuals do not.

**CSS Modules scopes `@keyframes` too** (`ui-button-pulse` ships as `ui-Button-module-ui-button-pulse-…`). That is correct and prevents collisions with a consuming app; don't "fix" a test that expects the unscoped name.

## Deliberate divergences — do not "fix" these

- **Focus is code-only.** `.button:focus-visible` has a 2px primary outline with 2px offset. Figma models no Focus state, and the buttons carry **no strokes in any variant** — that is the design's intent. Figma also has no equivalent of `outline-offset`, so an `OUTSIDE` stroke misrepresents the ring (it reads as invisible on Primary, primary-on-primary). Don't add focus variants or strokes to the Figma file.
- ~~Dark mode is code-only.~~ No longer true: the Figma collection has Light and Dark modes, carrying the same mapping as `tokens.css`. See "Light and dark are a semantic-tier concern" below.

## `tone="danger"` is a `State` cell in Figma, one cell for the whole tone

Figma: `Button` `State=Danger` at `Level=Primary, Size=XL` - a `Danger/Base`
ground with a `Text/OnDanger` label, drawn as the HOVER appearance because that
is what the tone changes.

**One cell, following `Confirm`'s precedent**, which is also a single
`Primary/XL` cell. The tone reaches all four Levels in code; drawing it
sixteen times would say nothing the description does not, and the set is
already 82 variants. The cell says the tone exists and what colour it is; the
description says how far it reaches.

**`State` now holds three different kinds of thing**, and reading it as one
axis is how someone ends up adding a fifth `Level` called Danger:

| cells | what they are |
|---|---|
| Default, Hover, Pressed, Disabled | the element's own states - not props |
| Loading | the `loading` prop, a State because a Figma boolean can only drive `visible` |
| Confirm, Danger | the `tone` prop, cutting across the four Levels |

**`Confirm` remains Figma-only.** `tone="confirm"` exists on `ButtonRound` and
not on `Button` - no rectangular confirm has been needed - so that cell has no
counterpart in code. It is named as such in the description rather than left
for someone to discover.

This went code-first and was pushed at the user's explicit instruction, the
same documented exception the Tabs size axis used.

## Ghost fills on interaction; it does not darken

Figma: `Button` Level=Ghost, States Hover and Pressed (`615:15224`). The
treatment changed from *darken the text and border* to *fill the button*:

| state | fill | label | outline |
|---|---|---|---|
| Default | none | `--ui-primary` | 1px `--ui-primary` |
| Hover | `Primary/Lighter` | `--ui-primary` | none |
| Pressed | Figma `#ea929f` | `Button/Ghost/Darker` `#ac172d` | none |

The outline drops away and the button fills, so it reads as the same object
gaining weight rather than as a different colour of button. The label holds at
`--ui-primary` on hover and **darkens on press**, so it keeps its footing
against the heavier fill under it. In code that is one `color` declaration,
which carries the icon with it since icons draw in `currentColor`. The border is made **transparent through its own hook** rather than
deleted, so an app can keep the outline under the fill.

**Both tints are derived, not pinned**, for the reason `--ui-primary-lighter`
is: an app that sets a green primary must get a green press, not a pink one.
That costs some fidelity against the drawn values, and the pressed one is worth
knowing about:

    hover fill     15% primary on white  ->  #fbdde1   vs Figma #f7dce0
    pressed fill   48% primary on white  ->  #f291a0   vs Figma #ea929f
    pressed label  primary + 25% black   ->  #ac142a   vs Figma #ac172d

Green and blue land within a point; the pressed **red channel is 8/255 light**,
because `#ea929f` is not on the primary→white line at all — it was picked by
eye, not mixed. 48% is the closest fit. If exactness ever matters more than
theming, `--ui-button-ghost-bg-active` pins it in one line.

**The tints mix toward `--ui-surface-raised`, not toward white.** In light that
surface *is* white, so nothing moves; in dark it is `Neutral/800`, so the tint
comes out a dark ground with a hint of brand in it rather than a pale pink chip
glowing on a dark page. One rule, correct in both modes, and why this component
needs no dark block.

That fixed a real bug. Figma's dark values had been left on the *old* darken
model: `Button/Ghost/Hover` was `Primary/Lighter` in Light but `Primary/Dark`
in Dark, and `Button/Ghost/Pressed` was `#ea929f` in Light but `Primary/Darker`
in Dark — one variable meaning a pale tint in one mode and a dark shade in the
other. Under the old model those dark values were the *label* colour and
nothing was filled; once they became a **fill**, dark mode filled dark red and
wrote `Primary/Base` on top at **1.5:1**. Both dark values are now the
surface-mixed tints (`#492b30`, `#862433`), matching what the code derives.

**The pressed label moves AWAY from its fill, in whichever direction that is.**
It mixes toward `--ui-text-default`, not toward black: darkening is a
light-ground idea, and on the dark press fill it walked the label *into* the
background. `Text/Default` is near-black in light and near-white in dark, so one
declaration darkens in one mode and lightens in the other. Measured:

    light   #b51d34 on #f3919f   2.93:1   (was 3.23 mixing toward black)
    dark    #e74f65 on #862433   2.46:1   (was ~1.3)

Light gives up a little and dark gains a lot. The light value also drifts from
Figma's hand-picked `#ac172d` by about 9/255 on red; `Button/Ghost/Darker` keeps
that hex in Light and carries `#e74f65` in Dark, and
`--ui-button-ghost-text-active` pins the exact value if fidelity ever beats
legibility. Both are still under the 4.5:1 text floor — this is a transient
press state on a control the pointer is already on, not a resting string.
