import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import styles from "./Card.module.css";

export type CardVariant = "flat" | "float1" | "float2";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Figma: `Style`. `flat` is a rule with no elevation; `float1` and `float2`
   * are the two shadow steps, float2 sitting higher.
   */
  variant?: CardVariant;
}

/**
 * A raised surface that groups content.
 *
 * Container only - it sets a fill, a radius and an elevation, and nothing
 * else. There is deliberately no padding and no internal layout: what goes
 * inside has not been designed yet, and guessing at it here would be a
 * decision the Figma file has not made.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "flat", className, children, ...props },
  ref,
) {
  const classes = [styles.card, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});
