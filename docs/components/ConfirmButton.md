# ConfirmButton

The button at the end of a decision: the two halves of "are you sure?". Round and
icon-only, or labelled for a dialog footer.

Figma: the `ConfirmButton` set (`735:398`), axes `Shape` = Round | Label, `Size` =
XL | LG | MD | SM, `Style` = Safety | Danger and `State` = Default | Hover | Active |
Ghost | Disabled (80 cells), plus an `Icon` instance swap and, for Label, a `Label`
text and an `Icon Start?` boolean. Added in 0.36.0; the labelled shape, the sizes
and Disabled were drawn on 2026-09-27.

> **Deprecated in 0.74.0.** A confirmation is now a `Button` or `ButtonRound` with
> `tone="safety"` or `tone="danger"` (decided with the user 2026-09-29). The
> component still exists for one release as a wrapper that renders exactly that -
> a label means `Button`, none means `ButtonRound`; `variant="filled"` becomes
> `"secondary"`, `"ghost"` becomes `"tertiary"` - and warns once in dev. What moves
> in the swap: hover and press follow Button's ladder (the fill darkening from the
> role colour) rather than this component's own Lighter/Base/Darker steps, and the
> `--ui-confirm-button-*` hooks and geometry tokens are gone. **Figma's
> `ConfirmButton` set (`735:398`) was deleted on 2026-09-29** (it had no instances
> in the file); the confirmation is Button / Button/Round with Tone. Everything below
> describes the component as it was, and is kept for its reasoning.
>
>     <ConfirmButton tone="safety" icon={<Save />} aria-label="Save" />
>     -> <ButtonRound tone="safety" icon={<Save />} aria-label="Save" />
>     <ConfirmButton tone="danger" variant="ghost">Remove</ConfirmButton>
>     -> <Button tone="danger" variant="tertiary">Remove</Button>

```tsx
<ConfirmButton tone="safety" icon={<Check />} aria-label="Save changes" />
<ConfirmButton tone="danger" icon={<Trash2 />} aria-label="Delete job" />

{/* labelled: the dialog's confirm, beside a Cancel */}
<Button variant="tertiary">Cancel</Button>
<ConfirmButton tone="danger" icon={<Trash2 />}>Delete</ConfirmButton>
```

## A label makes it rectangular

Pass `children` and it takes **Button's** box - height, padding, radius, type and
a type-sized icon at 0.65 - with this component's colours. The label decides the
shape; there is no `shape` prop, the same way a Segment's `hideLabel` decides its
own. With `asChild`, the child element's own text is the label.

This is the confirmation coloured **at rest**, which Button cannot be. It replaces
the hand-rolled version NextJob built by retinting a primary Button's hooks to
danger (`.dialogConfirm` in `OpportunityDetail.module.css`). Its hover and press
there were solid red at rest; here a labelled confirmation rests on the pale tint
like the round one, and fills on hover - one family, one ladder.

Geometry is read from `--ui-button-*` behind `--ui-confirm-button-label-*` hooks,
and nothing is declared in `tokens.css`: it is Button's box, so a Cancel and a
Delete in one footer stand level without anyone checking.

**Button `tone="danger"` is the loud one** - red at rest since 0.65.0, solid on
primary, and what a Modal's destructive answer uses. This is the quieter
confirmation: a pale tint at rest that fills on hover.

    size   box    icon   stroke
    xl     48     28     2.5
    lg     40     24     2
    md     32     20     1.5
    sm     24     16     1

## Why it is not a `ButtonRound` prop

It was one, until 0.36.0: `ButtonRound` carried `tone="confirm" | "danger"`,
and Figma carried `Button/Round` `State=Confirm` and `State=Danger`. Both sides
dropped them in the same release.

The old tones recoloured the **hover pair only** — the resting disc stayed
`--ui-action-lighter` and the press stayed `--ui-surface-inverse`. So a Save, a
Delete and a Back button in one row were indistinguishable until the pointer was
already on one.

That is the right behaviour for a toolbar and the wrong one for a confirmation:

- **A row wants one resting rhythm.** A delete button that RESTS red is the
  loudest thing on the screen, which is backwards — the destructive action
  should be quiet until you reach for it.
- **A confirmation has to be read before it is pressed.** A colour that only
  arrives on hover tells the user what the button does at the moment it has
  stopped being useful.

So this component colours the control **at rest**, and `ButtonRound` keeps the
rhythm. Neither is the other with a different prop value, which is why this is
a component and not a variant. See [ButtonRound](ButtonRound.md) for the
migration note — it is deliberately not a like-for-like swap.

## `tone` is required, and it is the only prop that is

Every other variant prop in the library defaults. This one does not:

```tsx
tone: "safety" | "danger"   // no default
```

A confirmation that came out safety-green because nobody passed a tone would be
wrong in the one place being wrong is expensive. TypeScript asking costs a word.

**`safety`, not `confirm`.** The semantic role was renamed `--ui-confirm` ->
`--ui-safety` in the same release, and Figma's group has been `Safety/*` for
longer than that. `confirm` is also the name of the *act* of pressing either
button in a yes/no dialog, so `--ui-confirm` and `--ui-danger` on the two halves
of one confirmation read as "the confirm one" and "the other one" rather than as
opposites. Safety and danger are opposites. The **component** stays
`ConfirmButton` because the component *is* the confirmation; its two tones are
the safe answer and the dangerous one.

**The prop is `tone`, not `style`.** Figma calls the axis `Style`, which cannot
be the prop name here — the props interface extends `ButtonHTMLAttributes`,
where `style` is already the inline style object. `tone` is what `Button` calls
the same kind of axis.

## Colour: four grounds per tone, every one a Figma variable

    tone="safety"                              tone="danger"
    rest    --ui-safety-lighter  #cafac8       --ui-danger-lighter  #f7dce0
            glyph --ui-safety-darker                   glyph --ui-danger
    hover   --ui-safety          #59cf55       --ui-danger          #e51a38
            glyph --ui-text-on-safety                  glyph --ui-text-on-danger
    press   --ui-safety-darker   #378f34       --ui-danger-darker   #a31c30
            glyph --ui-text-on-safety                  glyph --ui-text-on-danger
    ghost   none                               none
            glyph --ui-safety                          glyph --ui-danger

Figma: `Safety/Lighter`, `Safety/Base`, `Safety/Darker` and the matching
`Danger/*`, all three bound on every variant.

**Safety rests on the darker glyph, danger on the base one.** `--ui-safety` on
`--ui-safety-lighter` is two light greens together, and the icon inside it was a
shape you had to look for rather than read; `--ui-safety-darker` (#378f34) is
the same role colour with the contrast to carry a 16px glyph. Danger does not
have the problem — `--ui-danger` on `--ui-danger-lighter` is already a red on a
pale pink — so it is left where it is rather than moved for symmetry. Ghost
keeps `--ui-safety` (see below): with no disc behind it there is nothing for the
glyph to be lost against.

**Press is the darker role colour, not the inverse surface.** `ButtonRound`
presses to `--ui-surface-inverse`, which means "the pointer is down on this" and
says nothing about what the button does — right for it. Here the press is the
last frame of a decision the user has already made, and dropping the role colour
at exactly that moment would read as the button changing its mind.

**The lighter and darker tints are literals, not mixes** - Danger's alias the TC
Red primitives (`--ui-tc-red-lighter`, `-darker`); Safety owns its three values
outright since 0.65.0 (`--ui-safety` `#2aca25`, `-lighter` `#cafac8`, `-darker`
`#378f34`), with no green primitive behind them. They are hand-drawn in Figma and
no `color-mix()` reproduces them: the drawn safety tint is *more saturated* than
any mix of the base with white can be. Only
`--ui-tc-red-lighter` falls out of a formula, and mixing one of four would be
worse than mixing none.

The consequence, and it is deliberate: **an app that repoints `--ui-safety` or
`--ui-danger` alone keeps its old tints.** Repoint the trio:

```css
:root {
  --ui-danger: #d4183d;
  --ui-danger-lighter: #f7dfe4;
  --ui-danger-darker: #8f1029;
}
```

A single-token override still yields a coherent button — the grounds simply stay
where they were — so nothing breaks; it just does not carry the whole component.

**Per-tone override hooks**, not shared ones:
`--ui-confirm-button-safety-bg`, `-bg-hover`, `-bg-active`, `-icon`,
`-icon-hover`, `-icon-active`, `-ghost-bg`, `-ghost-icon`, and the same eight
under `--ui-confirm-button-danger-*`. The two tones are the two answers, and an
app that wants to restyle one of them almost never means both — a shared hook
would make "make Delete darker" also darken Save. The disabled pair
(`--ui-confirm-button-bg-disabled`, `-icon-disabled`) *is* shared, because a
disabled button has no answer to colour.

## `variant="ghost"` drops the disc and keeps the colour

Figma: `State=Ghost`, whose glyph is on `Safety/Base` / `Danger/Base` — the same
fill the Default cell gives its glyph. So ghost differs from filled **at rest by
the disc alone**.

That is the one place this component and `ButtonRound` use the same prop name
for visibly different behaviour, and it follows from the split above: a ghost
`ButtonRound` rests `--ui-text-muted`, because it is a toolbar control with
nothing to say until you reach for it, while a ghost ConfirmButton keeps its
role colour, because being readable before the pointer arrives is the reason
this component exists.

Only the resting pair is declared; hover and press fall through to the tone
rules, so a ghost fills exactly as a filled one does.

**Source order is load-bearing here, unlike in `ButtonRound`.** There, `.ghost`
is one class and `.button:hover` outranks it whatever the order. Here `.ghost`
is qualified by the tone (`.ghost.safety`, two classes) to match the tone
blocks' own specificity, so the ghost rules must stay *below* the tone rules in
the file. Moving them up silently kills the hover fill.

## Geometry is `ButtonRound`'s, aliased

`--ui-confirm-button-xl-size: var(--ui-button-round-xl-size)`, and the same for
every size, icon box and stroke. Aliased rather than copied so the 48/40/32/24
ramp stays one fact — a second ramp would be two facts about one object, and
they would drift.

This is what keeps a Save and a Back button level in the same row, which matters
more here than for most components: these two get used side by side by
definition.

## Divergences — do not fix these

1. ~~Only XL is drawn in Figma.~~ All four sizes are drawn since 2026-09-27, on
   Button/Round's ramp for Round and Button's for Label.
2. **`State=Hover` and `State=Active` are CSS states, not props.** Figma has to
   spend variants on them; code gets them from `:hover` and `:active`. The real
   axis Figma's `State` carries is `Default` vs `Ghost`, which is `variant`.
3. **`Disabled` was derived in code, then drawn** (2026-09-27, both shapes). From `ButtonRound`'s —
   `--ui-surface-disabled` / `--ui-text-disabled` — and applied to **both**
   variants, so a disabled ghost takes the disc. That is the opposite of
   `ButtonRound`, where a disabled ghost stays unfilled so that switching a
   button off never makes it louder. Here the control is never the quiet one in
   a row, and an unavailable confirmation that rendered as bare grey glyph would
   be easy to miss entirely.
4. **No focus state in Figma.** 2px `--ui-action` outline at 2px offset, like
   every other control. The ring does not follow the tone: it marks where the
   keyboard is, which is the same fact whatever the button goes on to do, and a
   ring that changed colour would say the tone twice and the focus position less
   clearly.
5. **Figma draws the glyph as a filled vector; code strokes `currentColor`.**
   Standard across the library — the icon is a slot, and the library ships no
   icon dependency.
6. **The resting tints do not move in dark mode.** Figma holds the same literal
   in both modes for all six role colours, and role colours are the one family
   that does not re-point with the theme. A `#cafac8` disc on a `#262626` page
   is louder than it is in light; that is the design, checked in the playground
   in both themes.
7. **`Icon` is an instance-swap property in Figma, a `ReactNode` slot here.**
8. **The labelled ghost has no outline**, where Button's ghost has a 1px rule.
   It follows this component's own ghost - the ground goes, the colour stays -
   because it is a confirmation first and a rectangle second.
9. **The labelled shape has no trailing icon.** A confirmation states its action;
   Button's `iconEnd` has no counterpart here.

## When a component is added

Reminder for whoever touches this next: this component's arrival also renamed
`--ui-confirm` -> `--ui-safety` and `--ui-text-on-confirm` -> `--ui-text-on-safety`,
and removed `ButtonRound`'s `tone` prop. All three are in `CHANGELOG.md` under
0.36.0 with the old -> new names.
