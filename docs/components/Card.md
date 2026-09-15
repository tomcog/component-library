# Card

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

A raised surface that groups content. Figma: the `Card` component set
(`395:14848`), one variant axis `Style` = `Float1` | `Float2` | `Flat`.

```tsx
<Card variant="float1">…</Card>
```

**Container only.** It sets a fill, a radius and an elevation, and nothing
else. No padding, no internal layout, no width or height.

## Divergences — do not "fix" these

- **The 350x200 frame is not modelled.** Figma poses all three variants at that
  size; it is the frame the design sits in, not a property of the component. A
  card in an app is whatever size its grid cell gives it, so `Card` has no
  width or height and stretches to its parent.
- **No padding.** What goes inside has not been designed yet. Adding padding
  now would be inventing a decision the Figma file has not made, and every
  consumer would then have to undo it.
- **Flat has no rule at all** - fill and radius only. It carried a 3px
  hairline briefly; that went, and `--ui-border-subtle` and
  `--ui-card-border-width` went with it since nothing else used them. `flat`
  still sets `box-shadow: none` rather than being an empty rule, so the
  variant always puts a class on the element.

## `float1` / `float2` are Figma's names, not good ones

The variants say nothing about what they are for; they are elevation steps,
and `Style=Float1` reads as a style rather than a height. They are kept
because the transform rule holds - `Style=Float1` -> `variant="float1"` -
and renaming one side alone is how the two drift apart. If they are ever
renamed (`raised`/`lifted`, say), rename the **Figma** side first: that is a
design-shaped change, and the code follows.

The two shadows are `--ui-shadow-float-1` / `--ui-shadow-float-2` in
`tokens.css`, alongside motion rather than in a component tier: elevation is
system-level, and a second component inventing its own shadow is how depth
drifts apart. Both are two-layer - a soft cast plus a tight contact shadow -
so a card reads as lifted rather than blurred.

**Float 1 was lowered to `0 2px 6px / 0 0 2px` in 0.29.0.** At `0 6px 18px`
against `0 12px 18px` the two steps were barely distinguishable: identical
blur, half the offset. Lowering float1 rather than raising float2 was
deliberate; only Card reads float-1, whereas float-2 also draws InputSelect's
menu.

It was prompted by PlantPal's plant grid running `float1` at rest and `float2`
on hover. **That pairing is gone** - the grid now sits on a flat `float2` with
no hover - so no consumer reads float-1 at present. The value is still right
on its own terms; just don't treat the resting/hover story as current.

Two things to know before touching this again:

- **The two sides had already drifted before this change**, and it was not
  recorded anywhere. `Shadow/Float 1` in Figma was `0 0 4px` + `0 4px 16px`
  while the code said `0 0 6px` + `0 6px 18px`. `Shadow/Float 2` matched
  exactly, and still does. Whatever caused that drift, it was not a documented
  decision - so do not read Figma's old float1 as an intent that was
  overridden here.
- **Figma is synced.** `Shadow/Float 1`
  (`S:75e740be560094d05c51563c32287f3db6c4db36`) now holds contact
  radius 2 / offset (0,0) and cast radius 6 / offset (0,2), both colours still
  bound to `Shadow/Color`. Figma's blur radius maps 1:1 to the CSS blur, which
  is checkable against Float 2: radius 10 / offset (0,-1) and radius 18 /
  offset (0,12) against `0 12px 18px, 0 -1px 10px`.

  Editing an effect style through the plugin means reassigning the whole
  `effects` array. **Spread each existing effect and change only `radius` and
  `offset`** - rebuilding the objects from literals drops
  `boundVariables.color`, and that binding is the only reason elevation is
  theme-aware. Read the bindings back after writing; a green result proves
  nothing here.

  On the canvas the variants run **Flat, Float1, Float2** left to right, which
  is not the order `children` returns them in. Flat is invisible in a
  screenshot against the white page - no shadow, white fill - and that is
  correct, not a failed render.

Figma shadows cannot be variables — variables are only BOOLEAN, FLOAT, STRING
and COLOR — so the two elevations are **effect styles**, `Shadow/Float 1` and
`Shadow/Float 2`, named so the transform still holds
(`Shadow/Float 1` -> `--ui-shadow-float-1`). Effect styles are the Figma-native
equivalent of a shadow token; don't try to model them as variables.

**The shadow colour is a variable, though**, and that is what makes elevation
theme-aware. `--ui-shadow-color` / `Shadow/Color` is `rgb(0 0 0 / 0.1)` in
light and `0.5` in dark: a 10% black shadow does almost nothing on a dark
surface, where the card and its shadow are already close in lightness. The
geometry is identical in both modes; only the alpha moves. In Figma each
effect's colour is bound to that variable, so the two modes follow it.

**The composed tokens must be redeclared in the `[data-theme="dark"]` block.**
A `var()` inside a custom property resolves at the element that *declares* it,
so `--ui-shadow-float-1: … var(--ui-shadow-color) …` written once on `:root`
freezes against `:root`'s colour and a `[data-theme]` on a subtree cannot move
it — the same trap the header of `tokens.css` describes for the component
tier. Repeating the two lines in the dark block is the cost of keeping one
public token name; don't "tidy" them away.

The component set is fully bound: fill -> `Surface/Raised`, all four corners ->
`Card/Radius`. Flat carries no stroke at all. No property on any variant is a
raw value.

Flat's stroke was briefly `CENTER`-aligned (1.5px of it outside the frame,
making the variant 353x203 against the float variants' 350x200), then
`INSIDE`, and is now removed entirely along with the rule it drew.
