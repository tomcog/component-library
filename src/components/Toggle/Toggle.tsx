import { forwardRef } from "react";
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import styles from "./Toggle.module.css";

// Same literal-expression note as Button: bundlers substitute this exact
// string, and an optional chain silently never fires.
declare const process: { env: { NODE_ENV?: string } };

/**
 * Figma: Size. The TRACK takes the control ladder's height - 48 / 40 / 32 -
 * and the knob is the Button/Round disc one step below it, so a Toggle sits
 * level with a Button or an InputText of the same name.
 */
export type ToggleSize = "xl" | "lg" | "md";

export interface ToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type" | "value"> {
  /** Which side the knob is on. The control is always controlled. */
  checked: boolean;
  /** Called with the state the user is asking for, not with an event. */
  onChange: (next: boolean) => void;
  /**
   * The accessible name. A switch carries no visible label of its own, so
   * this is the only thing a screen reader has to go on - "Mark the car
   * washed", not "Toggle".
   */
  label?: string;
  /** Figma: Size. Defaults to `lg`. */
  size?: ToggleSize;
  /** The glyph on the knob while off, e.g. any Lucide React icon. */
  offIcon?: ReactNode;
  /** The glyph on the knob while on. */
  onIcon?: ReactNode;
}

/**
 * A two-state switch: a disc travelling inside a SegmentedTrack, the ground
 * tinted to the half it is in - the action tint while off, the safety tint
 * once on. Figma: `Toggle` (60:2027 / 60:2031).
 *
 * `role="switch"` with `aria-checked` rather than a checkbox: the control IS
 * the state, and assistive tech announces it as on or off. The knob is drawn
 * here rather than with ButtonRound because a button inside a button is not
 * valid HTML - it takes the same disc tokens instead.
 *
 * Both glyphs stay mounted and share one grid cell, so the swap is a
 * cross-fade rather than a pop and the knob never reflows.
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { checked, onChange, label, size = "lg", offIcon, onIcon, className, onClick, ...props },
  ref,
) {
  if (process.env.NODE_ENV !== "production") {
    const named = label != null || props["aria-label"] != null || props["aria-labelledby"] != null;
    if (!named) {
      console.warn(
        "[@tomcoggia/ui] Toggle: no `label` and no accessible name. " +
          'Pass `label` or aria-label="…" - a switch has no visible text of its own.',
      );
    }
  }

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    onClick?.(e);
    if (e.defaultPrevented) return;
    onChange(!checked);
  }

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={[styles.root, styles[size], className].filter(Boolean).join(" ")}
      onClick={handleClick}
      {...props}
    >
      <span className={styles.knob} aria-hidden="true">
        {offIcon != null ? <span className={`${styles.glyph} ${styles.off}`}>{offIcon}</span> : null}
        {onIcon != null ? <span className={`${styles.glyph} ${styles.on}`}>{onIcon}</span> : null}
      </span>
    </button>
  );
});
