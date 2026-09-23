# Tag

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

A small label pill. Figma: the `Tag` set (`685:584`), one axis
`State` = `Default` | `Hover`.

```tsx
<Tag>Applied</Tag>
<Tag asChild><button onClick={rename}>{skill.name}</button></Tag>
```

    radius    Pill/Radius (999) - the SAME variable Pill binds
    padding   4 / 8
    type      Type/Label MD, 12/16, Medium, no letter-spacing
    count     the same size, one weight lighter, in --ui-brand
    fill      Surface/Raised
    label     Text/Muted, going Action/Base on hover
    height    none - 24 is padding plus the line box, as Pill's is

## It is not Pill, and the difference is the ARIA

They look alike and share a radius, so this is the confusion worth heading off.
**`Pill` is a filter TOGGLE** - a real `<button>` carrying `aria-pressed`, with
an on and an off state the user switches between. **A `Tag` states a fact**
about the thing it sits on: nothing to toggle, no pressed state. So it renders
a `<span>` and there is deliberately no `selected` prop. Reaching for `Pill` to
get a rounded label is how a screen reader ends up announcing "toggle button,
not pressed" about a word.

`asChild` is there for when the whole pill IS the control, so a clickable tag
is one element rather than a span wrapping a button - the same pattern `Button`,
`ButtonRound` and `NavSlat` carry.

## The radius is read through Pill's token, not copied

`--ui-tag-radius` is **not declared**. The module reads
`var(--ui-tag-radius, var(--ui-pill-radius))`, because Figma binds Tag's four
corners to `Pill/Radius` - the very same variable Pill binds. Declaring a
second `999px` here would be a copy that only looks like an alias, and the two
corners would drift the first time either moved. Same reasoning as
`--ui-nav-rail-chip-size` aliasing ButtonRound's, and the same trap
`--ui-left-rail-bg` documents from the other direction.

## `count` is a number before the label

```tsx
<Tag count={3}>Applied</Tag>       // "3 Applied" - the tag appears three times
```

It is **context**, so it is quieter than the thing it qualifies: the same
size, one weight lighter (Regular against the label's Medium), and in
`--ui-brand` rather than the label's muted grey. "3 Applied" reads as one tag
saying a thing appears three times, not as a tag called "3 Applied".

`0` renders. Only `undefined` leaves the prefix off - a tag that genuinely
counts zero of something is saying something, and a `count` that silently
vanished at zero is the sort of falsy-check bug nobody sees.

Under `asChild` the number goes INSIDE the supplied button or link, not in
front of it, so the whole pill stays one control.

It keeps its brand colour on hover, because hover is the LABEL's state - the
number is not part of the string that reddens.

**This is the second thing in the library to consume `--ui-brand` at all**,
after `LayerController`'s layer number. That is the role working as intended:
a count is chrome on a label, not a control, which is exactly the distinction
the role names were rewritten for in 0.50.0.

## Tag stopped being the exception in 0.55.0

It carried the library's only two typographic departures, both transcribed
faithfully from the Figma cells, and both are now gone:

- **Weight was SemiBold 600.** Every other string in the library is Medium
  (bar `InputText`'s value and `Checkbox`'s label, which are Regular), so a
  tag was the one thing shouting. It aliases `--ui-type-label-font-weight`
  now, which also means it follows the scale rather than repeating a number
  from it.
- **Letter-spacing was 0.01em.** The only letter-spacing anywhere in the
  library, and the consuming apps' own `guidelines/Guidelines.md` says not to
  adjust letter-spacing at all. It is `0`.

`--ui-tag-letter-spacing` is kept rather than dropped: the rule still reads it,
so an app can tune it, and `0` is the honest default rather than a value
nothing asked for.

Both were faithful transcriptions of the drawing, which is the right instinct -
and they show its limit. A value read off a cell is only as considered as the
cell, and two of them had quietly made this component the odd one out.

## Divergences - do not "fix" these

- **Hover is on the tag, not on an inner element.** Figma draws the state on
  the component and a Tag is one object, so a non-interactive tag reddens under
  the pointer too. That is what the file draws; `--ui-tag-text-hover` set to the
  resting colour opts out.
- **There is no trailing-action slot, deliberately.** Figma's Tag is a label and
  nothing else - no icon property, no remove affordance. `children` is a plain
  slot, so a caller CAN put a remove button in one, and `--ui-tag-gap` (0 per
  Figma) is the hook for the space it then needs. Modelling it as a real
  `onRemove` prop would be inventing a decision the file has not made, the same
  reason `Card` has no padding. **If a removable tag is wanted, draw it in Figma
  first** - that is a design-shaped change and the code follows.
- **The set carries no description.** `Tag` and `logo-tc` are the two without
  one; see Open divergences #7.
- **No border.** NextJob's hand-rolled `.chipOutline` has a 1px grey rule and
  dark text; the drawn Tag has neither - a `Surface/Raised` fill and a
  `Text/Muted` label. Adopting it there is a visible change, not a swap.
