# ButtonRound

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

Circular icon-only action button. Figma: the `Button/Round` set (`220:11857`),
axes `Size` = XL | LG | MD | SM and `State` = Default | Hover | Active |
Disabled | Ghost | Confirm | Danger.

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

## `variant="ghost"` drops the fill; `tone` and `variant` are orthogonal

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
though that is what `Button` calls its filled variant. `tone` already accepts
`"primary"` on this same component, and one component with two props that both
take that word, meaning different things, is a lookup table nobody should have
to hold in their head. Not a boolean either, so a third weight can join without
reshaping the API.

The two props are orthogonal and compose: `variant` is how much weight the
button carries, `tone` is what it does. `variant="ghost" tone="confirm"` rests
as a muted glyph and answers the pointer in green.

**Figma models both as `State`**, which cannot express two independent axes
without multiplying the set. That is a modelling difference, the same one
`tone="confirm"` already carries — see below.

## `tone` marks what the button DOES: `confirm` and `danger`

Figma: `Button/Round` `State=Confirm` (`--ui-confirm` ground,
`--ui-text-on-confirm` glyph) and `State=Danger` (`--ui-danger` /
`--ui-text-on-danger`). Tag the affirmative and the destructive action:

```tsx
<ButtonRound tone="confirm" icon={<Save />} aria-label="Save job" />
<ButtonRound tone="danger" icon={<Trash2 />} aria-label="Delete job" />
```

**Both change the HOVER pair and nothing else**, and the resting appearance is
untouched for both. That is the design, not an omission - see the note below,
which was written for confirm and applies unchanged to danger.

**`danger` is worth the emphasis.** A delete button that RESTS red is the most
coloured thing in its row, which is exactly backwards: the destructive action
should be the quiet one until you reach for it. NextJob had precisely that on
its task Delete, a permanent red-50 wash, and it came off. Figma agrees by
construction - there is a `State=Danger` cell and no `Danger Default`, the same
tell that says Confirm is a state rather than a variant.

**It is the first consumer of `--ui-danger`**, which had none. That token
resolves to TC Red exactly as `--ui-primary` does today, so a danger button and
a primary one look identical until an app splits the two roles - which is the
whole reason to say `danger` rather than reaching for the primary hover and
getting the right colour by luck.

**`Danger` arrived as `ConfirmButton`** and was open divergence #22 for a
session: `Primary/Lighter` with the glyph on `Danger/Base`, so it rendered
identically to Default and read as work in progress. It was left alone on the
"ask before touching an unfamiliar variant" rule, and asking is what got it
redrawn properly rather than deleted.

## `tone="confirm"` changes the hover pair and nothing else

Figma: `Button/Round` `State=Confirm` (`606:15107`) — `--ui-confirm` ground,
`--ui-text-on-confirm` glyph. Tag the affirmative action with it:

```tsx
<ButtonRound tone="confirm" icon={<Save />} aria-label="Save job" />
```

**The resting appearance is untouched.** That is the design, not an omission:
the green answers the pointer arriving, it is not a second resting style
competing with the default one. A row of round buttons keeps one resting
rhythm and only responds differently under the cursor. Figma models it the same
way — there is a `State=Confirm` cell and deliberately no `Confirm Default`,
which is what says this is a *state*, not a variant.

**Pressed is untouched too.** Active is the inverse surface for every round
button whatever its tone, because it means "the pointer is down on this" — the
same fact regardless of what the button goes on to do.

The rule is declared after the base `:hover` and still reads
`--ui-button-round-bg-hover` / `--ui-button-round-icon-hover` first, so an
instance-level override of those hooks continues to win. The tone sets a
default; it does not lock the colour.

**`Button` has the same `tone` axis**, for the same reason: `tone="danger"`
cuts across its four variants rather than joining them as a fifth. Both leave
the resting appearance untouched, which is what Figma's `State=Danger` cell with
no `Danger Default` says. They differ on press: ButtonRound's pressed state is
the inverse surface whatever the tone (above), while Button's danger also
recolours its pressed pair, deriving it from `--ui-danger` the way each variant
derives its own from `--ui-primary`. (Button's tone recoloured the resting state
too for one release; 0.26.1 corrected it.)

`confirm` is still ButtonRound's alone - no rectangular one has been needed.

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
