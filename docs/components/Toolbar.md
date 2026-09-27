# Toolbar

A rounded bar holding several `SegmentedControl`s — undo/redo beside the view
beside the zoom target. Figma: the `Toolbar` set (777:1325), a `Color` axis of
Gray | White.

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

    bar      radius 99, padding 4, gap 20 between controls
             tone="gray"   bar Surface/Sunken, tracks Surface/Raised  (default)
             tone="white"  bar Surface/Raised, tracks Surface/Sunken
    height   DERIVED: padding + the tallest control, so 32 with SM, 48 with LG

## It owns the grounds, a 4px inset, and the gap

Grounds plural, because the bar decides its own **and** the one its tracks
take: they sit *against* it rather than with it. A gray bar holds white
tracks; a white bar holds sunken ones, the gray bar's own ground. It is a
relationship, not two colours — the track is always the step that stands
apart from the bar.

That is set by the bar, not asked of the consumer. Nesting a `SegmentedControl`
in a `Toolbar` should not require remembering to flip its tone, so the bar
declares `--ui-segmented-track-bg` on itself (hooks `--ui-toolbar-track-bg`
on gray, `--ui-toolbar-white-track-bg` on white) and the tracks inherit it. A
control given an explicit `tone="white"` is unaffected — that one reads
`--ui-segmented-track-white-bg` instead.

Beyond the grounds it has no opinion about segments, icons, labels or
selection, because every one of those already belongs to `SegmentedControl`
and `Segment`.

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

**A group that is not a choice takes `actions`.** An undo/redo pair is two
things you do, not one-of-N, so the track becomes a `group` of plain buttons
rather than a `radiogroup` of radios that can never be chosen. It looks
identical - Figma draws such a pair exactly like the other groups - and it is
the common case in a toolbar. See `actions` in `SegmentedControl.md`.

Likewise **each control picks its own selected ground** with `variant`:
`primary` for the brand fill, `dark` for the near-black one. It sits on the
control, not on the segment or the bar, so one toolbar can mix them — which
is what Figma draws, with `History` on the brand and `View` and `Zoom` dark.

## A group may carry a caption: `ToolbarGroup`

A toolbar is a row of groups, and any group can be captioned or not - NextDraw's bar
reads `VIEW:` before one track and `ZOOM:` before the next (NextDraw file, `87:1230`).
In the library set each group is a `<Group> Group` frame with a `Label` text, switched by
`History Label?` / `View Label?` / `Zoom Label?` and set by the matching `Label` TEXT
property; the gap binds `Toolbar/Label Gap`.
Each *item* can independently show its label or not; that is still `Segment`'s
`hideLabel`, and the two axes don't interact.

```tsx
<Toolbar tone="white" aria-label="Drawing tools">
  <ToolbarGroup label="VIEW:">
    <SegmentedControl size="sm" variant="dark">
      <Segment icon={<Hairline />} selected>Hairline</Segment>
      <Segment icon={<Eye />}>Simulated</Segment>
    </SegmentedControl>
  </ToolbarGroup>
  <SegmentedControl size="sm" actions aria-label="History">...</SegmentedControl>
</Toolbar>
```

    caption  Label MD (12/16, Medium), --ui-text-default, 4 before the track
             (--ui-toolbar-label-gap); hook --ui-toolbar-label-color

- **The caption is the control's name.** `ToolbarGroup` passes its label's id down by
  context and `SegmentedControl` uses it as `aria-labelledby` when it has no name of its
  own, so the visible and announced names can't drift. An explicit `aria-label` wins.
- **The wrapper has no role.** The control inside is already the `radiogroup`/`group`;
  a second group around it would be announced twice.
- **The text is rendered as given.** Figma types `VIEW:` - the capitals and colon are
  the consumer's string, not a `text-transform`.
- Unlabelled, a `ToolbarGroup` is a plain flex wrapper; bare `SegmentedControl`
  children still work and the two mix.

## The gap is the argument

20 between controls against 4 between segments (16 until 0.59.0). Segments crowd together
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

The component set is bound throughout, so the two sides agree on every value.
The loose frames it was built from are still on the canvas and still carry the
eyedropped `#e1e3e2` the bar was drawn in; they are sketches, not the library,
and are not tracked. The set binds `Surface/Sunken`.

- **The caption sits flush at the bar's 4px inset.** NextDraw's frame opens its first
  caption with a typed space (`" VIEW:"`) to push it off the curve; code does not
  reproduce a space as spacing. If it needs air, that is a padding decision for Figma.
- **The group gap stays 20**, although the NextDraw frame spaces its groups 16. The
  library set moved to 20 in 0.59.0, after that frame was drawn.
- **The caption is `--ui-text-default`**, not the NextDraw frame's raw `black`.
- **Nothing forces `size="sm"` on the children.** Figma draws SM only, and the
  bar derives its height from whatever it holds, so an LG bar is supported and
  undrawn rather than forbidden.
