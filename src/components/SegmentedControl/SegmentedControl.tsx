import { forwardRef, useEffect, useRef } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import styles from "./SegmentedControl.module.css";
import hidden from "../../internal/visuallyHidden.module.css";

declare const process: { env: { NODE_ENV?: string } };

/**
 * Figma: the `Size` axis on both `Segment` (555:14966) and `SegmentedTrack`
 * (558:15011).
 *
 * The full control ladder - 48 / 40 / 32 / 24 - aliased from
 * `--ui-control-*-height`, so a segment stands level with a Button or a
 * ButtonRound at the same step without anyone measuring.
 */
export type SegmentedControlSize = "xl" | "lg" | "md" | "sm";

/**
 * Which ground the SELECTED segment takes. `primary` is the brand fill;
 * `dark` is the near-black one.
 *
 * Figma models these as two `State` values on the segment, `Active` and
 * `Dark`, which is the only way a variant axis can say it. In code it belongs
 * on the TRACK: a control whose selected segment is red today and black
 * tomorrow depending on which one you clicked would be a different control
 * each time. One track, one treatment - the same reasoning that puts `size` on
 * the strip in Tabs.
 */
export type SegmentedControlVariant = "primary" | "dark";

/**
 * Which ground the TRACK takes - the pill the segments sit in. Figma: the
 * `Color` axis on `SegmentedTrack` (558:15011).
 *
 * `gray` is `--ui-surface-pale` and `white` is `--ui-surface-raised`, so the
 * names say what light mode draws and both still follow the theme: a `white`
 * track is the raised near-black in dark mode, exactly as `Card` is. Kept as
 * Figma names them rather than renamed to the semantics, because the two
 * sides are meant to be readable as one thing.
 *
 * `white` exists because the pale track disappears on a pale page - NextJob's
 * dashboard ground IS `#f5f5f5`, and it has been overriding
 * `--ui-segmented-track-bg` by hand to get out of the collision. This says it
 * as a prop.
 */
export type SegmentedControlTone = "gray" | "white";

export interface SegmentedControlProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** The `<Segment>` children. */
  children: ReactNode;
  /**
   * The control ladder: `xl` 48 on 18/24, `lg` 40 on 14/20, `md` 32 on
   * 12/16, `sm` 24 on 10/12 - and the track stands the same, the inset being
   * zero. Height, padding, icon and both gaps step; only the radius is
   * shared.
   */
  size?: SegmentedControlSize;
  /** The selected segment's ground. Defaults to `primary`. */
  variant?: SegmentedControlVariant;
  /** The TRACK's ground. Defaults to `gray`. */
  tone?: SegmentedControlTone;
  /**
   * Names the group. Required in practice: a screen reader announces "radio
   * group" with nothing to say which one, on a page that may hold several.
   */
  "aria-label"?: string;
}

/**
 * A single choice from a short, fixed set - a filter row, a sort order.
 * Figma: `SegmentedTrack` (558:15011) holding `Segment` (555:14966).
 *
 *     <SegmentedControl aria-label="Sort order">
 *       <Segment selected={sort === "newest"} onClick={() => setSort("newest")}>Newest</Segment>
 *       <Segment selected={sort === "az"} onClick={() => setSort("az")}>A-Z</Segment>
 *     </SegmentedControl>
 *
 * **NOT Tabs, and not Pill.** Tabs swaps what is shown inside a page and is a
 * `tablist`; Pill is one independent toggle that happens to sit beside others,
 * so each carries its own `aria-pressed`. This is N options of which exactly
 * one holds - a radio group - and saying so is what tells a screen reader that
 * choosing one un-chooses the rest.
 *
 * **Keyboard**: the arrow keys move between segments and select as they go,
 * which is the radio-group pattern and what suits a filter - the list follows
 * the selection. Home and End jump to the ends, and both directions wrap. One
 * segment is in the tab order, so Tab enters the group at the current choice
 * and leaves rather than walking every option.
 *
 * That one segment is the selected one WHERE THERE IS ONE. A group need not
 * carry a selection - two actions that are never "current" are a real case -
 * and a group with none still has to be reachable, so the tab stop falls to
 * the first segment that is not disabled. Without that the stop rides on a
 * selection that never comes and Tab walks straight past the whole control.
 *
 * Selection is the consumer's: the arrow handler fires the focused segment's
 * own `onClick`, so it composes with whatever state that handler already
 * drives - the same contract Tabs has.
 */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  function SegmentedControl(
    { children, size = "lg", variant = "primary", tone = "gray", className, ...props },
    ref,
  ) {
    const track = useRef<HTMLDivElement | null>(null);

    if (process.env.NODE_ENV !== "production") {
      if (props["aria-label"] == null && props["aria-labelledby"] == null) {
        console.warn(
          "[@tomcoggia/ui] SegmentedControl: no accessible name. Pass `aria-label` - " +
            'a page can hold more than one, and "radio group" alone does not say which.',
        );
      }
    }

    // The tab stop is owned here rather than by the segment, because a segment
    // knows only whether IT is selected and this is a question about the group:
    // when none of them is, the stop has to fall somewhere anyway. Re-applied
    // after every render, since React writes each segment's own `tabIndex` from
    // its `selected` prop and would otherwise leave a stop behind on a segment
    // that has since lost it.
    useEffect(() => {
      const segments = Array.from(
        track.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [],
      );
      if (!segments.length) return;
      const selected = segments.find((s) => s.getAttribute("aria-checked") === "true");
      const stop = selected ?? segments.find((s) => !s.disabled);
      for (const segment of segments) segment.tabIndex = segment === stop ? 0 : -1;
    });

    function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
      if (!keys.includes(event.key)) return;
      const segments = Array.from(
        track.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)') ?? [],
      );
      if (!segments.length) return;
      const from = segments.indexOf(document.activeElement as HTMLButtonElement);
      if (from === -1) return;
      event.preventDefault();

      // Wraps, as the pattern specifies: the ends are neighbours. Up and Down
      // are included because a radio group answers both axes - the control is
      // drawn as a row, but the pattern is not about which way it is drawn.
      const back = event.key === "ArrowLeft" || event.key === "ArrowUp";
      const to =
        event.key === "Home" ? 0
        : event.key === "End" ? segments.length - 1
        : back ? (from - 1 + segments.length) % segments.length
        : (from + 1) % segments.length;

      segments[to].focus();
      // The selection follows the focus, which is the radio pattern. `click()`
      // rather than a callback of our own, so it runs whatever handler the
      // segment already carries.
      segments[to].click();
    }

    return (
      <div
        ref={(node) => {
          track.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        role="radiogroup"
        aria-label={props["aria-label"]}
        aria-labelledby={props["aria-labelledby"]}
        className={[styles.track, styles[size], styles[variant], styles[tone], className]
          .filter(Boolean)
          .join(" ")}
        onKeyDown={onKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  },
);

/* `type` is omitted rather than defaulted: a button inside a form submits it
   unless told otherwise, and choosing a filter must never submit anything - so
   the choice is not the consumer's to make. */
export interface SegmentProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** The chosen option. Sets `aria-checked` and the ground. */
  selected?: boolean;
  /**
   * Decorative icon, e.g. any Lucide React icon. Always `aria-hidden`: the
   * label is the accessible name. Its stroke is `currentColor`, so it follows
   * the label through idle, hover and selected without a rule of its own.
   *
   * Drawn LARGER than the label's line box - 24 / 18 / 14 against 20 / 16 /
   * 12 - which is why the segment's height is a token rather than something
   * the type derives.
   *
   * Its OPACITY depends on whether a label shows beside it: 0.65 when one
   * does, so the label leads, and full strength when the glyph is alone. See
   * `hideLabel`.
   */
  icon?: ReactNode;
  /**
   * Draw the icon alone, keeping the label in the accessibility tree.
   * Figma: `Label?` on the `Segment` set.
   *
   * Pass the label as `children` as usual and set this - the text is
   * visually hidden, never `display: none`, so it is still the name a screen
   * reader announces and still what the segment is called in the radio group.
   * That is the whole reason this is a prop rather than "just leave the
   * children out": a row of unnamed glyphs is a control nobody can use, and
   * `aria-label` on each one is the same string in a worse place.
   *
   * Leaving `children` out entirely also works and warns in dev unless you
   * pass `aria-label`, `aria-labelledby` or `title`.
   *
   * The segment keeps its height and hugs to padding + icon. The padding is
   * uniform and the icon is square, so this comes out a PERFECT CIRCLE at
   * every step - 48, 40, 32, 24 - and it is the same circle `ButtonRound`
   * draws, both reading `--ui-control-*`. That is intentional, and it does
   * NOT make them one component: this is one option in a radio group and that
   * is an independent action, which is the whole of the difference. Figma has not posed one - this is the
   * mechanical result of its own `Label?` boolean, not a drawn size.
   */
  hideLabel?: boolean;
}

/**
 * One option in a `SegmentedControl`. Figma: the `Segment` set (555:14966).
 *
 * It carries no `size` or `variant` of its own - the track sets both for every
 * segment in it.
 *
 * Only the selected segment has a ground. An idle one is a label on the
 * track's own pale pill, and hovering it changes the LABEL alone rather than
 * giving it a ground of its own: two grounds in one track would read as two
 * things chosen.
 */
export const Segment = forwardRef<HTMLButtonElement, SegmentProps>(function Segment(
  { selected = false, icon, hideLabel = false, children, className, ...props },
  ref,
) {
  /* `null`, `undefined` and `false` are all "no label" - the shapes a
     conditional child comes out as. An empty string is not treated specially:
     it is a label the caller passed, and guessing otherwise would hide a bug
     rather than the label. */
  const hasLabel = children != null && children !== false;
  const labelShown = hasLabel && !hideLabel;

  if (process.env.NODE_ENV !== "production") {
    if (
      !hasLabel &&
      props["aria-label"] == null &&
      props["aria-labelledby"] == null &&
      props.title == null
    ) {
      console.warn(
        "[@tomcoggia/ui] Segment: an icon-only segment needs an accessible name. " +
          "Pass the label as children with `hideLabel`, which keeps it as the name, " +
          "or pass aria-label, aria-labelledby or title.",
      );
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      // Roving tabindex: Tab enters the group at the current choice rather
      // than walking through every option.
      tabIndex={selected ? 0 : -1}
      className={[
        styles.segment,
        selected ? styles.selected : null,
        // Drives the icon's opacity, and keyed off the label being SHOWN: a
        // hidden-but-named label leaves the glyph alone on screen, which is
        // what the rule is about.
        labelShown ? null : styles.iconOnly,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {hasLabel ? (
        hideLabel ? <span className={hidden.visuallyHidden}>{children}</span> : children
      ) : null}
    </button>
  );
});
