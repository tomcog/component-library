# Pill

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

A filter toggle — the row of choices above a list. Figma: the `Pill` set
(`432:17267`), one axis `State` = `On` | `Off`.

```tsx
<Pill selected={filter === "Remote"} onClick={() => setFilter("Remote")}>Remote</Pill>
```

Renders a real `<button>` with `aria-pressed`, so it is announced as a toggle
rather than a link or a tab. The prop is `selected`, not `on`: that is what the
control means to a caller and what `aria-pressed` reports. The class stays
`.on`, so `State=On` still transforms.

    padding   7 / 14         Pill/Padding Y, Pill/Padding X
    type      Label LG 14/20 Medium
    radius    999            Pill/Radius
    height    34             padding plus line box - no token

**No height token.** A pill is 7px padding plus a 20px line box, so 34 tall -
set a height and the two would fight the moment the type scale moved. (It was
13/17 and 31 tall until 0.9.0 moved it onto Label LG.)

**`Pill/Radius` (999) and `Pill/Line Height` are FLOAT variables**, bound
across both variants - four corners and the label - so each is one edit rather
than several nodes, matching how `Card/Radius` and the `Button Size/*` set
already work. Both hold the same value in Light and Dark: geometry never
varies by mode, only the semantic colour tier does.

The line height was `AUTO` until then. It *resolved* to 17 for DM Sans Medium
13, the type Pill had at the time, so the two sides agreed - by luck. A font change would have moved Figma
and not the code, and nothing would have looked wrong on either side. Pinning
it is what makes the agreement real rather than coincidental.

`Pill/Padding X` (14) and `Pill/Padding Y` (7) are bound too, since the padding
drifted to 16 in Figma while it was raw - see resolved divergence #15.

Note when reading bindings back: **a text node's binding is an array**, where
a corner radius binding is a single object. A check written for the scalar
shape reads `undefined` and reports the binding missing when it is in fact
there.

This is not only `lineHeight` — **`fontSize` is array-shaped too**, and it
caught a verification pass during the two-letter rename: the check reported
Button's font-size bindings as absent when all 80 variants still carried them.
Read `Array.isArray(b) ? b[0] : b` and the shape stops mattering. An absent
binding and a wrongly-shaped read look identical in the output, which is what
makes this worth a second mention.

## It was rebound to the semantic tier on arrival

As drawn, `State=Off` filled with `Color/White` and `State=On` with
`Button/Secondary/Default`. Both were repointed in Figma — Off to
`Surface/Raised`, On to `Surface/Inverse` — and the code uses those.

Two separate problems, worth recognising again elsewhere:

- `Color/White` is a **primitive**, so it could not follow the theme; the pill
  would have stayed white on a dark page. `Surface/Raised` is `#ffffff` in
  light, so nothing changed there.
- `Button/Secondary/Default` is **Button's component token**. Reusing it would
  have made Pill's appearance a side effect of Button's, so that a later change
  to the secondary button silently moved the filter row. It resolved to
  `Surface/Inverse` anyway; Pill now says so directly.
