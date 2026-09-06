import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Checkbox.module.css";

// Same literal-expression note as Button: bundlers substitute this exact
// string, and an optional chain silently never fires.
declare const process: { env: { NODE_ENV?: string } };

/** Figma: Size. There is no SM - the design draws three. */
export type CheckboxSize = "xl" | "lg" | "md";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /**
   * The text beside the box. The whole row is a `<label>`, so this both names
   * the control and extends its hit target. Omit it and no text is rendered,
   * in which case pass `aria-label` or the box has no accessible name.
   */
  label?: ReactNode;
  /** Figma: Size. Defaults to `lg`. */
  size?: CheckboxSize;
}

/**
 * A checkbox and its label. Figma: `Checkbox` (615:15245).
 *
 * The control is a real `<input type="checkbox">`. It is drawn at 1px behind
 * the glyph rather than hidden, because `display:none` and
 * `visibility:hidden` both remove it from the focus order - this way space
 * toggles it, forms submit it, and screen readers announce it as a checkbox
 * with a checked state, none of which a div can be made to do properly.
 *
 * `className` lands on the outer `<label>`; every other prop spreads onto the
 * input, which is what the ref points at.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, size = "lg", className, ...props },
  ref,
) {
  if (process.env.NODE_ENV !== "production") {
    const named =
      props["aria-label"] != null ||
      props["aria-labelledby"] != null ||
      props.title != null;
    if (label == null && !named) {
      console.warn(
        "[@tomcoggia/ui] Checkbox: no `label` and no accessible name. " +
          'Pass `label` or aria-label="…" - the box is aria-hidden on its own.',
      );
    }
  }

  return (
    <label className={[styles.root, styles[size], className].filter(Boolean).join(" ")}>
      <input ref={ref} type="checkbox" className={styles.input} {...props} />
      <span className={styles.slot}>
        {/* lucide `square` and `square-check`, drawn as one glyph rather than
            swapped between two: the tick is always in the DOM and only its
            opacity moves, so hover can fade it in without the box reflowing. */}
        <svg
          className={styles.glyph}
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          {/* The square is stock lucide `square`. The tick is NOT stock
              `square-check` - the design scales that one up by 1.5, to 9x6
              units at (7.5, 9) against lucide's 6x4 at (9, 10). Traced off the
              file's own vector paths rather than taken from the icon set,
              because the two do not match. */}
          <rect className={styles.box} width="18" height="18" x="3" y="3" rx="2" />
          <path className={styles.check} d="M7.5 12 L10.5 15 L16.5 9" />
        </svg>
      </span>
      {label != null ? <span className={styles.label}>{label}</span> : null}
    </label>
  );
});
