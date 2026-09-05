import { forwardRef } from "react";
import type { SVGAttributes } from "react";
import { LOGO_PATHS } from "../../internal/logoPaths";
import styles from "./Spinner.module.css";

export interface SpinnerProps extends Omit<SVGAttributes<SVGSVGElement>, "children"> {
  /** Rendered size in px, or any CSS length. Square. */
  size?: number | string;
  /**
   * Accessible name, e.g. "Loading". Omit it and the spinner is marked
   * decorative (`aria-hidden`) — correct only when something beside it
   * already announces the wait. A spinner standing alone should pass one.
   */
  label?: string;
}

/**
 * The brand mark as a loading indicator: the ring rotates, the T stays put.
 *
 * Taken from the working implementation on tomcoggia.com, which draws exactly
 * these paths — so it shares `Logo`'s artwork rather than carrying a copy.
 *
 * **Medium weight only, deliberately.** `Logo` has five because a mark is set
 * at whatever weight its surroundings want; a spinner is one thing the app
 * shows while it waits, and offering five ways to draw it invites a choice
 * nobody needs to make. If a second weight is ever genuinely wanted, the
 * artwork is already shared — it is a prop, not an export.
 *
 * This is the page- and section-level loader. It is deliberately NOT what
 * `Button` uses: at button sizes a ring has too few pixels to read, which is
 * why that spinner is three pulsing dots. Don't unify them.
 */
export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(function Spinner(
  { size = 64, label, className, ...props },
  ref,
) {
  const [ring, stem] = LOGO_PATHS.medium;
  const classes = [styles.spinner, className].filter(Boolean).join(" ");

  return (
    <svg
      ref={ref}
      className={classes}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      {/* Static: the T is the thing being circled, not part of the motion. */}
      <path d={stem} />
      <g className={styles.ring}>
        <path d={ring} />
      </g>
    </svg>
  );
});
