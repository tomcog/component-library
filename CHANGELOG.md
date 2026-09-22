# Changelog

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

Newest first. Apps pin a git tag (`github:tomcog/component-library#vX.Y.Z`), so read
every entry between an app's current ref and the one it is moving to - token renames
fail silently rather than erroring. Versions 0.9.0 -> 0.21.0 were not written up here;
`git log` has them.

**0.52.0 -> 0.53.0** - SegmentedControl: hover has no ground again, reverting 0.51.0.

    .segment:not(.selected):hover   background removed; label and glyph stay --ui-action

Figma's `Hover` cell has its fill switched OFF at all four sizes again, so the track shows
through and the only ground in the control is the selected segment's. `--ui-segmented-bg-hover`,
added in 0.51.0, is removed with it - nothing reads it now, and a token that does nothing is
how the next reader gets a wrong idea confidently.

**This is the second flip in one day**, and both releases matched the drawing at the time:
0.51.0 added the ground when the cell's fill was visible, 0.53.0 removes it now that it is
not. The `Action/Lighter` paint is still sitting in the cell either way, which is exactly what
makes the state easy to misread.

If you are moving an app between 0.50.0 and here, the net effect is nil - hover is label-only
in both. Only 0.51.0 and 0.52.0 drew the tint.

The lesson is recorded in the component doc, the module CSS and the Figma description, all
three now saying the same thing: **read `visible` on the fill before changing the hover rule**,
and trust neither the prose nor a remembered look at the cell. A fill that becomes visible is
as easy to miss as one that never was.

**0.51.0 -> 0.52.0** - Toolbar: the gray bar holds WHITE tracks.

    tone="gray"    bar --ui-surface-sunken, tracks --ui-surface-raised   (tracks were pale)
    tone="white"   bar --ui-surface-raised, tracks --ui-surface-pale     (unchanged)

The tracks sit *against* the bar rather than with it, and that is a relationship rather than
two colours: the track is always the step that lifts off the bar. Only the gray case was
wrong - a white bar's pale tracks are already `SegmentedControl`'s default.

The bar sets it, not the consumer. Nesting a `SegmentedControl` in a `Toolbar` should not
require remembering to flip its tone, so `.gray` declares `--ui-segmented-track-bg` on itself
and the tracks inherit it. A control given an explicit `tone="white"` is untouched, reading
`--ui-segmented-track-white-bg` instead. New hook: `--ui-toolbar-track-bg`.

**0.50.0 -> 0.51.0** - SegmentedControl: hovering an idle segment lights a ground.

    .segment:not(.selected):hover   background: --ui-action-lighter   (was: nothing)

The label and glyph already turned to the action colour; now a pale tint comes up under
them too. Figma draws the `Hover` cell with a visible `Action/Lighter` fill at all four
sizes, and the code drew no ground at all.

**This was correct when it was written and stopped being correct.** The `Hover` cell's fill
used to be switched OFF, so the drawing said the label changed and nothing else - and the
code's comment argued the case, that a second ground inside the track would read as two
things chosen. The fill is visible now. The tint is pale enough to read as "the pointer is
here" rather than as an answer, and full strength still belongs to the selected segment
alone.

New override hook: `--ui-segmented-bg-hover`. It derives `--ui-action-lighter` at the
element - `color-mix(in srgb, var(--ui-action) 15%, var(--ui-white))` - never on `:root`,
the same expression `ButtonRound` and `NavRail` use, because a var() inside a custom
property freezes where it is declared and a scoped `--ui-action` could not move it.

The hidden-fill trap is worth restating with the opposite sign: `Off` still carries an
invisible `Action/Base` paint, so reading fills without checking `visible` misreads it - but
a fill that *became* visible is just as easy to miss as one that never was. The component
doc, the playground note and the Figma description all said Hover had no ground; all three
are corrected.

**0.49.0 -> 0.50.0** - BREAKING: the two colour roles are renamed for what they are for.

    --ui-primary          -> --ui-action
    --ui-primary-lighter  -> --ui-action-lighter
    --ui-text-on-primary  -> --ui-text-on-action
    --ui-accent           -> --ui-brand
    --ui-accent-lighter   -> --ui-brand-lighter
    --ui-text-on-accent   -> --ui-text-on-brand

**No value changes anywhere.** Both still default to `--ui-tc-red`; every component renders
the colour it did before. This is a rename and nothing else.

`primary` said where a colour came in a hierarchy and nothing about what it is for. **BRAND is
what the app looks like; ACTION is what its controls do.** This library is red for both,
because its brand is red and its buttons are too. A plant app would be green because it is
about plants, and could still put its buttons in blue - one brand, a different action colour,
no conflict. The division of labour already existed; the names now say it.

**Scope is strictly the colour tokens.** These are deliberately UNCHANGED, because `primary`
on a component means emphasis, which is a different question:

- `ButtonVariant`, `ButtonTone`, `SegmentedControlVariant`, `NavSlatLevel` still take
  `"primary"`.
- `--ui-button-primary-bg` / `-hover` / `-active` / `-text` are named for Button's variant.
- `--ui-font-primary` is the typeface role and has nothing to do with colour.

A find-and-replace on the word "primary" would have broken all three groups. The four literal
strings above are safe precisely because none of those names contains them.

**Migrating an app:** replace the six strings. Nothing errors if you miss one - a custom
property that no longer resolves falls back or renders wrong silently - so grep for
`--ui-primary` and `--ui-accent` and expect zero hits. NextJob (94), NextDraw (228) and
PlantPal (4) were migrated in this release.

**Figma** carries the same names: `Primary/*` -> `Action/*`, `Accent/Base` -> `Brand/Base`,
`Text/OnPrimary` -> `Text/OnAction`, `Text/OnAccent` -> `Text/OnBrand`. A Figma rename keeps
the variable's ID, so every binding survived untouched. `Button/Primary/*` is a component
token named for Button's variant and was left alone.

`docs/theming.md` used to say "don't reintroduce `--ui-brand` in either tier" - an earlier
version had used that name for the *overridable CTA* token, which asked consumers to
"override the brand colour with your brand colour". That objection was to `brand` naming the
CONTROL role. Now that it names the app's own aesthetic, overriding the brand colour with
your brand colour is exactly what it is for. The note is rewritten rather than deleted.

**0.48.0 -> 0.49.0** - New component: Toolbar.

A rounded bar holding several `SegmentedControl`s - undo/redo beside the view beside the zoom
target. Figma: the `Toolbars` frame (772:1200).

```tsx
<Toolbar aria-label="Drawing tools">
  <SegmentedControl size="sm" aria-label="History">…</SegmentedControl>
  <SegmentedControl size="sm" variant="dark" aria-label="View">…</SegmentedControl>
</Toolbar>
```

**It owns a ground, a 4px inset and the gap between its controls, and nothing else.** Every
question of what a segment shows already belongs to `Segment`, so the three configurations -
icon + label, label alone, and icon alone via `hideLabel` - need nothing from Toolbar: a bar
of icon-only controls and a bar of labelled ones are the same Toolbar with different children.
Each control likewise picks its own selected ground with the existing `variant`, so one bar
can mix brand and dark, which is what Figma draws.

The gap is the point: **16 between controls against 4 between segments**. Segments crowd
because they answer one question, controls stand apart because they answer several.

`tone="gray" | "white"` names the BAR's own ground, matching `SegmentedControl`'s prop.
Figma's layers are named for the page instead, so the two read inverted - `Toolbar on white`
is the gray bar. Height is derived, so a bar of SM controls stands 32 and a bar of LG ones 48.

`role="group"`, not `role="toolbar"`: the ARIA toolbar pattern claims the arrow keys and every
`SegmentedControl` inside has already bound them. Tab moves between controls.

New tokens: `--ui-toolbar-{radius,padding,gap}` and the override hooks
`--ui-toolbar-bg` / `--ui-toolbar-white-bg`.

**New semantic: `--ui-surface-sunken`** (26th in the tier) - a ground a step below the page,
for a bar things sit down inside. `--ui-neutral-150` in light; in dark it inverts and lifts
one step ABOVE `--ui-surface-raised`, because a bar cannot sink out of sight on a dark ground.
That inversion is why it is a semantic rather than a neutral read directly.

Figma draws the bar in an unbound `#e1e3e2` - four points off its own `Neutral/200`, with a
2/255 green cast where this library's ramp is strictly hueless. Matched to the nearest colour
the library already has rather than mirrored; see `docs/components/Toolbar.md`.

**0.47.0 -> 0.48.0** - SegmentedControl XL takes Type/Label XL's 24 line height.

**0.46.0 -> 0.47.0** - The control ladder gets tokens, and SegmentedControl joins it with a new `xl`.

**New: `--ui-control-{xl,lg,md,sm}-height`** (48/40/32/24) and
**`--ui-control-{xl,lg,md,sm}-icon-size`** (28/24/20/16). `Button`, `ButtonRound`,
`ConfirmButton` and `SegmentedControl` now alias them rather than each restating the numbers.
For the three buttons this is a **pure refactor with no rendered change** - every value
resolves as before. It means one place to change a step, and a component can no longer leave
the ladder quietly, which is how SegmentedControl spent five releases at 44/34/26.

Two icon ladders exist and the distinction is now written down: `--ui-control-*-icon-size` is
the glyph sized off the CONTROL, where the box is the subject (ButtonRound, SegmentedControl).
`Button`'s icon is sized off the TYPE - its line box, 24/20/16/12 - so glyph and label sit on
one optical line, and those stay literals deliberately. They differ from LG down, so picking
the wrong one is visible.

**SegmentedControl is fetched onto the ladder and gains `size="xl"`.**

    XL   height 48   padding 10   icon 28   icon gap 10   track gap 8   type 18/24
    LG   height 40   padding 8    icon 24   icon gap 8    track gap 8   type 14/20
    MD   height 32   padding 6    icon 20   icon gap 6    track gap 6   type 12/16
    SM   height 24   padding 4    icon 16   icon gap 4    track gap 4   type 10/12

LG/MD/SM all move (44/34/26 -> 40/32/24), the tracks with them. **This is the last of the
height changes** - the component is now on the same ladder as everything else, so a segmented
control in a fixed row finally lines up with the buttons beside it. That was the original
complaint behind NextDraw's six SM controls stepping 2px against their neighbours; they now
match at 24.

An **icon-only segment is a perfect circle, pixel-identical to a `ButtonRound`** at the same
step - same box, same glyph, both reading `--ui-control-*`. Intentional. It does NOT merge the
two components: one is a radio in a group and the other an independent action, and they say
completely different things to a screen reader. The playground's `vs ButtonRound` row puts
them side by side so a future divergence shows up by eye.

Every type step aliases `Type/Label`, XL included: the set drew 18/20 and 18/24 is correct, so
the code takes the scale and the drawing is corrected to match. No visible change - the height
is the icon's, not the label's, and a single centred line sits in the same place either way.

**Pushed back to Figma in the same session**, so the two sides agree for the first time since
0.41.0. Twenty-one geometry variables created and six repointed, each carrying its `--ui-*`
name as Dev Mode code syntax; all sixteen `Segment` variants bind padding, gap, icon size and
type; `Segmented/Track Gap` and `Segmented/Icon Gap` were deleted, having become one number
where the component needs four; `SegmentedTrack` gained its XL cells and two stale poses were
corrected. A `Control/*/Height` and `/Icon Size` tier mirrors the code's ladder. Closes
divergences #33, #39, #40 and #41.

Still open and needing a decision: three superseded worked frames remain on the page under the
same layer names as their replacements (#38 - deleting nodes you may be working in is yours to
confirm), the icon stroke still binds the `Color/White` primitive in Active and Dark (#34), and
no icon-only segment is posed (#36). **Both sets read `CHANGED` and need publishing.**

**0.45.0 -> 0.46.0** - Checkbox, Tabs and InputText read the type scale instead of repeating it.

**No rendered change.** Eight tokens that held a raw number equal to a Type/Label step now
alias that step: Checkbox's three font sizes and its LG line height, Tabs' two font sizes and
its XL line height, and InputText MD's font size. Every one resolves to exactly the value it
did before - verified against the rendered playground, not just the build.

What changes is what happens when the scale MOVES. Button, SegmentedControl, Pill and Tag
already followed `--ui-type-label-*`; Checkbox, Tabs and InputText did not, because their
numbers agreed by coincidence rather than by construction. An app retuning
`--ui-type-label-lg-font-size` used to move four components and leave two behind. It now
moves all six.

Four line heights are genuinely off the scale and stay raw, each now marked `OFF-SCALE` in
`tokens.css` with the reason and what the scale says, so intent is distinguishable from drift:
Checkbox XL (18/20 against Label XL's 18/24), Checkbox MD and InputText MD (both 12/18 against
12/16), and Tabs LG (14/21, which is what holds the strip at 32 tall).

`CLAUDE.md` gains the rule this closes - never write a scale number out by hand - and, newly
written down, **the size ladder**: `xl` 48, `lg` 40, `md` 32, `sm` 24, one height and one
label size per step across every component, so a UI pattern built at one size lines up without
anyone checking. `Button`, `ButtonRound` and `ConfirmButton` hold it today.

It also records the one component family that does NOT: `InputText` draws `lg` at 32 and `md`
at 24 - one step short at both - and `InputSelect` and `InputTextarea` alias its size type, so
an LG field beside an LG button steps by 8px. Unchanged here; it needs a decision on whether
the heights move or the steps are renamed, and the name gives no warning today.

**0.44.0 -> 0.45.0** - SegmentedControl: the segment's padding is uniform on all four sides.

10 / 8 / 6, the same number the padding-x already held, so the vertical padding comes UP to
meet the horizontal rather than the other way round. Heights follow: every one is padding +
the icon + padding.

    --ui-segmented-lg-height   36px -> 44px
    --ui-segmented-md-height   30px -> 34px
    --ui-segmented-sm-height   22px -> 26px   (back where 0.43.0 had it, by a different route)

The tracks stand the same, the inset being zero. **This is the fourth height in four
releases** (LG 48 -> 40 -> 36 -> 44); anything sized against a previous ref should be
measured against this one rather than diffed.

No token renamed or added. `--ui-segmented-*-padding-x` keeps its name although Figma now
draws the same value on all four sides: the code still declares it horizontally only and lets
the height carry the vertical half, which is Button's decomposition, and a token called
`-padding` that reached one axis would be the misleading half of that trade.

One consequence worth knowing: an **icon-only segment is now square** - 44, 34, 26 - because
the padding is uniform and the icon is square. Nothing decided that, and Figma still poses no
icon-only segment (#36).

**0.43.0 -> 0.44.0** - SegmentedControl: `hideLabel` draws the icon alone, the glyph sits back from its label, and LG comes down to 36.

Three changes from the same Figma pass.

**`hideLabel` on `Segment`** - Figma's `Label?` boolean, the icon-only segment. Pass the
label as `children` as usual and set the flag: the text goes into `visuallyHidden`, so it
is still the name a screen reader announces and still what the option is called inside the
radio group. Leaving `children` out entirely also works and warns in dev unless you pass
`aria-label`, `aria-labelledby` or `title` - a row of unnamed glyphs is a control nobody
can use. The segment keeps its height and hugs to padding + icon: 44x36 at LG, 34x30 at
MD, 26x22 at SM.

**The icon's opacity is now conditional.** Beside a label it draws at
`--ui-segmented-icon-opacity` (**0.65**) so the label leads; alone it draws at
`--ui-segmented-icon-only-opacity` (**1**), because then the glyph is the whole message and
a faded one reads as disabled. Keyed off whether the label is SHOWN, so `hideLabel` counts
as alone. **Existing icon+label segments change appearance** - the glyph is muted where it
was solid. Opacity rather than a muted colour, since the glyph is `currentColor` and has to
sit back across four grounds.

**The padding-y comes down at both ends**: LG 8 -> 6 and SM 6 -> 4, so those segments and
their tracks stand **36** and **22**. Every height is padding-y + the icon + padding-y -
6+24+6, 6+18+6, 4+14+4. That is the third height this component has had in three releases
(LG 48 -> 40 -> 36, SM 32 -> 26 -> 22); measure against this ref rather than diffing from
the last one.

**The gap between segments is per size**, stepping 8 / 6 / 4 where one shared value served
all three. At SM a flat 8 was a groove as wide as LG's between segments a third the width.
Note there are now two gaps per size and they are different objects: `*-track-gap`
separates two segments, `*-icon-gap` separates a glyph from its label inside one.

    --ui-segmented-lg-height          40px -> 36px
    --ui-segmented-sm-height          26px -> 22px
    --ui-segmented-track-gap          RENAMED -> --ui-segmented-{lg,md,sm}-track-gap
                                      8px -> 8px / 6px / 4px
    --ui-segmented-icon-opacity       new, 0.65
    --ui-segmented-icon-only-opacity  new, 1

`--ui-segmented-track-gap` is the only rename; nothing in `~/Sites` sets it, and an app that
does gets the default gaps back rather than an error. Three Figma items recorded. LG's `Active` and `Dark` cells drew the glyph at full opacity
where the other ten were 0.65 (#35) - **closed just after this release**, along with a
doubling defect it was hiding: some cells carried the 0.65 on both the icon instance and its
paths, which composes to 0.42. All twelve now carry it on the container alone, which is where
the code has always put it, so no code change followed. No
icon-only segment is posed anywhere in the file, so the code's 44x36 is derived rather than
drawn (#36). The per-size track gap went **code-first by the rule** - spacing is
token-shaped, so code leads - and was pushed to the three worked frames in the same session,
so that half is already closed (#37).

**0.42.0 -> 0.43.0** - SegmentedControl: the track's inset is gone and its gap is 8.

The other half of the 0.42.0 respec, missed first time round. Figma draws the selected
pill **flush with the track's ends** (frames 756:478 / 485 / 498, one per size): the 4px
inset is zero, and the gap between segments doubles 4 -> 8, so the track's ground is seen
only between the segments and behind the idle ones rather than as a ring around the
chosen one.

    --ui-segmented-track-padding   4px -> 0px
    --ui-segmented-track-gap       4px -> 8px

**The track's height changes with it**, and this is the part to check: it is derived, so
with no inset it is now exactly the segment - **40 / 30 / 26** where 0.42.0 gave 48 / 38 /
34 and 0.41.0 gave 48 / 40 / 32. A control in a fixed-height row has moved twice; measure
it once against this ref rather than against 0.42.0. Nothing else moved: same sizes, same
type, same radii, same grounds, same keyboard.

No token renamed or removed. `--ui-segmented-track-padding` is kept at zero rather than
deleted — it is still what an app would set to put the ring back.

Why it was missed: `SegmentedTrack` (558:15011) is six empty shells with `layoutMode:
"NONE"`, so the `padding: 4` / `gap: 4` bound on them is inert, and the set was read as
the spec over the worked frames. The set's own poses stand 40 / 30 / 26 — the segment
height, not segment + 8 — which was the tell. `docs/components/SegmentedControl.md` has
it under "Read the worked frames, not the track set", and divergence #33 now covers the
two inert track variables.

**0.41.0 -> 0.42.0** - SegmentedControl: a respec of the segment's insides, and a `tone` on the track.

Fetched from Figma, where both sets were redrawn (`Segment` 555:14966, `SegmentedTrack`
558:15011). Every number that moved:

    LG   padding-x 16 -> 10   icon 20 -> 24   icon gap 8 -> 6   height 40 (unchanged)
    MD   padding-x 12 ->  8   icon 16 -> 18   icon gap 8 -> 6   height  32 -> 30
    SM   padding-x  8 ->  6   icon 12 -> 14   icon gap 8 -> 4   height  24 -> 26

Derived from those, the track now stands **48 / 38 / 34** where it stood 48 / 40 / 32.
A control in a fixed-height row may need its neighbour re-checked at MD and SM. The type
scale, both radii, the 4px inset, the 4px gap between segments, the two selected grounds
and every keyboard and ARIA behaviour are unchanged.

The icon is the part to know about: it used to be sized off the line box, and Figma now
draws it deliberately **larger** than the type. It has `--ui-segmented-{lg,md,sm}-icon-size`
of its own, and the segment keeps an explicit height so a track can mix segments with and
without glyphs without its row stepping.

**New: `tone="gray" | "white"` on `SegmentedControl`**, defaulting to `gray` - Figma's new
`Color` axis on the track. `gray` is `--ui-surface-pale` as before; `white` is
`--ui-surface-raised`, for the case where a pale track disappears into a pale page. Both
are semantics, so `white` is the raised near-black in dark mode.

**Renamed: `--ui-segmented-icon-gap` -> `--ui-segmented-lg-icon-gap`,
`--ui-segmented-md-icon-gap`, `--ui-segmented-sm-icon-gap`.** One value could not say
6 / 6 / 4. Nothing in `~/Sites` overrides the old name; an app that does gets no error,
just the default gaps back.

New tokens: `--ui-segmented-{lg,md,sm}-icon-size`, the three `-icon-gap` above, and
`--ui-segmented-track-white-bg`. `--ui-segmented-track-bg` keeps its name and its
meaning - the **gray** track's ground - so NextJob's dashboard override still works. That
override is what `tone="white"` now says properly, and the app can drop it whenever.

Three Figma-side defects came back with the fetch. The White track variants were named
`Size4/5/6` and are renamed `LG/MD/SM` in the file, along with both sets' descriptions,
which still gave the pre-respec geometry (#32, resolved). Two stay open in
`docs/divergences.md`: the drawn geometry is raw while the `Segmented Size/*` variables
still hold the pre-respec numbers (#33), and the icon stroke binds the `Color/White`
primitive in `Active` and `Dark` (#34). **Both sets read `CHANGED` and need publishing**,
which is UI-only.

**0.40.0 -> 0.41.0** - ConfirmButton: `tone="safety"` rests on a darker glyph.

The filled safety button drew its icon in `--ui-safety` on `--ui-safety-lighter` - two
light greens together, which made the glyph a shape to look for rather than read. It is
`--ui-safety-darker` (#378f34) now. Danger is untouched: a red on a pale pink was never
the problem, and moving it for symmetry would cost contrast rather than gain it. Ghost
keeps `--ui-safety`, having no disc to be lost against. No token renamed, and the
existing `--ui-confirm-button-safety-icon` hook still overrides it.

Figma still draws the rest glyph on `Safety/Base`; see `docs/divergences.md`.

**0.39.0 -> 0.40.0** - LayerController: bigger swatch and name, and a swatch that can be struck through.

The swatch goes 12px -> 16px and the name goes Label SM -> Label MD (10px -> 12px), on
the same 12px leading, so the row's height and the number beside it are unchanged
(Figma 719:337). `swatchCut` draws Figma's rule across the swatch (741:386): the colour
shown and cancelled at once, for a colour nothing available can draw - a plotter with no
pen in that ink. It marks a fact about the colour and changes nothing else about the row.

New tokens: `--ui-layer-controller-label-font-size`, `--ui-layer-controller-cut-color`
(white, as Figma draws it) and `--ui-layer-controller-cut-width` (3px). Nothing renamed,
so an app moving to this ref picks up the two size changes and needs no edits.

**0.38.0 -> 0.39.0** - LayerController: a row can leave its grip off.

**0.38.0 -> 0.39.0** - LayerController: `hideHandle` leaves the grip off a row.

For lists whose order is decided elsewhere and only reported here. Until now a row
without `handleProps` still drew a decorative grip, which invites a drag that does
nothing. Nothing changes for existing callers: `hideHandle` defaults to `false`.

**0.37.0 -> 0.38.0** - LayerController: the draw box is a pen nib, not a pencil.

**0.36.0 -> 0.37.0** - LayerController: purpose says what picking a layer means; Correct the 0.36.0 migration note: NextDraw was affected too.

**0.35.0 -> 0.36.0 adds `ConfirmButton`, and renames the `confirm` role to `safety`.**
**Breaking** - two tokens renamed and one prop removed. Read the whole entry
before moving an app's ref.

**New component `ConfirmButton`** - the round button at the end of a decision,
from Figma's `ConfirmButton` set (735:398). `tone="safety" | "danger"`
(required, no default), `variant="filled" | "ghost"`, `size="xl" | "lg" | "md"
| "sm"`, plus the usual `icon`, `asChild` and spread props. Unlike the
`ButtonRound` tones it replaces it is coloured **at rest**, because a
confirmation has to be read before it is pressed. `ConfirmButtonProps`,
`ConfirmButtonTone`, `ConfirmButtonSize` and `ConfirmButtonVariant` are
exported. See `docs/components/ConfirmButton.md`.

**Renamed tokens**, old -> new:

    --ui-confirm          ->  --ui-safety
    --ui-text-on-confirm  ->  --ui-text-on-safety

Both fail silently if an app still sets the old names - the override simply
stops applying. Grep for `ui-confirm` before moving a ref. The rename is
Figma's spelling (`Safety/*`), and it stops `--ui-confirm` and `--ui-danger`
reading as "the confirm one" and "the other one" on the two halves of one
dialog. The `ConfirmButton` component keeps its name: the component *is* the
confirmation, and its tones are its two answers.

**Removed `ButtonRound`'s `tone` prop** (`"primary" | "confirm" | "danger"`)
and the `ButtonRoundTone` type. Figma dropped the `State=Confirm` and
`State=Danger` cells from `Button/Round` (220:11857); code followed, and
`primary` went with them because a one-value enum is not an axis.

**Both apps that used it have been migrated**, in the same release. NextJob
had eight call sites - `CRM`, `OpportunityDetail` (x2), `JobSites`, `Tasks`,
`Companies`, `SmartCapture` (x2) and the `CircleIconButton` wrapper that
forwarded `tone`. NextDraw had one, `FileSection`'s clear-the-drawing X, plus
five CSS references to `--ui-confirm`. PlantPal was unaffected.

A grep for `tone=` is not enough to find these - the prop sits on its own line
in most of them. Typecheck the app against the new version; the CSS half will
not show up there at all, so grep `ui-confirm` separately.

The swap is *not* mechanical:

    <ButtonRound tone="confirm" …/>  ->  <ConfirmButton tone="safety" …/>
    <ButtonRound tone="danger"  …/>  ->  <ConfirmButton tone="danger"  …/>

The replacement **rests** in its role colour where the original rested in the
brand, so every migrated button gets louder in its row. Where the button is a
toolbar action rather than the end of a decision, dropping the prop and leaving
a plain `ButtonRound` is the right answer. Decide per call site.

**Four new tokens**, the grounds `ConfirmButton` draws either side of each role:

    --ui-danger-lighter  #f7dce0    --ui-safety-lighter  #cafac8
    --ui-danger-darker   #a31c30    --ui-safety-darker   #378f34

plus the primitives behind them (`--ui-tc-red-lighter|-darker`,
`--ui-tc-green-lighter|-darker`) and twelve `--ui-confirm-button-*` geometry
tokens aliasing `ButtonRound`'s. They alias primitives rather than mixing from
the base, because the tints are hand-drawn and no percentage reproduces them -
so **an app repointing `--ui-danger` or `--ui-safety` should repoint its trio**,
not just the base. A base-only override still renders a coherent button.

`LayerController`'s printer glyph moved from `--ui-confirm` to `--ui-safety`
with no visual change.

**0.34.0 -> 0.35.0 adds `size="md"` to InputText, InputSelect and
InputTextarea** - a 24px field with 12/18 type, 12px icons, a 6px icon gap and
an 8px label, from Figma's `Size=MD` (725:703). `lg` is the default and is the
field as it was. **Minor** - a new optional prop and eight new
`--ui-input-text-md-*` tokens; no token renamed. The unsized
`--ui-input-text-*` tokens stay the LG values, so existing overrides keep
working. `InputTextSize`, `InputSelectSize` and `InputTextareaSize` are
exported.

The native `size` attribute is no longer in these three components' prop
types. Nothing passed it (checked NextJob and NextDraw).

NextDraw's `.plotOptions` hand-rolls a compact field through six token
overrides (24px, 12/16, 14px icons). It can move to `size="md"` and drop them;
the line height and icon become 18 and 12, per the design.

Also fixes a pre-existing 1px overflow on date-type inputs at both sizes:
Chrome pads `::-webkit-datetime-edit-fields-wrapper` 1px top and bottom, so
the control stood 2px taller than its line box. The value text does not move.

**0.33.0 -> 0.34.0 adds `swatchProps` to `LayerController`** - pass them and
the colour dot becomes a `<button>`, for NextDraw Studio's pen-colour menu.
Omitted, the dot is the decorative span it was. **Minor** - one new optional
prop. Figma draws no pressed or focus state for the dot; the focus ring is the
library's.

**0.32.0 -> 0.33.0 adds show/hide to `LayerController`** - `visible`
(default `true`), `onVisibleChange` and `hideVisibility` (leaves the eye off,
for NextDraw's Work mode, where only the layer to print matters), drawn from the updated Figma component
(719:567): an eye before the grip, and a hidden state. **Minor** - new props,
defaults unchanged apart from the eye now being drawn on every row, which is
what the file shows. See the LayerController section.

**0.31.0 -> 0.32.0 adds `LayerController`** - one layer of a drawing with a
box that picks the layer to print. Figma: `LayerController` (719:555). Built
for NextDraw Studio's Layers card. **Minor** - a new component, nothing else
moved. See the LayerController section.

**0.30.0 -> 0.31.0 adds `hideLabel` to every input control** - InputText,
InputSelect, InputTextarea and Checkbox. Defaults to `false`, so the label
shows and no consumer changes. With `hideLabel` the `label` is still rendered
and still names the control (`htmlFor`, or Checkbox's wrapping `<label>`); it is
only removed from view by `src/internal/visuallyHidden.module.css`, one shared
class rather than four copies. Prefer `label="…" hideLabel` over `aria-label`
when a design drops the visible label: the name stays in the same prop it would
otherwise occupy, and turning the label back on is one boolean. Requested for
NextDraw Studio, which hides the labels of its paper-size and drawing-tool
selects.

The hidden label is out of flow, so the field closes up to its own height
(InputSelect 46 -> 32 measured in the playground) and Checkbox's slot-to-label
`gap` leaves no hole (the root measured exactly the slot, 24/20/16).
Named `hideLabel`, not `showLabel`, so the default is the absent boolean
rather than `showLabel={false}` - the same shape as `autoResize` and `loading`.

**Minor, not patch** - a new prop on four public components. **Figma has no
counterpart yet**: see Open divergences #24.

**0.30.0 also adds SegmentedControl `size="sm"`** - a 24px segment on the
Label SM step (10/12), padding-x 8, so the track stands 32. Purely additive: a
third value on an existing prop and two new tokens, `--ui-segmented-sm-height`
and `--ui-segmented-sm-padding-x`. Added for NextJob's section-header sort
toggle. Figma carries it too: `Segment` has `Size=SM` in all four states (icon
12, padding-y 6), `SegmentedTrack`'s unfinished `Size=Size3` variant was renamed
`Size=SM`, and `Segmented Size/SM/Height` and `/Padding X` exist in both modes
with their `--ui-*` code syntax. Not yet published from Figma.

**0.29.0 -> 0.30.0 tightens Button's padding at three of its four sizes.**

    --ui-button-xl-padding-x   24 -> 16
    --ui-button-lg-padding-x   16 -> 12
    --ui-button-md-padding-x   12 -> 10
    --ui-button-sm-padding-x    8     unchanged

The ramp goes 24/16/12/8 -> **16/12/10/8**. Heights, gaps, radii and type did
not move; the buttons are narrower, not shorter.

**Minor, not patch** - no API moved, but XL, LG and MD buttons in every
consuming app get narrower, which is not what a patch should do. **MD is the
one to check first**: it is the most-used size in NextJob (14 of 34 call sites
against 7 large), so this is felt there more than the XL and LG changes are.

**This one went Figma -> code**, against the direction rule, because the user
had already made the change on the canvas. Padding is token-shaped, so the rule
says code first; what actually happened is the documented fetch exception.

**The edit had been made by hand, so it arrived as RAW values that bound
nothing** - the defect `Pill/Padding X` was created to close, here on Button.
`Button Size/XL/Padding X` and `-LG-` still held the old 24 and 16 while all 22
XL and 20 LG variants carried a raw 16 and 12 binding neither. Repaired in the
same session at the user's instruction: both variables set to the new values in
Light *and* Dark, then rebound across all 42 variants. **A no-op on screen** -
the raw values already equalled the targets - which is what makes it safe to do
in one pass.

**MD came from the audit, not from the brief**, and it is the reason to run one.
Walking all 82 variants found MD split - 16 cells at a raw 10 and 4 bound at 12
- and the 10 turned out to be the intended value, so the code token and the 4
bound Primary cells were the wrong ones. See resolved divergence #23; the
sequence there is worth reading, because binding all 20 first is what reduced
the value change to a single variable edit that moved every MD cell at once.

Verified by measuring the rendered playground, not off the build: 48/40/32/24
tall with padding 16/12/10/8, radius 4, type 18/14/12/10, and each size's width
within a pixel of the matching Figma variant (168.15 vs 169, 131.57 vs 132,
112.52 vs 113, 89.35 vs 89). Loading widths still match default widths exactly
at all four sizes, which is the invariant the `visibility: hidden` content
wrapper exists to hold. On the Figma side, all 82 variants bind their
`Button Size/*/Padding X`, one padding and one width per size, and both file
invariants hold - zero non-colour variables and zero colour primitives differ
across modes.

**0.28.2 -> 0.29.0 lowers Float 1 so the two elevations read as two heights.**
`--ui-shadow-float-1` goes from `0 6px 18px / 0 0 6px` to `0 2px 6px / 0 0 2px`.
The old values shared an 18px blur and differed only by half an offset, so
against Float 2 the step barely registered. The y-offset separation goes from
2x to 6x.

Float 1 was lowered rather than Float 2 raised: only Card reads float-1,
whereas float-2 also draws InputSelect's menu.

**The pairing that prompted this no longer exists.** PlantPal's plant grid was
`float1` at rest and `float2` on hover, which is what made the two steps'
similarity obvious; it has since settled on a flat `float2` with no hover, so
nothing consumes float-1 today. The value stands on its own - two elevation
steps that differ only by half an offset are not two steps - but do not read
the original pairing as a live requirement, and do not assume a consumer would
notice if float-1 moved again.

**Minor, not patch** - nothing about the API moved, but every `Card
variant="float1"` in every consuming app changes appearance, which is not
what a patch should do.

Figma was synced afterwards - see the Card section. Token-shaped changes go
code-first, and the sync is its own pass.

**0.28.1 -> 0.28.2 stops aligning a menu that does not fit.** Chrome does not
shrink an oversized picker - it pins it to a viewport edge and lets the rest
hang off - so shifting a long list up by `index * row` only buries more of it.
NextJob has a 165-option company select where aligning cut the visible rows
from ~31 to ~12.

The component now withholds `data-ui-picker-aligned` when
`options.length * row > innerHeight`, so an oversized menu falls back to
Chrome's own placement, which shows the most rows. The row height is read
through the same fallback chain the CSS uses, so an app that retunes either
token is measured on its own terms.

**The overflow itself is NOT ours and predates all of this** - measured with
the rule switched off, that menu is 5290px tall in a 1001px viewport either
way. Alignment only moved where the overflow sat. Worth knowing before anyone
"fixes" the fallback expecting the long list to behave.

**0.28.0 -> 0.28.1 fixes the half of that alignment which was missing.**
0.28.0 lined the chosen row up with the field only when the menu opened
DOWNWARD. Chrome opens the picker above the field as readily as below it - its
UA sheet gives `::picker(select)` a `position-try-fallbacks` of
`start span-end, end span-start, start span-start` ordered by
`most-block-size`, so a select low in the viewport flips upward - and in that
case the menu landed a full constant term (31px at LG) out.

**It reproduced only where the select sat low**, which is why the playground
looked perfect and NextJob's Add Job dialog did not: the first select in that
dialog was pixel-exact and the third, 300px further down, was not. A fix
verified on one instance is not verified.

`margin-block-end` is now set alongside `margin-block-start`, and only the one
facing the anchor applies - so CSS never has to ask which way Chrome went. The
flipped case measures from the menu's far edge, so it needs the option COUNT as
well as the index, and the component now publishes
`--ui-input-select-picker-count` beside `-picker-index`.

Purely a fix; no token renamed or removed.

**0.27.0 -> 0.28.0 aligns InputSelect's open menu, and adds Tag.** The
picker now opens with the CHOSEN row over the field's own value, the way a
macOS popup button does, instead of dropping below the field. `Tag` is the
small label pill from Figma's `Tag` set (685:584).

**Breaking for one token, which nobody overrides** (checked: NextJob overrides
no `--ui-input-select-*` at all):

    --ui-input-select-option-padding   ->  --ui-input-select-option-padding-x
                                           + --ui-input-select-option-height

A menu row is now a height rather than padding plus leading, because the
alignment rule multiplies the row height by the selected index and a padding
shorthand cannot be used in that arithmetic. The rendered row is 32 either way.

Everything else is additive: a new component, its `--ui-tag-*` tokens, and a
`data-ui-picker-aligned` attribute the select adds to itself.

**0.26.1 -> 0.27.0 rebuilds Checkbox's glyph from the Figma artwork.** Four
filled paths exported out of the set - `lucide/square`, `lucide/square-check`,
`lucide/square-checked`, `lucide/square-filled` - replacing a hand-trace of
lucide's `square` plus a scaled-up tick. Every path is `currentColor` and none
has a stroke.

**Breaking for anyone overriding six tokens**, which is nobody today (checked:
NextJob uses Checkbox in four places and overrides none of them):

    --ui-checkbox-xl-box-stroke      removed - no stroke to weight
    --ui-checkbox-lg-box-stroke      removed
    --ui-checkbox-md-box-stroke      removed
    --ui-checkbox-tick-stroke        removed
    --ui-checkbox-check-checked      removed - the tick is a knockout, not a paint
    --ui-checkbox-check-disabled     removed
    --ui-checkbox-box-fill-disabled  removed
    --ui-checkbox-box-border-disabled removed

They do not error if left behind - they silently stop applying, the usual
failure mode here. What is left is one colour hook per state: `--ui-checkbox-box`,
`-box-hover`, `-box-checked`, `-box-disabled`.

**One visible change beyond the redraw: disabled is now a solid mid-grey
square** where it was a pale `--ui-surface-disabled` ground carrying a
`--ui-text-disabled` tick. The new checked shape has the tick KNOCKED OUT of a
single path, so the tick is the ground showing through and one shape cannot
carry two colours. Figma binds `Button/Disabled/Label` across the whole glyph,
which is what the code now renders.

**The drawn box also grew about a pixel at each size** - the glyph is inset to
13 of its 16 viewBox where lucide's `square` was 18 of 24, so it reads
16.25 / 13 / 11.375 inside the unchanged 24 / 20 / 16 slot. Slot, glyph and type
tokens did not move.

This was a fetch from Figma, not an independent edit - the documented exception
to "never change both sides in the same session". Verified by rendering the
BUILT stylesheet with the component's real DOM and measuring all 15 cells: glyph
20/16/14, `stroke: none` on every path, the right one or two paths visible per
state, hover previewing tick and label on unchecked only and suppressed on
checked and disabled.

**0.26.0 -> 0.26.1 makes Button's danger rest neutral**, matching ButtonRound.
It shipped for one version recolouring the RESTING appearance too - a danger
ghost rested with a red rule - which put two contracts on one prop name. It now
changes the HOVER and PRESSED pairs only, and at rest a danger button is
indistinguishable from its variant. The focus ring is no longer retinted
either, for the same reason ButtonRound never retints it.

**Breaking only in appearance, and only if you were using it**, which was one
button in NextJob for a few minutes. The trade is now stated where the tone is:
on a palette that splits `--ui-primary` from `--ui-danger`, a Delete RESTS in
the CTA colour and turns red when reached for. That is the cost of one resting
rhythm, and it is the cost ButtonRound already pays.

**0.25.0 -> 0.26.0 gives Button the same `tone`.** `tone="danger"` on whichever
`variant` it is given - see 0.26.1 above for the contract it settled on.

**Purely additive.** A new optional prop defaulting to `primary`, which changes
nothing; no token renamed or removed.

**A tone, not a fifth variant** - this is the shape CLAUDE.md predicted when
ButtonRound got `confirm`: danger cuts ACROSS the variants rather than joining
them, because a destructive action can be loud or quiet and is destructive
either way. As a variant it could only ever be one of them.

It works by setting the component's OWN override hooks on the element rather
than restating any variant's rules, which is what lets one tone recolour all
four. Tertiary is the one that takes it on the LABEL alone: its grey ground is
the variant, and recolouring that would make it a primary in disguise. Tints
are derived from `--ui-danger` with the same mixes the primary and ghost
variants use on `--ui-primary`.

**NextJob's `.deleteBtn` hand-rolled exactly this** - seven declarations
replicating the ghost variant's whole derived-tint scheme in danger - and it
collapses to one prop.

**0.24.0 -> 0.25.0 adds `tone="danger"` to ButtonRound.** The destructive
action - Delete, Discard, Remove - turning the HOVER pair `--ui-danger` /
`--ui-text-on-danger`. Resting and pressed are untouched, exactly as `confirm`
is: a delete button that RESTS red is the loudest thing in its row, which is
backwards.

**Purely additive.** A third value on an existing prop; no token renamed or
removed, and nothing renders differently without it.

It is the first consumer of `--ui-danger`, which resolves to TC Red like
`--ui-primary` today - so the two look identical until an app splits the roles,
which is the whole point of saying `danger`. **Three places in NextJob
hand-roll this** through `--ui-button-round-bg-hover`, and between them use
three different reds for one meaning: the job sheet's Discard
(`--ui-primary`), the task Delete (`--destructive`) and SmartCapture's discard
(`--ui-danger`). Each collapses to one prop once its ref moves.

**0.23.0 -> 0.24.0 adds SegmentedControl.** A pale track holding N options of
which exactly one holds - a filter row, a sort order. `LG | MD`, and a
`variant` of `primary | dark` choosing the selected segment's ground.

**Purely additive.** A new component and its own `--ui-segmented-*` tokens; no
existing token renamed or removed, so an app on 0.23.0 needs no edit to move.

It is a **radiogroup**, which is the point of it existing beside `Pill`. A row
of Pills is N independent toggles that an app happens to keep exclusive; this
says so to a screen reader, and carries the arrow-key pattern that follows.
Anywhere an app draws a row of pills where only one can hold - NextJob's
work-mode filters and its Newest/A-Z sort are both this - should move.

**0.22.1 -> 0.23.0 gives ButtonRound a ghost variant.** `variant="ghost"`
drops the fill and rests as a `--ui-text-muted` glyph; `filled` is the default
and is the button as it was. Figma has drawn `State=Ghost` at all four sizes
for some time - this is the code catching up, not a new design.

**Purely additive.** No token renamed or removed, and nothing renders
differently without the prop, so an app on 0.22.1 needs no edit to move.

Hover and press are NOT declared on it: they fall through to the base rules,
so a ghost fills `--ui-primary` under the pointer exactly as a filled one does.
Disabled is the one code-only piece - it stays unfilled, where the base rule
would paint it `--ui-surface-disabled` and make switching a button off the
thing that gives it a visible disc.

**Four places in NextJob hand-roll this today** through
`--ui-button-round-bg` / `--ui-button-round-icon`: the job sheet's discard and
save pair, both task dialogs' close buttons, and the task delete. Each is two
declarations that collapse to one prop once its ref moves - and the comments
sitting beside them, which say ButtonRound "ships no ghost variant", are now
wrong and should go with them.

**0.22.0 -> 0.22.1 lifts the field's value 2px.**
`--ui-input-text-padding-top` 10 -> 8 and `-padding-bottom` 1 -> 3, so the
value sits 2px higher and the gap to the rule doubles. The field is still 32:
8 + the 20 line box + 3 + the 1px rule.

**InputSelect and InputTextarea read those same two tokens, so all three moved
together** - which is the whole point of sharing them. Moving the select alone
was offered and declined; it would have put a select 2px above a text field
standing next to it, which the playground's own "beside a text field" row
would have shown immediately.

It partly undoes an earlier trim of `-padding-bottom` TO 1, made on the
reasoning that the change "barely showed". It showed at this end: 1px left the
glyphs all but touching the rule.

Pushed to Figma in the same pass, and the padding is now BOUND there rather
than raw - `Input/Padding Top` and `Input/Padding Bottom`, with their
`--ui-*` code syntax, on `Button/Input-Text`'s field frame. It had been a raw
`[10, 4, 1, 4]`, which is the same shape of defect `Pill/Padding X` was created
to close. Verified after: both invariants still hold - zero non-colour
variables and zero primitives differ across modes.

**One sub-pixel divergence is left, and it predates this.** Figma centres the
value in a 21px content box and lands it at 8.5; the code's box is 20 (the
1px rule is inside `border-box`) so it lands at 8. Both moved by exactly 2.
Fixing it means changing how the stroke is counted, not the padding - not
worth it for half a pixel, but don't be surprised by it.

**0.21.0 -> 0.22.0 gives Tabs a size axis.** `<Tabs size="xl">` is 18/24 with
a 20 icon and a 35px strip; `lg` is the default and is the strip as it was.
Only three values differ between the sizes - the gaps, the padding and the
rule are shared - so an XL strip is the same object set larger.

**Breaking for anyone overriding three tokens**, which is nobody today
(checked: NextJob mentions `--ui-tabs-icon-size` in a comment and overrides
none of them):

    --ui-tabs-font-size    -> --ui-tabs-lg-font-size
    --ui-tabs-line-height  -> --ui-tabs-lg-line-height
    --ui-tabs-icon-size    -> --ui-tabs-lg-icon-size

They do not error if left behind - they silently stop applying, the usual
failure mode for a renamed token here.

**The prop is on the STRIP, where Figma's axis is on the item.** A strip is
one size throughout and the rule under it has to be continuous, so a per-tab
size could build a ragged row. Figma repeats the axis on `Tabs/Item` only
because a variant axis is the only way it can say this; that is a modelling
difference, not drift, and it is written into the set's description.

This went Figma-first, per the direction rule for a design-shaped change, and
the code followed in the same session at the user's explicit instruction -
which is the one documented exception to "never change both sides in the same
session", because the second half was a fetch rather than an independent edit.

**0.8.0 -> 0.9.0 adds a type scale and renames Button's largest size.**
Three breaking changes, all small but none silent:

- **The size axis is now two-letter throughout: `"xl" | "lg" | "md" | "sm"`**,
  on both `Button` and `ButtonRound`. Was `jumbo | large | medium | small`.
  TypeScript catches every call site.

  This closes a three-way split that had been sitting there: the prop and the
  CSS module class said `large`, the tokens said `-lg-`, and Figma said
  `Large` — so `.large` hand-mapped to `--ui-button-lg-*`, which is exactly
  the drift-by-hand-map this file warns about elsewhere. All three now agree,
  Figma's variant axis included (`Size = XL | LG | MD | SM`).

  **Blast radius, measured rather than guessed: NextJob only.** It is the one
  `package.json` in `~/Sites` depending on `@tomcoggia/ui`, pinned at
  `#v0.8.0`, with 34 call sites across 24 files — 7 `large`, 14 `medium`, 13
  `small`, and zero `jumbo`. An earlier version of this entry said the rename
  was "a bigger break across four apps"; that was wrong. The four Next.js apps
  named under the `"use client"` banner are the reason for that directive, not
  current consumers. Check before repeating the claim.
- **Pill is 3px taller** (31 -> 34). It moved from 13/17 to 14/20 to sit on
  the same scale step as everything else at that size, and it has no height
  token by design, so height is padding plus leading.
- **`--ui-nav-rail-line-height` means 20, not 32.** The 32 was the slat's
  box, not its leading; it is now `--ui-nav-rail-slat-height`. An app
  overriding the old token to resize the rail must move to the new one. The
  rail renders identically otherwise - verified slat, pipe and pitch.

Additive alongside those: **four `--ui-type-label-*` steps** that every
component's type tokens now alias, and six -> four Figma text styles. An app
that overrides no type tokens needs no edit.

The rename went code-first then to Figma, per the direction rule. Verified
after: all four sizes still render 48/40/32/24 with padding 24/16/12/8, gaps
10/8/8/4, radii 4, type 18/14/12/10; the Figma variants resolve the same
through their bindings, which survived the rename; and neither mode invariant
moved.

**0.7.0 -> 0.8.0 adds LeftRail and NavSlat sub items, and moves NavRail's
geometry.** Not additive: the `NavSlat` set was redrawn in Figma and the code
followed, so **any app already using `NavRail` will see its rail change** -
slats 20 -> 32 tall, gap 14 -> 8, inline padding 12 -> 0, and the icon chip
40 -> 32 (Button/Round Large -> Medium). Nothing renamed, so no theme file
breaks, but the rhythm is visibly different; check a rail after bumping.

It also adds a **14th semantic token**, `--ui-surface-pale`. An app that
mapped the other thirteen keeps working - it silently falls back to the
library's `#f5f5f5`, which is right in light and wrong in dark, so map it
before shipping a dark theme.

**0.6.0 -> 0.7.0 adds Pill and Logo.** Purely additive — no token renamed or
removed, so an app on 0.6.0 needs no theme edits and nothing already rendered
changes.

**0.5.0 -> 0.6.0 makes elevation and ButtonRound's pressed state theme-aware,
and adds ButtonRound.** No token was renamed or removed, so an app on 0.5.0
needs no theme edits. Two values move in dark mode only: the float shadows
deepen to 50% black, and a pressed ButtonRound flips to `--ui-surface-inverse`
instead of staying near-black. ButtonRound's icons also grew (24/20/16 from
22/16/12).

**0.2.0 -> 0.3.0 adds Card and moves colour values.** The greys were neutralised
(`--ui-ink` `#282523` -> `#262626`) and the dark-side neutrals renumbered
(`600/700/800/850` -> `550/650/700/800`) — an app aliasing a primitive by
number would be affected, though none should be. NextJob's
The semantic contract stays at 12 names: `--ui-border-subtle` was added with
Card and removed again when the flat variant lost its rule.

**0.1.x -> 0.2.0 renamed three public tokens.** `--ui-brand` ->
`--ui-primary`, `--ui-text-on-brand` -> `--ui-text-on-primary`, and the
primitive `--ui-red-500` -> `--ui-tc-red`. An app still setting `--ui-brand`
does not error — it silently falls back to the library default, i.e. reverts
to TC Red. Apps pin a tag, so nothing breaks until a ref is bumped: update
the app's theme file in the same commit that moves it to `#v0.2.0`.
NextJob's `src/styles/theme.css` maps this token and needs that edit.
