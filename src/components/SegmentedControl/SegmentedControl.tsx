import { forwardRef, useRef } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import styles from "./SegmentedControl.module.css";

declare const process: { env: { NODE_ENV?: string } };

/**
 * Figma: the `Size` axis on both `Segment` (555:14966) and `SegmentedTrack`
 * (558:15011).
 *
 * Two steps, because two are drawn - the same rule Tabs follows. `xl` and `sm`
 * are not missing, they are unbuilt.
 */
export type SegmentedControlSize = "lg" | "md";

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

export interface SegmentedControlProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** The `<Segment>` children. */
  children: ReactNode;
  /**
   * `lg` is a 40px segment on 14/20 in a 48px track; `md` is 32 on 12/16 in a
   * 40px track. Nothing else moves - the radius, the 4px inset, the gap
   * between segments and the icon gap are shared, so an MD control is the same
   * object set smaller.
   */
  size?: SegmentedControlSize;
  /** The selected segment's ground. Defaults to `primary`. */
  variant?: SegmentedControlVariant;
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
 * the selection. Home and End jump to the ends, and both directions wrap. Only
 * the selected segment is in the tab order, so Tab enters the group at the
 * current choice and leaves rather than walking every option.
 *
 * Selection is the consumer's: the arrow handler fires the focused segment's
 * own `onClick`, so it composes with whatever state that handler already
 * drives - the same contract Tabs has.
 */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  function SegmentedControl(
    { children, size = "lg", variant = "primary", className, ...props },
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
        className={[styles.track, styles[size], styles[variant], className]
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
   */
  icon?: ReactNode;
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
  { selected = false, icon, children, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      // Roving tabindex: Tab enters the group at the current choice rather
      // than walking through every option.
      tabIndex={selected ? 0 : -1}
      className={[styles.segment, selected ? styles.selected : null, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
});
