# Figma sync

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

Reference and hard-won lessons for editing the Figma file. The rules themselves are
summarised in CLAUDE.md; open drift is in `docs/divergences.md`.

## The file, the tools, and how the variables were restructured

Source of truth is the `Button` component set (`135:9598`) in the **component-library** file (key `l0022oDH82HhLclD3s3q9z`; formerly named *iconAtomic Components* — a rename does not change the key), page `Components`. It is edited via the Figma Console MCP Desktop Bridge plugin, which needs Figma Desktop open with the plugin running. The REST token is expired, so `figma-console`'s REST-backed tools (`figma_get_component_for_development`, component images) fail with 403 — use `figma_execute` and `figma_capture_screenshot`, which go through the plugin and need no token.

**For reading, prefer the official Figma MCP server instead** (`get_design_context`, `get_screenshot`, `get_variable_defs`). It is authenticated separately, needs neither the Desktop Bridge nor the expired REST token, and returns the variant matrix, component properties and bound variable values in one call — that is how the Nav spec was read. The Desktop Bridge is still required for *writing*, and is worth the setup only then; it also binds to a fallback port when stale instances hold 9223, so `figma_get_status` reporting "no plugin connected" while the plugin looks open usually means it attached to a different port.

**This paragraph was stale and is corrected here.** It recorded a
reconciliation from before commit `919b801` ("Add a Jumbo size and BottomNav,
and move spacing to base 8"), and neither `jumbo` nor `BottomNav` was ever
written up. Verified against the file: Figma's **Light** mode now matches the
code — heights 48/40/32/24, padding X 24/16/12/8, gaps 10/8/8/4, radii all 4,
font 18/14/12/10 DM Sans **Medium**, line heights 24/20/16/12. The old numbers
this paragraph carried (gaps 6/5/4, radii 4/3/2, font …/9, padding X 14) are
what Figma's **Dark** mode still holds — see Open divergences #11.

Figma's variables were restructured to mirror `tokens.css`: every Button variant now binds to a `Button/*` token which aliases a semantic token which aliases a primitive (e.g. `Button/Tertiary/Hover -> Surface/Muted Hover -> Neutral/350`). Before this, hover/pressed states bound straight to `Brand/Dark` and `Neutral/*`, skipping the component tier — that was the inconsistency that motivated the whole token design. **Don't reintroduce direct primitive bindings on component variants.**

The Nav sets were reconciled the same way later: `Nav/Item` Default and Hover
text had been bound to a variable literally named `"Black"` (`#171717`, quote
characters included) rather than `Text/Default` (`#282523`), and `State=On`
bound straight to the `Color/TC Red` primitive. Both were repointed onto the
semantic tier. `"Black"` itself was left alone — 589 nodes across the file use it, so
changing its value reaches well beyond this library and is the user's call
rather than a side effect of a library change. Fixing its malformed name
costs nothing and is safe either way.

`NavSlat` was reconciled the same way when it was fetched into code. As drawn
it bound four things it should not have, none of which looked wrong on the
canvas because every one resolved to the right colour *in Light*:

    Primary Default icon    Button/Tertiary/Label     -> Text/Default
    Primary Active icon     Color/White               -> Text/OnPrimary
    Secondary Default icon  Button/Secondary/Default  -> Text/Default
    Secondary Hover icon    IconDefault               -> Text/Default
    Secondary Active icon   IconDefault               -> Primary/Base

Three lessons, each already recorded elsewhere and each repeated here:

- **`Button/Tertiary/Label` and `Button/Secondary/Default` are Button's
  component tokens.** Reusing either would have made NavSlat's appearance a
  side effect of Button's - exactly the trap Pill hit, with the very same
  `Button/Secondary/Default`. It reappeared here mid-session, which is a fair
  sign this is the easiest binding in the file to reach for by accident.
- **`Color/White` is a primitive**, so it could not follow the theme - the
  same reason ButtonRound's pressed state was moved off `Color/Ink`.
- **`IconDefault` aliases `Neutral/500` in *both* modes**, so it is frozen
  against the theme, and its name cannot be produced by the transform rule
  (it has no group). It is **not** the same thing as `Text/Muted`, which is
  `Neutral/500` in Light but `Neutral/400` in Dark - so in dark mode the sub
  item icons would have sat at `#737373` while every other muted thing moved
  to `#8c8c8c`. Verified after the fix: they now resolve to `#8c8c8c`.

**A sub item's glyph is a single `Union`, and only its fill paints.** The
three vectors beneath it are the boolean operation's operands and never render
on their own - so reading their bindings tells you nothing about what the icon
looks like, and an early pass here "fixed" them while the colour that actually
showed sat elsewhere. Check `children` before trusting a binding list. They
were set to match the Union anyway, so un-grouping it cannot surprise anyone.

`IconDefault` itself was **left alone** - 4443 nodes across the file bind it,
so it belongs to the other projects sharing this file and repointing it is the
user's call. Only NavSlat's own bindings moved. Likewise `Button/Tertiary/Label`
(38 bindings) and `Color/White` (602) were not touched as variables.

Secondary Active was also internally inconsistent: its icon's `Union` fill was
on `Primary/Base` while the three stroke shapes under it were still on
`IconDefault`. Invisible, because the Union is drawn over them - but it would
have surfaced the moment anyone edited the glyph. Checked that all four nodes
were visible before touching them, per the rule below about not assuming an
unfamiliar node is scaffolding.

The semantic tier was also renamed to match the code's identity/role split:
`Brand/*` -> `Primary/*` and `Text/OnBrand` -> `Text/OnPrimary`,
`TextSecondary` -> `Text/Muted`. `Surface/Raised`, ten `Nav/*` geometry floats
and `Motion/Fast` / `Motion/Base` were added. **`Color/TC Red` already existed
and was not renamed** — it is the Figma counterpart of `--ui-tc-red`, and
`Primary/Base` aliases to it exactly as `--ui-primary` does in code.

## Names need not match, but they must be *derivable*

The two sides keep their own conventions — Figma `Group/Title Case`, CSS
`--ui-kebab-case`. What matters is the tier, the alias target and the value.
But a name that cannot be transformed by rule has to be hand-mapped forever,
and hand-maps are where drift starts — it is how the file ended up with
`Color/Black` at `#282523` and `"Black"` at `#171717`, Button on one and Nav
on the other.

The transform is: lowercase, spaces and `/` to `-`, prefix `--ui-`, drop a
trailing `-base`.

    Color/TC Red          -> --ui-tc-red
    Surface/Muted Hover   -> --ui-surface-muted-hover
    Text/OnPrimary        -> --ui-text-on-primary
    Primary/Base          -> --ui-primary

Three pairs used to break that rule and were fixed by renaming the *Figma*
side: `TextSecondary` -> `Text/Muted`, `Surface/Muted Pressed` ->
`Surface/Muted Active` (CSS is stuck with `active`, the pseudo-class), and
`Color/Black` -> `Color/Ink` (the value `#282523` is not black; Figma keeps a
separate `True Black` at `#000000`). `Color/Ink` had 1209 dependants — a
rename preserves every binding, so this was safe. Don't reintroduce a name
that has to be hand-mapped.

**Only one colour is fixed: `--ui-tc-red`.** Everything else is a value that
can be revised like any other design decision — see the identity/role split
above. An earlier version of this file said `Color/Ink` must "never change its
value". That was not an instruction from the user; it was inferred from the
1209-dependant count and overstated into a rule, and it then sat here
contradicting a legitimate request to revise the palette. The dependant count
is a **blast radius, not a prohibition**: changing Ink recolours most of the
Figma file, so it wants the user out of the file and a deliberate push — which
is a reason to be careful, not a reason to refuse.

Ink has since been neutralised to `#262626` on both sides, which is exactly
the change that rule would have blocked.

## Every variable now carries its `--ui-*` name (Dev Mode code syntax)

Six variables used to have a WEB code syntax set; **95 do now**. A developer
opening any token in Dev Mode is told the CSS custom property the coded
component actually reads — `Surface/Muted Hover` says `var(--ui-surface-muted-hover)`,
`Button Size/XL/Padding X` says `var(--ui-button-xl-padding-x)`.

This is metadata only: it changes no fill, no binding, and nothing renders
differently. It is the cheapest possible defence against the drift this file
keeps suffering, because it puts the code name in front of whoever is about to
diverge from it. **When you add a variable, set its code syntax in the same
breath.**

Four groups are deliberately left without one, and the absence is the signal:

- `Button Size/*/Padding Y` — the code sizes buttons by height, not by
  vertical padding, so there is no token to point at.
- `Primary/Dark`, `Primary/Darker`, and the `Button/{Primary,Secondary,Tertiary,Ghost}/{Hover,Pressed}`
  aliases that read them. Figma models button hover and press as darker shades
  of the brand; the code does not have `--ui-primary-dark` at all. **This is a
  real divergence, not an oversight** — see Open divergences.
- `Neutral/50`, `/200`, `/900` — in Figma, never mirrored into the ramp.
- The file's own legacy screen colours (`Text`, `IconDefault`, `Column`,
  `Checkbox`, `TabBarBG`, `PageBG`, `StepperWell`, `PacketEditorHeader`,
  `GroupHeader`, `LayoutIcons`, `TextSoft`, `True Black`) and the unrelated
  `M3` collection. None of these are library tokens.

## Confirm was promoted out of the component tier

It arrived as `Button/Confirm` holding a **raw `#59cf55`** — a component-tier
name carrying a literal value, which is both tiers wrong at once and exactly
the mistake the paragraph above warns about. It is now:

    Safety/Base    -> Color/TC Green  var(--ui-safety)
    Text/OnConfirm -> Color/White     var(--ui-text-on-safety)

sitting beside `Primary/Base`, `Accent/Base` and `Danger/Base` as the fourth
semantic role. The rename kept the variable's ID, so the binding on the
`State=Confirm` cell survived it untouched — **renaming is safe, deleting and
recreating is not.**

It has been renamed twice more since, on the same reasoning and with the same
safety: `Confirm/Base` -> `Safety/Base` in the file, `Text/OnConfirm` ->
`Text/OnSafety` beside it, and `--ui-confirm` -> `--ui-safety` in code (0.36.0).
Three renames, every binding intact, because a rename keeps the ID.

The same pass closed the other half of the original defect. `Safety/Base` and
`Danger/Base` aliased `Color/TC Green` / `Color/TC Red` in **Dark** but held a
raw literal in **Light** — so the two modes agreed by coincidence rather than by
construction, and the Light value would have survived a change to the primitive.
Both now alias in both modes, as do the four tints `ConfirmButton` added and
`Primary/Lighter`, which had held a raw `#f7dce0` since it was created.

**A mode that agrees by luck reads exactly like a mode that agrees by
construction.** Resolving a variable in one mode tells you nothing about the
other; walk both, as the invariant check at the end of a session does.

The cell's glyph was bound to the `Color/White` primitive; it now reads
`Text/OnConfirm`. Same class of fix as the `Neutral/350` rule and the
`Neutral/400` label on `Input-Text`, and the third time it has come up.

**The Figma set models Confirm as a `State`, the code as a `tone`.** That is not
drift — it is why the tone changes hover only; see the ButtonRound section. The
`State` axis was deliberately NOT renamed to match the prop: changing a variant
property name breaks every existing instance, and the modelling difference is
documented rather than forced.

## The `Input/*` group was made consistent

`Input Hint` -> `Input/Hint` and `Input/border` -> `Input/Border`, so all five
sit together under one prefix (`Input/Border`, `Input/Hint`, `Input/Icon`,
`Input/Label`, plus the older `InputFieldBG`).

`Input/Label` was also repointed. It had been `Neutral/400` — a **primitive** —
in Light and `Text/Muted` in Dark, so it could not follow the theme in one mode
and disagreed with the code in the other. It now reads `Text/Faint` in both,
which is `Neutral/400` light and `Neutral/500` dark: the value the design asked
for, and exactly what the component renders.

## Geometry is variable-bound too

`Button Size/{XL|LG|MD|SM}/{Padding X, Padding Y, Gap, Radius, Font Size}` are FLOAT variables, bound across every Button variant (82 at 0.30.0). Changing radius, padding, gap or font size in Figma is **one variable edit**, not one per node. A set-level read cannot tell "bound everywhere" from "bound on a few" - walk every variant before trusting a size's geometry (resolved divergence #23 is what that missed).

Corner radius binds per-corner (`topLeftRadius` etc.), not via `cornerRadius`. Height is *not* a variable: the frames hug vertically, so height is derived from Padding Y plus line height. The code expresses the same geometry as explicit `height` plus `padding-inline`; both produce 48/40/32/24.

## The two sides must match

**The library and the Figma file are meant to be identical, to the extent the
two media allow.** This is the user's standing instruction, not a preference to
be traded off. Any change to a token — a value, a name, a new one, a deleted
one — is only half done until the other side carries it too. A divergence is a
defect with a fix pending, never a resting state, and it must be recorded in
this file with the direction it still has to travel.

Only a handful of things genuinely cannot match, and each is listed under the
component that owns it: focus rings (Figma models no focus state) and
`asChild` (an element change, not a visual one). Everything else that differs
is drift.

Note this Figma file is shared with other work — `PacketEditorHeader`,
`StepperWell`, `Checkbox`, `TabBarBG` and friends belong to other projects.
"Identical" covers the design-system subset (`Color/*`, `Neutral/*`,
`Primary/*`, `Text/*`, `Surface/*`, `Button*`, `Nav/*`, `NavSlat`, `Motion/*`,
`Card*`), not the whole file. One explicit exception inside that pattern:
`Button/Round-Deprecated` is used by the file's own screens but is **not part
of the library**, so its absence from the code is not drift and must not be
"fixed" by building a component for it.

## A component's Figma description is part of the spec

`Button/Round` carries a description in the file; it surfaces in every
`get_design_context` read, so it is what a consuming designer - or a later
fetch - actually sees. Pushing property values across is only half of a sync:
**a component whose values match but whose description is empty is still only
half documented.** `NavSlat`, `Card` and `Pill` were all empty and have since
been written.

What belongs in one: the React usage line, the states and the tokens each
binds, the geometry, and - most valuable - the things that read as odd in the
file and are not. NavSlat's hidden pipe rectangles, Card's unmodelled 350x200
frame, Pill's absent height token. Those are exactly what someone would
otherwise "fix".

## There is a third copy: the published library

Editing the Figma file is only half of a Figma-side change. **A consuming file
sees the last *published* snapshot, not the file** — so publish after any
change to a component, variable or style, and treat that as part of the edit
rather than a later tidy-up.

This is not theoretical. The snapshot was found roughly five renames behind:
`Button` published 36 variants where the file had 60, `ButtonRound` 3 where it
had 12, `Card` was absent entirely, and `Primary/Base` and `Color/Ink` still
resolved to their pre-rename names `Brand/Brand` and `Color/"Black"` — the
quote bug included. None of it was visible from either the code or the Figma
file; it only showed up when a consuming file tried to import by key.

Two follow-ons, both easy to miss:

- **Publishing does not update consumers.** A file that already has instances
  keeps rendering the old ones until someone accepts the update in its Assets
  panel. After changing a component, check a consumer rather than assuming.
- **The snapshot cannot be verified from inside the source file.**
  `importComponentSetByKeyAsync(key)` run in component-library resolves the
  key to the *local* set and returns it, so every variant count matches and
  the check proves nothing. Compare `imported.id` against the local node's id:
  if they are equal, that is what happened. This is why the five-renames-behind
  snapshot only surfaced when a consuming file tried to import - the check has
  to run from the consumer.
- **Publishing is UI-only.** There is no plugin API for it, so it is always a
  step to hand back to the user — as is accepting the update on the far side.

The corollary for this file's rules: "the two sides must match" is really
three, and the published one is the only one that drifts without either side
looking wrong.

## Checking the published snapshot: `getPublishStatusAsync`

**Verified, and there is a far better way to do it than this file previously
knew.** `node.getPublishStatusAsync()` returns `CURRENT` | `CHANGED` |
`UNPUBLISHED` and works from INSIDE the source file, answering directly the
question the five-renames-behind incident could not: does the published
snapshot match what is on the canvas? It exists on components, component sets,
variables and variable collections alike.

All eleven library sets returned `CURRENT` - Segment, SegmentedTrack,
ButtonRound, Button, Tabs, Tabs/Item, Card, Pill, NavSlat, Checkbox,
Input-Text - as did the variable collection and every variable this pass
touched (`Text/Muted`, `Text/Faint`, `Surface/Pale` and all nine
`Segmented/*`), each carrying its `--ui-*` code syntax.

**Use this instead of the two checks described under "There is a third copy".**
Both of those are still true and both are still traps -
`importComponentSetByKeyAsync` resolves to the LOCAL set when run from inside
this file, so it proves nothing, and `figma_search_components` returns empty
even for long-published components because the REST token is expired and fails
silently. But neither is necessary now: `getPublishStatusAsync` is direct, it
needs no consuming file open, and `CHANGED` is exactly the state that went
unnoticed for five renames.

**Consumers still have to accept the update in their own Assets panel.** That
half has not changed - publishing does not push it to them, so a file holding
instances keeps rendering the old ones until someone accepts.

## Flattening a Figma icon silently kills every instance's colour

The `lucide/*` components in the file were redrawn from stroked outlines to
single FILLED shapes. Nothing in code depends on them - see the Checkbox
section for why they are drawings, not a source - but it broke the Figma side
comprehensively and **it broke it invisibly, one paint at a time**.

A per-instance icon colour is an override on a specific PROPERTY. Every one of
them was on `strokes`, because that is what painted a stroked glyph. Flatten
the component and the glyph paints from `fills` instead - so all those
overrides still exist, still hold the right colour, and reach a property that
no longer draws anything. Every glyph in the file fell back to its component
default, `IconDefault`.

The damage, measured rather than guessed:

    Button           164 glyphs, all IconDefault  (should be 8 different tokens)
    Button/Round      22 glyphs, all IconDefault  (7 states)
    NavSlat            3 glyphs, all IconDefault
    BottomNav frame    4 of 5
    Segment           17 glyphs, all IconDefault
    Input-Text         1
    Checkbox           already correct - repaired by hand beforehand

**It does not look broken in the obvious places.** A Tertiary button wants a
near-black glyph and `IconDefault` is a mid grey, so it reads as slightly off
rather than wrong; only the Primary and Secondary fills, which want white,
shout. Checking one variant proves nothing - scan them all.

**Repairing it: take the colour from the variant's own LABEL wherever there is
one.** Text fills were untouched, every Button variant binds one, and the icon
is `currentColor` in code - so the label IS the answer, and copying it needs no
table to be re-derived and cannot drift from what the design says. That covers
Button and Segment. Only the icon-only sets - `Button/Round`, `NavSlat`,
`BottomNav/Item` - need an explicit state -> token map, and those are small.

Two traps inside the repair, both hit:

- **Climb to the RIGHT ancestor for the state.** A `BottomNav/Item` contains a
  `Button/Round` chip carrying a `State` of its own (`Ghost`), so a naive
  walk-up finds the chip's state, not the item's. Match on the ancestor whose
  main component's set is the one you mean.
- **`setBoundVariableForPaint` still needs the resolved colour first**, and
  still does not chase an alias chain. The recipe in the Checkbox section
  applies unchanged, and `Text/OnPrimary -> Color/White -> #ffffff` has to be
  walked by hand.

Verified after by screenshot rather than by reading values back - the stored
and rendered colour have disagreed in this file before. Both mode invariants
still hold, and the 11 instances belonging to other projects (`Stepper`,
`Stepper/Rule`, `Dropdown`, `Component/Stepper`) were left alone.

**ButtonRound's ramp is deliberately different** (28/24/20/16 at 2.5/2/1.5/1):
its glyph grows faster than its container so Small stays legible with no label
beside it. Don't reconcile the two.

Both icons are `aria-hidden`, so a Button with icons and no children has no accessible name. A dev-only `console.warn` catches this; it relies on the exact expression `process.env.NODE_ENV` (bundlers substitute that literal — an optional chain does **not** match their define and silently disables the warning), and on `define: { "process.env.NODE_ENV": "process.env.NODE_ENV" }` in `vite.config.ts` keeping Vite from inlining it at our build time.

## Editing the Figma file safely

Plugin edits are undoable from the canvas, and the user may be working in the file at the same time — node state can change between calls. Never bulk-delete by name pattern or assume an unfamiliar variant is leftover scaffolding (doing so destroyed a `Level=Ghost` variant the user was creating). Remove only ids created in the same call, and re-read state rather than trusting a previous call's snapshot.
