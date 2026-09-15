# SegmentedControl

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

One choice from a short, fixed set - a filter row, a sort order. Figma: the
`SegmentedTrack` set (558:15011) holding the `Segment` set (555:14966), both
carrying a `Size` axis of LG | MD | SM.

```tsx
<SegmentedControl aria-label="Sort order">
  <Segment selected={sort === "newest"} onClick={() => setSort("newest")}>Newest</Segment>
  <Segment selected={sort === "az"} onClick={() => setSort("az")}>A-Z</Segment>
</SegmentedControl>
```

    track    Surface/Pale pill, radius 99, 4 inset, 4 between segments
    segment  radius 99, icon gap 8
    LG       segment 40 on 14/20, padding-x 16, so the track stands 48
    MD       segment 32 on 12/16, padding-x 12, so the track stands 40
    SM       segment 24 on 10/12, padding-x 8, so the track stands 32

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
track's own pale pill. Hovering one changes the LABEL and nothing else.

That is not an inference: Figma draws the `Hover` cell with its fill switched
OFF at both sizes, and the `Inactive` cell likewise. Reading the fills without
checking `visible` makes Inactive look like a brand-red chip with near-black
text on it, and MD Hover look like red text on red. Both are hidden paints.
**Check `visible` before believing a fill.**

## The track is not given a height

48 and 40 are derived - 4 + the segment + 4. Declaring a track height as well
would be two numbers for one measurement, and they would disagree the moment
the segment moved. The segment itself takes `height` plus `padding-inline`,
never `padding-block`: the same decomposition Button uses, for the same reason.

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
- **Both sets were given descriptions.** They were empty, and a description is
  the surface every `get_design_context` returns.

- **`Icon?` and `SegmentIcon` were added to the set**, the same boolean +
  instance-swap shape Button carries. Deliberately NOT a variant axis: that is
  what once doubled Button's set to 96 and was reverted, and the note is under
  "Icons: two slots, not a position enum". It defaults OFF so existing
  instances do not sprout a glyph, and the icon's stroke binds the same
  variable as the label in every state - what the code gets for free from
  `currentColor`. Sized to the LINE BOX (LG 20, MD 16), matching the CSS.
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
  section-header sort toggle wanted a 32 track.
