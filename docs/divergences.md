# Open divergences

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

Places where the code and the Figma file still disagree, each a defect with a fix
pending. Numbers are stable IDs, not an order. When one is closed, move it to
`docs/divergences-resolved.md` rather than deleting it.

3. **In Figma, absent from code:** `Neutral/50`, `Neutral/900`,
   `True Black`, `Action/Dark`, `Action/Darker`. No
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
   (`Action/Lighter` was already in code as `--ui-action-lighter`; it should
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

   - ~~the set `725:702` is named **`Button`**~~ - renamed `Input-Text`
     on 2026-09-27. It holds `Size=LG` (`553:5455`) and `Size=MD` (`725:703`).
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

26. **`InputTextarea` has no MD in Figma.** Code gives all three inputs
   `size="md"` because they share one field. Figma's `InputTextarea` set
   (`638:2383`) has only a `State` axis. It wants a `Size` axis drawn from the
   code's MD; that is design-shaped, so it happens in Figma as its own
   session. (The select half closed on 2026-09-27: `Input-Select`, `837:463`,
   wraps `Input-Text` at LG and MD.)

45. **`FAB` is in Figma and absent from code.** A component (`703:513`) of a
   `Button/Round` beside a text label, with no description and no instances
   in the file. No `FAB` exists in `src/`, and no doc mentions it. It sits in
   its own "Figma only - not in code" section on the canvas so its placement
   does not suggest it is in the library. Either it is built in code (from
   the drawing, as a design-shaped change arriving Figma-first) or it is
   marked deprecated; which is the user's call.

47. **Button/Round, LayerController-Plot and Layer bind Button's variables.**
   DEFECT: a binding that breaks. `Button/Round` binds `Button/Tertiary/Label`,
   and `LayerController-Plot` and `Layer` bind `Button/Tertiary/Default` - another
   component's tokens, which CLAUDE.md forbids. Found 2026-09-27 when Tertiary was
   restyled: repointing those variables would have silently restyled all three, so
   Button's Tertiary cells were moved to `Button/Ghost/*` instead and
   `Button/Tertiary/*` left in place, now used only by these three. Fix: bind each
   to its own tier (`Button/Round/*`, a `Layer Controller/*` token, or the
   semantic underneath), then retire `Button/Tertiary/*`. Figma-side only.

48. **Button/Round's `outline-light` exists only as instance overrides in
    Figma.** DEFECT, small: the look is drawn on placed `Button/Round`
    instances over the ParkPal hero (`890:1695`, `890:1688`), not as a `State`
    in the set (`220:11857`), so the set cannot say it and a designer cannot
    pick it. Code has `variant="outline-light"`. Direction: Figma - add
    `State=Outline Light` at the four sizes (LG drawn; XL/MD/SM take the same
    1.5px ring). While doing so, rebind: the ring and glyph are bound straight to
    `Color/White` (a primitive - the tier rule) and the ground is a raw
    `rgba(0,0,0,0.4)` with a 75% layer opacity; the ring is a raw
    `rgba(255,255,255,0.8)` and the glyph a 75% layer (code: those percentages
    of `--ui-text-on-media`, mixed at the element). The hover cell is
    `892:1700`, also an instance. Code reads two new semantics, `--ui-text-on-media` and
    `--ui-surface-scrim`, identical in Light and Dark; Figma wants matching
    `Text/OnMedia` and `Surface/Scrim` variables with the same value in both
    modes. Press (= hover) and disabled (40%) are code-only - draw them as
    `Hover`/`Active` cells of the new State when it is added. (`888:1673`, an earlier draft - 40% white ground, 1px ring - was
    superseded by these two.)
