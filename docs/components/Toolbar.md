# Toolbar

A rounded bar holding several `SegmentedControl`s — undo/redo beside the view
beside the zoom target. Figma: the `Toolbars` frame (772:1200).

```tsx
<Toolbar aria-label="Drawing tools">
  <SegmentedControl size="sm" aria-label="History">
    <Segment icon={<Undo />}>Undo</Segment>
    <Segment icon={<Redo />}>Redo</Segment>
  </SegmentedControl>
  <SegmentedControl size="sm" variant="dark" aria-label="View">
    <Segment icon={<Outline />} selected>Outline</Segment>
    <Segment icon={<Eye />}>Preview</Segment>
  </SegmentedControl>
</Toolbar>
```

    bar      radius 99, padding 4, gap 16 between controls
             tone="gray" Surface/Sunken (default) | tone="white" Surface/Raised
    height   DERIVED: padding + the tallest control, so 32 with SM, 48 with LG

## It owns three things

A ground, a 4px inset, and the gap between its controls. That is the whole
component — it has no opinion about segments, icons, labels or selection,
because every one of those already belongs to `SegmentedControl` and `Segment`.

That is what makes the three configurations free. **Icon + label**, **label
alone** and **icon alone** are all `Segment` props, so a bar of icon-only
controls and a bar of labelled ones are *the same Toolbar with different
children*:

```tsx
<Segment icon={<Undo />}>Undo</Segment>           {/* icon + label */}
<Segment>Undo</Segment>                            {/* label alone  */}
<Segment icon={<Undo />} hideLabel>Undo</Segment>  {/* icon alone   */}
```

The third keeps the text as the accessible name rather than dropping it, so
switching a bar to icons costs nothing in screen-reader terms. See
`hideLabel` in `SegmentedControl.md`.

Likewise **each control picks its own selected ground** with `variant`:
`primary` for the brand fill, `dark` for the near-black one. It sits on the
control, not on the segment or the bar, so one toolbar can mix them — which
is what Figma draws, with `History` on the brand and `View` and `Zoom` dark.

## The gap is the argument

16 between controls against 4 between segments. Segments crowd together
because they answer one question; controls stand apart because they answer
several. That ratio is the only thing stopping a toolbar from reading as one
long row of options, and it is why `--ui-toolbar-gap` is its own token rather
than sharing the track's.

## The bar is not given a height

32 and 48 are derived — padding + the tallest control. Nothing here forces
`size="sm"`, so a bar of LG controls stands 48 with no token changing, exactly
as the track derives from its segment. Figma draws SM only.

## `tone` names the BAR, and Figma's layers name the page

`gray` is `--ui-surface-sunken` and is the default; `white` is
`--ui-surface-raised`. Both are semantics, so both follow the theme.

**The two sides read inverted, and it will catch you once.** Figma's layers
are named for the page the bar sits on, so `Toolbar on white` is the GRAY bar
(`tone="gray"`) and `Toolbar on gray` is the WHITE one (`tone="white"`). The
prop matches `SegmentedControl`'s `tone`, which also names its own ground —
consistency inside the code won over matching the layer names.

`--ui-surface-sunken` is new with this component: a ground a step *below* the
page, for a bar that things sit down inside. In dark mode it inverts and
lifts *above* the page instead, because a bar cannot sink out of sight on a
dark ground — which is exactly why it is a semantic and not a neutral read
directly.

## `role="group"`, deliberately not `role="toolbar"`

The ARIA toolbar pattern claims the arrow keys, and every `SegmentedControl`
inside has already bound them for its own options — a segmented control is
itself a composite widget. Implementing the toolbar pattern properly would
mean intercepting at the boundaries of each nested composite, and claiming a
pattern without implementing it is worse than not claiming it (the rule
`SegmentedControl` follows for its own `radiogroup`).

So: Tab moves between controls, the arrows stay with the control that owns
them, and the bar is an `aria-label`led `group`. Code-only; Figma models no
keyboard behaviour.

## Divergences — do not "fix" these

- **The gray bar is `#ededed`; Figma draws `#e1e3e2`.** The drawn fill is
  unbound and four points off `Neutral/200`, with a 2/255 green cast where
  every neutral in this library is strictly hueless — an eyedropped value
  rather than a chosen one. Matched to the nearest colour the library already
  has (`--ui-neutral-150`, via `--ui-surface-sunken`) by decision, not by
  accident. `--ui-surface-muted` (`#d4d4d4`) is the next nearest and is
  further away.
- **Toolbar exists as frames in Figma, not a component set.** Three of them:
  `Toolbar on white`, `Toolbar on gray`, `Toolbar on gray Icon only`. Nothing
  to instance, so the two sides are compared by measurement. Promoting them to
  a set with a `Color` axis would close it; that is design-shaped, so it
  happens in Figma first. Same situation as `LeftRail` (divergence #10).
- **Nothing forces `size="sm"` on the children.** Figma draws SM only, and the
  bar derives its height from whatever it holds, so an LG bar is supported and
  undrawn rather than forbidden.
