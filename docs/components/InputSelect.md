# InputSelect

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

A dropdown: InputText's field with a chevron and a real `<select>` inside it.

```tsx
<InputSelect label="Work mode" value={mode} onChange={…}>
  <option>Remote</option>
</InputSelect>
```

**It is a native `<select>`, deliberately.** A listbox rebuilt out of divs has
to reimplement type-ahead, keyboard traversal, the mobile wheel picker and the
screen-reader contract, and gets them subtly wrong. The native control has all
of that, and it keeps all of it here - the menu is styled without giving any of
it up. See *The menu* below. `appearance: none` removes the UA arrow, and the
chevron replaces it.

## `size="md"`

The same two sizes as InputText, through the same remap - see
`InputText.md`. At MD the field is 24, the chevron 12, and a menu row 24: a row
is the field's height by construction, so the alignment arithmetic below works
unchanged. Measured: picker alignment enabled, option height 24px.

## It shares InputText's tokens rather than restating them

Every measurement reads InputText's token behind an `--ui-input-select-*` hook:

```css
height: var(--ui-input-select-height, var(--ui-input-text-height));
```

The two ARE the same field, so sharing is what stops them drifting the moment
either is retuned — while the hook still lets an app move the select alone.
**No new geometry is declared in `tokens.css`**, because none of it is new.
That is the same reasoning as `--ui-nav-rail-chip-size` aliasing
`--ui-button-round-md-size`, one layer further out: a fallback chain instead of
a declared alias, because nothing here needs a name of its own yet.

## The chevron is `--ui-primary`, not `--ui-accent`

It is the one part of the control that says "there is more here", which makes
it a call to action rather than chrome. Red by default like everything else,
and it moves with the CTA colour rather than the brand colour if an app splits
them.

It sits **out of flow and `pointer-events: none`**, with its width reserved by
`padding-inline-end` on the select. So the select spans the whole field and a
click anywhere — the chevron included — opens the menu. Shrinking the select to
make room would have left a dead strip that looks clickable and is not.

## The menu

The menu a native `<select>` drops is drawn by the platform in a window of its
own, outside the page - so nothing declared on the component reaches it, and
its highlight was the OS blue rather than `--ui-primary`. `appearance:
base-select` moves the picker INTO the page as real DOM, where it styles like
anything else: the raised surface, the field's radius, `--ui-shadow-float-2`,
and `--ui-primary` / `--ui-text-on-primary` on `option:hover`, `:focus` and
`:checked` alike - one pair for all three ways a row can be the one you mean.

It is wrapped in `@supports selector(::picker(select))`, which is true only
where the whole feature exists. A browser without it keeps the platform menu,
blue highlight and all, rather than being left with a half-converted control.

Two things `base-select` adds are turned back off, because the component
already provides them: its `::picker-icon` (`.chevron` draws that) and the
per-row `::checkmark` gutter, which cost every label ~20px of indent to say
what the highlight already says.

This reverses an earlier decision - the menu used to be listed below as a
deliberate divergence. It was one, for as long as styling it meant rebuilding
the control out of divs. `base-select` is that same native `<select>`, so the
trade the divergence protected no longer exists.

## The open menu lines the chosen row up with the field's value

Like a macOS popup button: open the menu and the thing you were looking at has
not moved. Without it the menu drops below the field and the selected row is
wherever the list happens to put it.

The picker anchors to the **select's** bottom edge - measured, not assumed; the
4px gap is `margin-block-start` against the select box, not the field. From
there the chosen row's centre sits at `border + padding + index * row + row/2`,
and the field's value centre sits half a line-height above it. Cancelling the
two gives the shift, which is a negative `margin-block-start`:

    -(border + padding + row/2 + value-line-height/2 + index * row)

Every term is a token; only the index comes from JS. At LG that is
`-(1 + 4 + 16 + 10 + 32i)`, so `-31px` on the first option and `-95px` on the
third. Verified live at 0.00px misalignment for indices 0 and 2.

**A row is now a HEIGHT, not padding plus leading.** It was `6px 12px`, which
came to the same 32 - but the rule above multiplies the row height by an index,
and a padding shorthand is not a number you can do arithmetic with. A row is
now exactly the field's height by construction, which is also what "the menu
reads as the field opened up" is trying to say.
**`--ui-input-select-option-padding` is therefore gone**, replaced by
`--ui-input-select-option-padding-x` and `--ui-input-select-option-height`.
Nothing overrode it - checked NextJob, which overrides no `--ui-input-select-*`
at all.

### `beforetoggle` does NOT fire for a select's picker

This cost a debugging round and is the reason the hook is what it is. Measured
in Chrome 148: opening a picker emits `pointerdown`, `mousedown`, `focus`,
`click` - and **neither `beforetoggle` nor `toggle`**, despite both being the
documented popover events and despite the picker being a popover.

Worse, the obvious feature test lies. **`"onbeforetoggle" in el` is `true` on
every `HTMLElement`**, inherited from the popover API, so it answers yes for a
select that will never fire the event. An implementation was written against it
and reported success while the index silently stayed at 0 - the menu was
mispositioned by exactly `index * row`, which reads as "the shift is wrong"
rather than "the event never fired". **Don't reintroduce either.**

`pointerdown` and `keydown` are used instead: they are the two things that
precede an open, and both fire while the index is still correct and before the
picker paints, so the menu is never drawn wrong and then corrected.

**The `:open` guard is load-bearing.** Every arrow press inside an open menu is
a `keydown`, so re-reading the index there would walk the menu up the screen
under the pointer. Syncing only while closed also makes controlled and
uncontrolled selects behave identically - the index is read from the DOM at the
last possible moment either way. Verified: pressing Up with the menu open left
the index and the margin untouched.

The whole thing is gated on `data-ui-picker-aligned`, which the component adds
only where `::picker(select)` is supported. A browser without it keeps the
platform menu; one that somehow styles the picker but never runs the effect
keeps the plain menu below the field, rather than one shifted by a stale index.

**A menu taller than the viewport is not aligned.** Chrome pins an oversized
picker to a viewport edge rather than shrinking it, so shifting it by
`index * row` only buries more of the list. Since 0.28.2 the component
withholds `data-ui-picker-aligned` when `options.length * row > innerHeight`,
and Chrome's own placement - which shows the most rows - takes over. The
overflow itself is Chrome's and predates the alignment.

**The menu can open upward**, and since 0.28.1 that case aligns too:
`margin-block-end` is set beside `margin-block-start`, only the one facing the
anchor applies, and the component publishes `--ui-input-select-picker-count`
beside `-picker-index` because the flipped case measures from the far edge.
Verify alignment on a select low in the viewport as well as a high one.

## Divergences — do not "fix" these

- **No `iconEnd` slot.** InputText has two icon slots because a text field's
  trailing icon is a caller's business; here the trailing slot IS the chevron
  and the control would stop reading as a dropdown without it. The leading
  `icon` slot is kept, so the two components still line up.
- **The chevron is drawn by this component, not the picker.** `base-select`
  supplies a `::picker-icon` of its own; it is hidden, because `.chevron`
  already occupies that slot and is the one the design specifies.
- **Focus turns the rule primary, with no ring**, matching InputText — see that
  component's note for why the ring is deliberately absent.
