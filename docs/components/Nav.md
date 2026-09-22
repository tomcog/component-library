# Nav

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

Sitewide navigation. Figma: `Navigation Components` (node `342:4239`) — the
component sets `Nav`, `Nav/Item`, `Nav/Dropdown`, `Nav/Dropdown/Item`.
**The logo is not part of it** — it sits beside the nav in the page header.

```tsx
<Nav aria-label="Main">
  <NavItem asChild active={pathname === "/"}><Link href="/">Home</Link></NavItem>
  <NavDropdown label="My work">
    <NavDropdownItem asChild><Link href="/simplescreen">SimpleScreen</Link></NavDropdownItem>
  </NavDropdown>
</Nav>
```

## NavDropdown is a hover/focus disclosure

Figma shows only a static column, so the behaviour was taken from the working
implementation on tomcoggia.com (dev server, port 5170) and matches it:

| | value |
|---|---|
| panel enter | `opacity 0 -> 1`, `translateY(-4px) -> 0` |
| panel | `right: -20px`, `12px` below trigger, white, `16px 20px` padding, `12px` gap, right-aligned |
| sub item hover | label indents `8px`; red pipe **drawn top to bottom** (`scale: 1 0 -> 1 1`, `transform-origin: top`), `4px` wide, `20px` tall, `1px` radius |
| sub item current | red label **only** — no pipe, no indent |
| duration | `--ui-motion-fast` (150ms) for colour, `--ui-motion-base` (200ms) for travel |

Three things not to "simplify":

- **The trigger-to-panel offset is padding on the panel, not a `top` gap.** A
  real gap leaves a strip where the pointer is over neither element, so the
  menu closes as you reach for it. Transparent `padding-top` keeps the hover
  region contiguous and needs no close-timer.
- **The indent lives on the label, not as padding on the link.** Padding would
  slide the pipe with the text; the pipe has to stay pinned to the right edge.
- **The pipe is drawn top to bottom** — it scales vertically from its top edge
  like a stroke being laid down. Use the standalone `scale` property with
  `transform-origin: top`, not `transform`, so it composes with anything a
  consumer sets on `transform`. Width animates `0 -> 4px` alongside it so the
  pipe takes no horizontal room until drawn. Note Tailwind v4 emits `scale-y-*`
  as the `scale` property: reading `transform` on the reference implementation
  shows `none` and makes the vertical draw look absent when it is not.
- **The current sub item is red text only** — no pipe, no indent, and hovering
  it adds neither, so the two states never compound. Mirrors NavItem's
  `State=Current`, which likewise drops its rule.

The panel is hidden with `visibility`, not `display`, so it stays out of the
tab order while closed *and* can still transition out — the same trick Button
uses for its loading content.

## State names

| Figma | Code |
|---|---|
| `State=Default` | resting |
| `State=Hover` | `:hover`, or `underlined` to pin it (NavDropdown pins it while open) |
| `State=Current` | `active` — primary-coloured label, rule suppressed |

The prop is `active`; the CSS class and component token are `current`
(`.current`, `--ui-nav-item-text-current`). Not an oversight: `-active` was
unavailable because in CSS it already means *pressed* (`:active`), so a token
named `-active` would read as the pressed state. `current` matches the
`aria-current` the prop emits. `active` stays as the public prop because that
is what a nav prop is conventionally called. Figma's variant was renamed from
`State=On` to `State=Current` to match, so there are now two vocabularies, not
three: `active` at the API boundary, `current` everywhere else.

`active` also sets **`aria-current="page"`**. Active detection is the app's job
(`active={pathname === "/resume"}`), not a `currentPath` prop: with `asChild`
the `href` lives on the `next/link` child, so `Nav` cannot read it, and
per-app matching rules don't belong in a library. A `currentPath` layer could
be added over `active` later; the reverse cannot.

## Divergences — do not "fix" these

- **There is no icon variant, deliberately.** `Nav/Item` used to carry an
  `Icon?` boolean and a `Nav Icon` instance swap, and an earlier pass modelled
  them in code. No nav in use has an icon, so the prop, its CSS slot and the
  `--ui-nav-icon-size` / `--ui-nav-item-gap` tokens were removed — and the
  property and its three icon layers were then deleted from Figma too. Neither
  side has it now; don't add it back to either.
- **The dropdown trigger is a `<button>`** with `aria-expanded`/`aria-haspopup`,
  and the panel opens on focus as well as hover, with Escape closing it and
  restoring focus. tomcoggia.com uses a `<span>`, which no keyboard user can
  reach. Don't downgrade it to match.
- **Sub items rest at `--ui-text-muted` and darken to `--ui-text-default` on
  hover**, per Figma; the current one is `--ui-action`.
  tomcoggia.com rests them at `#1c1917` and hovers to `#171717` — a transition
  too small to see, which looks like an oversight rather than a decision.
- **Three different blacks exist.** Figma's nav binds to a variable literally
  named `"Black"` (with the quote characters — a naming bug in the file) =
  `#171717`; tomcoggia.com uses `#1c1917`; the library's `--ui-text-default`
  is `#262626`. The component uses `--ui-text-default` so a themed app's nav
  matches its Buttons. Reconciling Figma is a token-shaped change.
- **The top-level rule sits directly under the line box** (`top: 100%`), per
  Figma. tomcoggia.com sits it 2px lower; reproduce that with
  `--ui-nav-item-underline-offset: 2px`.
- **No mobile/hamburger.** tomcoggia.com has `hidden md:flex` plus a toggle
  button; Figma specs neither. Design it before building it.
- **Focus rings are code-only**, matching Button.
