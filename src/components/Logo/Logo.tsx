import { forwardRef } from "react";
import type { SVGAttributes } from "react";
import { LOGO_PATHS } from "../../internal/logoPaths";
import type { LogoWeight } from "../../internal/logoPaths";
import styles from "./Logo.module.css";

export type { LogoWeight };

export interface LogoProps extends Omit<SVGAttributes<SVGSVGElement>, "children"> {
  /** Figma: `Weight`. */
  weight?: LogoWeight;
  /** Rendered size in px, or any CSS length. Square. */
  size?: number | string;
  /**
   * Accessible name. Omit it and the mark is marked decorative
   * (`aria-hidden`) — correct when it sits beside the wordmark, wrong when it
   * is the only thing identifying the page.
   */
  label?: string;
}

/**
 * Tom Coggia's brand mark, at five stroke weights.
 *
 * Defaults to `--ui-tc-red` — red is what the brand is. Override with
 * `--ui-logo-color`, which inherits, so an ancestor can reverse the mark on
 * ink. Note an ancestor's plain `color` does NOT reach it: `.logo` declares
 * colour on the element itself.
 *
 * The red is `--ui-tc-red`, never `--ui-primary`. The mark is a personal identity, not a themeable surface:
 * an app that recolours its primary recolours its buttons and its nav, and
 * this stays TC red regardless. That is exactly why the two are separate
 * names in tokens.css, with --ui-primary merely defaulting to the brand.
 */
export const Logo = forwardRef<SVGSVGElement, LogoProps>(function Logo(
  { weight = "medium", size = 40, label, className, ...props },
  ref,
) {
  const [ring, stem] = LOGO_PATHS[weight];
  const classes = [styles.logo, className].filter(Boolean).join(" ");

  return (
    <svg
      ref={ref}
      className={classes}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      <path d={ring} />
      <path d={stem} />
    </svg>
  );
});
