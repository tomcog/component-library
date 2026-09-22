# NavRail

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

Left rail navigation - a vertical column of links. Figma: the `NavSlat` set
(`444:791`) at `Level=Primary`, assembled text-only at `458:2467`.

```tsx
<NavRail aria-label="Sections">
  <NavSlat asChild active={pathname === "/"}><Link href="/">Home</Link></NavSlat>
  <NavSlat asChild><Link href="/work">Work</Link></NavSlat>
</NavRail>
```

**Sub items are modelled**, as `level="secondary"` plus a `NavSlatGroup`
wrapper. An early pass built them as a hover-disclosed group and was deleted;
this one was built fresh off the redrawn set rather than restored from
history, which is what that warning was for.

`icon` is optional. Without one the slat is text alone and closes up, which is
what hiding the layer does to Figma's auto-layout. It no longer changes the
slat's height: the line box and the chip are both 32.

    gap       12   between slats (--ui-nav-rail-gap; the history below says 8 -
                   the token moved after it was written, so check Figma before
                   trusting either)
    padding   0    inline - the rail's own padding sets the inset
    type      DM Sans Medium 14 / 20 (Label LG); slat min-height 32
    height         none - the slat hugs its line box: 32, with a chip or without
    chip      32   a Button/Round Medium; icon 20 at stroke 1.5
    chip gap  8    chip -> label
    pipe      4 wide, the height of the label's line box, --ui-action
    indent    14   = pipe width + the 10 gap Figma sets after it
    sub       16   indent, or 32 + 8 = 40 once icons are on; 0 gap within a group
    badge          optional trailing slot (a count, a status dot), pinned to the
                   slat's end; the app styles what goes in it

| Figma state | here | label | pipe | indent |
|---|---|---|---|---|
| Default | resting | `--ui-text-default` | - | - |
| Hover | `:hover`, `:focus-visible` | unchanged | drawn | 14px |
| Active | `active` | `--ui-action` | - | - |

## The geometry moved when the set was redrawn

The numbers above are not the ones this component was first built to. The
`NavSlat` set was redrawn in Figma between the first fetch and `LeftRail`, and
all four variants are now 32 tall where they were 20 on their own and 40 with
a chip. Three things followed from that one change:

- **The chip dropped a size.** A 40px `Button/Round` Large no longer fits a 32
  line, so it is Medium (32/20/1.5) and the slat is one height throughout -
  `--ui-nav-rail-chip-*` alias the `-md-` tokens now, not `-lg-`.
- **The gap went 14 -> 8**, and padding-inline 12 -> 0. Both were read off the
  `LeftRail` frames, where the slats sit flush against the rail's own 24
  padding and the hover pipe wants the slat's leading edge to *be* that inset.
- **A brief 34px pitch agreement is gone.** For one session the code stacked a
  20 line box on a 14 gap while Figma stacked a 24 box on a 10, and every slat
  top still landed on the same pixel. That coincidence is what made the two
  gap numbers look like a divergence when the rhythm actually matched. Both
  sides are now 32 + 8 = 40 outright, so the agreement is stated rather than
  arrived at.

Verified live against both `LeftRail` frames: slat tops `0/40/72/104/136/176/
216/256` and sub labels at 40 (text-only) / 64 (icons) from the rail's edge,
which is what Figma draws at `pl-16` and `pl-40` inside its 24 padding.

## The pipe is out of flow

Figma draws it in flow, before the label, because that is how Figma has to
draw it. **In code it is absolutely positioned**, and the label's own
`margin-inline-start` does the indenting.

In flow, a 2px bar plus its gap would already be holding the label 12px over
before anything is hovered, and there would be nothing left to indent. Out of
flow the pipe costs no layout at rest, and the two halves of the effect
animate independently: the pipe draws over `--ui-motion-base`, the label
slides over `--ui-motion-fast`.

It draws with the standalone `scale` property (`1 0` -> `1 1`,
`transform-origin: top`), not `transform`, so it composes with anything a
consumer sets on `transform` - the same rule as the dropdown's pipe.

**The indent is `calc(pipe-width + pipe-gap)`**, not a flat number, so
widening the pipe keeps the gap after it rather than eating into it. That is
not academic - the pipe went 2px -> 4px to match the horizontal nav's accent
rule, and the indent followed to 14px on its own.

The pipe is 4px because `--ui-nav-accent-size` is, but it is **its own token,
not an alias**. The two are the same figure today; one component's thickness
should not move because another's did.

## The chip borrows ButtonRound, but is not one

Figma composes an actual instance of `Button/Round` here. **In code it is an
inert `<span>`, not `<ButtonRound>`** - a slat is an `<a>`, and a `<button>`
cannot be nested inside one. That is invalid HTML rather than a style
preference: interactive content does not nest, the button would swallow the
link's clicks, and the accessible name gets confused. `asChild` does not
rescue it either, since it replaces the button with its child rather than
making the chip passive.

**The geometry is aliased, the colours are not**, and that split mirrors what
Figma does with the instance:

    --ui-nav-rail-chip-size        -> --ui-button-round-md-size
    --ui-nav-rail-chip-icon-size   -> --ui-button-round-md-icon-size
    --ui-nav-rail-chip-icon-stroke -> --ui-button-round-md-icon-stroke

Resize ButtonRound and the rail's chip follows, exactly as the instance does.
The fills are overridden per state on the Figma instance, so in code they are
the rail's own - which they have to be, because **the states sit one step off
ButtonRound's**:

| slat state | chip | ButtonRound's equivalent |
|---|---|---|
| Default | transparent, `--ui-text-muted` glyph | none - ButtonRound has no transparent state |
| Hover | `--ui-action` / `--ui-text-on-action` | its Hover |
| Active | `--ui-action-lighter` / `--ui-action` | its Default |

The glyph takes the chip's colour by inheritance and sets none of its own -
otherwise it wins inside the chip and draws a text-coloured icon on a red
circle.

## Divergences - do not "fix" these

- **`:focus-visible` gets the hover treatment too**, not just the outline. A
  keyboard user should see the same "this row is highlighted" affordance a
  pointer user gets. Figma models no focus state, so this is code-only,
  matching Nav and Button.
- **Current suppresses hover entirely** - hovering the current page adds
  neither pipe nor indent, so the two states never compound. Figma has no
  hovered-current variant; this mirrors what `NavItem` and `NavDropdownItem`
  already do.
- **The parent of the current sub item takes `sectionCurrent`, and only the
  chip changes.** See the `sectionCurrent` section below. Two earlier
  versions were written and dropped, so don't re-derive either: one showed no
  state on the parent at all, and one visually hid the parent's label so the
  row collapsed to its glyph (the label is the link's accessible name, and the
  sub items indent to line up under it, so they end up anchored to nothing).
- **The rail stretches its slats**, where the Figma component hugs its text.
  Figma sets `w-full` on the instances, which is the same intent - and a slat
  that fills the rail is hoverable across the whole row rather than only
  where its text reaches.
- **The pipe is the height of the label's line box, not the slat's.** The slat
  is 32 and the label's line box 20, so the pipe is 20, centred - the pipe lives in
  the label's group in Figma, not in the slat, and its rectangles are
  `layoutAlign: STRETCH` so they follow the type on that side too. It is
  centred with a margin rather than a translate so the standalone `scale`
  stays the only transform.
- **Default and Active carry a hidden pipe rectangle in Figma**, which is how
  Figma expresses "no pipe" inside an auto-layout - hiding it removes it from
  the flow, which is why those variants are 177 wide against Hover's 191
  (4 + the 10 gap). They are not grey pipes; don't model them.
- **The example frame's `Surface/Pale` background is not modelled.** It is the
  page the rail sits on, not part of the rail - same call as Card's 350x200
  frame.
- **`prefers-reduced-motion` is honoured**: the states all still apply, the
  pipe just stops drawing and the label stops sliding.
- **A sub item's hover and current are code-only.** The set draws exactly one
  secondary variant, `Level=Secondary, State=Default`. Left literally, a sub
  item would not respond to the pointer at all, which reads as disabled rather
  than quiet - so they rest at `--ui-text-muted` and darken to
  `--ui-text-default`, which is what `NavDropdownItem` already does with the
  horizontal nav's sub items, and go `--ui-action` when current.
- **A sub item draws the hover pipe, exactly as a primary slat does** - the
  same 4px bar drawn top to bottom, the same 14px indent after it. Figma has
  no hovered secondary variant, so this is code-only, and it is a deliberate
  request rather than an inference: an earlier pass left sub items with a
  colour change alone, on the reasoning that a second pipe under the parent's
  would read as a nested rule. In practice the pipe is what makes a row feel
  live, and dropping it made sub items feel like labels rather than links.

  It needs no rules of its own. The pipe is positioned from the slat's own
  leading edge, and a sub item's leading edge is already the indented one, so
  the bar lands against its own label rather than under the parent's - which
  is what that earlier reasoning was actually worried about.

  The current sub item still suppresses both, so hover and current never
  compound - the same rule primary slats and `NavDropdownItem` follow.
- **A sub item drops an `icon` if one is passed.** Figma draws no chip on
  `Level=Secondary` and offers no variant carrying one, so the slot is
  dropped rather than rendered at some smaller size.

## `NavSlatGroup` picks its own indent

Figma expresses the sub indent as two hand-set frames - `pl-16` on the
text-only rail, `pl-40` on the one with icons, that 40 being the chip plus its
gap. Copying both numbers into code would mean a prop saying which rail this
is, and a rail that gains icons would then be wrong until someone remembered
to change it.

The group reads the condition off its own contents instead:

    .group:has(.withIcon) .secondary { margin-inline-start: calc(chip + gap) }

So the sub labels line up under the parent's label either way - verified at
64/64 with icons on. The group also sets `gap: 0`, which is the other half of
its job: a parent and its children want to read as one block, and the rail's
own 8 still separates the group from its neighbours.

## `sectionCurrent`: the parent of the current sub item

A slat that owns sub items is not itself the page when one of its children is.
It takes the chip's current treatment and **nothing else**:

| | `active` | `sectionCurrent` |
|---|---|---|
| chip | current pair | current pair |
| label | `--ui-action` | unchanged |
| `aria-current` | `"page"` | none |
| pipe + indent on hover | suppressed | kept |

The red label marks the page you are actually on, and the sub item already
carries it — putting it on the parent too reads as two current items. The chip
is what says *the page is somewhere in here*.

It is a separate prop rather than something derived from `active`, because the
two differ in more than colour. `aria-current` is the important one: announcing
two current items is wrong, so the parent sets none. The pipe and indent stay
for the same kind of reason — unlike the current page, this slat is still
somewhere you can navigate to, so it should still answer a hover.

The chip rule is written out rather than shared with `.current`. The two mean
different things and only happen to agree on that one pair today; sharing it
would tie them together for a reason that is a coincidence.
