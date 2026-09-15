# Spinner

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

The brand mark as a loading indicator — the ring turns, the T stays put.
Taken from `LoadingSpinner` on tomcoggia.com (`src/app/components/`), the same
way Nav's dropdown behaviour was.

```tsx
<Spinner size={64} label="Loading" />
```

Two props: `size` and `label`. `--ui-spinner-color` stays as the override
hook — the playground demos only sizes now, but a spinner on a dark surface
still needs to be able to reverse.

## It shares Logo's artwork, it does not copy it

The site's spinner draws two `d` strings that are **byte-identical to
`Logo`'s `medium` weight** — it is the mark, not a lookalike. So the paths
moved to `src/internal/logoPaths.ts` and both components import them.

Two copies would mean two things to re-export the next time the mark is
redrawn in Figma, and only one of them would get done. That is the same
reasoning the Logo section already gives for exporting rather than redrawing.

**Medium weight only, and there is no `weight` prop.** Sharing the artwork
made all five available for nothing, and offering them was still wrong:
`Logo` has five because a mark is set at whatever weight its surroundings
want, whereas a spinner is the one thing an app shows while it waits. Five
ways to draw it is a choice nobody needs to make. The cost of reversing this
is a prop, not an export — the other four paths are already imported.

## It is not Button's loader, deliberately

`Button` spins three pulsing dots, because at button sizes a ring has too few
pixels to read — that reasoning is in the Button section and it still holds.
This is the page- and section-level loader. **Don't unify them**; they look
like duplicates and are not.

## What did not come across

- **The `py-[80px]` centring wrapper.** That is the page's layout, not the
  component — same call as `Card`'s 350x200 frame and `NavRail`'s example
  frame. A consumer centres it in whatever space it has.
- **The hardcoded `#E51A38`.** It is `--ui-spinner-color`, defaulting to
  `--ui-tc-red`. Its own token rather than reusing `--ui-logo-color`: the two
  are the same red today, but a spinner tinted to match a surface should not
  drag the logo with it — the same call as `--ui-nav-rail-pipe-width` versus
  `--ui-nav-accent-size`.
- **Tailwind's `animate-spin` and `origin-center`.** This library has no
  Tailwind.

## The motion tokens are periods, not transitions

`--ui-spinner-duration` (800ms) and `--ui-spinner-duration-reduced` (2400ms)
sit beside the component sizing tokens and deliberately do **not** reuse
`--ui-motion-fast` / `--ui-motion-base`. Those two describe how quickly a
thing settles after an interaction; a loop that never settles is a different
quantity, and 150ms would spin it absurdly. This is the one legitimate
exception to "component CSS must not hardcode a duration" — it doesn't
hardcode one, it just has its own scale.

## `prefers-reduced-motion` slows it, it does not stop it

Everywhere else in this library the reduced-motion branch removes the effect
outright — the rail's pipe stops drawing, its label stops sliding — because
those are decoration. **Here the motion is the information.** A frozen
spinner reads as a hung app rather than a calm one, so it keeps turning at
2400ms, well below the vestibular trigger threshold.

## `transform-box` is load-bearing

The ring rotates via the standalone `rotate` property (not `transform`, so it
composes with anything a consumer sets — the rule the nav and rail pipes
already follow). It needs `transform-box: view-box` with
`transform-origin: 50% 50%`: without it an SVG child resolves
`transform-origin` against its own bounding box, and the ring visibly wobbles
instead of spinning true. Verified resolved to `50px 50px`.

Naming follows `Logo`: `label` sets `role="status"` and `aria-label`, and
without it the spinner is `aria-hidden`. A spinner standing alone should pass
one — the opt-in exists for when something beside it already announces the
wait, not as a default to leave.

## Divergence — no Figma counterpart

`Spinner` exists only in code. Figma has the `logo-tc` set but nothing
modelling the animation, and Figma cannot express a continuous rotation as a
component anyway. See Open divergences.
