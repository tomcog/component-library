import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Pill.module.css";

export interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Figma: `State=On`. The prop is `selected` rather than `on` because that is
   * what the control means to a caller and what `aria-pressed` reports; the
   * class stays `.on` so the Figma name still transforms.
   */
  selected?: boolean;
  children: ReactNode;
}

/**
 * A filter toggle - the row of choices above a list, one or several of which
 * can be on. Renders a real <button> carrying `aria-pressed`, so it is
 * announced as a toggle rather than as a link or a tab.
 */
export const Pill = forwardRef<HTMLButtonElement, PillProps>(function Pill(
  { selected = false, type = "button", className, children, ...props },
  ref,
) {
  const classes = [styles.pill, selected ? styles.on : styles.off, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button ref={ref} type={type} className={classes} aria-pressed={selected} {...props}>
      {children}
    </button>
  );
});
