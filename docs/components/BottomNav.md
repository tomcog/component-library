# BottomNav

Bottom navigation: the mobile counterpart to `NavRail`, for the same destinations at a
width with no room for a rail. Two components. `BottomNav` is the bar, a `<nav>`
landmark. `BottomNavItem` is one destination inside it. Figma: the `BottomNav`
component (`827:732`) and the `BottomNav/Item` set (`542:2467`, `State` = Default |
Hover | Current).

```tsx
<BottomNav aria-label="Sections">
  <BottomNavItem icon={<Home />} current>Home</BottomNavItem>
  <BottomNavItem icon={<Search />} asChild>
    <Link href="/search">Search</Link>
  </BottomNavItem>
</BottomNav>
```

    bar      1px Border/Subtle rule on top, padding 8 top / 8 inline / 0 bottom,
             Surface/Raised ground; 73 tall = 1 + 8 + 64
    row      --ui-bottom-nav-height 64; items in equal columns (flex 1 1 0)
    item     50 tall: a 32 chip (Button/Round MD geometry), 6, a Label SM caption

| Figma | Code |
|---|---|
| `Bottom Nav/Height` | `--ui-bottom-nav-height` |
| `Bottom Nav/Padding X` / `Padding Y` | `--ui-bottom-nav-padding-x` / `-y` |
| `Bottom Nav/Item Gap` | `--ui-bottom-nav-item-gap` |
| `Surface/Raised` | `.bar` ground (hook `--ui-bottom-nav-bg`) |
| `Border/Subtle` | `.bar` rule (hook `--ui-bottom-nav-rule`) |

## At most six items (0.76.0)

A bar holds up to **six** `BottomNavItem`s - decided with the user 2026-09-29. Past
that a phone-width bar has no room for the captions. More are still rendered (a
silently dropped destination would be worse) but `BottomNav` warns in dev: move the
rest behind a More destination.

## Tap feedback: press and pop (0.76.0)

Asked for by the user 2026-09-29. Two motions, **size only** - the chip's colours
still change instantly, because on a touched tab bar a colour fade only ever reads
as lag (the reason it had no motion before):

    press   while a finger is down the chip shrinks to 0.88
            (--ui-bottom-nav-press-scale), --ui-motion-fast, and springs back
    pop     a chip that BECOMES current grows from 0.7 (--ui-bottom-nav-pop-from)
            to 1 with a small overshoot (--ui-bottom-nav-pop-easing), --ui-motion-base

The pop runs whenever `current` is newly applied - so on the tab tapped, and also
on the current tab when the bar first mounts. Both are removed under
`prefers-reduced-motion`. Code-only: Figma draws no motion.

## The bar paints itself but does not place itself

There is no `position: fixed` and no safe-area inset. The app pins the bar to the
viewport, or docks it in a frame as the playground does. This is the same call
`LeftRail` makes about its column. Its width is the container's: Figma's 375 is a
phone pose, not a size.

## The rule is `--ui-border-subtle` (0.62.0)

Until 0.62.0 the top rule read the `--ui-neutral-150` primitive. Primitives do not
change with the theme, so the rule stayed `#ededed` on the dark bar. It now reads
`--ui-border-subtle`, the quieter of the two rule semantics: `Neutral/150` in light
(unchanged, 1.17:1 on white) and `Neutral/700` in dark (1.25:1 on
`--ui-surface-raised`). `--ui-border-default` was not used: in light it is
`Neutral/350`, which would have darkened a rule nobody asked to change.

## Current is brand, hover is action (0.63.0)

The current tab - label, chip icon and chip tint - reads `--ui-brand`; the hover
chip and the focus ring stay `--ui-action`. The same split NavRail, Nav and Tabs
make: the current item marks where you are, the hover previews going somewhere.
The tint reads `--ui-brand-lighter` first, then 15% brand on white. Figma:
`State=Current` binds `Brand/Base` and `Brand/Lighter`; Hover keeps `Action/Base`.

## Divergences - do not "fix" these

- **Nothing is transitioned**, where `NavRail` eases its chip. A tab bar is touched,
  not hovered. The state has already changed by the time a finger lifts, so a fade
  only reads as lag.
- **Current is signalled by colour alone in the design**, so `current` also sets
  `aria-current="page"`.
- **Focus is code-only**: a 2px `--ui-action` outline at 2px offset, plus the hover
  chip. Figma models no focus state.
- **The loose `BottomNav` frame on the canvas (`543:2464`) is a sketch.** It spaces
  its items `SPACE_BETWEEN` with 15/7 padding. The component set, not the sketch, is
  the spec.
