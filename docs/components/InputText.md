# InputText

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

A single-line text field: an underlined box with its label beneath it. Figma:
set `725:702` (named `Button` - see open divergence #25), `Size` = LG
(`553:5455`) | MD (`725:703`), each drawn as one state.

```tsx
<InputText label="Input label" icon={<Layers />} value={v} onChange={…} />
<InputText size="md" label="Input label" icon={<Layers />} value={v} onChange={…} />
```

`className` lands on the outer wrapper — the component's root box — while every
other prop spreads onto the `<input>`, which is also what the ref points at. So
`style` and layout classes size the field and `value` / `onChange` / `disabled`
reach the control. The `<label>` is wired with `htmlFor`; with no `label` and no
`aria-label` the field has no accessible name, and dev builds warn, exactly as
Button's icon-only check does.

**The label sits BELOW the field.** That is what the design draws, and DOM
order matches visual order — a `<label>` after its input is still announced on
focus.

**No width token.** Figma hugs the field to 95px; that is the component posed
on the canvas, not a property of it. Same call as Card's 350x200 frame.

## Two sizes: `lg` (default) and `md`

    size  field  pad (top/bottom)  value         icon  gap  label
    lg    32     8 / 3             14/20 Regular 16    8    10/12 Medium
    md    24     4 / 1             12/18 Regular 12    6    8/12 Medium

Inline padding 4, radius 2, the 1px rule, label gap 2, label inset 4 and the
label's 0.02em uppercase tracking are shared. `size` is on InputText,
InputSelect and InputTextarea alike, so fields of one size line up - measured in
the playground: an MD text field, select and textarea put their values on the
same pixel row.

**The unsized tokens are LG, and MD remaps them.** `--ui-input-text-height` and
friends kept their names because apps override them (NextJob's CRM,
SmartCapture and TaskLinkSelector; NextDraw's plot options). `size="md"` adds
`src/internal/inputSize.module.css` to the root, which sets each unsized token
to its `--ui-input-text-md-*` counterpart on that element. Nothing else in the
three modules knows sizes exist - every rule and every `--ui-input-select-*` /
`--ui-input-textarea-*` hook reads the same names it always did, and
InputSelect's picker alignment picks up the 24px row without a change.

Two consequences worth knowing:

- **Retune MD through `--ui-input-text-md-*`**, not the unsized names. The
  remap is declared on the element, so an unsized value set on `:root` or an
  ancestor does not reach an MD field.
- **A component hook still wins at both sizes.** `--ui-input-select-height` set
  on an ancestor sizes every select, LG or MD, as it did before.

**The native `size` attribute is omitted** from the props (a character width on
`<input>`, an always-open listbox on `<select>`), the same trade Checkbox makes.

### MD is the rendered Figma geometry, not its padding values

Figma's MD frame is **fixed** at 24 but carries padding 6/3 around an 18px line
box - 28px of content in a 24px frame. Auto-layout centres the text in what is
left, so the line box renders at y 4.5. The code uses 4 + 18 + 1 + the 1px rule
= 24, which lands within half a pixel of that render. Figma's 6 top padding is
raw and its 3 bottom is `Input/Padding Bottom` - neither is what the canvas
shows. See open divergence #25.

### The MD type is off the label scale, deliberately

The value is 12/18: the same numbers Checkbox MD's label uses, and like those
they are the component's own rather than aliases - Label MD is 12/16. Figma
sets it with an `Input Text MD` text style that binds no variables.

The label is **8px**, below the smallest scale step (Label SM, 10). That is
what the design draws; its 12 line height is Label SM's, which Figma binds.
This does not contradict "the label snaps to Label SM" below - that was about an
11 that sat one pixel off an existing step; 8 is a deliberate step down with
nothing near it. It is the smallest string this library renders: faint,
uppercase and 8px, justified only because it repeats a value already visible in
the field above it. An app that needs it larger sets
`--ui-input-text-md-label-font-size`.

## Three bindings were rebound to the semantic tier on arrival

The same reconciliation Pill and NavSlat had, and the third time the same two
mistakes have appeared in the file:

- the rule was `Neutral/350` and the label `Neutral/400`, both **primitives**,
  so neither could follow the theme. They read `--ui-border-default` and
  `--ui-text-faint`.
- the leading icon was `IconDefault`, which aliases `Neutral/500` in **both**
  modes and so is frozen against the theme — the exact binding NavSlat's sub
  items carried. `--ui-text-muted` is the identical `#737373` in light and
  lightens to `#8c8c8c` in dark.

Rebinding the label keeps Figma's **value** and drops only its **binding**:
`--ui-text-faint` *is* `Neutral/400` in light, and steps to `Neutral/500` in
dark, so the label renders the tone the design asked for and still tracks the
theme.

It sat on `--ui-text-muted` (`#737373`) for one release. That was a contrast
call — `#8c8c8c` on white is 3.0:1, under the 4.5:1 floor for text this small —
and it was overruled on request: the label repeats a value the user can already
see in the field above it, which is the same argument that scopes faint to
placeholders. **The contrast shortfall is accepted, not overlooked.** If a
consuming app needs the darker string, `--ui-input-text-label-color` is the
hook, and it does not have to move `--ui-text-faint` to reach it.

## The date picker indicator is moved to the LEADING edge

Chrome puts `::-webkit-calendar-picker-indicator` at the inline end of the
control. It is pulled to the start so it lines up with the component's own
`icon` slot and with the leading icon on every other field in a form.

It is taken **out of flow**, not reordered. The shadow-DOM container it lives
in is not ours to lay out; `direction: rtl` on the input would move it, but at
the cost of reversing the datetime-edit's own fields and then needing that
undone. Absolute positioning is honoured on this pseudo-element and disturbs
nothing else.

Its containing block is the input (`position: relative`), so
`inset-inline-start: 0` is the start of the **text box** — after the
component's leading icon when one is passed, so the two sit adjacent rather
than overlapping. The space is reserved with
`padding-inline-start: calc(icon-size + gap)`, reusing `--ui-input-text-gap` so
the date sits at the same offset from its glyph as any other field's value
does from its icon.

Logical properties throughout, so it follows the writing direction.

## `--ui-border-default` is the 15th semantic token

The first rule colour the library has needed: a hairline drawn *on* a surface,
which is neither a fill nor a string, so no `--ui-surface-*` or `--ui-text-*`
could carry it. Light is `Neutral/350` (Figma's value); dark is `Neutral/550`,
which holds roughly the same 2.3:1 separation from the surface behind it
instead of vanishing. Card had a `--ui-border-subtle` briefly and it went with
the flat variant's hairline because nothing used it — something does now.

## `--ui-text-faint` is the 16th — the placeholder and the field label

The placeholder was on `--ui-text-muted` — the same value as the label under
the field — and a hint at the same weight as the label reads as a value the
user has already typed. It moved one step back.

It is a **semantic** name and not a pinned primitive, which is the whole point
of it. Muted is `Neutral/500` in light and `Neutral/400` in dark, so a
placeholder frozen at `Neutral/400` would sit one step behind the label in
light and be *exactly the same colour as it* in dark — the distinction would
survive in one mode only, which is the `IconDefault` trap again. Faint takes
whichever step muted is not on: `Neutral/400` light, `Neutral/500` dark.

The four text names now read as one ramp in both modes, each less contrasty
against its own surface than the one before:

    light   default #262626 -> muted #737373 -> faint #8c8c8c -> disabled #b8b8b8
    dark    default #ededed -> muted #8c8c8c -> faint #737373 -> disabled #686868

Faint is the lowest-contrast string this library will render that a user is
still meant to read — 3.0:1 light, 2.8:1 dark, under the 4.5:1 text floor. It is
scoped to two strings that both repeat something already on screen: the
placeholder, which repeats the label, and the field label itself, which repeats
what the value in the field above it already shows. **Don't reach for it for
content.**

The label and the placeholder therefore share a value. That is not the collision
this token was created to avoid: those two never sit on the same line, and
colour is not what separates them — the label is 12px uppercase with
letter-spacing, below the rule; the placeholder is 14px sentence case, inside
it. The pairing that has to stay distinct is placeholder vs. **value**, and the
value is `--ui-text-default`.

## The label snaps to Label SM

Figma draws it at 11/14, **bound to no text style** — the file's one loose type
value, where every other string binds a `Type/Label`. The scale has no 11, and
growing an orphan step for one component is what Pill's 13/17 was cut for, so
the label sits on Label SM (10/12), the step BottomNav's caption already uses
for exactly this: a small uppercase caption under a control. Bind Figma's text
node to `Type/Label SM` rather than reintroducing the 11 in code.

## The value is the library's one Regular string

Everything else this library renders is a Medium label. An input's value is
content the user typed, not a label naming a control, so
`--ui-input-text-font-weight` is `400`. Its size is Label LG, which is Figma's
14 exactly.

## Divergences — do not "fix" these

- **The chevron is not baked in.** Figma's instance draws `lucide/chevron-down`
  in the trailing slot, but a text field is not a select and a permanent
  disclosure chevron would say it was. `icon` and `iconEnd` are two independent
  slots, as Button's are.
- **The active state turns the rule primary**, and the token for it is
  `--ui-input-text-border-focus`, **not** `-active`. `-active` means *pressed*
  in this library, as it does in CSS — the same collision that made NavItem's
  current-page token `-current`. It is read with `:focus-within`, so it shows
  for a mouse click too: it answers which field is live, which is true however
  the caret got there.
- **The rule is the only focus treatment**, and this component therefore does
  *not* carry the 2px primary ring at 2px offset that Button, ButtonRound and
  Pill all use. The ring was written and then removed on the designer's call:
  the active state is the underline, and a ring around the whole field on top
  of it is a second indicator saying the same thing.

  The trade, recorded so it is a known cost rather than an oversight: a colour
  change on a 1px hairline is under WCAG 2.2 SC 2.4.13, which wants a focus
  indicator at least as large as a 2px perimeter. If it needs to come back into
  line without reintroducing the ring, thicken the focused rule to 2px and drop
  the field's padding-bottom by 1 so nothing shifts — that satisfies the
  criterion and is still only the underline. **Don't just re-add the ring.**
- **Disabled is not in Figma.** It reuses Button's and Pill's muted fill and
  inert text.
- **No hover, no error state.** Neither is designed, and inventing one would
  be inventing a decision the file has not made — the same reason Card has no
  padding. When one is drawn, colour it with `--ui-danger` (which exists now,
  for Button's and ButtonRound's `tone`), not `--ui-action`: primary is red by
  default, so a red underline on primary would read as focus.
