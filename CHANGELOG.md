# Changelog

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

Newest first. Apps pin a git tag (`github:tomcog/component-library#vX.Y.Z`), so read
every entry between an app's current ref and the one it is moving to - token renames
fail silently rather than erroring. Versions 0.9.0 -> 0.21.0 were not written up here;
`git log` has them.

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
