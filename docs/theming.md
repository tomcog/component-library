# Theming

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

The colour tiers, the semantic contract an app overrides, and how light/dark works.

## The theming contract: 21 semantic tokens

`tokens.css` has a primitive tier and a semantic tier. **The semantic tier is
the public API** — those 21 names are what a consuming app overrides to make
these components look like its own. The primitives are internal; an app should
never alias `--ui-tc-red`.

### CTA vs chrome: `--ui-action` and `--ui-brand`

Four roles, settable apart:

| token | means | default | who reads it |
|---|---|---|---|
| `--ui-action` | the **CTA** colour | `--ui-tc-red` | nearly every component - every interactive control |
| `--ui-brand` | the **brand/chrome** colour — headers, rules, borders, dividers | `--ui-tc-red` | LayerController's layer number |
| `--ui-danger` | **destructive actions and error states** — Delete, Remove, an invalid field | `--ui-tc-red` | `Button tone="danger"`, `ConfirmButton tone="danger"` |
| `--ui-safety` | the **affirmative** action — Save, Apply, Accept, Done | `--ui-tc-green` | `ConfirmButton tone="safety"`, LayerController's printer icon |

`--ui-safety` was `--ui-confirm` until 0.36.0. `confirm` is also the name of the
*act* of pressing either button in a yes/no dialog, so the old pair read as "the
confirm one" and "the other one" rather than as opposites; Figma's group has
been `Safety/*` throughout. The `ConfirmButton` component keeps its name — the
component *is* the confirmation, and its tones are its two answers.

**Danger and safety each carry two tints as well as a base**, because
`ConfirmButton` draws three grounds per tone:

| token | default | drawn as |
|---|---|---|
| `--ui-danger-lighter` / `--ui-safety-lighter` | `#f7dce0` / `#cafac8` | the resting disc |
| `--ui-danger-darker` / `--ui-safety-darker` | `#a31c30` / `#378f34` | the pressed disc |

These alias primitives rather than being mixed from the base — they are
hand-drawn and no percentage reproduces them, least of all the green, whose
drawn tint is more saturated than any mix with white can be. So **repointing a
role means repointing its trio**, not just its base; see
[ConfirmButton](components/ConfirmButton.md). An app that sets only the base
still gets a coherent button, it just does not carry the whole component.

Each carries its own **on** colour — `--ui-text-on-action`,
`--ui-text-on-brand`, `--ui-text-on-danger`, `--ui-text-on-safety` — rather
than sharing one. That is the whole point of splitting the roles: an app that
gives itself a pale accent and a dark CTA needs different text on each, and a
single shared name would be wrong for one of them. The playground's pairings
panel renders all four, so a recolour that breaks contrast shows up there.

**`--ui-safety` is the one that does not default to the brand.** The other
three can all share TC Red because red says nothing contradictory as a CTA, as
chrome, or as a warning. Safety is doing for "yes" what danger does for "no":
carrying a meaning by convention. A safety button that came out brand-red
would say *danger* in the one place the user most needs to hear the opposite,
so it ships green (`#59cf55`, Figma's `Confirm`) and stays green until an app
says otherwise. It is also untouched in the dark block, for the same reason
`--ui-action` is: a colour that carries a meaning does not get to change when
the theme does.

Know what the default pairing costs. White on `#59cf55` is **2.0:1**, and a
glyph is a graphical object, which WCAG asks 3:1 of. It is Figma's spec and it
is what ships. This got sharper in 0.36.0: on `ButtonRound`'s departed tone the
green was a *hover* fill, transient and never the only signal a control was
there, but `ConfirmButton` takes the green on hover and holds it for as long as
the pointer is on the button. `--ui-safety-darker` (`#378f34`) clears 3:1
against white, so an app that wants the contrast at every state can point
`--ui-safety` at it, or set `--ui-text-on-safety` and move nothing else.

**Almost everything this library renders is an interactive control**, and
every one of those is a call to action, so they are on `--ui-action` -
button fills, ghost rules, the nav underline, the current-page label, the
rail's pipe, the tinted nav chips, and every focus ring. That is a fact about
what has been built, not a rule against `--ui-brand`; LayerController's layer
number is the first thing that reads it.

**New components should read `--ui-brand` whenever the element is chrome
rather than a control**: a divider, a section rule, a page-header underline, a
decorative border, a badge that labels rather than acts. Choose by what the
element *is*, not by the colour it comes out — both resolve to TC Red today,
so the choice is invisible right up until an app splits them, which is exactly
when a wrong one bites.

Focus rings stay on `--ui-action` deliberately: a ring is an interaction
affordance, and pinning it to the CTA colour keeps it legible when an app
picks something pale for its chrome.

### Identity vs role: `--ui-tc-red`, `--ui-brand` and `--ui-action`

Three things that are easy to conflate and must not be.

- **`--ui-tc-red` (primitive) is THIS library's identity.** `#e51a38`, Tom
  Coggia's red. A fixed fact; it never varies per app or per theme.
- **`--ui-brand` (semantic) is the CONSUMING app's identity** — what the app
  looks like. Defaults to `--ui-tc-red`, and a plant app repoints it to green.
- **`--ui-action` (semantic) is what the app's controls DO** — buttons, active
  nav, the selected segment, every focus ring. Also defaults to `--ui-tc-red`,
  and that same plant app could put its buttons in blue without touching its
  green.

The library leaves brand and action equal because its brand is red and its
buttons are too. They are separately settable precisely so an app does not
have to.

**A note on the name, because this doc used to forbid it.** An earlier version
called the *overridable CTA* token `--ui-brand`, and that had the mutability
backwards: it asked consumers to "override the brand colour with your brand
colour". The objection was to `brand` naming the **control** role, not to the
word. Now that `--ui-brand` names the app's own aesthetic, overriding the brand
colour with your brand colour is exactly what it is for, and the CTA role is
`--ui-action`. Renamed from `--ui-primary`/`--ui-accent` in 0.50.0.

Still don't let an app alias `--ui-tc-red` — overriding the primitive moves
every role built on it rather than the one you meant.

Declare them unlayered on `:root` (the library's defaults live inside
`@layer ui`, so any unlayered declaration wins regardless of import order):

```css
:root {
  --ui-action:              /* the CTA colour                        */;
  --ui-text-on-action:      /* text on a primary fill                */;
  --ui-brand:               /* brand/chrome: rules, labels            */;
  --ui-text-on-brand:       /* text on an accent fill                */;
  --ui-danger:               /* destructive actions, error states     */;
  --ui-text-on-danger:       /* text on a danger fill                 */;
  --ui-danger-lighter:       /* ConfirmButton's resting disc          */;
  --ui-danger-darker:        /* ConfirmButton's pressed disc          */;
  --ui-safety:               /* the affirmative action                */;
  --ui-text-on-safety:       /* text on a safety fill                 */;
  --ui-safety-lighter:       /* ConfirmButton's resting disc          */;
  --ui-safety-darker:        /* ConfirmButton's pressed disc          */;

  --ui-surface-inverse:      /* secondary: dark fill                  */;
  --ui-text-on-inverse:      /* text on that dark fill                */;

  --ui-surface-muted:        /* tertiary: grey fill                   */;
  --ui-surface-muted-hover:  /* tertiary hover                        */;
  --ui-surface-muted-active: /* tertiary pressed                      */;
  --ui-text-default:         /* text on a light/neutral fill          */;
  --ui-text-muted:           /* de-emphasised text (nav sub items)    */;
  --ui-text-faint:           /* placeholders, field labels            */;
  --ui-surface-raised:       /* floating panel fill (nav dropdown)    */;
  --ui-surface-pale:         /* the page under a rail or panel        */;

  --ui-surface-disabled:     /* disabled fill                         */;
  --ui-text-disabled:        /* disabled text, and ghost's border     */;
  --ui-border-default:       /* a hairline rule on a surface          */;
}
```

`--ui-action-lighter` is **not** in the list: it is deliberately not declared
on `:root`, because a tint composed there would freeze against `:root`'s
primary. Components derive it at the element
(`color-mix(in srgb, var(--ui-action) 15%, ...)`) and read the name first, so
an app can still pin it.

**Leave one out and it does not fail — it silently keeps the library's own
placeholder neutral.** That looks plausible in isolation, which is exactly why
it goes unnoticed; the app's palette and the component's drift apart one variant
at a time. Map all 21 or none. The list in `src/tokens.css` (section 2) is the
authority; if it and this page disagree, the file wins.

`--ui-surface-pale` was added with `LeftRail`, the first component to paint
its own ground. It is the counterpart of `--ui-surface-raised`, not a synonym:
`raised` is what floats (a dropdown, a card), `pale` is what those float over.
The pair keeps that order in both themes — in dark, `pale` is `--ui-ink`
(`#262626`) *below* `raised`'s `#2e2e2e`, rather than inverting. An app that
themed the library before `LeftRail` existed will not have mapped it, and per
the rule above that fails silently.

`--ui-text-muted` (Figma `TextSecondary`, `#737373`) and `--ui-surface-raised`
(the dropdown panel's fill) were both added with Nav. They are the only
semantic tokens no Button variant uses, so a consuming app that themed
the library before Nav existed will not have mapped it — and per the rule above
it fails silently, leaving dropdown sub items in the library's placeholder grey.
Check it when adopting Nav.

Most palettes lack a muted hover/active pair and a disabled surface. Deriving
them is fine and keeps the interaction feel: the library's own steps are
`#d4d4d4 -> #b8b8b8 -> #8c8c8c`, i.e. roughly 14% and 34% black, so
`color-mix(in srgb, var(--your-muted), black 14%)` reproduces it.

Only `primary` is exercised by NextJob today, so a wrong mapping shows up later,
in whichever app first uses `secondary`/`tertiary`/`ghost`. Check a new app by
rendering all four variants plus a disabled one side by side, not just the one
the app happens to use. NextJob's mapping in `src/styles/theme.css` is a worked
example.

## The greys are neutral, deliberately

Every grey in the palette is a true neutral — `R = G = B`. The palette used to
be split: the light-side neutrals (`100`-`500`) were neutral, while `--ui-ink`
and the four dark-side neutrals (`600`-`850`) carried a warm tint (`#282523`,
`#6b6764`, `#4a4643`, `#3a3735`, `#302d2b`). Mixing the two families is what
made a dark surface read slightly brown next to a light one.

Each was replaced by the neutral of the **same perceptual lightness** (CIE
L*), so only hue moved and nothing changed weight:

    #282523 -> #262626   L* 14.9    (--ui-ink)
    #6b6764 -> #686868   L* 43.9
    #4a4643 -> #474747   L* 30.0
    #302d2b -> #2e2e2e   L* 18.7

`--ui-neutral-800` is the exception: its neutral equivalent is `#383838`, and
it ships as `#3d3d3d` — that value lightened again by ~10% in L* (23.3 ->
25.8), because it carries the dark tertiary fill and read too heavy.

**It cannot go much lighter.** `--ui-surface-muted-hover` is `--ui-neutral-700`
at L* 30.0, so a fill much above L* ~27 would be lighter than its own hover
state and the interaction would read backwards. Lightening it further means
restructuring the whole dark muted ramp, not editing one value.

The playground chrome was neutralised to match. It deliberately does not use
library tokens, so its greys are separate literals and drift on their own.

## Light and dark are a semantic-tier concern

**Only the semantic tier varies by mode. Primitives are identical in Light and
Dark.** A primitive states what a colour *is* — `Neutral/300` is `#d4d4d4` —
and giving it a second value per mode moves everything built on it invisibly,
which collapses the two-tier split for the same reason an app must never alias
`--ui-tc-red`. What changes per mode is the **alias**: `Surface/Muted` points
at `Neutral/300` in Light and `Neutral/700` in Dark.

The code says this already: `:root` declares the primitives once and
`[data-theme="dark"]` re-declares only semantics. Figma's Light/Dark modes
mirror it exactly.

The role colours - primary, accent, danger, confirm and their on-colours - do
not move, deliberately: a colour that carries a meaning is the same colour in
either theme. The neutrals do. The table below is the original set as first
reconciled; `src/tokens.css`'s dark block is the current list (it adds
`--ui-text-faint`, `--ui-surface-pale` and `--ui-border-default`).

    Surface/Inverse       Color/Ink    -> Neutral/150
    Text/OnInverse        Color/White  -> Color/Ink
    Surface/Muted         Neutral/300  -> Neutral/700
    Surface/Muted Hover   Neutral/350  -> Neutral/650
    Surface/Muted Active  Neutral/400  -> Neutral/550
    Text/Default          Color/Ink    -> Neutral/150
    Text/Muted            Neutral/500  -> Neutral/400
    Surface/Raised        Color/White  -> Neutral/800
    Surface/Disabled      Neutral/150  -> Neutral/800
    Text/Disabled         Neutral/300  -> Neutral/550

**The structural caveat.** Modes belong to a *collection*, and this file has
one collection holding primitives, semantics, component tokens and other
projects' variables. So all 93 variables carry a Dark value whether they
should or not, and primitives staying identical is upheld by discipline rather
than by structure. The textbook arrangement is two collections — `Primitives`
with a single mode, `Semantic` with Light/Dark — which makes the invariant
impossible to break. Splitting means re-pointing every binding in a shared
file, so it has not been done; if it ever is, check the other projects first.
Until then, after any mode work, assert that no primitive differs between
modes.
