# ConfirmButton

The round button at the end of a decision: the two halves of "are you sure?".

Figma: the `ConfirmButton` set (`735:398`), axes `Style` = Safety | Danger and
`State` = Default | Hover | Active | Ghost, plus an `Icon` instance swap.
Added in 0.36.0.

```tsx
<ConfirmButton tone="safety" icon={<Check />} aria-label="Save changes" />
<ConfirmButton tone="danger" icon={<Trash2 />} aria-label="Delete job" />
```

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
`--ui-primary-lighter` and the press stayed `--ui-surface-inverse`. So a Save, a
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
            glyph --ui-safety                          glyph --ui-danger
    hover   --ui-safety          #59cf55       --ui-danger          #e51a38
            glyph --ui-text-on-safety                  glyph --ui-text-on-danger
    press   --ui-safety-darker   #378f34       --ui-danger-darker   #a31c30
            glyph --ui-text-on-safety                  glyph --ui-text-on-danger
    ghost   none                               none
            glyph --ui-safety                          glyph --ui-danger

Figma: `Safety/Lighter`, `Safety/Base`, `Safety/Darker` and the matching
`Danger/*`, all three bound on every variant.

**Press is the darker role colour, not the inverse surface.** `ButtonRound`
presses to `--ui-surface-inverse`, which means "the pointer is down on this" and
says nothing about what the button does — right for it. Here the press is the
last frame of a decision the user has already made, and dropping the role colour
at exactly that moment would read as the button changing its mind.

**The lighter and darker tints alias primitives** (`--ui-tc-green-lighter`,
`--ui-tc-red-darker`, …) rather than being composed from the base with
`color-mix()`, which is what `--ui-primary-lighter` does. They are hand-drawn in
Figma and no mix reproduces them: 30% of `#59cf55` on white gives `#cdf0cc`
against the drawn `#cafac8`, and no percentage reaches it, because the drawn
tint is *more saturated* than any mix of the base with white can be. Only
`--ui-tc-red-lighter` falls out of a formula, and mixing one of four would be
worse than mixing none.

The consequence, and it is deliberate: **an app that repoints `--ui-safety` or
`--ui-danger` alone keeps TC Red's and TC Green's tints.** Repoint the trio:

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

1. **Only XL is drawn in Figma.** The set has no `Size` axis; `lg`, `md` and
   `sm` are the code's, and they are `ButtonRound`'s sizes by construction. This
   is the one place the component is ahead of the file. If the set gains a
   `Size` axis, it should take these values.
2. **`State=Hover` and `State=Active` are CSS states, not props.** Figma has to
   spend variants on them; code gets them from `:hover` and `:active`. The real
   axis Figma's `State` carries is `Default` vs `Ghost`, which is `variant`.
3. **No `Disabled` cell exists in Figma.** Derived from `ButtonRound`'s —
   `--ui-surface-disabled` / `--ui-text-disabled` — and applied to **both**
   variants, so a disabled ghost takes the disc. That is the opposite of
   `ButtonRound`, where a disabled ghost stays unfilled so that switching a
   button off never makes it louder. Here the control is never the quiet one in
   a row, and an unavailable confirmation that rendered as bare grey glyph would
   be easy to miss entirely.
4. **No focus state in Figma.** 2px `--ui-primary` outline at 2px offset, like
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

## When a component is added

Reminder for whoever touches this next: this component's arrival also renamed
`--ui-confirm` -> `--ui-safety` and `--ui-text-on-confirm` -> `--ui-text-on-safety`,
and removed `ButtonRound`'s `tone` prop. All three are in `CHANGELOG.md` under
0.36.0 with the old -> new names.
