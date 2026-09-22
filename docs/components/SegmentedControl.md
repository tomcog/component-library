# SegmentedControl

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

One choice from a short, fixed set - a filter row, a sort order. Figma: the
`SegmentedTrack` set (558:15011) holding the `Segment` set (555:14966), both
carrying a `Size` axis of LG | MD | SM; the track carries a `Color` axis of
Gray | White as well.

```tsx
<SegmentedControl aria-label="Sort order">
  <Segment selected={sort === "newest"} onClick={() => setSort("newest")}>Newest</Segment>
  <Segment selected={sort === "az"} onClick={() => setSort("az")}>A-Z</Segment>
</SegmentedControl>
```

    track    radius 99, 4 inset, 4 between segments
             tone="gray" Surface/Pale (default) | tone="white" Surface/Raised
    segment  radius 99
    LG       segment 40 on 14/20, padding-x 10, icon 24, icon gap 6 -> track 48
    MD       segment 30 on 12/16, padding-x 8,  icon 18, icon gap 6 -> track 38
    SM       segment 26 on 10/12, padding-x 6,  icon 14, icon gap 4 -> track 34

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
OFF at both sizes, and the `Inactive` cell likewise. Reading the fills without
checking `visible` makes Inactive look like a brand-red chip with near-black
text on it, and MD Hover look like red text on red. Both are hidden paints.
**Check `visible` before believing a fill.**

## The icon is bigger than the type, and that is why height is a token

0.42.0 pulled the glyph off the line box: 24 / 18 / 14 against a 20 / 16 / 12
line. Until then `.lg .icon` read `--ui-segmented-lg-line-height`, and leaving
it there would have quietly undone the respec at every size - which is the one
thing to know before touching this file. The icon has `--ui-segmented-*-icon-size`
of its own now.

It is also why the segment keeps an explicit height. Figma hugs, so its segment
is `padding-y + the tallest child`, and the tallest child is the glyph: an
icon-less LG segment there comes out 36 where one with a glyph is 40. Holding
the height instead means a track can mix segments with and without icons
without its row stepping, and the vertical padding simply falls out of it - 8
around the glyph, 10 around the label, at LG.

## The track is not given a height

48, 38 and 34 are derived - 4 + the segment + 4. Declaring a track height as
well would be two numbers for one measurement, and they would disagree the
moment the segment moved. The segment itself takes `height` plus
`padding-inline`, never `padding-block`: the same decomposition Button uses,
for the same reason.

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

## Figma was reconciled after the code landed

The set was drawn first and the code followed, so this was a fetch rather than
an independent edit - the documented exception to "never change both sides in
the same session". What moved in Figma, none of it changing a rendered value
except where noted:

- **`State=Dark` came off the `Neutral/800` PRIMITIVE** onto `Surface/Inverse`
  / `Text/OnInverse`, so it follows the theme. This DID change the value:
  `#2e2e2e` -> `#262626`, 8/255 on one channel, and the code's number.
- **Every `Button/*` token is gone from the set.** `Active` was on
  `Button/Primary/Default` and `Button/Primary/Label`, and all four LG cells
  took `Button Size/LG/Padding Y` and `Button Size/LG/Font Size`. A Segment
  would have moved whenever a Button did - the trap NavSlat and Pill each hit
  once. Colours now read `Primary/Base` / `Text/OnPrimary`, type reads the
  `Type/Label */*` scale, and vertical padding is unbound: the code has no
  padding-Y token at all, sizing by height exactly as Button does, so there is
  nothing to point at.
- **Nine `Segmented/*` and `Segmented Size/*/*` FLOAT variables** now carry the
  geometry, each with its `--ui-*` name as Dev Mode code syntax, and each set
  to the same value in both modes. Radius, padding, gap, height and padding-x
  were raw on the variants - the defect `Pill/Padding X` was created to close.
  **Undone by the 0.42.0 respec**, which edited the variants directly and left
  the variables holding the old numbers: divergence #33.
- **Both sets were given descriptions.** They were empty, and a description is
  the surface every `get_design_context` returns.

- **`Icon?` and `SegmentIcon` were added to the set**, the same boolean +
  instance-swap shape Button carries. Deliberately NOT a variant axis: that is
  what once doubled Button's set to 96 and was reverted, and the note is under
  "Icons: two slots, not a position enum". It defaults OFF so existing
  instances do not sprout a glyph, and the icon's stroke binds the same
  variable as the label in every state - what the code gets for free from
  `currentColor`. Sized to the LINE BOX (LG 20, MD 16), matching the CSS.
  **Both halves of that last sentence have since moved**: 0.42.0 draws the
  glyph larger than the line box, and `Active` and `Dark` bind the
  `Color/White` primitive rather than the label's variable (divergence #34).
- **A worked `Segmented Control - LG (icons)` frame** sits below the other two,
  built the way they are: a track instance with Segment instances posed on it.

Verified after: geometry unchanged at 40/32, padding-x 16/12, padding-y 10/8,
radius 99, gap 4, type 14/20 and 12/16; no `Button/*` binding remains; and both
file invariants still hold - zero non-colour variables and zero primitives
differ across modes.

**Published by the user** once the reconciliation landed - which covers this
whole pass, not just SegmentedControl: the `Text/Muted` and `Surface/Pale`
value fixes, `Button/Round`'s rewritten description and its ghost variant, and
the `Segment` icon property all went out in the same snapshot.

## Divergences - do not "fix" these

- **The dark ground is `--ui-surface-inverse` on both sides now.** Figma drew
  it on the `Neutral/800` PRIMITIVE, which cannot follow the theme - the sixth
  time this file has had to record that fix, after ButtonRound's pressed state
  (`Color/Ink`), Pill's ground (`Color/White`), NavSlat's icons, `Input-Text`'s
  rule and Checkbox's box. Reconciled in Figma rather than copied into code, so
  this is no longer a divergence; kept here because the shape of the mistake
  keeps recurring and `Neutral/800` is the obvious thing to reach for.
- **The focus ring is INSET** (`outline-offset: -2px`), where every other ring
  in this library is offset outward by 2. A segment sits 4px inside the track's
  pill, so an outset ring is clipped by the thing it lives in. Figma models no
  focus state, so this is code-only, matching Button and Tabs.
- **The icon takes `currentColor`**, where Tabs gives its icon a colour of its
  own. In Tabs an idle tab is a dark label beside a muted glyph, so the two
  cannot inherit together; here the icon and label are one object and move
  together through every state.
- **The example frames are not modelled.** `Segmented Control - MD` and
  `- LG` are loose groups posing three hand-placed segments, and their spacing
  disagrees with the set (6 and 8 against the track's 4). The SET is the spec -
  same call as Card's 350x200 frame.
- **No `xl`.** A step exists when something uses one, the rule that cut
  the type scale from six to four. `sm` met that rule when NextJob's
  section-header sort toggle wanted a short track.
- **The segment has a height; Figma's hugs.** See above - the two agree at
  40 / 30 / 26 as long as the segment carries a glyph, and deliberately
  disagree when it does not.
- **`tone` is a prop on the track; Figma's `Color` is a variant axis.** The
  same shape `variant` already has, and for a weaker reason: an axis is simply
  how Figma says a choice. No open question here.

## What 0.42.0 changed, and what is still owed in Figma

The respec was drawn in Figma first and fetched, so this was a fetch rather
than an independent edit. Padding, icon size and icon gap all moved, MD and SM
stand 30 and 26 where they stood 32 and 24, and the track grew its `Color`
axis. What did NOT move: the type scale, both radii, the 4px inset, the 4px
gap between segments, the two selected grounds, and every keyboard and ARIA
behaviour.

Three defects came back with it, all Figma-side. The White variants had kept
Figma's placeholder `Size4/5/6` names; those are renamed `LG/MD/SM` in the file
and both sets' descriptions, which still gave the pre-0.42.0 geometry, are
rewritten (divergence #32, now resolved - **the sets read `CHANGED` and need
publishing**, which is UI-only). Two stay open in `docs/divergences.md`: the
drawn geometry is raw while the `Segmented Size/*` variables still hold the old
numbers (#33), and the icon stroke binds the `Color/White` primitive in
`Active` and `Dark` (#34). Neither changes a rendered value; both make the file
lie to the next reader, so **do not read this component's geometry off its
variables** until #33 is closed.
