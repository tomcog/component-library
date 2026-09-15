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
    type      Label SM 10/12, Medium; number Accent, name Text/Default
    swatch    12px circle, the caller's colour
    icons     16px lucide/printer (Confirm stroke) and lucide/printed
              (Text/Muted with a Confirm tick); 12px eye (Text/Muted) and
              grip (Surface Muted), both at 65%, gap 4
    hidden    (719:567) no rules on box or row; number and name
              Text/Disabled; swatch unchanged; eye-off in Accent at 65%

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
