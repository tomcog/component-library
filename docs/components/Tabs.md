# Tabs

> Split out of CLAUDE.md on 2026-09-15. Where the text says "this file" or points at
> another section, it means the old single CLAUDE.md; that section now lives in `docs/`
> or `CHANGELOG.md` under the same heading.

An in-page view switcher. Figma: the `Tabs` strip set (`648:13715`) and the
`Tabs/Item` set (`646:2357`) on the Components page, with `Tabs/*` and
`Tabs Size/*/*` variables carrying the `--ui-tabs-*` code syntax. Both sets
carry a `Size` axis of `LG | XL`.

The strip was a plain COMPONENT at `646:2391` until XL arrived; it is now the
`Size=LG` variant inside the set. Promoting it was safe because it had zero
instances - checked against all 4478 instances in the file, not assumed.

**It was designed in the app file and moved here after.** The strip was first
drawn as a `PageTabs` frame in the NextJob file (`364:420`) while mocking the
job-detail page, iterated there, and only then built as a real component set in
this file. If the two ever disagree, this one is the library's.

**Not a nav, and the distinction is the whole design.** `Nav`, `NavRail` and
`BottomNav` move you between PAGES and are built from links. This swaps what is
shown inside the page you are already on, so it is a real `tablist` of
**buttons** — and gets the ARIA tab pattern rather than `aria-current`.

    tab      icon 18 · label 14/500/21 · icon-gap 8 · padding-bottom 8 · rule 3
    strip    gap between tabs 32 · rule 1 · both rules --ui-primary

**There are two sizes.** The numbers above are `lg`, the default. `xl` is
18/24 with a 20 icon and stands 35 tall; only font size, line height and icon
size are size-scoped, so the gap, padding-bottom and rule are shared and an XL
strip is the same object set larger.

    <Tabs size="xl" aria-label="Resource types">
      <Tab active onClick={...}>Companies</Tab>
      <Tab onClick={...}>Job sites</Tab>
      <Tab onClick={...}>People</Tab>
    </Tabs>

**The prop is on the strip; Figma's axis is on the item.** A strip is one size
throughout, and the rule under it has to be continuous - a per-tab size could
build a ragged row whose rules do not line up. Figma repeats the axis on
`Tabs/Item` because a variant axis is the only way it can express this. Not
drift; don't "fix" it by adding `size` to `Tab`.

**Only two steps, not Button's four.** A step exists when something uses it -
the same rule that cut the type scale from six to four. `md` and `sm` are not
missing, they are unbuilt.

## It was measured off the app, not read off the drawing

The markup asks for a 16px icon and the CSS overrides it to 18, so the rendered
size — the one that matters — is **18**. Reading the JSX would have got it
wrong, and did: the Figma node was drawn at 16 and had to be corrected.

## Space between tabs is a GAP, never padding

This is the one that took five attempts to get right, so it is worth being
blunt about. The tabs carry **no inline padding at all**; they are separated by
`--ui-tabs-gap` on the list. Padding inside each tab is the wrong instrument:
it widens every hit area, it grows the space between two tabs at *twice* the
rate you set it, and it cannot put air before the first tab or after the last
without also padding the ends of the strip.

Three different gaps live here and they must not be confused:

| token | between |
|---|---|
| `--ui-tabs-gap` | one tab and the next (32) |
| `--ui-tabs-icon-gap` | a tab's icon and its label (8) |
| `--ui-tabs-padding-bottom` | a label and its own rule (8) |

## The icon carries its own colour

Not `currentColor`. An idle tab is a **dark label beside a muted glyph** — the
label holds the weight, the icon stays quiet — so the two cannot inherit
together the way they do in `NavSlat` and `Button`. `--ui-tabs-icon` is muted,
and goes primary on hover and when selected.

## The line box is 21, and stays there

A tab is label + gap + rule = `21 + 8 + 3 = 32`, which is the strip height the
design sets. The 21 came from DM Sans at 16, and it is **held** now the label
is 14 — the type shrank, the strip did not. Letting the line box follow the
font size would have taken 3px off every tab bar in the app.

## Tabs hug; the rule spans

Each tab is as wide as its label needs. The 1px primary rule is on the bar,
which is `width: 100%`, so the line runs the full container while the tabs
sitting on it do not.

They were equal shares at first — which is how the source design drew a
four-tab strip, and only looks right at exactly that count: the same rule turns
a two-tab strip into two 50% slabs.

## The rule is transparent, never absent

Every tab draws its 3px rule at every state and only the colour changes.
Toggling `border-bottom` on and off would move the row by 3px each time you
picked a view.

## The keyboard is the reason this is a component

`role="tab"` without arrow keys is a lie: a screen-reader user is told this is
a tablist and then finds the arrows do nothing. So the full pattern is here —
`←`/`→` move **and select** (automatic activation, which is what suits a view
switcher: the view follows the focus), `Home`/`End` jump to the ends, and both
directions wrap. A roving `tabIndex` means Tab enters the strip at the selected
view and leaves it, rather than walking through every one.

Selection stays the consumer's: the arrow handler calls the focused tab's own
`click()`, so it runs whatever handler that tab already carries instead of
inventing a second channel for state.

## `trailing` sits outside the tablist

A tablist's children must be tabs, so an action parked among them would be a
lie to a screen reader. It renders as a sibling inside the strip; the tabs
still share what is left, so the bar looks the same with or without it.

## `type` is omitted from `TabProps`, not defaulted

A `<button>` inside a form submits it unless told otherwise, and a tab must
never submit anything — so that is not a choice to leave with the consumer.

## One line, two weights

The bar sits on a 1px primary rule that runs the full container, and the
selected tab thickens it to 3px on the same line. Not two lines: an earlier cut
put an 8px gap between them and it read as a stray stroke.

`--ui-border-subtle` was added for this and removed again inside one version.
An intermediate design gave the strip a near-invisible grey hairline, which
needed a token the library did not have; the rule then went primary and the
token had no consumer left. It came out for exactly the reason `Card`'s copy
did. `--ui-tabs-border` is the hook if a quiet rule is ever wanted on an
instance.
