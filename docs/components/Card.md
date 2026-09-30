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
drifts apart. Modal and InputSelect's menu read float-2 as well, so moving a
step moves them.

## Elevation is a five-layer stack (since 0.72.0)

Figma redrew both steps on 2026-09-28 as new effect styles, `CardLow`
(Float1) and `CardHigh` (Float2), and Modal moved to `CardHigh` with them.
Each is a tight ambient halo plus casts that fall further and fade:

            halo         cast 1        cast 2        cast 3        (cast 4)
    float1  0/0/17 100%  0/8/10 90%    0/6/14 50%    0/36/16 10%   0/60/18 0%
    float2  0/0/26 100%  0/22/22 90%   0/49/29 50%   0/87/35 10%   0/135/38 0%

(offset-x / offset-y / blur, strength as a share of `--ui-shadow-color`.)
Figma's blur radius maps 1:1 to the CSS blur. The 0% fifth layer paints
nothing and is not restated in code.

**The strengths are mixed from `--ui-shadow-color`, not written as
literals**, so the stack still deepens in dark (0.1 -> 0.5 at the halo, and
the casts in proportion). Figma's two new styles hold literal alphas with no
binding to `Shadow/Color`, so in Figma the Dark mode no longer deepens them -
divergence #49, which also covers their names.

Before 0.72.0 both steps were two-layer - a soft cast plus a tight contact
shadow: float1 `0 2px 6px / 0 0 2px`, float2 `0 12px 18px / 0 -1px 10px`,
in the `Shadow/Float 1` / `Shadow/Float 2` styles. Those styles are still in
the file, bound to `Shadow/Color`, and used by nothing.

When editing an effect style through the plugin, the whole `effects` array
is reassigned. **Spread each existing effect and change only `radius` and
`offset`** - rebuilding the objects from literals drops
`boundVariables.color`. Read the bindings back after writing; a green result
proves nothing here.

On the canvas the variants run **Flat, Float1, Float2** left to right, which
is not the order `children` returns them in. Flat is invisible in a
screenshot against the white page - no shadow, white fill - and that is
correct, not a failed render.

Figma shadows cannot be variables — variables are only BOOLEAN, FLOAT, STRING
and COLOR — so the two elevations are **effect styles**. They were `Shadow/Float 1` and
`Shadow/Float 2`, named so the transform holds
(`Shadow/Float 1` -> `--ui-shadow-float-1`); the set now uses `CardLow` /
`CardHigh`, which break it (#49). Effect styles are the Figma-native
equivalent of a shadow token; don't try to model them as variables.

**The shadow colour is a variable, though**, and that is what makes elevation
theme-aware (in code; see #49 for Figma). `--ui-shadow-color` / `Shadow/Color` is `rgb(0 0 0 / 0.1)` in
light and `0.5` in dark: a 10% black shadow does almost nothing on a dark
surface, where the card and its shadow are already close in lightness. The
geometry is identical in both modes; only the alpha moves. The old
`Shadow/Float` styles bound each effect's colour to that variable; the new
`CardLow` / `CardHigh` do not.

**The composed tokens must be redeclared in the `[data-theme="dark"]` block.**
A `var()` inside a custom property resolves at the element that *declares* it,
so `--ui-shadow-float-1: … var(--ui-shadow-color) …` written once on `:root`
freezes against `:root`'s colour and a `[data-theme]` on a subtree cannot move
it — the same trap the header of `tokens.css` describes for the component
tier. Repeating the two tokens in the dark block is the cost of keeping one
public token name; don't "tidy" them away.

The component set is fully bound: fill -> `Surface/Raised`, all four corners ->
`Card/Radius`. Flat carries no stroke at all. No property on any variant is a
raw value - except the effect styles' colours (#49).

Flat's stroke was briefly `CENTER`-aligned (1.5px of it outside the frame,
making the variant 353x203 against the float variants' 350x200), then
`INSIDE`, and is now removed entirely along with the rule it drew.
