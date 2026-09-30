# ButtonRound

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

Circular icon-only action button: **Button's four Levels and its danger tone, on a
circle** (since 0.73.0). `variant` = primary | secondary | tertiary | ghost, plus
`outline-light` for a button over a photo; `tone` = primary | danger; `size` =
xl | lg | md | sm. Each Level's rest, hover, press and disabled are Button's own,
with the same colour expressions, so a round and a rectangular button of the same
Level behave identically. Figma: the `Button/Round` set (`220:11857`) - see
"Figma" below for where it stands.

```tsx
<ButtonRound icon={<Pencil />} aria-label="Edit" />                  // secondary
<ButtonRound variant="tertiary" icon={<X />} aria-label="Dismiss" />
<ButtonRound variant="primary" tone="danger" icon={<Trash2 />} aria-label="Delete" />
```

    size   box    icon   stroke
    xl     48     28     2.5
    lg     40     24     2
    md     32     20     1.5
    sm     24     16     1

The icon grows faster than the container (58% / 60% / 62.5% / 67%) so the glyph
stays legible at Small — that ratio is deliberate, not a rounding artefact.

**Stroke is set on the shapes, not just the `<svg>`.** Lucide puts
`stroke-width` on the root and lets it inherit, but plenty of icons set it on
each `<path>`, and a presentation attribute on an element beats a value
inherited from its parent — an svg-only rule loses to those silently.
`vector-effect: non-scaling-stroke` then pins the weight to rendered px
whatever the icon's viewBox, so a 24-viewBox glyph drawn at 12px does not
halve its stroke.

## The Levels (since 0.73.0)

Decided with the user 2026-09-29: standardise on Button's styling and naming,
Figma `914:678` (Button's four Levels) as the reference.

    variant     rest                         hover                     press
    primary     --ui-action / on-action      action 22.3% darker       40.7% darker
    secondary*  action tint / --ui-action    22.3% darker / on-action  40.7% darker / on-action
    tertiary    none / --ui-action           action tint               48% tint / glyph 25% to Text/Default
    ghost       1px --ui-action ring         tint, ring transparent    as tertiary
    * the default

    disabled    primary, secondary: --ui-surface-disabled / --ui-text-disabled
                tertiary: unfilled, --ui-text-disabled glyph
                ghost: unfilled, --ui-text-disabled glyph and ring

- **The default is `secondary`, not `primary` as on Button.** A row of round
  toolbar actions rests tinted, as it always has; solid discs by default would make
  every toolbar the loudest thing on the page.
- **`tone="danger"`** is Button's: every state of every Level moves from the action
  colour to danger, at rest included. Disabled and the focus ring are untouched.
  Ignored by `outline-light`.
- **The ghost's ring is an inset box-shadow**, as Button's is, so it costs no
  layout: every Level is exactly the size of its neighbours.
- **Hooks** are `--ui-button-round-<variant>-<part>`, parts `bg`, `icon`,
  `bg-hover`, `icon-hover`, `bg-active`, `icon-active`, and for ghost `border`,
  `border-hover`, `border-active`, `border-disabled`; `--ui-button-round-disabled-bg`
  / `-icon`. Tertiary reads its own hooks and then Ghost's, as Button's Tertiary
  does, so the danger tone and a retuned ghost reach it for free.

### Migrating from 0.72.0 and earlier

    variant="filled" (or none)   -> "secondary" (the default; "filled" still works, warns)
    variant="ghost"  (no fill)   -> "tertiary"  - "ghost" now means the ring
    --ui-button-round-bg / -icon / -bg-hover / -icon-hover / -bg-active /
      -icon-active                -> --ui-button-round-secondary-*
    --ui-button-round-bg-disabled / -icon-disabled
                                  -> --ui-button-round-disabled-bg / -icon
    --ui-button-round-ghost-bg / -icon / -bg-disabled / -icon-disabled
                                  -> --ui-button-round-tertiary-*

What changes to look at, for a button migrated like-for-like: a secondary's
**press** is the darker action fill, where it was the near-black inverse surface;
a tertiary (old ghost) **hovers** to the pale tint, where it filled solid action.
Both are Button's.

## `variant="outline-light"` sits on a photo

For a round button laid over a photo or video - ParkPal's park hero image is the
first. A translucent black ground with a white ring and glyph, the whole button
translucent too:

```tsx
<ButtonRound variant="outline-light" icon={<X />} aria-label="Close" />
```

              ground        ring         glyph        whole button
     rest     40% black     80% white    75% white    75% opacity
     hover    60% black     90% white    90% white    90% opacity

    ground   --ui-surface-scrim / --ui-surface-scrim-hover
    ring     --ui-text-on-media at --ui-button-round-outline-light-ring-strength[-hover],
             1.5px inset (--ui-button-round-outline-light-stroke)
    glyph    --ui-text-on-media at --ui-button-round-outline-light-icon-strength[-hover]
    opacity  --ui-button-round-outline-light-opacity[-hover]

Hooks: `--ui-button-round-outline-light-bg`, `-bg-hover`, `-icon`, `-icon-hover`,
`-ring`, `-ring-hover`.

**Both colours are theme-independent, on purpose.** They are semantics of their own
rather than `--ui-text-on-inverse` (white in light, ink in dark): a photo is the
same photo in either mode, and a glyph that turned dark in dark mode would vanish
against a shadowed rock. Neither is redeclared in the dark block. The ring and glyph
tints are mixed from `--ui-text-on-media` at the element, not declared as colours.

**The ring is an inset box-shadow**, so the button is exactly the size of any
other Level beside it.

**Hover and press stay neutral - only transparency moves.** They never take the
action fill the way the other Levels do: over a photo a coloured disc reads
as a different control. Decided with the user; don't restore the fall-through
(0.67.0 shipped it).

Figma: drawn as `Button/Round` **instances** over the ParkPal hero - `890:1688`
at rest (also `890:1695`, the close button), `892:1700` hovered - at LG only, not
yet a `State` in the set. That, and the raw/primitive colours, are divergence #48.

### Code-only, derived rather than drawn

- **Press** is the hover look.
- **Disabled** keeps the resting look at 40% opacity - below the resting 75%, so
  it still reads as off. The base disabled pair (a pale grey disc) would be the
  loudest thing on a dark photo.
- **XL, MD and SM** share LG's 1.5px ring.

## History: the tones that moved out, and why `tone` is back

Until 0.36.0 this component had `tone="primary" | "confirm" | "danger"`, which
recoloured the HOVER pair only; `confirm` and `danger` moved to
[ConfirmButton](ConfirmButton.md), whose job is a confirmation coloured at rest.
That reasoning still holds for ConfirmButton. The `tone` added in 0.73.0 is a
different thing - Button's, colouring every state at rest included - and exists
because the user asked for ButtonRound to follow Button's conventions (2026-09-29).
The "do not reintroduce a tone" rule this doc carried is retired with it.
ConfirmButton remains the component for a confirmation.

## There are two round-button sets; only one is live

`Button/Round` (`220:11857`, `Size` x `State`) is the one this
component models. Beside it sits `Button/Round-Deprecated` (`66:2077`,
`Level` x `State` — Primary, Secondary, Tertiary, Ghost, Destroy).

**That one is deliberately not in the library.** It is used by the file's own
screens — ~247 instances against the live set's 9 — and the user has said it
will not be part of the library. The code now has Levels too (0.73.0), but they
are Button's, not that set's - don't read it as the spec, and do not delete it: those instances are real, and it is the set that carries
the `Level=Ghost` variant a previous session destroyed by assuming exactly
this kind of thing was leftover scaffolding.

The two shared the name `Button/Round` until the deprecated one was renamed,
and that ambiguity is the likely reason consuming files resolved the key to a
third, older shape (a `State=On` axis) no matter how often the library was
published. Re-check a consumer after any publish rather than assuming it took.

## Every colour is on the semantic tier, deliberately

Every Level reads semantics (`--ui-action`, `--ui-action-lighter`,
`--ui-text-on-action`, `--ui-danger`, …) and derives its tints at the element with
`color-mix()`, so a scoped theme or an app's own action colour moves all of it.
The old default's press used `--ui-surface-inverse` rather than `--ui-ink` for the
same reason - a primitive does not move with the theme; that press is Button's
darker action fill since 0.73.0.

## Figma

The `Button/Round` set (`220:11857`) is `Size` x `State` = Off | Hover | Active |
Dark | Disabled, and does not yet carry the Levels or Tone - see
`docs/divergences.md`. The code moved first on the user's instruction; the set
follows.
