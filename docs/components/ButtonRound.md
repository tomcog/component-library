# ButtonRound

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

Circular icon-only action button. Figma: the `Button/Round` set (`220:11857`),
axes `Size` = XL | LG | MD | SM and `State` = Default | Hover | Active |
Disabled | Ghost.

`State` also carried `Confirm` and `Danger` until 0.36.0. Both moved out into
[ConfirmButton](ConfirmButton.md), on both sides — see "The tones moved out"
below before reaching for them here.

    size   box    icon   stroke
    xl     48     28     2.5
    lg     40     24     2
    md     32     20     1.5
    sm     24     16     1

The icon grows faster than the container (58% / 60% / 62.5% / 67%) so the glyph
stays legible at Small — that ratio is deliberate, not a rounding artefact.

**Stroke is set on the shapes, not just the `<svg>`.** Lucide puts
`stroke-width` on the root and lets it inherit, but plenty of icons set it on
each `<path>`, and a presentation attribute on an element beats a value
inherited from its parent — an svg-only rule loses to those silently.
`vector-effect: non-scaling-stroke` then pins the weight to rendered px
whatever the icon's viewBox, so a 24-viewBox glyph drawn at 12px does not
halve its stroke.

## `variant="ghost"` drops the fill

Figma: `Button/Round` `State=Ghost`, drawn at **all four sizes** (`220:11857`).
No fill, no stroke, and the glyph on `Text/Muted`. The geometry is untouched,
so a ghost lines up with a filled button standing beside it.

```tsx
<ButtonRound variant="ghost" icon={<X />} aria-label="Dismiss" />
```

**Only the resting pair is declared. Hover and press fall through to the base
rules**, so a ghost fills `--ui-primary` under the pointer exactly as a filled
one does — transparent at rest, weight arriving with the cursor. That is not
invention: `NavRail` and `BottomNav` both hand-roll this exact chip today, and
the reason their comments give is that ButtonRound "has no transparent resting
state". Now it does, and those two are the obvious candidates to move onto it.

Specificity does the sequencing on its own — `.ghost` is one class, so
`.button:hover:not(:disabled)` outranks it whatever the source order.
`:disabled` is the exception: it matches at the same weight, so `.ghost:disabled`
is written below the base rule rather than left to it.

**A disabled ghost stays unfilled**, which is code-only — Figma draws no Ghost
Disabled cell. The base rule would paint it `--ui-surface-disabled`, making
*switching a button off* the thing that gives it a visible disc: louder off
than on.

**The prop is `variant`, taking `filled | ghost` — deliberately not `primary`,**
though that is what `Button` calls its filled variant. The departed `tone` prop
also accepted `"primary"` on this same component, and one component with two
props that both take that word, meaning different things, is a lookup table
nobody should have to hold in their head. Not a boolean either, so a third
weight can join without reshaping the API.

**The name outlives the clash on purpose.** `tone` is gone, so `primary` is now
free — but [ConfirmButton](ConfirmButton.md) calls the same axis `variant` with
the same two values, and the two round buttons reading alike is worth more than
recovering a name nothing needs.

**Figma models `variant` as a `State`**, which cannot express two independent
axes without multiplying the set. That modelling difference is the one thing
this component still diverges on.

## The tones moved out into ConfirmButton

**This component has no `tone` prop.** It had `tone="primary" | "confirm" |
"danger"` until 0.36.0; `confirm` and `danger` now live in
[ConfirmButton](ConfirmButton.md), and `primary` went with them because a
one-value enum is not an axis.

Figma made the call: `Button/Round` (`220:11857`) now draws `State` =
Default | Hover | Active | Disabled | Ghost, and the `Confirm` and `Danger`
cells were lifted into the `ConfirmButton` set (`735:398`). Code followed.

**The reason is worth keeping, because it is the reason the two components are
different and not a rename.** The old tones recoloured the HOVER pair and
nothing else — `--ui-confirm` / `--ui-text-on-confirm` or `--ui-danger` /
`--ui-text-on-danger` under the pointer, with the resting disc left on
`--ui-primary-lighter` and the press left on `--ui-surface-inverse`. So a Save,
a Delete and a Back button in one row were identical until the pointer was
already on one.

That is right for a toolbar and wrong for a confirmation:

- **In a row, one resting rhythm is the point.** A delete button that RESTS red
  is the most coloured thing on the screen, which is exactly backwards — the
  destructive action should be the quiet one until you reach for it. NextJob
  had precisely that on its task Delete, a permanent red-50 wash, and it came
  off.
- **In a confirmation, being read before it is pressed is the whole job.** A
  hover-only colour tells the user what the button does at the moment it is too
  late to matter.

ConfirmButton takes the second case and colours the control at rest. This one
keeps the first. Neither is the other with a different value passed to it,
which is why the split is two components rather than one prop.

### Do not reintroduce them here

`--ui-danger` and `--ui-safety` (formerly `--ui-confirm`) both still exist and
both still resolve exactly as they did. Adding a `tone` back to this component
would put two answers to "what colour is a destructive round button?" in the
library, and would disagree with Figma. If a toolbar genuinely needs a
hover-only recolour, set the override hooks on the instance —
`--ui-button-round-bg-hover` and `--ui-button-round-icon-hover` are still there
and still win, which is what they are for.

### Migrating

    <ButtonRound tone="confirm" icon={<Save />} … />
    -> <ConfirmButton tone="safety" icon={<Save />} … />

    <ButtonRound tone="danger" icon={<Trash2 />} … />
    -> <ConfirmButton tone="danger" icon={<Trash2 />} … />

**This is not a like-for-like swap and should not be applied blindly.** The
replacement rests in its role colour where the original rested in the brand, so
every migrated button becomes louder in its row. Where the button lives in a
toolbar rather than at the end of a decision, dropping the prop and leaving a
plain `ButtonRound` is usually the right answer. NextJob has both kinds.


## There are two round-button sets; only one is live

`Button/Round` (`220:11857`, `Size` x `State`) is the one this
component models. Beside it sits `Button/Round-Deprecated` (`66:2077`,
`Level` x `State` — Primary, Secondary, Tertiary, Ghost, Destroy).

**That one is deliberately not in the library.** It is used by the file's own
screens — ~247 instances against the live set's 9 — and the user has said it
will not be part of the library, so there is nothing to model in code and no
divergence to close. Do not build a `Level`-based round button to "match" it,
and do not delete it: those instances are real, and it is the set that carries
the `Level=Ghost` variant a previous session destroyed by assuming exactly
this kind of thing was leftover scaffolding.

The two shared the name `Button/Round` until the deprecated one was renamed,
and that ambiguity is the likely reason consuming files resolved the key to a
third, older shape (a `State=On` axis) no matter how often the library was
published. Re-check a consumer after any publish rather than assuming it took.

## Every colour is on the semantic tier, deliberately

    Default   --ui-primary-lighter  / --ui-primary
    Hover     --ui-primary          / --ui-text-on-primary
    Active    --ui-surface-inverse  / --ui-text-on-inverse
    Disabled  --ui-surface-disabled / --ui-text-disabled

Active used to be `--ui-ink` / `--ui-white`, and Figma likewise bound it to
`Color/Ink` / `Color/White`. The two sides agreed, so it did not read as
drift — but both skipped the semantic tier, and a primitive does not move with
the theme. In dark mode that put a `#262626` circle on a `#2e2e2e` panel:
present, and invisible. `--ui-surface-inverse` is `--ui-ink` in light, so the
swap changed nothing there, and flips to `--ui-neutral-150` in dark. Don't
reintroduce the primitives; the same reasoning is why Button's `secondary`
uses this pair.
