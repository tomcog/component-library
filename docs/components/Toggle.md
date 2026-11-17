# Toggle

Figma: `Toggle` set `1039:2177` — `State` = Toggle off | Toggle off hover |
Toggle on | Toggle on hover | Disabled, `Size` = XL | LG | MD (named for the
track, as in code), `Theme` = Color, and a `Track Icon?` boolean for
`trackIcon`. Reconciled to the code on 2026-11-16 (it had named sizes for the
knob, one step low). The knob is a Button/Round instance (Primary, at
Tone=Safety when on); the seat glyph is a Tertiary one. `Theme=Light` has no
code counterpart — divergence #61. Added in 0.88.0, from the goal cards in GTD,
where it is a goal's completion switch.

    track (h)   knob   glyph   stroke
    48          40     24      2
    40          32     20      1.5
    32          24     16      1

## It is a disc inside a track, and that is the whole geometry

The track is **two knobs and two insets** wide, stands **one knob and two
insets** tall, and the knob travels **exactly one knob**. The two seats are
therefore adjacent and the inset is equal at both ends in both states — 4px of
track showing on the near side, 4px on the far. Everything is stated from
`--toggle-knob` and `--ui-toggle-inset` (4px), so a size is one number changed
and the rest follows, which is what keeps the three honest.

    size   track     knob at off / on
    xl     88 x 48   4 / 44
    lg     72 x 40   4 / 36
    md     56 x 32   4 / 28

The ladder it sits on is the control ladder: the **track** takes the standard
height (48 / 40 / 32) and the **knob is the Button/Round disc one step below
it**. That is where the 4px inset comes from rather than being chosen: a
Toggle LG is a 40-high track around ButtonRound MD's 32 disc. So
`--ui-toggle-*-knob` aliases `--ui-button-round-*-size` instead of restating
it, and retuning a disc retunes the switch with it.

Sizes are named for the **track**, not the knob, so `size="lg"` sits level
with a `lg` Button or InputText.

## The ground carries the state with the knob

Off is the action tint under a solid action disc; on is the safety tint under
a solid safety disc — ButtonRound **Secondary**'s ground under **Primary**'s
disc, at `Tone=Default` and `Tone=Safety`. So the switch is made of the two
buttons the rest of the library is already made of, and it reads as one
control changing its mind rather than as a lamp going out.

**The colours are composed in the module, never in `tokens.css`.** A
`var(--ui-action)` inside a custom property resolves where it is *declared*,
so a tint written at `:root` freezes against `:root`'s action and ignores a
section that sets its own — which is exactly what happened the first time this
was built, and why `--ui-toggle-track-off` and its five siblings exist only as
hooks with the ButtonRound expressions as fallbacks. Same rule as
`--ui-action-lighter`; `src/tokens.css` opens with it.

## The glyphs are props

`offIcon` and `onIcon` are `ReactNode`, like ButtonRound's `icon`, so the
library takes no icon dependency. Both stay mounted in one grid cell and only
opacity and transform move, so the swap is a cross-fade and the knob never
reflows: the arriving glyph comes in from `scale(0.6)` and 30° out of true.
Passing neither is legal — a plain disc, which is what the "no glyphs" row in
the playground poses.

Stroke weight and `vector-effect: non-scaling-stroke` are handled as on
ButtonRound, on the `<svg>` **and** its descendants: a `stroke-width`
presentation attribute on a `<path>` beats a value inherited from the root,
and plenty of lucide icons set one.

## The far seat says what pressing would do

`trackIcon` fills the half of the track the knob is **not** in while off —
Figma `1039:2175`, where it is a Tertiary Button/Round in that seat: the glyph
alone, in the action colour, at the size the knob's own glyph takes. On a
completion switch it is a tick, so the empty half reads as "press here and
this is done".

It is positioned on the knob's own two numbers rather than laid out, so the
seat is exactly where the knob is about to be and the two cannot drift apart
when a size changes. It is drawn *before* the knob so the knob paints over it
on the way past, and it fades once the knob has arrived — there is nothing to
say about a seat that is occupied. It takes no pointer events: the whole track
is the switch, and a glyph that swallowed the press would leave a dead spot in
the half you are aiming at.

Its colour is `--ui-toggle-seat-icon`, falling back to the action colour.
Passing no `trackIcon` is the old drawing, unchanged.

## The disc darkens under the pointer

`:hover` darkens the knob by the same **22.3% of black** Button/Round's
Primary takes, in both states — the knob *is* that disc, so it answers the
pointer the way one does. The track does not move: the ground already says
which half you are in, and dimming it as well would say it twice.

The darkening is composed on the knob's own hook —
`--ui-toggle-knob-off-hover` and `--ui-toggle-knob-on-hover`, each falling
back to a `color-mix` of `--ui-toggle-knob-off` / `-on` — so an app that
repaints the knob gets *its* colour darkened rather than the action red it
replaced.

## It is a switch, not a checkbox

`role="switch"` with `aria-checked` on a `<button>`: the control *is* the
state, and assistive tech announces it as on or off. `onChange` is called with
the state the user is asking for — `(next: boolean)`, not an event — and the
component is always controlled.

The knob is drawn here rather than with `ButtonRound` because a button inside
a button is not valid HTML. It takes the same tokens instead.

Calling `preventDefault()` in your own `onClick` suppresses the change, which
is how a confirmation step gets in front of it.

## Do not "fix" these

- **No `sm`.** The design draws three, and a 16px knob would not hold a glyph.
- **No uncontrolled mode.** A switch with no `checked` has nothing to say.
- **Disabled greys the track as well as the knob.** A live track with a grey
  knob in it reads as a control mid-flight rather than one switched off.
