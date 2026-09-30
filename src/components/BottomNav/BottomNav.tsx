import { Children, forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./BottomNav.module.css";

declare const process: { env: { NODE_ENV?: string } };

/** The most items a bar holds. Past this a phone-width bar cannot fit the captions. */
const MAX_ITEMS = 6;

export interface BottomNavProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

/**
 * Bottom navigation — the mobile counterpart to `NavRail`, for the same
 * destinations at a width that has no room for a rail.
 *
 * Renders a `<nav>` landmark. A page with more than one nav should give each
 * an `aria-label` so they can be told apart:
 *
 *     <BottomNav aria-label="Sections">
 *       <BottomNavItem icon={<Home />} current>Home</BottomNavItem>
 *     </BottomNav>
 *
 * At most SIX items (decided with the user 2026-09-29): past that a phone-width
 * bar has no room for the captions. More are rendered, not dropped - dropping a
 * destination silently would be worse - but it warns in dev.
 *
 * It paints itself but does not place itself — no `position: fixed` — so the
 * app decides whether it is pinned to the viewport or docked in a frame. Same
 * call as LeftRail, which paints its ground but takes whatever column it is
 * given.
 */
export const BottomNav = forwardRef<HTMLElement, BottomNavProps>(function BottomNav(
  { className, children, ...props },
  ref,
) {
  if (process.env.NODE_ENV !== "production") {
    const count = Children.toArray(children).length;
    if (count > MAX_ITEMS) {
      console.warn(
        `[@tomcoggia/ui] BottomNav: ${count} items; it holds at most ${MAX_ITEMS}. ` +
          "Move the rest into a More destination.",
      );
    }
  }

  return (
    <nav ref={ref} className={[styles.bar, className].filter(Boolean).join(" ")} {...props}>
      <div className={styles.row}>{children}</div>
    </nav>
  );
});
