# LeftRail

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

The app shell's left column - a brand slot over a `NavRail`. Figma:
`LeftRail-NoIcons` (`482:2517`) and `LeftRail-Icons` (`458:2612`).

```tsx
<LeftRail brand={<Logo weight="medium" size={50} label="Acme" />}>
  <NavRail aria-label="Sections">
    <NavSlat asChild icon={<Home />}><Link href="/">Dashboard</Link></NavSlat>
    <NavSlatGroup>
      <NavSlat asChild active icon={<Settings />}><Link href="/settings">Settings</Link></NavSlat>
      <NavSlat asChild level="secondary"><Link href="/settings/members">Members</Link></NavSlat>
    </NavSlatGroup>
  </NavRail>
</LeftRail>
```

    padding    24   all round
    brand      50   min-height, then 32 to the nav
    fill            --ui-surface-pale
    width           none - whatever column the layout gives it

## It is a shell, not a nav

It renders a `<div>` and takes the `NavRail` as **children** rather than
building one internally. Two reasons, and neither is style:

- The `<nav>` landmark and its `aria-label` belong on the element that holds
  the links. Wrapping would have meant forwarding a `navLabel` prop down, and
  a page with more than one nav needs that label to be obvious, not plumbed.
- The column carries more than nav sooner or later - a workspace switcher
  under the brand, a user block pinned to the bottom. Children leave room for
  that; a `items` prop would not.

`brand` is a **slot, not a `logo` prop**. What belongs there varies per app:
the mark alone, a mark beside a wordmark, or a link home. The slot is rendered
even when empty and collapsed with `:empty`, so omitting it leaves no 32px
hole and no second code path.

## The fill is the one place a frame background IS the component

`Card`'s 350x200 frame and `NavRail`'s own example frame are both "the page
the design sits on", and neither is modelled. This one is different and the
distinction is worth keeping straight: the pale ground travels with the rail,
and it is the thing separating the rail from the content beside it. A left
rail with no fill is not a left rail, it is a list.

That is what made `--ui-surface-pale` worth adding to code - it had sat in
Figma unused, as open divergence #3 records, precisely because no component
had needed it.

**`--ui-left-rail-bg` is deliberately not declared in `tokens.css`.** Composing
it there as `var(--ui-surface-pale)` looks tidier and is wrong: a `var()`
inside a custom property resolves at the element that *declares* it, so the
fill would freeze against `:root`'s light value and `[data-theme="dark"]` on a
subtree could not move it. This was caught by rendering it, not by reading it
- the build is green either way and light mode looks perfect. The module
carries `var(--ui-left-rail-bg, var(--ui-surface-pale))` instead, resolving at
the rail, which is what every other component colour in this library already
does. Card's shadow tokens describe the same trap and solve it the other way,
by redeclaring in the dark block; the fallback form is preferred where a
component token has no reason to exist on `:root` at all.

## The spacer is not modelled

Figma reaches the 32px between brand and nav as an 8 gap, a 16 `Spacer`
rectangle and another 8 gap. The spacer is an auto-layout idiom for "leave a
hole here", the same class of thing as `NavSlat`'s hidden pipe rectangles, so
code carries one number - `--ui-left-rail-brand-gap: 32px` - rather than
three nodes. Measured live at 32.

## Divergences - do not "fix" these

- **The 200x500 frame is not modelled.** Same call as `Card`: the rail has no
  width and no height, and stretches to the column it is given. Figma poses it
  at 200x500 because a frame must have a size.
- **`LeftRail` is a plain frame in Figma, not a component set.** There is
  nothing to instance and no variant axis; the two frames are `Icon?` on and
  off, which in code is just whether the caller passes `icon`. If it is ever
  promoted to a component, the code name already matches.
