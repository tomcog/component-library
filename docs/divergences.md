# Open divergences

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

Places where the code and the Figma file still disagree, each a defect with a fix
pending. Numbers are stable IDs, not an order. When one is closed, move it to
`docs/divergences-resolved.md` rather than deleting it.

3. **In Figma, absent from code:** `Neutral/50`, `Neutral/200`, `Neutral/900`,
   `True Black`, `Primary/Dark`, `Primary/Darker`. No
   component uses any of them, and some may belong to the other projects
   sharing this file — so this is the one gap worth leaving open until a
   component actually needs the value. Check ownership before importing.

   `Surface/Pale` came off this list when `LeftRail` needed it, which is
   exactly the trigger the rule describes. It is now `--ui-surface-pale`, the
   14th semantic token. ~~Its dark value is still unreconciled.~~
   **Resolved.** Figma had a raw `#efefef` in dark - a near-white, lighter than
   every dark surface it is meant to sit *below* - and a raw `#f5f5f5` in
   light. Both were raw rather than aliased, which is the other half of the
   defect. Now `Neutral/100` in light and `Color/Ink` in dark, matching the
   code and aliasing the tier it should.
   (`Primary/Lighter` was already in code as `--ui-primary-lighter`; it should
   not have been on this list.)

8. ~~NavRail's slat gap moved in code and not yet in Figma.~~
   **Superseded.** The 14px gap lasted one session. Reading the `LeftRail`
   frames showed the `NavSlat` set had been redrawn to a 32 line box with an
   8 gap, and the code took those numbers instead - so the question of
   whether the slat box or the line box was the thing being spaced answered
   itself: both sides are now 32 + 8.

   The `Nav/Rail/Gap` **variable** is still 10 in Figma and is now used by
   nothing - the `LeftRail` frames hardcode their 8. Either repoint it to 8
   and bind the frames to it, or delete it; leaving a stale geometry variable
   in the file is how the next reader gets a wrong number confidently.

9. **Figma's `NavSlat` description is stale**, and it is the most-read
   surface on the component - it comes back with every `get_design_context`.
   It still says the chip is a Button/Round **Large** (40/24/2), the type is
   14/**20**, padding-inline is **12**, the gap is **10**, and that
   "Level=Secondary is drawn here but not yet modelled". Every one of those is
   now wrong: the artwork itself moved to 32/8/0 with a Medium chip, and the
   code models Secondary. The description was written against the old
   drawing and never updated when the set was redrawn.

   Rewriting it needs the Desktop Bridge, which was not connected this
   session. Worth doing in the same pass as #8, and worth re-reading the
   description against the artwork rather than against this file - the two
   disagreed here and the artwork was right.

10. **`LeftRail` exists only in code as a component.** Figma has two frames,
   `LeftRail-NoIcons` and `LeftRail-Icons`, neither of which is a component
   set - so there is nothing to instance, and the "two sides must match" rule
   has nothing to compare against beyond the drawn pixels (which do match,
   measured). Promoting them to a set with an `Icon?` boolean would close it;
   that is a design-shaped change, so it happens in Figma first.

18. **`Spinner` has no Figma counterpart.** It was pulled from tomcoggia.com,
   not from the file, so there is nothing to reconcile against beyond the
   `logo-tc` artwork it shares — which does match, being literally the same
   paths. Figma cannot express a continuous rotation as a component, so the
   most it could carry is a static frame plus a description; that is probably
   worth adding when someone next has the Bridge open, so a designer reaching
   for a loader finds one. Not drift in the usual sense — there is no value
   disagreeing — but recorded so it is not mistaken for an oversight.

7. ~~`Button` has no Figma description.~~ **Half resolved.** `Button`'s is
   written - and the useful part was naming what its `State` axis actually
   holds, which is three different kinds of thing at once: the element's own
   states (Default, Hover, Pressed, Disabled), a real prop (Loading), and a
   tone (Danger). Read as one axis it invites a fifth Level called Danger,
   which is exactly the modelling the code rejects.

   `logo-tc` still has none.

12. **The text styles are not applied to any node.** `Type/Label *` exist and
   are bound, but Button, Nav, NavSlat, Pill and BottomNav labels still carry
   a `fontSize` variable binding plus a raw `lineHeight` and a raw `Medium`.
   Applying a style to Button's 80 variants is the risky half — it needs to
   not disturb the existing `Button Size/*/Font Size` bindings — so it was
   left as its own pass rather than bundled into the style creation.

13. **Button's line height and weight are unbound in Figma.** Read directly
   off the labels: `fontSize` is bound, `lineHeight` is a raw PIXELS value and
   `fontName.style` is a raw `"Medium"`. That is Pill's old `AUTO` problem —
   the two sides agree by luck, and a type change moves one and not the other.
   The `Type/Label */Line Height` and `Type/Label/Font Weight` variables now
   exist to bind them to.

24. **Input labels have no hidden state in Figma.** Code 0.31.0 added
   `hideLabel` to InputText, InputSelect, InputTextarea and Checkbox; the
   Figma components still always draw their label. Code went first because the
   prop changes no token and no visible default. The Figma side is a `Label?`
   boolean on `Input-Text` (`553:5455`), the Input-Select and Input-Textarea
   sets and the Checkbox set, hiding the label layer so the field hugs its own
   height - to be done as its own session, per "Which direction to make a
   change".

25. **The input set is inconsistent with itself and with the code.** Found
   reading `Size=MD` (`725:703`); code followed the rendered canvas, and
   these are the Figma-side fixes still pending:

   - the set `725:702` is named **`Button`**. It holds `Size=LG`
     (`553:5455`, the old `Input-Text`) and `Size=MD`. Rename it
     `Input-Text` - a rename keeps every instance.
   - **`Size=LG` is 30 tall; the code is 32.** Its field frame is fixed at 30
     with padding 8/4 around a 20 line box, so it too centres the text in
     less room than the padding asks for. `Input/Padding Bottom` is 3 and LG
     no longer binds it (its bottom padding is a raw 4).
   - **`Size=MD` is fixed at 24 with padding 6/3 around an 18 line box**
     (28). The top 6 is raw, the bottom binds `Input/Padding Bottom` (3).
     Code uses 4/1, which is what renders. Fix: padding 4/1, bound to new
     `Input/MD/Padding Top` and `/Padding Bottom` variables carrying
     `--ui-input-text-md-padding-*` as code syntax - or hug the frame and let
     the padding set the height, as the code does.
   - **MD's geometry is raw**: height 24, gap 6, icons 12, the value's
     `Input Text MD` style (12/18, no bound variables) and the label's 8px
     font size. Code has `--ui-input-text-md-*` tokens for all of them; Figma
     has no variables to bind.

26. **`InputTextarea` and InputSelect have no MD in Figma.** Code gives all
   three inputs `size="md"` because they share one field. Figma's
   `InputTextarea` set (`638:2383`) has only a `State` axis, and there is
   no Input-Select set at all - the select is `Input-Text` with a chevron in
   its trailing slot. The textarea wants a `Size` axis drawn from the code's
   MD; that is design-shaped, so it happens in Figma as its own session.

27. **`ConfirmButton` has no `Size` axis in Figma.** The set (`735:398`) is
   drawn at 48 only; code ships `xl | lg | md | sm`, aliasing `ButtonRound`'s
   geometry tokens, because the two get used side by side and have to sit
   level. Direction: **Figma**, which needs a `Size` axis taking 48/40/32/24
   with 28/24/20/16 icon boxes — the same ramp `Button/Round` already draws.
   Design-shaped, so it happens in Figma as its own session.

30. **`Button` (`135:9598`) still draws a `State=Confirm` cell.** It was left
   alone when `Button/Round`'s Confirm and Danger moved into `ConfirmButton`,
   and it has no counterpart in code — `Button`'s `tone` is
   `"primary" | "danger"` only. This is the pre-existing Figma-only cell
   `docs/components/Button.md` already names; it is listed here now because it
   is the last one left, and because "confirm" no longer names anything in the
   code. Direction: undecided — either code grows a rectangular safety tone or
   the cell is renamed `Safety` and left as a documented Figma-only. Ask.

31. **`ConfirmButton`'s safety rest glyph is `Safety/Darker` in code,
   `Safety/Base` in Figma.** Changed in code on 2026-09-20 (see CHANGELOG):
   `--ui-safety` on `--ui-safety-lighter` was two light greens, and the icon
   read as a shape rather than a glyph. Direction: **Figma** — the Default cell
   of `tone=Safety` (node `606:15107` and its siblings) binds its icon stroke to
   `Safety/Darker`. Hover, press and ghost are unchanged, as is Danger
   throughout. Not done in the session that made the code change: writes need
   the Desktop Bridge plugin, which wasn't connected.

33. **The `Segment` set's geometry went raw again, and the
   `Segmented Size/*` variables are now stale.** The 0.42.0 respec was drawn
   by editing the variants directly: padding is `8/10`, `6/8`, `6/6`, the icon
   gaps are 6, 6, 4 and the icon frames 24, 18, 14 — none of them bound, while
   `Segmented Size/LG/Padding X` still says 16, `/MD/Height` still says 32,
   `/SM/Height` 24 and `Segmented/Icon Gap` 8. A reader who trusts the
   variables gets the *old* component confidently, which is the failure mode
   `Pill/Padding X` was created to end. Direction: **Figma** — repoint the six
   existing floats to the drawn values, add `Segmented Size/*/Icon Size` and
   `/Icon Gap` (nine new floats, each carrying its `--ui-segmented-*` name as
   Dev Mode code syntax, same value in both modes), and rebind every variant.
   The code's tokens are the list to build from; `docs/components/SegmentedControl.md`
   has the table.

   **The track's two are worse, because they are inert as well as stale.**
   `Segmented/Track Padding` says 4 and `/Track Gap` says 4, where the worked
   frames draw 0 and 8. They are bound to the six `SegmentedTrack` variants —
   which have no children and `layoutMode: "NONE"`, so Figma never applies
   either one. The set cannot be wrong on canvas and cannot be right either;
   it simply does not spend the values it holds. Repointing the two variables
   is half the fix. The other half is giving the set auto-layout and a real
   slot so the numbers have somewhere to land, which is design-shaped and is
   its own session. Until then the frames 756:478 / 485 / 498 are the only
   statement of the track's layout, and `docs/components/SegmentedControl.md`
   says so under "Read the worked frames, not the track set".

34. **The `Segment`'s icon stroke binds `Color/White` in `Active` and
   `Dark`.** A primitive, at all three sizes, on both states — where the label
   beside it correctly reads `Text/OnPrimary` and `Text/OnInverse`. The set's
   own description claims the glyph "binds the same variable as the label in
   every state", and in `Inactive` and `Hover` it does (`Text/Default`,
   `Primary/Base`). It is invisible today because both semantics resolve to
   white in both modes, and it is the seventh time this file has recorded a
   component reaching for a primitive. Direction: **Figma** — bind the two to
   `Text/OnPrimary` and `Text/OnInverse`. Code is unaffected: the icon takes
   `currentColor` and cannot diverge from its label.

35. **The `Segment`'s icon is full-opacity in `Size=LG, State=Active` and
   `Size=LG, State=Dark`.** Every other cell that shows a glyph beside a label
   draws it at 0.65 — the other two LG cells, and all four of MD and SM. These
   two are the oldest cells in the set and predate the rule. Direction:
   **Figma** — set both icon instances to 0.65. Code implements the rule
   (`--ui-segmented-icon-opacity`), so LG Active and LG Dark render a muted
   glyph where Figma renders a solid one; it is the most prominent cell of the
   most prominent size, so this one is visible rather than theoretical.

36. **Figma poses no icon-only `Segment`.** `Label?` exists as a boolean on the
   set and is `true` in every instance in the file, so what a segment looks
   like with its label off has never been drawn. Code ships it as `hideLabel`
   and lets the frame hug — padding-x + icon, giving 44x36 / 34x30 / 26x26 —
   which is the mechanical result of Figma's own property rather than a
   decision. Direction: **Figma**, and it is worth drawing precisely because
   the mechanical answer is not square and a designer may not want it that way.
   Until then the code's sizes are the only statement, and they are derived
   rather than authored.
