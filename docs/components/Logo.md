# Logo

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

Tom Coggia's brand mark. Figma: the `logo-tc` set (`107:7630`), one axis
`Weight` = `x-light` | `light` | `medium` | `heavy` | `x-heavy`.

```tsx
<Logo weight="medium" size={40} label="Tom Coggia" />
```

**The paths are exported from Figma, not redrawn.** Each weight is two paths —
the open ring and the T — pulled straight out of the component with
`exportAsync`, so the curves are the artwork's. If a weight is ever redrawn in
Figma, re-export rather than nudging the `d` strings by hand.

## TC Red by default

The mark defaults to `--ui-tc-red`. It is Tom Coggia's brand mark and red is
what the brand is; `--ui-logo-color` overrides it, and that property inherits,
so any ancestor can reverse the mark on ink or knock it back to text colour.

**`--ui-tc-red`, deliberately not `--ui-action`.** Primary is the role an app
owns and recolours. An app recolouring its own primary to blue must not turn
someone else's logo blue — so this is the identity half of the identity/role
split, and the one component that legitimately reaches for the primitive.
Confirmed live: the mark stays red in dark mode and when the playground's
primary picker is moved.

**This reverses an earlier decision, at the user's instruction.** This section
used to argue the opposite — that the mark "carries no colour of its own",
that it should inherit, and that `--ui-tc-red` "would be the *wrong* default
even though the mark is the brand". That was a defensible reading, but it was
not the user's, and it is now settled the other way. Don't re-derive the old
argument and revert it; if it changes again it will be because the user says
so.

**The old section also described behaviour the component never had.** It said
the mark "takes its colour from context via currentColor". It does not:
`.logo` declares `color` on the element itself, so its own declaration beats
anything inherited, and `currentColor` on the fill just points back at that
declaration. Measured before the change — an ancestor setting `color: blue`
left the mark at `#262626`. Only `--ui-logo-color` ever worked, or `style` on
the element itself (which is why the playground's reversed-on-ink specimen
appeared to work). The playground demo now overrides through the custom
property, so it demonstrates the supported route rather than the accidental
one.

## Naming is opt-in

`label` sets `role="img"` and `aria-label`; without it the mark renders
`aria-hidden`. A logo beside a wordmark is decorative and should not be
announced twice, but one standing alone as the page's identity must be — the
component cannot tell which, so the caller says.
