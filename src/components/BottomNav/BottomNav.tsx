import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./BottomNav.module.css";

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
 * It paints itself but does not place itself — no `position: fixed` — so the
 * app decides whether it is pinned to the viewport or docked in a frame. Same
 * call as LeftRail, which paints its ground but takes whatever column it is
 * given.
 */
export const BottomNav = forwardRef<HTMLElement, BottomNavProps>(function BottomNav(
  { className, children, ...props },
  ref,
) {
  return (
    <nav ref={ref} className={[styles.bar, className].filter(Boolean).join(" ")} {...props}>
      <div className={styles.row}>{children}</div>
    </nav>
  );
});
