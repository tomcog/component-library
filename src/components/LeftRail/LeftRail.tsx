import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./LeftRail.module.css";

export interface LeftRailProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The app's mark, sitting above the nav. Figma: the `AppBrand` frame.
   *
   * A slot rather than a `logo` prop, because what belongs here varies per
   * app: `<Logo />` on its own, a mark beside a wordmark, or a link home.
   * Omit it and the slot collapses - the nav starts at the rail's padding
   * with no gap left behind.
   *
   *     <LeftRail brand={<Logo weight="medium" size={50} label="Acme" />}>
   */
  brand?: ReactNode;
}

/**
 * The app shell's left column: a brand slot over a navigation rail. Figma:
 * `LeftRail-NoIcons` (482:2517) and `LeftRail-Icons` (458:2612).
 *
 *     <LeftRail brand={<Logo weight="medium" size={50} label="Acme" />}>
 *       <NavRail aria-label="Sections">
 *         <NavSlat asChild icon={<Home />}><Link href="/">Dashboard</Link></NavSlat>
 *         <NavSlatGroup>
 *           <NavSlat asChild active icon={<Settings />}>
 *             <Link href="/settings">Settings</Link>
 *           </NavSlat>
 *           <NavSlat asChild level="secondary">
 *             <Link href="/settings/members">Members</Link>
 *           </NavSlat>
 *         </NavSlatGroup>
 *       </NavRail>
 *     </LeftRail>
 *
 * **A shell, not a nav.** It renders a `<div>` and takes the `NavRail` as
 * children rather than building one internally. That keeps the `<nav>`
 * landmark - and its `aria-label`, which a page with more than one nav needs
 * - on the element that actually holds the links, and it leaves room for
 * anything else the column carries later: a workspace switcher under the
 * brand, a user block pinned to the bottom.
 *
 * Composed rather than sized: no width, no height. See `LeftRail.module.css`.
 */
export const LeftRail = forwardRef<HTMLDivElement, LeftRailProps>(function LeftRail(
  { brand, className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={[styles.rail, className].filter(Boolean).join(" ")} {...props}>
      {/* Rendered even when empty so the slot's :empty rule can collapse it,
          rather than branching here - one code path, and an app that swaps
          the brand in and out at runtime does not remount the nav. */}
      <div className={styles.brand}>{brand}</div>
      {children}
    </div>
  );
});
