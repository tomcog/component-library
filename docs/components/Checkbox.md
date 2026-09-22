# Checkbox

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

Figma: the `Checkbox` set (`615:15245`), `Size` = XL | LG | MD and `State` =
Default | Hover | Selected | Disabled | Disabled Selected.

    slot   glyph   text
    24     20      18/20
    20     16      14/20
    16     14      12/18

## The slot is the hit area; the glyph is the box

Two tokens per step, not one. The square you actually see is smaller than
either — the glyph's square is inset to 13 of its 16 viewBox — so the LG box
reads as **13px inside a 20px target**. Sizing the drawn square directly would
have shrunk the hit area with it.

## Hover previews the tick

The distinctive part of the design: hovering an **unchecked** box shows the
check in `--ui-action` on an unfilled square, so the row says what clicking it
will do before it does it. The tick is in the DOM at every state and only its
opacity moves, so it can fade rather than pop and the glyph never reflows.

## Disabled is one colour, because the glyph is one shape

`--ui-text-disabled` (`#b8b8b8`) on whichever path the state is showing, and
nothing else. Unchecked drops to the SOLID square rather than staying a ring -
a greyed hairline reads as an artefact rather than as a control switched off,
and filling it makes the pair honest, since checked and unchecked then differ
by the tick alone. Checked keeps the knocked-out shape, so the tick is still
the thing the state exists to say.

**This changed when the Figma artwork was adopted, and it is worth knowing why
the old shape is not recoverable.** It used to be a two-colour glyph - an
`--ui-surface-disabled` (`#ededed`) ground carrying a `--ui-text-disabled`
tick - reasoned from `.button:disabled`, which is a pale fill with a muted
mark. The new glyph is a single path with the tick KNOCKED OUT of it, so the
tick is the ground showing through rather than a second colour painted on top.
One shape cannot hold two colours, so `--ui-checkbox-check-disabled` and
`--ui-checkbox-box-fill-disabled` have nothing to point at and are gone.

It follows Figma rather than Button now: the cells bind `Button/Disabled/Label`
(`#b8b8b8`) across the whole glyph. **A borrowed token still pointing at the
right answer** - the binding tier is wrong and the value is what the design
asks for, which is the same lesson recorded below and the reason it was twice
"corrected" onto the wrong thing. Repointing it to `Text/Disabled` is a
mechanism fix that changes no pixel; the VALUE is settled.

The net effect on screen: a disabled box is a solid mid-grey square where it
used to be a pale square with a grey mark in it.

## The glyph is NOT a lucide icon, and there is not a stroke in it

This is the thing to understand before touching this component, and it is the
opposite of how every other icon in the library works.

**Everywhere else, an icon is a SLOT.** `Button`, `ButtonRound`, `Segment`,
`NavSlat` and `Tabs` all take a `ReactNode` and render whatever the app hands
them - the library has no icon dependency at all, only React. The app imports
`lucide-react` itself, so the consumer has the entire set, including icons that
were never drawn in the Figma file. The `lucide/*` components in Figma exist
only as instance-swap targets so a designer can populate that same slot in a
mockup; **nothing is ever exported from them into code**, and an icon missing
from the Figma file is not drift.

**Checkbox is one of only two exceptions**, and the reason is that its glyph is
not swappable: the tick fades in on hover and the square fills when checked, so
the component owns the shapes. (The other is `InputText`'s calendar indicator,
which has to be in CSS because a shadow-DOM pseudo-element cannot take a node.)

So the four paths are **exported straight out of the Figma set** -
`lucide/square`, `lucide/square-check`, `lucide/square-checked` and
`lucide/square-filled` - the same way `Logo`'s weights are. Re-export if the
artwork moves; don't nudge the `d` strings, and don't reach for the lucide
package to "fix" them. The `lucide/` prefix on those components is where the
artwork STARTED, not what it is.

    path        shape                              states
    .ring       the outline, as a filled ring      Default
    .tick       the check                          Hover (over .ring)
    .solid      the square, no tick                Disabled unchecked
    .knockout   the square with the tick REMOVED   Selected, Disabled Selected

All four sit in the DOM at every state and only opacity moves, so the tick
fades rather than pops and the glyph never reflows.

**Every path is `fill: currentColor` and none of them has a stroke.** That is
the whole simplification: a state is ONE colour on `.glyph` plus which paths
are showing, exactly as the Figma cells are built - one component per state,
each a single shape with a single fill.

Four tokens went with it - `--ui-checkbox-{xl,lg,md}-box-stroke` and
`--ui-checkbox-tick-stroke` - along with `vector-effect: non-scaling-stroke`.
The glyph is flattened at its 16x16 appearance and simply scaled, so the ring
thickness now rides the glyph size (1px at LG, 1.25 at XL, 0.875 at MD) instead
of being pinned per size. **Do not reintroduce the ramp here.**

`non-scaling-stroke` is still correct and still load-bearing in `Button` and
`ButtonRound`, and the two cases are not comparable: those render lucide's real
SVG, whose stroke-width is in a 24-unit viewBox, so without it a token saying
`1.5` would draw at 1px in a 16px box. Checkbox has no stroke to scale.

The square is inset to 13 of its 16 viewBox, so the drawn box reads 16.25 / 13
/ 11.375 inside the 24 / 20 / 16 slot. It used to be lucide's `square` at 18 of
24, reading 15 / 12 / 10.5 - so the box grew about a pixel at each size when
the artwork was adopted.

## Hover previews the label too, and only while unchecked

The label turns `--ui-action` with the tick, so the whole row answers the
pointer rather than just the glyph. That matters because the whole row IS the
hit target - a row that lit only its box read as though the text were not part
of it.

**Only while UNCHECKED.** A checked row is already the answer, so lighting it
would say "this will become selected" about something that is - the same rule
`NavItem`, `NavSlat` and `Segment` all follow. It is EXCLUDED with
`:not(:has(.input:checked))` rather than overridden afterwards, so the two
states cannot compound.

Figma drew the Hover label as `Text/Default`; the cells now carry
`Action/Base` to match.

## Two things about this set that cost an hour, both worth knowing

**The boolean came BACK.** `lucide/square-check` was flattened once, and a
later session found the UNION restored — so something in the editing flow
recreates it, and it is worth checking rather than assuming the fix held. The
tell is not obvious: with the union present, Hover still looks right and only
`Selected` and `Disabled Selected` go grey. That is because the boolean's fill
paints the union AREA, and those two are the only states whose square carries a
fill of its own; where the children are stroke-only there is no area to paint,
so the strokes show through and the cell looks fine. **Judge it on the filled
states, not on Hover.**

**A `BOOLEAN_OPERATION` paints with its OWN fill; its children are operands and
render nothing.** `lucide/square-check` had its two vectors wrapped in a UNION
carrying a grey `IconDefault` fill, so Hover, Selected and Disabled Selected -
nine variants - all rendered as flat grey shapes whatever their children were
set to. A union with one fill cannot express a filled square with a contrasting
tick, so the construction was wrong for this icon, not just mis-coloured.
Fixed by lifting the two vectors out and deleting the wrapper, which is how
every other lucide icon in the file is built. Instance overrides survived,
being keyed on the child node ids.

This is the same fact `NavSlat`'s note records ("only its fill paints"), hit
from the other direction. **Verify it by hiding the boolean's fill: if the
glyph vanishes rather than revealing its children, the boolean is the only
thing painting.**

**Do not hand a fresh paint literal to `setBoundVariableForPaint`.** Doing so
stored the paint as BLACK while reporting the right colour back on the same
call - the disabled labels rendered black for two rounds before a screenshot
caught it, because reading `fills[0].color` said `#b8b8b8`. Write the resolved
colour first, then bind the paint READ BACK from the node:

    node.fills = [{ type: "SOLID", color: resolved }];
    const p = JSON.parse(JSON.stringify(node.fills));
    p[0] = figma.variables.setBoundVariableForPaint(p[0], "color", v);
    node.fills = p;

`setBoundVariableForPaint` also does not chase an alias chain, so resolve
`Text/Disabled -> Neutral/350 -> #b8b8b8` yourself before using it as the base.
**And screenshot: the stored colour and the rendered colour disagreed here, so
reading the value back proves nothing.**

## The input is 1px, not hidden

`display:none` and `visibility:hidden` both take a control out of the focus
order. The real `<input type="checkbox">` sits at 1px behind the glyph, so
space-to-toggle, form submission and the screen-reader contract are the
browser's. The whole row is a `<label>`, which both names the control and
extends its hit target — no `id`/`htmlFor` pair needed.

## Two bindings were reconciled on arrival, as usual

The drawn cells had the box on `IconDefault` — which aliases `Neutral/500` in
**both** modes and so is frozen against the theme, the same trap NavSlat's sub
items and `Input-Text`'s icon carried — and the selected tick on the
`Color/White` **primitive**. They now read `Text/Muted` and `Text/OnAction`.
Fourth and fifth time this has come up in this file.

The label is DM Sans **Regular**, not the Label scale's Medium: the design sets
it as body text beside a control, which is also why its 20px and 18px line
heights are its own numbers rather than `--ui-type-label-*` aliases.
