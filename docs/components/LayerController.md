# LayerController

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

One layer of a drawing: a 24px print box butted against a layer row holding
the number, a colour swatch, the name and a grip. Figma: `LayerController`
(719:555), posed in frame 719:326.

```tsx
<LayerController name="print-layer" number={2} color="#00838a" label="Turquoise"
  checked={target === id} onChange={() => setTarget(id)} printed={done.has(id)}
  handleProps={{ "aria-label": "Move Turquoise", onKeyDown }} />
```

    box       24 x 24, Button Size/SM height; strokes Button/Tertiary/Default
              (--ui-surface-muted in code), radius Button Size/SM on the
              outer corners, overlapping the row by 1px
    row       padding 6 / Button Size/SM padding-x (8), gap 4, same stroke
              and radius on the other two corners; 24 tall, as Figma strokes
              inside - drawn with an inset box-shadow, not a border
    type      number Label SM 10/12 in Accent; name Label MD 12px on the same
              12px leading, Text/Default - the row is the 24px button box, and
              Label MD's own 16px leading would burst it (719:337)
    swatch    16px circle, the caller's colour; `swatchCut` strikes it through
              with Figma's 3px rule, overhanging it at both ends (741:386)
    icons     16px lucide/printer (Confirm stroke) and lucide/printed;
              lucide/pen-tool at 24px/1.5 stroke for purpose="draw" - same weight
              `icon`: the caller's glyph at 16px, stroke 1.5 on lucide's 24 box
              (the same weight); Text/Muted at rest, Confirm when picked,
              Text/Disabled when hidden - not in Figma
              (Text/Muted with a Confirm tick); 12px eye (Text/Muted) and
              grip (Surface Muted), both at 65%, gap 4
    hidden    (719:567) no rules on box or row; number and name
              Text/Disabled; swatch unchanged; eye-off in Accent at 65%

## A struck-through swatch is about the colour, not the layer

`swatchCut` says there is nothing available that draws this colour - no pen in
that ink in the plotter, a palette the colour isn't in. It is drawn as the
colour cancelled rather than replaced, because the layer really is that colour;
what's missing is the means to draw it. So it changes nothing else: the swatch
still opens whatever it opened, the eye still hides, and the layer still prints
(in whatever the machine has). A row that refused to print would be answering a
question the component isn't being asked.

The rule overhangs the circle at both ends, which is what keeps it reading as a
cut rather than as a highlight drawn inside the dot; that's why it's Figma's
vector at an 18.12 box rather than a gradient clipped to the swatch.

## The box is a radio, drawn like a checkbox

Figma draws an empty square, and the design brief is "only one layer prints at
a time". So it renders `<input type="radio">` - Checkbox's zero-size input
behind the glyph - and rows sharing a `name` are one group: arrow keys move the
choice, forms submit it, screen readers announce "radio, 2 of 4". A checkbox
look with checkbox semantics would let two layers claim the printer.

## States are what the box holds

`checked` shows the green printer; `printed` shows the grey printer with a
green tick; **checked wins** when both are true, because which layer prints
next matters more than what printed last. Figma's `printStatus` boolean plus an
instance swap is two properties for one three-way state, so code has one
visible outcome per combination instead.

## `purpose` is what picking a layer means

`print` is the default and is a plotter's: the picked layer is the one that
will be printed, the box is a printer, and `printed` marks the ones already
done. `draw` is an editor's: the picked layer is the one being drawn on, so the
box is lucide/pen-tool and `printed` is ignored - nothing has been "already drawn
on", so there is no third state for it to show. The accessible name follows,
"Draw on Sky Blue" rather than "Print Sky Blue".

Everything else is deliberately identical - same geometry, same swatch, same
eye, same radio-group behaviour - because it is the same layer either way. The
two apps that use it sit side by side, and a row that changed shape between them
would read as a different kind of thing rather than the same one doing a
different job.

## `icon` is what kind of layer it is

Some layers aren't drawn the way the rest are - a photo turned into hatching
among layers of drawn shapes. `icon` puts that kind in the box, and unlike the
printer or nib it stays there whether or not the layer is picked: muted at
rest, in the picked colour when picked, because a kind that only showed on the
chosen layer wouldn't mark anything. When picked it takes the place of the
printer or nib; the box's colour is still what says "picked". `printed` shows
nothing on a row with an icon - the kind is the more lasting fact. Pass an icon
that draws in `currentColor`; the row sizes it and sets its stroke.

## Hidden layers can't be picked

`visible={false}` disables the radio and draws the box empty even if
`checked` is still true: a layer that isn't shown can't be the one that prints.
The eye is a toggle `<button>` with `aria-pressed` (pressed = hidden) when
`onVisibleChange` is passed, and a decorative span otherwise.

## Divergences - do not "fix" these

- **No width.** The row is posed at 200; in code it fills its container, the
  same call Card makes.
- **Hover, focus and disabled are not drawn.** Focus is the library's 2px
  primary ring on the box; nothing changes on hover. Draw them in Figma first
  if they are wanted.
- **`label` is a slot, not a string.** An editable name passes a borderless
  `<input>`, which inherits the row's type and colour. Figma's text layer has no
  edit state.
- **The grip is a button only when `handleProps` is passed.** Reordering is the
  caller's behaviour; without it the grip is decorative and `aria-hidden`.
- **`hideHandle` leaves the grip off entirely**, for a list whose order isn't the
  reader's to change - one that reports an order decided somewhere else. Prefer
  it to a decorative grip there: a grip that can be grabbed and does nothing
  reads as a broken drag rather than as an absent feature.
