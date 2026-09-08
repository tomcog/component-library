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
        {/* NOT a lucide icon, and not swappable. Four filled paths exported
            straight out of the Figma component set - `lucide/square`,
            `lucide/square-check`, `lucide/square-checked` and
            `lucide/square-filled` - which is where this glyph is drawn and
            where it has to be re-exported from if it ever moves.

            The name `lucide/*` in that file is where the artwork STARTED, not
            what it is: the tick was scaled up from lucide's, and all four have
            since been flattened to single filled shapes. Nothing here imports
            an icon set, and this is one of only two places in the library that
            carries glyph geometry at all.

            All four are in the DOM at every state and only their opacity
            moves, so the tick can fade rather than pop and the glyph never
            reflows. Each is one closed shape in currentColor, so a state is a
            single colour on .glyph plus which of these are showing - which is
            exactly how the Figma cells are built. */}
        <svg
          className={styles.glyph}
          viewBox="0 0 16 16"
          aria-hidden="true"
          focusable="false"
        >
          {/* Unchecked: the outline, as a filled ring rather than a stroke. */}
          <path className={styles.ring} d="M13.5 3.33301C13.4998 2.87303 13.127 2.50018 12.667 2.5H3.33301C2.87303 2.50018 2.50018 2.87303 2.5 3.33301V12.667C2.50018 13.127 2.87303 13.4998 3.33301 13.5H12.667C13.127 13.4998 13.4998 13.127 13.5 12.667V3.33301ZM14.5 12.667C14.4998 13.6793 13.6793 14.4998 12.667 14.5H3.33301C2.32074 14.4998 1.50018 13.6793 1.5 12.667V3.33301C1.50018 2.32074 2.32074 1.50018 3.33301 1.5H12.667C13.6793 1.50018 14.4998 2.32074 14.5 3.33301V12.667Z" />
          {/* Hover previews this over the ring, unchecked only. */}
          <path className={styles.tick} d="M11.0244 5.31055C11.2476 5.08739 11.6098 5.08739 11.833 5.31055C12.0557 5.53366 12.0558 5.89511 11.833 6.11816L7.26074 10.6895C7.03758 10.9125 6.67625 10.9126 6.45312 10.6895L4.16699 8.4043C3.94391 8.18116 3.94394 7.81886 4.16699 7.5957C4.39014 7.37256 4.75242 7.37259 4.97559 7.5957L6.85742 9.47754L11.0244 5.31055Z" />
          {/* Disabled unchecked: the same square with no tick and no hole. */}
          <path className={styles.solid} d="M14.5 12.667C14.4998 13.6793 13.6793 14.4998 12.667 14.5H3.33301C2.32074 14.4998 1.50018 13.6793 1.5 12.667V3.33301C1.50018 2.32074 2.32074 1.50018 3.33301 1.5H12.667C13.6793 1.50018 14.4998 2.32074 14.5 3.33301V12.667Z" />
          {/* Checked, enabled or not: ONE shape with the tick knocked out of
              it, so the tick is the ground showing through rather than a
              second colour painted on top. That is why disabled checked needs
              no second token - see the module. */}
          <path className={styles.knockout} d="M12.667 1.5C13.6793 1.50018 14.4998 2.32074 14.5 3.33301V12.667C14.4998 13.6793 13.6793 14.4998 12.667 14.5H3.33301C2.32074 14.4998 1.50018 13.6793 1.5 12.667V3.33301C1.50018 2.32074 2.32074 1.50018 3.33301 1.5H12.667ZM11.833 5.31055C11.6098 5.08739 11.2476 5.08739 11.0244 5.31055L6.85742 9.47754L4.97559 7.5957C4.75242 7.37257 4.39014 7.37255 4.16699 7.5957C3.94392 7.81886 3.94389 8.18116 4.16699 8.4043L6.45312 10.6895C6.67626 10.9126 7.03758 10.9125 7.26074 10.6895L11.833 6.11816C12.0558 5.89511 12.0557 5.53366 11.833 5.31055Z" />
        </svg>
      </span>
      {label != null ? <span className={styles.label}>{label}</span> : null}
    </label>
  );
});
