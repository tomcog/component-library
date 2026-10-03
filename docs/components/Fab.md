# Fab

A primary round disc with its label beside it, as **one control**. Figma: the `FAB`
component (`703:513`) - a `Button/Round` at Size=LG, Level=Primary with an
action-coloured Label LG beside it.

```tsx
<Fab icon={<Plus />} onClick={addJob}>New job</Fab>
<Fab icon={<Plus />} hideLabel>New job</Fab>            // disc only, still named
<Fab icon={<Plus />} asChild><Link href="/jobs/new">New job</Link></Fab>
```

    disc     40 (ButtonRound LG)     --ui-button-round-lg-size
    glyph    24, stroke 2            --ui-button-round-lg-icon-size / -icon-stroke
    gap      8                       --ui-fab-gap (Figma: FAB/Gap)
    label    Label LG 14/20 Medium   --ui-type-label-lg-*, --ui-type-label-font-weight
    shadow   on the disc only        --ui-shadow-float-1 (Figma: CardLow)

- **One control, not a ButtonRound plus text.** Disc and label sit in one `<button>`
  (or the `asChild` element), so the whole thing is the hit area and the label is the
  accessible name. The disc is `aria-hidden`.
- **`hideLabel`** (Figma: `Label` off) keeps the label as the name, visually hidden
  with `src/internal/visuallyHidden.module.css`, so a disc-only Fab needs no
  `aria-label`. With no label at all, pass `aria-label`; it warns in dev otherwise.
- **The disc is ButtonRound's LG primary**, read through its tokens and hooks as
  fallbacks (`--ui-button-round-primary-bg`, `-bg-hover`, `-bg-active`, `-icon`,
  `--ui-button-round-disabled-*`), so retuning the round button retunes this. Fab's
  own hooks come first: `--ui-fab-bg`, `-bg-hover`, `-bg-active`, `-icon`,
  `-disabled-bg`, `-disabled-icon`, `-label`, `-label-disabled`, `-shadow`, and the
  geometry hooks `--ui-fab-size`, `-icon-size`, `-icon-stroke`.
- **No positioning.** "Floating" is `position: fixed` in a corner, offset above a
  bottom nav or a safe area - every app does it differently (DecorPal, AndreasPalms,
  SitePal), so the app places it.

## Divergences - do not fix these

- **Hover and press are code-only.** Figma draws no states for FAB. The disc darkens
  as ButtonRound's primary does (22.3% / 40.7% toward black); the label does not move.
- **Disabled is code-only**: ButtonRound's disabled disc and a `--ui-text-disabled`
  label. The shadow stays, so nothing shifts.
- **Focus is code-only**: a 2px `--ui-action` ring at 2px offset around the whole
  control, rounded to the disc's ends.
- **One size, one level.** Figma draws LG Primary only, so there is no `size`,
  `variant` or `tone` prop. Add them when something needs them, from ButtonRound's ladder.
- **The shadow and weight were brought onto the system, 2026-10-03.** The drawing had
  its own five-layer literal shadow and a SemiBold label; on the user's call both
  sides now use `CardLow` / `--ui-shadow-float-1` and Medium. Don't restore them.
