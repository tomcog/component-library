# Modal

A dialog that interrupts: an icon, a title, a body and the actions that answer it.
Figma: the `Modal` set (`877:641`, `Icon Color` = Default | Brand; the Default
variant is the original component `853:583`), in the Overlays section, with `Title`
and `Body` text properties, `Icon?` and an `Icon` swap, and its two Buttons exposed.
Added in 0.63.0, drawn Figma-first.

```tsx
<Modal
  open={confirming}
  onClose={() => setConfirming(false)}
  icon={<Trash2 />}
  title="Delete this job?"
  actions={<>
    <Button variant="tertiary" size="md" onClick={() => setConfirming(false)}>Cancel</Button>
    <Button variant="primary" tone="danger" size="md" onClick={remove}>Delete</Button>
  </>}
>
  Acme's listing will be removed. This cannot be undone.
</Modal>
```

    width     --ui-modal-width 350 at most; narrower screens: viewport - 16 each side
    padding   24 all round (--ui-modal-padding)
    gap       24 between icon, title, body, actions (--ui-modal-gap)
    actions   right-aligned, 16 apart (--ui-modal-actions-gap), in the order given
    icon      48 (--ui-modal-icon-size), stroke 3 (--ui-modal-icon-stroke);
              iconColor "default" --ui-text-muted | "brand" --ui-brand
    title     Type/Heading - Bold 24/32, the library's one heading step
    body      Body MD 12/16, Regular, --ui-text-default
    surface   --ui-surface-raised, --ui-card-radius (8), --ui-shadow-float-2
    backdrop  --ui-modal-backdrop, black at 40%, both themes

| Figma | Code |
|---|---|
| `Modal/Width`, `/Padding`, `/Gap`, `/Actions Gap`, `/Icon Size`, `/Icon Stroke` | `--ui-modal-*` of the same names |
| `Modal/Backdrop` | `--ui-modal-backdrop` (`::backdrop`) |
| `Type/Heading` (style), `Type/Heading/*` | `--ui-type-heading-font-size` / `-line-height` / `-font-weight` |
| `Card/Radius`, `Surface/Raised`, `Shadow/Float 2` | shared with Card |

Hooks: `--ui-modal-bg`, `--ui-modal-text`, `--ui-modal-title-color`,
`--ui-modal-body-color`, `--ui-modal-icon-color`, `--ui-modal-radius`,
`--ui-modal-shadow`.

## The icon is grey or brand, never action

`iconColor="default"` (the default) draws the icon in `--ui-text-muted`, for a Modal
that informs; `iconColor="brand"` takes `--ui-brand`, for one that should carry the
identity. It is decorative chrome either way - it names the kind of moment and acts
on nothing - so it is never the action colour. `--ui-modal-icon-color` overrides
both. Figma: `Icon Color` = Default (`Text/Muted`) | Brand (`Brand/Base`). Brand was
the only colour until 0.65.0.

## A native `<dialog>`

Opened with `showModal()`, which is the real element for this and brings what a
hand-built overlay fakes: the page behind goes inert, focus stays inside and goes
back to the opener on close, the dialog sits in the top layer above every stacking
context, and `::backdrop` is the scrim. No dependency and no portal.

It is **controlled**: `open` shows it, `onClose` asks for it to be hidden. Escape
fires `onClose` (the native close is prevented, so `open` never goes stale). A
`<form method="dialog">` inside closing it natively is reported the same way.

**A click outside does not close it.** Alert-dialog behaviour, as NextJob's delete
dialogs have today: a stray click cannot dismiss an "are you sure?". The action
buttons close it through their own handlers.

**Focus starts on the first action**, which is the browser's rule for
`showModal()`. Actions are laid out in the order given - dismiss first, answer
last, as Figma draws Tertiary then Primary - so the safe choice is the one a stray
Enter presses.

**A destructive answer is the primary appearance** - `variant="primary"
tone="danger"`: red ground, white label at rest, the danger colour on hover and
press. Not `ConfirmButton`'s pale tint: in a Modal the question has already
interrupted, so the answer that acts is the loud one. (Decided 2026-09-28.)

The title is the dialog's `aria-labelledby` and the body its `aria-describedby`.
For a confirmation, pass `role="alertdialog"`.

**The page does not scroll underneath** (`html:has(.modal[open])`). Code-only.

## Divergences - do not fix these

1. **The title is 24/32, drawn at 24/130% (31.2).** 32 puts it on the label
   ladder's own 4:3 rhythm, and px leading is what Figma can bind to a variable;
   the Figma text now uses `Type/Heading`, so the two agree. Decided with the user.
2. **The body is Body MD - Regular 12/16 - drawn Medium at 12/130% (15.6).** 12/16
   is the scale's step, 0.4px a line off the drawing, and the body is reading text,
   so it takes the Regular body twin (since 0.65.0; Label MD, Medium, before). Figma
   binds `Type/Body MD`.
3. **The drawing's text was raw black.** Both sides now use `Text/Default`, so
   the Modal follows the theme.
4. **The width is a maximum, not a size.** Figma poses 350; code caps at 350 and
   shrinks on narrow screens, 16 from each edge (`--ui-modal-viewport-gutter`,
   code-only).
5. **The backdrop, focus, Escape, scroll lock and the no-click-outside rule are
   code-only.** A component cannot draw the page it covers; `Modal/Backdrop` is
   in Figma as a variable so the colour is shared.
6. **No open/close motion.** None is drawn, and the system motion tokens were
   not stretched to cover one.
7. **The icon's stroke is bound in Figma** (`Modal/Icon Stroke` 3). Swapping the
   icon on an instance brings the new glyph's own stroke and `IconDefault` colour;
   rebind both - the swap traps in `docs/figma.md`.
