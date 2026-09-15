# InputTextarea

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

`InputText`'s field made multi-line, and the third member of that family.
Every measurement reads InputText's token behind an `--ui-input-textarea-*`
hook, exactly as `InputSelect` does, so the three cannot drift apart when any
one of them is retuned — and almost no new geometry is declared in
`tokens.css`, because almost none of it is new.

Figma: the `InputTextarea` set (`638:2383`), `State` = Default | Active |
Disabled. **This one went code → Figma**, not the other way: it was built from
InputText's spec applied to a `<textarea>`, and the Figma set was drawn from the
component afterwards rather than the component from a design. The drawn cells
are `rows={3}`, so the field is `10 + 3×20 + 1 = 71px`; the 260px width is the
pose, not a property.

## `size="md"` is code-only

The same two sizes as InputText, through the same remap - see `InputText.md`.
At MD a row is 18px, so `rows={3}` is `4 + 3×18 + 1 + 1 = 60` and `rows={1}` is
24, lining up with an MD text field. **Figma's `InputTextarea` set has no Size
axis**, so this is InputText's MD applied to a textarea rather than a drawn
design - open divergence #26.

## Height is the one real departure

InputText pins `height: 32px` because a line *is* 32px. A textarea is as tall
as the `rows` it was given, so this sets `min-height` to InputText's height
token as a floor and lets the box grow from there. Pinning a height would
fight `rows`.

## No resize grabber

`resize: none`, and the reason is the same one that strips the number spinner
and replaces the calendar glyph: it is UA chrome introducing a second visual
language. It is worse here than in either of those cases — the handle is drawn
in the bottom-right corner, which on an underline-only field is **directly on
the rule**, so it reads as a defect rather than an affordance. It shipped
`vertical` for about ten minutes and looked broken; see the note in the module.

Height still moves, for a better reason: `rows` sets it, and `autoResize`
grows it to fit the content, which is what a user dragging the corner was
trying to achieve. `--ui-input-textarea-resize` puts the handle back for an app
that wants it — `vertical`, never `both`, since a box dragged wider breaks out
of the column it was placed in and leaves the label and every field above it
hanging.

## `autoResize` measures, it does not calculate

Height is reset to `auto` before reading `scrollHeight`, so the measurement is
the content's natural height rather than the height the box is already
holding — without that it only ever grows and never shrinks back. It runs in a
`useLayoutEffect`, before paint, so a field that arrives already holding text
is never shown at the wrong height first, and it re-runs on `value` so a
controlled field follows its state.

## `--ui-input-textarea-max-height` is the ceiling on that

Unset it does nothing. Set it and the box hugs its content only up to that
point, then scrolls — the difference between a field that fits what is in it
and a field that runs a form to several screens because someone pasted a whole
job posting into it.

The class sets `overflow-y: auto`, which is what makes the ceiling work: the
component sets height to `scrollHeight`, so below the cap the content fits its
box exactly and no scrollbar is drawn, and above it `max-height` clamps the
rendered height so the scrollbar appears exactly when it is needed. `hidden`
would have swallowed the overflow instead. Measurement is unaffected —
`scrollHeight` reports the content's height whether or not the box is clamped.

## No icon slots, deliberately

Unlike `InputText` and `InputSelect`. A leading glyph is anchored to a single
line of text; beside a three-line box it either floats in the middle of an
empty column or sits against the first line pretending the other two are not
there. Neither reads as the same component, so the slot is omitted rather than
left to be misused.

## `display: block` on the control

An inline-level textarea sits on a text baseline and picks up the line-box
descender gap beneath it, which puts a few stray pixels between the last line
and the rule — enough to break the alignment with a single-line field standing
next to it.
