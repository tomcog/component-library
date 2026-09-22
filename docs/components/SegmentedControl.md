# SegmentedControl

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

One choice from a short, fixed set - a filter row, a sort order. Figma: the
`SegmentedTrack` set (558:15011) holding the `Segment` set (555:14966), both
carrying a `Size` axis of XL | LG | MD | SM; the track carries a `Color` axis
of Gray | White as well.

```tsx
<SegmentedControl aria-label="Sort order">
  <Segment selected={sort === "newest"} onClick={() => setSort("newest")}>Newest</Segment>
  <Segment selected={sort === "az"} onClick={() => setSort("az")}>A-Z</Segment>
</SegmentedControl>
```

    track    radius 99, NO inset; between segments 8 / 8 / 6 / 4 by size
             tone="gray" Surface/Pale (default) | tone="white" Surface/Raised
    segment  radius 99; padding is UNIFORM on all four sides
    XL       segment 48 on 18/24, padding 10, icon 28, icon gap 10, track gap 8
    LG       segment 40 on 14/20, padding 8,  icon 24, icon gap 8,  track gap 8
    MD       segment 32 on 12/16, padding 6,  icon 20, icon gap 6,  track gap 6
    SM       segment 24 on 10/12, padding 4,  icon 16, icon gap 4,  track gap 4
             the track stands exactly as tall as its segment: 48 / 40 / 32 / 24

Height and icon size are NOT this component's numbers - they alias
`--ui-control-*-height` and `--ui-control-*-icon-size`, the ladder shared with
Button, ButtonRound and ConfirmButton. See below.
    icon     0.65 beside a label, 1 alone

Every number above is a token: `--ui-segmented-{lg,md,sm}-{height,padding-x,
icon-size,icon-gap,font-size,line-height}`, plus the shared
`--ui-segmented-{radius,track-radius,track-padding,track-gap,font-weight}` and
the two grounds `--ui-segmented-track-bg` / `--ui-segmented-track-white-bg`.

## It is a radiogroup, and that is the whole distinction

Three components in this library look like rows of small pills and are not
interchangeable. Choose by what the row MEANS:

| | pattern | means |
|---|---|---|
| `Tabs` | `tablist` | swaps what is shown inside the page you are on |
| `Pill` | `aria-pressed` per pill | each is one independent toggle |
| `SegmentedControl` | `radiogroup` | N options, exactly one holds |

Figma's `State` axis reads `Off | Hover | Active | Dark`, and the mapping to
code is: `Off` is the resting segment, `Hover` is the CSS state, `Active` is
`selected`, and `Dark` is the track's `variant="dark"` - an alternate Active
for when the brand fill is too loud, not a state of its own. Only `Off` and
`Active` are things a consumer sets.

Saying `radiogroup` is what tells a screen reader that choosing one
**un-chooses the rest** - which a row of `aria-pressed` pills does not, however
the app happens to behave. The keyboard follows from it and is the reason this
is a component at all: arrows move and select, Home and End jump, both
directions wrap, and a roving `tabIndex` means Tab enters at the current choice
and leaves rather than walking every option. Up and Down are handled as well as
Left and Right - the pattern is about the group, not about which way it is
drawn.

Selection stays the consumer's: the arrow handler calls the focused segment's
own `click()`, the same contract Tabs has.

## Only the selected segment has a ground

An idle segment has **no fill at all** - what you see behind its label is the
track's own pill, whichever `tone` it is drawn in. Hovering one changes the
LABEL and nothing else.

That is not an inference: Figma draws the `Hover` cell with its fill switched
OFF, and the `Off` cell likewise. Reading the fills without checking `visible`
makes `Off` look like a brand-red chip with near-black text on it, and Hover
look like red text on red. Both are hidden paints. **Check `visible` before
believing a fill.**

The icon's opacity has the same shape of trap, and it bit once. Figma composes
opacity down the tree, so a 0.65 on the icon instance AND a 0.65 on the vector
inside it renders at 0.42, not 0.65 - and a reader who queries
`instance.opacity`, as every walk in this file's history has, sees 0.65 and
believes it. The set is uniform now: **0.65 on the icon container, 1 on the
paths within it**, at all twelve cells. CSS composes the same way, and the code
puts its `opacity` on the icon span for the same reason, so the two sides agree
in structure and not only in value. **Read both the container and its contents
before believing an opacity.**

## It is on the control ladder, and the icon-only segment is a ButtonRound

Every height aliases `--ui-control-{xl,lg,md,sm}-height` (48/40/32/24) and every
icon aliases `--ui-control-*-icon-size` (28/24/20/16). Nothing here is this
component's own number, which is the point: a segment, a Button and a
ButtonRound at the same step stand level without anyone measuring.

That is also the formal version of the "glyph larger than the line box"
decision. There are two icon ladders in the library - one sized off the CONTROL
(this, and ButtonRound) and one sized off the TYPE (Button's, which is its line
box). This component takes the control one, which is why its glyph outgrows its
label.

The consequence: **an icon-only segment is a perfect circle, pixel-identical to
a `ButtonRound` at the same size** - same box, same glyph. Deliberate, and the
reason both now read the ladder instead of agreeing by hand. The playground's
`vs ButtonRound` row puts them side by side so a future divergence is visible
rather than theoretical.

It does **not** mean they should be one component. `ButtonRound` is an
independent action - a plain `<button>`, no state, fires and forgets. A
`Segment` is one option of N inside a `radiogroup`: `role="radio"`,
`aria-checked`, roving `tabIndex`, arrow keys that move *and* select, and it
only functions inside a track that names the group. A screen reader says "radio
button, 2 of 4, selected" for one and "button" for the other. Merging them would
force `ButtonRound` to carry radio semantics it must never have, or strip
`Segment` of the semantics that are its whole reason for existing - the same
call the Tabs / Pill / SegmentedControl table above makes, one level down.

## The icon is bigger than the type, and that is why height is a token

0.42.0 pulled the glyph off the line box: 24 / 18 / 14 against a 20 / 16 / 12
line. Until then `.lg .icon` read `--ui-segmented-lg-line-height`, and leaving
it there would have quietly undone the respec at every size - which is the one
thing to know before touching this file. The icon has `--ui-segmented-*-icon-size`
of its own now.

It is also why the segment keeps an explicit height. Figma hugs, so its segment
is `padding + the tallest child`, and the tallest child is the glyph - every
height in the table is **padding + the icon + padding**: 10+28+10, 8+24+8,
6+20+6, 4+16+4. Holding the height in code instead means a track can mix segments with
and without icons without its row stepping, and the vertical padding falls out
of it: 10 around the glyph, 12 around the shorter label, at LG.

The padding is uniform on all four sides, so only one number per size exists -
but the code still declares it **horizontally only**, as `padding-inline`, and
lets the height carry the vertical half. That is Button's decomposition and the
reason the token is still called `-padding-x`: a token named `-padding` that
reached one axis would be the misleading half of the trade.

## The icon's opacity is conditional, and that is a rule, not a value

A glyph shown **beside a label** draws at `--ui-segmented-icon-opacity` (0.65),
so the label leads and the icon supports it. A glyph shown **alone** draws at
full strength: it is the whole message then, and a faded one beside a solid
neighbour reads as disabled rather than as secondary.

The rule is **system-wide, not this component's**, and `ButtonRound` is the
other half of the proof: it never carries a label, so its glyph is 1.0 in every
state including rest. Both sides of that were settled in Figma on 2026-09-22 -
Segment's `Hover` came down to 0.65 to join its siblings, and ButtonRound's
`Off` went up to 1.0. All four of Segment's states mute the glyph; the label's
presence is the only thing that decides it.

Opacity rather than a muted colour, deliberately. The glyph is `currentColor`
and has to sit back from its label across four grounds - the pale track, brand
red, near-black and the hover red - and no single muted colour does that on all
four. Figma carries it the same way, as a layer opacity on the icon instance.

The switch is keyed off whether the label is **shown**, not off whether one
exists, so `hideLabel` - which keeps the text as the accessible name - counts as
alone. That is the right key: the rule is about what the eye sees.

## `hideLabel` is the icon-only segment

Figma's `Label?` boolean. Pass the label as `children` as usual and set
`hideLabel`; the text goes into `visuallyHidden`, never `display: none`, so it
is still the name a screen reader announces and still what the option is called
inside the radio group.

That is why this is a prop rather than "just leave the children out". A row of
unnamed glyphs is a control nobody can use, and an `aria-label` on each one is
the same string in a worse place - further from the thing it names and easy to
leave behind when the label changes. Leaving `children` out does work, and warns
in dev unless `aria-label`, `aria-labelledby` or `title` is passed.

The segment keeps its height and hugs to padding + icon, so an icon-only LG
segment is **44x36**. Figma has not posed one - that is the mechanical result of
its own `Label?` boolean, not a drawn size.

## The selected pill is flush with the track

The track carried a 4px inset until 0.43.0, so the ground showed as a ring all
the way around the chosen segment. It does not any more: `--ui-segmented-track-padding`
is **0**, the pill runs to the track's ends, and the ground is seen only in the
gaps between segments and behind the idle ones. That is why the gap grew from
its old shared 4 - with the pills flush it is the only place the groove reads,
and at 4 it was a seam.

The track is never given a height. 48 / 40 / 32 / 24 are derived - padding plus
the segment, which with no padding is just the segment. Declaring one as well
would be two numbers for one measurement, disagreeing the moment the segment
moved. The segment itself takes `height` plus `padding-inline`, never
`padding-block`: the same decomposition Button uses.

**Two gaps per size, and they are different objects.**
`--ui-segmented-*-track-gap` (8 / 8 / 6 / 4) separates two segments and sits on
the track; `--ui-segmented-*-icon-gap` (10 / 8 / 6 / 4) separates a glyph from
its label inside one segment. They agree at LG, MD and SM and part at XL, which
is exactly the kind of near-coincidence a single shared token turns into a bug.

## `tone` picks the TRACK's ground

`gray` is `--ui-surface-pale` and is the default; `white` is
`--ui-surface-raised`. The names are Figma's `Color` axis kept as it spells
them, and they name what LIGHT mode draws - both are semantics, so a `white`
track is the raised near-black in dark mode exactly as `Card` is.

`white` exists for a collision, not for variety: a pale track disappears on a
pale page. NextJob's dashboard ground IS `#f5f5f5`, and it had been setting
`--ui-segmented-track-bg: var(--ui-surface-raised)` by hand since 0.24.0 to get
out of it. That override still works and is now the long way round.

The two grounds are **two hooks**, not one: `--ui-segmented-track-bg` for gray
and `--ui-segmented-track-white-bg` for white. One shared hook would flatten
the axis - an app retuning the gray track to fix a collision would silently
repaint the white one too.

## `variant` picks the selected ground, and sits on the TRACK

`primary` fills the chosen segment with the brand colour; `dark` fills it with
`--ui-surface-inverse`. Figma models these as two `State` values on the segment
(`Active` and `Dark`), which is the only way a variant axis can say it - the
same modelling difference `Tabs` has with its size, and recorded here for the
same reason. A control whose selected segment came out red or black depending
on which one you clicked would be a different control each time.

## How the set is modelled in Figma

Three rules, each of which has been broken at least once and is expensive to
break again:

- **No `Button/*` token may appear in the set.** `Active` once read
  `Button/Primary/Default` and the LG cells took `Button Size/LG/*`, which
  meant a Segment moved whenever a Button did - the trap NavSlat and Pill each
  hit. Colours read `Action/Base` / `Text/OnAction`, type reads
  `Type/Label */*`, geometry reads `Segmented Size/*` and `Control/*`.
- **`State=Dark` reads `Surface/Inverse` / `Text/OnInverse`, never
  `Neutral/800`.** A primitive cannot follow the theme, so a dark-selected
  segment would stay near-black on a near-black page. This is the sixth time
  the file has needed that fix - after ButtonRound's pressed state, Pill's
  ground, NavSlat's icons, `Input-Text`'s rule and Checkbox's box - and
  `Neutral/800` is always the obvious thing to reach for.
- **`Icon?` and `Label?` are boolean properties, not variant axes.** A variant
  axis is what once doubled Button's set to 96 and was reverted. The cost is
  that neither state can be *posed* in the set, only on an instance - which is
  why the icon-only circle is checked in the playground instead.

## Divergences - do not "fix" these

- **The focus ring is INSET** (`outline-offset: -2px`), where every other ring
  in this library is offset outward by 2. The reason got stronger in 0.43.0:
  the segment used to sit 4px inside the track's pill, so an outset ring was
  drawn over the thing it lives in; now it is FLUSH with the track's edge, so
  an outset ring would leave the control entirely. Figma models no focus state,
  so this is code-only, matching Button and Tabs.
- **The icon takes `currentColor`**, where Tabs gives its icon a colour of its
  own. In Tabs an idle tab is a dark label beside a muted glyph, so the two
  cannot inherit together; here the icon and label are one object and move
  together through every state.
- **An icon-only segment is a perfect circle, identical to `ButtonRound`.**
  Intentional, but it is arithmetic rather than a drawn decision: it holds only
  while the padding stays uniform and the icon stays square.
- **The segment has a height; Figma's hugs.** They agree at 48 / 40 / 32 / 24
  while the segment carries a glyph, and deliberately disagree when it does
  not - the code holds the height so a track can mix the two without stepping.
- **`tone` is a prop on the track; Figma's `Color` is a variant axis.** The
  same shape `variant` already has, and for a weaker reason: an axis is simply
  how Figma says a choice. No open question here.
