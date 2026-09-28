# Radio

One option of a one-of-N choice: a circle and its label. `RadioGroup` holds a set
of them answering one question. Figma: the `Radio` set (`886:780`), `State` =
Default | Hover | Selected | Disabled | Disabled Selected, `Size` = XL | LG | MD, a
`Text` property. Added in 0.66.0, modelled on `Checkbox`.

```tsx
<RadioGroup aria-label="Units" value={unit} onValueChange={setUnit}>
  <Radio value="in" label="Inches" />
  <Radio value="mm" label="Millimetres" />
</RadioGroup>
```

    size   slot / glyph / text      (Checkbox's, read through --ui-radio-* hooks)
    xl     24 / 20 / 18 on 20
    lg     20 / 16 / 14 on 20       (default)
    md     16 / 14 / 12 on 18
    glyph  16-unit box: ring 13 across, 1 thick (Checkbox's square outline);
           dot 9 across (a 1-unit gap = the ring's thickness); disabled disc 13 across
    group  options stacked 8 apart (--ui-radio-group-gap, code-only)

## Modelled on Checkbox

The same real input drawn 1px behind the glyph, the same sizes, gap, label weight
and bindings - every measurement reads Checkbox's token behind a `--ui-radio-*`
hook, because a Radio and a Checkbox of one size are the same object and must line
up. A ring and a dot where Checkbox has a square and a tick; the states follow its:

| state | glyph | label |
|---|---|---|
| Default | ring, `--ui-text-muted` | `--ui-text-default` |
| Hover (unchosen) | ring + dot PREVIEWED, `--ui-action` | `--ui-action` |
| Selected | ring + dot, `--ui-action` | `--ui-text-default` |
| Disabled | solid disc, `--ui-text-disabled` | `--ui-text-disabled` |
| Disabled Selected | ring + dot, `--ui-text-disabled` | `--ui-text-disabled` |

All three shapes are in the DOM at every state and only their opacity moves, so the
dot fades rather than pops. Hover and selected never compound.

## A real `<input type="radio">`

The browser already moves between radios sharing a `name` with the arrow keys,
checking as it goes, and Tab enters the group at the checked one - nothing here
re-implements that. `RadioGroup` is a `role="radiogroup"` that gives its radios one
`name` (generated if omitted), the chosen `value` and `onValueChange`, and a shared
`size`; a radio's own `size` wins. Standalone, a Radio takes `name`, `checked` and
`onChange` like any input. Name the group with `aria-label` or `aria-labelledby`.

**Not SegmentedControl.** That asks the same one-of-N question as a track of
segments, for a short set in a toolbar or filter row (the apps' existing "radio"
pickers are this shape). A Radio is the form-field shape: a column of labelled
options.

## Divergences - do not fix these

1. **The group is code-only.** Figma draws the Radio; `RadioGroup` is a container
   with no appearance beyond stacking, so there is no set for it.
2. **Focus is code-only**: a 2px `--ui-action` ring round the slot, round for a
   round control. Figma models no focus state.
3. **The glyph is drawn shapes in Figma, one SVG in code.** Figma's cells hold a
   ring (stroked ellipse), dot and disc bound to variables; code draws the same
   geometry as filled paths in `currentColor`.
