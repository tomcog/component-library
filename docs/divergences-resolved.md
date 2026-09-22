# Resolved divergences

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

Closed drift between code and Figma, kept for the lessons in how each one happened.
Nothing here needs action.

1. ~~`Color/Ink` disagrees.~~ **Resolved, then it regressed, then resolved
   again.** Both sides are `#262626`. The first push recoloured ~1209
   dependants; the Button set was screenshotted afterwards to confirm nothing
   broke. It was later found back at `#333333` **in Light only**, with Dark
   still holding `#262626` - so it was simultaneously drift against the code
   *and* a break of the primitives-identical-across-modes invariant. Restored
   with NavRail. The lesson: that invariant is upheld by discipline, not
   structure (see the structural caveat above), so **assert it rather than
   assume it** - `Color/Ink` was the only primitive that differed, and nothing
   about either side looked wrong until it was queried.

2. ~~`Neutral/600` means two different things.~~ **Resolved.** `--ui-neutral-600`
   is now Figma's `#525252`, and the four dark-mode placeholders that had
   borrowed light-ramp numbers were renumbered to sit between the real steps by
   lightness: `600 -> 550`, `700 -> 650`, `800 -> 700`, `850 -> 800`. A pure
   rename — every dark-mode token resolves to the same colour it did before.
   `Neutral/550`, `/650`, `/700` and `/800` were then created in Figma, so
   both sides hold the same ramp even though no Figma mode uses them yet.

4. ~~Dark mode.~~ **Resolved.** The collection has Light and Dark modes and
   the eleven semantics that move are aliased to the same primitives
   `tokens.css` uses. Verified: no primitive differs between the modes.

5. ~~NavRail's type and pipe moved in code and not yet in Figma.~~
   **Resolved.** Pushed once the Desktop Bridge came back: the three
   `Level=Primary` labels went to 14/20, and the Hover chip's glyph off the
   `Color/White` primitive onto `Text/OnPrimary` - the same defect fixed
   earlier in the session and reintroduced when the set was redrawn, which is
   a fair sign that binding is easy to reach for by accident.

   The pipe rectangles were also set to `layoutAlign: STRETCH`, so they take
   the label group's height instead of being pinned at a number. That is what
   the code does (`height: var(--ui-nav-rail-line-height)`), and it is why
   this particular divergence cannot recur: move the type and the pipe
   follows on both sides. The two hidden rectangles needed resizing by hand as
   well - a hidden node is out of auto-layout, so STRETCH does not reach it
   until it is shown.

   Verified after: the set uses only `Primary/Base`, `Primary/Lighter`,
   `Text/Default`, `Text/Muted` and `Text/OnPrimary` - no primitives, no
   Button component tokens - and no primitive differs between modes.
   **Still needs publishing.**

6. ~~`Button/Round` has a 13th variant: `Size=Large, State=Ghost`.~~
   **Resolved, and both halves of the old note had gone stale.** It is not one
   variant at Large: `Ghost` is drawn at all four sizes, same geometry as
   Default. And its glyph does not bind `Button/Tertiary/Label` any more - all
   four are on `Text/Muted`, the semantic tier, so the repointing this entry
   asked for had already happened in the file.

   The waiting question - *is it intended* - was answered by the user asking
   why the playground had no ghost. Code followed the drawing: `variant="ghost"`
   on `ButtonRound`. Only the code moved, the set already being complete.

   **The old note's caution was still right in kind.** It said to ask rather
   than assume, and asking is what turned a variant that looked like scaffolding
   into a shipped one. Two things in this set still fit that description and are
   left alone below.

15. ~~Pill's padding-inline disagrees: Figma 16, code 14.~~ **Resolved.**
   Figma took the code's 14, and `Pill/Padding X` and `Pill/Padding Y` now
   exist as FLOAT variables bound across both variants, so it cannot drift
   silently again — a raw value on the variants is exactly how it drifted.
   Both variants went 68x34 -> 64x34.

   **This should not have been raised as a question**, and it was, twice.
   Padding is spacing, which this file lists under token-shaped changes:
   "change the code first, then push to Figma." Design-shaped is new
   variants, layout restructure, visual exploration — not a padding value.
   The hesitation was a guess that Figma's 16 might be a deliberate edit
   worth preserving, plus a second guess that 14 might be a holdout from the
   base-8 move and therefore a real design call. The second was checked and
   is false: `--ui-bottom-nav-item-gap` is 6 and `--ui-nav-rail-pipe-gap` is
   10, so the palette was never uniformly base-8 and 14 is not an outlier.

   The lesson is narrow and worth keeping: **the direction rule already
   decides most of these.** Reach for the user when the two sides disagree
   about something the rule does not cover, not when it does.

16. ~~Pill's frame had a fixed height.~~ **Resolved, and it was a live trap.**
   `layoutSizingVertical` was `FIXED` at 32 while the code hugs, so when the
   type moved to 14/20 the Figma frame stayed 32 while its contents needed 34
   — the text overflowed rather than the pill growing. This is exactly what
   Pill's own note predicts ("set a height and the two would fight the moment
   the type scale moved"); the note was right and the file did not follow it.
   Set to `HUG`, and both variants now measure 34, matching the code.

17. ~~`logo-tc` bound a remote variable named `"Red"`.~~ **Resolved.** All five
   weights were already TC Red, so the *value* never diverged — but the fill
   bound to a **remote** variable literally named `"Red"`, quote characters
   included, owned by a different library file. Same defect as Nav's `"Black"`,
   and with the same consequence: this library's own brand mark took its
   colour from outside the file. Repointed to the local `Color/TC Red` on all
   five. Visually a no-op, both being `#e51a38`.

   Worth noting the direction here ran the other way for once — Figma was
   right and the code was the side that had drifted, defaulting the mark to
   text colour.

11. ~~12 geometry variables differ between Light and Dark.~~ **Resolved.**
   The rule is geometry-never-varies-by-mode, and it was broken at scale.
   What it was, read off the file rather than inferred:

       Button Size/Jumbo/*         Light 18/10/24/12/4  Dark 0 0 0 0 0
       Button Size/Large/Gap       8  vs 6
       Button Size/Large/Padding X 16 vs 14
       Button Size/Medium/Gap      8  vs 5
       Button Size/Medium/Radius   4  vs 3
       Button Size/Small/Radius    4  vs 2
       Nav/Panel Padding X         24 vs 20
       Nav/Pipe Radius             0  vs 1

   The Jumbo row is visible breakage: all 20 Jumbo variants collapse to zero
   padding, gap, radius and text size in Dark, because a new variable defaults
   to 0 in the second mode and these were never set.

   **It does not run one direction.** Button's Dark values are the old
   pre-base-8 numbers, so that edit landed in Light only; but `Nav/Panel
   Padding X` and `Nav/Pipe Radius` match the code in *Dark*, so those landed
   in Dark only. Geometry is mode-scoped in this collection, so every edit
   silently applies to whichever mode is active. That is the structural caveat
   this file already describes for primitives, biting somewhere it was not
   expected. Fixed with an explicit target per variable taken from
   `tokens.css` — **not a blanket Light-to-Dark copy**, which would have
   written 24 and 0 into the two Nav values and made them worse. Ten took the
   Light value; `Nav/Panel Padding X` and `Nav/Pipe Radius` took the Dark one.
   Both modes are set to the target, so re-running it is a no-op.

   Verified after: **zero** non-colour variables differ across modes, and the
   17 colour primitives are still identical. Assert this after any Figma
   session — it is upheld by discipline, not structure, and one session's
   spacing edit broke ten variables here without either side looking wrong.

14. ~~Figma is a whole session behind the code.~~ **Resolved.** Pushed and
   verified in one pass: the two retired text styles and their four variables
   deleted, `SM` -> `MD` and `XS` -> `SM` renamed with their variables,
   Button's 20 `Size=Jumbo` variants and ButtonRound's 5 renamed to `Size=XL`
   along with the five `Button Size/Jumbo/*` variables, and Pill moved to
   14/20. Verified after: both size axes read `Large | Medium | Small | XL`,
   no `Jumbo` remains anywhere, all four styles resolve through their bindings
   to the code's numbers, and neither invariant moved — zero non-colour
   variables differ across modes, zero primitives differ.

   **Two lessons from the run itself.** A removed style poisons an array
   captured before the removal: a helper that scanned a pre-fetched list threw
   `The style with id … does not exist` and left the batch half-applied, one
   style deleted and nothing else. Re-fetch before every operation rather than
   holding a list across mutations. And **order the deletes before the
   renames** — `Type/Label MD` (13/17) had to go before `SM` could take that
   name, or the file would carry two.

19. ~~`Tabs/Item` has a `Size` axis in Figma and none in code.~~ **Resolved in
   the same session, at the user's instruction.** Both sides now carry
   `LG | XL`: Figma as a variant axis on the item, code as `size` on the
   strip. The three renamed variables took their code names with them and the
   code followed - `--ui-tabs-lg-*` and `--ui-tabs-xl-*`, with the gap,
   icon gap, padding-bottom, rule and border still shared on `Tabs/*`.

   Measured off the rendered playground rather than trusting the build: LG
   14/21 icon 18 tab 32, XL 18/24 icon 20 tab 35, both with gap 32, icon gap
   8, padding 8 and rule 3. Class names came back hashed, so the CSS Modules
   pipeline is intact.

   **`Size=LG` is the first variant on purpose.** A variant property's default
   comes from the first variant and every existing instance resolves to it, so
   ordering XL first - which is what the two-letter axis convention would
   suggest, and what Button does - would have silently flipped the live
   instances to XL. Verified after: all four instances in the `Tabs` strip
   still read `Size=LG`. Don't reorder them to match Button.

   **The strip was promoted too.** `Tabs` is now a set at `648:13715` with the
   same `LG | XL` axis, LG first; the old plain component at `646:2391` is its
   `Size=LG` variant. Safe because it had zero instances - checked against all
   4478 instances in the file rather than assumed.

   The loose WIP frame at `648:2401` - the XL item drawn by hand before the
   variants existed - was deleted at the user's request once the set carried
   XL. It was validated by id and by properties first, not by position: it had
   been moved since it was first read, and the tell that it was the hand-drawn
   one rather than a variant was its RAW unbound font size where every real
   variant binds one. Figma deletes are undoable from the canvas.

   **Figma is published; the package is not.** The library was published by the
   user after the sets landed. The component keys, for a consuming file:

       Tabs/Item   91c3b5edaf79bab534b06dd8a4910123fc44ce9e
       Tabs        983bc9a89652d4120350e29ecd20a0a884e7e1c2

   The publish could NOT be verified from here, and the two ways it was tried
   are both worth knowing about:

   - `figma_search_components` against the file's own key as a library returns
     an empty list - but so does a search for `Button`, which has been
     published for many versions. That is the expired REST token failing
     silently, not evidence about Tabs. **Control the check against a
     known-published component before believing an empty result.**
   - `importComponentSetByKeyAsync` returned `imported.id === localId` for
     both sets, which is precisely the resolves-to-local case this file
     already warns about. The variant lists it returned were the local ones.

   So the snapshot still has to be checked from a consuming file, and the
   instances there accepted in its Assets panel - publishing does not update
   consumers on its own.

   The package still needs `git tag v0.22.0` and each app's ref moved.

20. ~~Figma's `Text/Muted` aliases `Neutral/400` in BOTH modes.~~
   **Resolved.** It is `Neutral/500` in light and `Neutral/400` in dark now,
   which is what the code says and what makes the token follow the theme at
   all. It had been wrong in light AND frozen against the mode - the
   `IconDefault` defect, on a semantic token.

   **207 node bindings moved**, from `#8c8c8c` to the darker `#737373` in
   light. That is a real visual change across the file and it was made
   deliberately: the count is a blast radius, not a prohibition, and the code
   is the documented intent.

   It also un-collapses a distinction the library built on purpose. `Text/Faint`
   is `Neutral/400` light and `Neutral/500` dark, so the two had been *the same
   colour* in light - and InputText's note says faint exists precisely to "take
   whichever step muted is not on". The ramp now reads muted -> faint in both
   modes, as tokens.css has it.

21. ~~`Button/Round`'s description is stale.~~ **Resolved.** Rewritten: all
   four sizes with their icon and stroke ramps, the six states with the tokens
   each binds, and - most useful to a reader - the note that `variant`, `tone`
   and the element's own states are three separate things in code where Figma
   has one `State` axis. It also names the `ConfirmButton` cell below as
   unmodelled, so someone reading the component is told rather than left to
   discover it.

22. ~~`Button/Round` carries a 7th state, `ConfirmButton`, at XL only.~~
   **Resolved, and the caution was the reason.** It was `Primary/Lighter` with
   the glyph on `Danger/Base`, so it rendered identically to `Default` and read
   as scaffolding. It was left alone on the rule that a previous session broke
   - never assume an unfamiliar variant is leftover - and flagged instead. It
   has since been renamed `State=Danger` and redrawn as a `Danger/Base` ground
   with a white glyph, which is what it was always reaching for.

   The code followed: `tone="danger"` on `ButtonRound`, the third tone. Had the
   cell been deleted as scaffolding, the intent would have gone with it.

23. ~~Button's 20 MD variants disagree about padding-x: 16 raw at 10, 4 bound
   at 12.~~ **Resolved, and the value went the opposite way to the first
   guess.** Found by auditing all 82 variants during the 0.30.0 sync; it
   predated that change. The split was by Level:

       Level=Primary, States Default/Hover/Pressed/Disabled   12, bound, 117 wide
       every Secondary, Tertiary and Ghost, plus ALL Loading   10, RAW,  113 wide

   It had broken a documented invariant: `Primary/MD` Default was 117 while
   `Primary/MD` Loading was 113, where the Button section says loading widths
   match Default exactly. That was the only mismatched pair in the set, because
   Primary MD Default was bound and its Loading cell was not.

   **The reasoning that read 12 as correct was wrong, and it is worth knowing
   why.** Three things pointed at 12 - the code token said 12, the only BOUND
   cells said 12, and 10 looked like a pre-base-8 leftover. All three are the
   same fact wearing three hats: the base-8 pass had written 12 into the token
   and into the cells it touched. **A raw value is not evidence of neglect, and
   a bound one is not evidence of intent** - binding records what someone last
   ran a script over, not what the design says. 16 cells agreeing was the
   stronger signal and was read as the weaker one. The user settled it: 10.

   So it was fixed in two passes, and the order mattered:

   - all 20 cells bound to `Button Size/MD/Padding X`, which widened 16 of them
     113 -> 117 on the wrong assumption;
   - the variable then set to **10**, which moved all 20 at once, back to 113.

   The detour left no trace - the 16 ended where they started - and the binding
   half was right regardless, since it is what turned the value change into one
   edit instead of twenty. The code token followed to 10.

   Verified after: all 82 variants bound, one padding and one width per size
   (XL 16/169, LG 12/132, MD 10/113, SM 8/89), heights still 48/40/32/24, zero
   loading-width mismatches anywhere in the set, and both file invariants
   holding.

   **The lesson is the audit.** `get_variable_defs` on the SET reported
   `--ui-button-md-padding-x` present and correct, because 4 cells did bind it
   - a set-level read cannot distinguish "bound everywhere" from "bound on a
   few". Only walking all 82 variants found it. Do that before trusting a
   size's geometry.

28. ~~The four new tints are raw values on semantic names in Figma.~~
   **Resolved in the 0.36.0 token push.** `Safety/Lighter|Darker` and
   `Danger/Lighter|Darker` arrived holding literal hex in both modes - the tier
   break CLAUDE.md flags as recurring, and none of them carried Dev Mode code
   syntax, so `get_design_context` emitted `var(--safety\/lighter,#cafac8)`
   instead of a token name. Four primitives were added to match the code -
   `Color/TC Red Lighter|Darker`, `Color/TC Green Lighter|Darker` - and the
   four semantics now alias them, with code syntax set.

   Three neighbours had the same defect and were fixed in the same pass:
   `Primary/Lighter` held a raw `#f7dce0` (the same value as `Danger/Lighter`,
   now the same primitive), and `Danger/Base` and `Safety/Base` aliased
   `Color/TC Red` / `Color/TC Green` in Dark but held a raw literal in Light -
   agreeing by coincidence rather than by construction. Every rendered colour
   is unchanged; the screenshot before and after is identical.

29. ~~`Text/OnConfirm` still carries the old spelling.~~
   **Resolved.** Renamed `Text/OnSafety` beside `Safety/Base`, code syntax
   `var(--ui-text-on-safety)`. The rename kept the variable's ID, so every
   binding survived untouched - the third time that has held on this variable
   (`Button/Confirm` -> `Confirm/Base` -> `Safety/Base` for its partner).

32. ~~`SegmentedTrack`'s three White variants are named `Size=Size4`, `Size5`,
   `Size6`.~~ **Resolved.** Renamed `LG`, `MD`, `SM`, so the set is the 3x2 it
   was drawn as - Size LG | MD | SM against Color White | Gray, all six cells
   filled - rather than a 6x2 grid half of whose cells do not exist, with
   `Size=LG` unable to pair with `Color=White` on an instance. The three are
   the placeholder names Figma hands a duplicated variant, and this is the
   second time this exact set has needed the repair: `Size=Size3` -> `Size=SM`
   in 0.30.0. The lesson is that adding a second axis by duplicating a column
   silently invents Size values, so **read the set's `variantGroupProperties`
   after adding an axis** - the canvas looks correct either way.

   Both sets' descriptions were rewritten in the same pass, which is the other
   half of the same job: they still gave the pre-0.42.0 geometry (LG 40/16,
   MD 32/12, SM 24/8, icon sized to the line box) and said nothing about the
   Color axis. A description is the surface every `get_design_context` returns,
   and divergence #9 is the standing reminder of what a confident stale one
   costs. They now also say which geometry is raw, so a reader is not sent to
   the stale `Segmented Size/*` variables (#33, still open).

37. ~~The track's gap between segments is per size in code and a flat 8 in
   Figma.~~ **Resolved in the same session.** `756:485` set to 6 and `756:498`
   to 4, so the three worked frames now step 8 / 6 / 4 with the code. This is
   what the code-first half of the direction rule looks like when it is
   actually finished: spacing is token-shaped, so the code led, and the push
   followed immediately rather than being left for a later pass — which is how
   #33 and #8 each became a stale value someone could read with confidence.

   It does NOT close the `Segmented/Track Gap` variable, which still says 4 and
   is still bound to six `SegmentedTrack` variants that have no auto-layout to
   spend it on (#33). When that set is given real layout, that one variable
   should become three, matching `--ui-segmented-{lg,md,sm}-track-gap`.

35. ~~The `Segment`'s icon is full-opacity in `Size=LG, State=Active` and
   `Size=LG, State=Dark`.~~ **Resolved, and it was worse than recorded.** The
   opacity had been applied inconsistently across the set - sometimes to the
   icon instance, sometimes to the vector inside it, and in places to **both**,
   which Figma composes to 0.42 rather than 0.65. All twelve cells now carry
   0.65 on the icon container with the paths at 1.

   The lesson is about reading, not drawing. Every walk of this set in this
   file's history has queried `instance.opacity` and stopped there, which
   reports 0.65 for a doubled node exactly as it does for a correct one - so
   the defect was invisible to the tool and visible on the canvas. It is the
   same shape as "check `visible` before believing a fill", already recorded on
   this component after hidden paints made `Inactive` look like a red chip:
   **an effect can be composed from more than the node you asked about**. Now
   in `docs/components/SegmentedControl.md` beside the fill note.

   The code needed no change: CSS composes opacity the same way, and it was
   already set on the icon span rather than on the SVG's paths, so the two
   sides agree in structure as well as value.

