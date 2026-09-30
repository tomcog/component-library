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

## Tones: `default | safety | danger` (0.74.0)

`tone` says what the button does. `default` (the action colour; it was named
`primary` until 0.74.0, which clashed with `variant="primary"` - the old name still
works and warns) · `danger`, destructive · `safety`, the affirmative half of a
decision. Since 0.74.0 a tone is also how a confirmation is drawn: ConfirmButton is
deprecated, and `<Button variant="secondary" tone="safety">Save</Button>` is what
its labelled `filled` shape was (its `ghost` is `variant="tertiary"`). Decided with
the user 2026-09-29. ButtonRound carries the same three tones.

### `tone="safety"`

The same structure as danger, one difference: **the green is light** (`#2aca25`,
about 2:1 on white), so wherever it sits on a light ground as text or glyph it is
`--ui-safety-darker`.

| variant | rest | hover / press |
|---|---|---|
| primary | solid `--ui-safety`, `--ui-text-on-safety` | safety darkened 22.3% / 40.7% |
| secondary | `--ui-safety-lighter` tint, `--ui-safety-darker` label | safety darkened 22.3% / 40.7%, on-safety label |
| tertiary | `--ui-safety-darker` text | 15% safety tint / Safety/Lighter under Safety/Darker |
| ghost | `--ui-safety-darker` rule and text | as tertiary, the rule dropping away |

White on the solid green is 2.2:1 - see `--ui-text-on-safety` in `tokens.css` for
the cost and how an app moves it. Figma: `Tone=Safety` on the `Button` set,
bound to `Button/Safety/*` (added 2026-09-29).

### `tone="danger"` is red in every state (0.65.0)

`tone="danger"` recolours the variant from the action role to the **danger** role
in every state - at rest as well as on hover and press - so a destructive button
always reads red, whatever `--ui-action` is. Each variant keeps its shape:

| variant | rest | hover / press |
|---|---|---|
| primary | solid `--ui-danger`, `--ui-text-on-danger` | danger darkened 22.3% / 40.7% |
| secondary | 15% danger tint, `--ui-danger` label | danger darkened 22.3% / 40.7%, on-danger label |
| tertiary | `--ui-danger` text | ghost's danger (pale tint / named pair) |
| ghost | `--ui-danger` rule and text | ghost's danger |

Disabled is untouched (grey) and the focus ring stays `--ui-action`. Before 0.65.0
the tone touched hover and press only, so a Delete rested in the variant's action
colour and turned red when reached for; that "quiet until reached for" contract is
gone.

Figma: `Button`'s `Tone` = Default | Danger, drawn on **Default, Hover, Pressed and
Loading** at every Level and Size (64 cells). The grounds bind `Button/Danger/*`:

| Figma | aliases | code |
|---|---|---|
| `Button/Danger/Default` | `Danger/Base` | `--ui-danger` |
| `Button/Danger/Hover` | raw shade (danger -22.3%) | `--ui-danger` mixed 22.3% toward black |
| `Button/Danger/Pressed` | raw shade (danger -40.7%) | `--ui-danger` mixed 40.7% toward black |
| `Button/Danger/Label` | `Text/OnDanger` | `--ui-text-on-danger` |
| `Button/Danger/Secondary Default` | `Danger/Lighter` | 15% `--ui-danger` on the raised surface |
| `Button/Danger/Secondary Label` | `Danger/Darker` (should be `Danger/Base`, #50) | `--ui-danger` |
| `Button/Danger/Ghost Hover` | `Danger/Lighter` | 15% `--ui-danger` on the raised surface |
| `Button/Danger/Ghost Pressed` | `Danger/Lighter` | `--ui-danger-lighter` |
| `Button/Danger/Ghost Label` | `Danger/Base` | `--ui-danger` |
| `Button/Danger/Ghost Label Pressed` | `Danger/Darker` | `--ui-danger-darker` |

Code derives the pressed shades with `color-mix()` so an app's own danger colour
gets a coherent press; Figma cannot mix, so it takes the nearest role shade -
the same trade `Button/Primary/Pressed` -> `Action/Darker` already makes. The
ghost press used to be the visible gap; since 0.63.0 code uses the named pair
there too, so it matches exactly. **Its label moved with its ground on
purpose**: the pale tint is a role colour and stays pale in dark, where the
default ghost's label (mixed toward near-white Text/Default) would have been
light on light. Darker on Lighter is 5.88:1 in both themes. In light the press
ground is barely distinct from the hover's 15% mix, so the press reads mainly as
the label darkening - which is what Figma draws. The variables carry no
code syntax, because code has no such tokens: the `.danger` class sets the
existing `--ui-button-*-hover` / `-active` hooks.

**`State` now holds only states**: Default, Hover, Pressed, Disabled (the
element's own) and Loading (the `loading` prop, a State because a Figma boolean
can only drive `visible`). It used to hold `Confirm` and `Danger` as single
Primary/XL cells. Both were parked in a `Button-Deprecated` set in the
Deprecated section rather than deleted, so any instance in another file still
resolves: `Danger` is this axis now, and a confirmation coloured at rest - the
job `Confirm` gestured at - is `ConfirmButton` with a label.

## Secondary is tonal (0.63.0)

`variant="secondary"` rests on the pale action tint with an action-coloured label
- exactly the ghost button's hover, so it shares that expression and cannot drift
from it - and fills solid when reached for: hover and press are unchanged (the
darker action shades with a white label), as are disabled and the danger tone.
Before 0.63.0 it rested near-black (`--ui-surface-inverse`) with a light label.
Figma: `Button/Secondary/Default` -> `Action/Lighter`, `Button/Secondary/Label` ->
`Action/Darker` (see below), and a new `Button/Secondary/Label Active` -> `Text/OnAction` for
Hover and Pressed (no other component bound these, so they were repointed).

**The resting label and icon are plain `--ui-action`** (again, since 0.72.0).
0.64.0 - 0.71.0 took it halfway toward `--ui-text-default` for contrast (7.32:1
light, 4.87:1 dark), which read as too dark a red; it was reverted by decision,
accepting 3.64:1 in light and 2.71:1 in dark on the tint - under AA for text.
Don't re-darken it for contrast without asking. The danger tone follows: plain
`--ui-danger` on the danger tint. Figma still binds `Button/Secondary/Label` to
`Action/Darker` (divergence #50).

## Tertiary is Ghost without its rule (0.63.0)

`variant="tertiary"` is text-only in `--ui-action` at rest, and from there on it
is the ghost button: the same fill on hover, the same press, the same disabled,
loading and danger tone. The one difference between the two is Ghost's 1px rule
at rest. Before 0.63.0 it was a grey `--ui-surface-muted` fill with a dark label.

Every interactive value reads Tertiary's own hook first, then **Ghost's** hook,
then the shared fallback - so retuning the ghost button retunes this one, the
danger tone (which sets the ghost hooks) reaches it without a rule of its own,
and an app can still move Tertiary alone through `--ui-button-tertiary-*`.

Figma: the Tertiary cells bind `Button/Ghost/*` and `Button/Danger/Ghost *`
directly. The `Button/Tertiary/*` variables were NOT repointed, because
Button/Round and LayerController also bind them (open divergence #47); Button no
longer reads them.

## Ghost fills on interaction; it does not darken

Figma: `Button` Level=Ghost, States Hover and Pressed (`615:15224`). The
treatment changed from *darken the text and border* to *fill the button*:

| state | fill | label | outline |
|---|---|---|---|
| Default | none | `--ui-action` | 1px `--ui-action` |
| Hover | `Action/Lighter` | `--ui-action` | none |
| Pressed | Figma `#ea929f` | `Button/Ghost/Darker` `#ac172d` | none |

The outline drops away and the button fills, so it reads as the same object
gaining weight rather than as a different colour of button. The label holds at
`--ui-action` on hover and **darkens on press**, so it keeps its footing
against the heavier fill under it. In code that is one `color` declaration,
which carries the icon with it since icons draw in `currentColor`. The border is made **transparent through its own hook** rather than
deleted, so an app can keep the outline under the fill.

**Both tints are derived, not pinned**, for the reason `--ui-action-lighter`
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
model: `Button/Ghost/Hover` was `Action/Lighter` in Light but `Action/Dark`
in Dark, and `Button/Ghost/Pressed` was `#ea929f` in Light but `Action/Darker`
in Dark — one variable meaning a pale tint in one mode and a dark shade in the
other. Under the old model those dark values were the *label* colour and
nothing was filled; once they became a **fill**, dark mode filled dark red and
wrote `Action/Base` on top at **1.5:1**. Both dark values are now the
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
