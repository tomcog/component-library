import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import styles from "./NavRail.module.css";

export type NavRailProps = HTMLAttributes<HTMLElement>;

/**
 * Left rail navigation - a vertical column of links. Figma: the `NavSlat` set
 * (444:791), assembled text-only at 458:2467.
 *
 * Renders a `<nav>` landmark. A page with more than one nav should label each
 * so they can be told apart:
 *
 *     <NavRail aria-label="Sections">
 *       <NavSlat asChild active={pathname === "/"}><Link href="/">Home</Link></NavSlat>
 *       <NavSlat asChild><Link href="/work">Work</Link></NavSlat>
 *     </NavRail>
 *
 * Text only, deliberately - no icons and no sub items. This is a separate
 * component from `Nav`, not a variant of it: different anatomy, different
 * Figma set, and a different type scale (16/600 on a 24 line against the
 * horizontal nav's 14/500 on 20).
 */
export const NavRail = forwardRef<HTMLElement, NavRailProps>(function NavRail(
  { className, children, ...props },
  ref,
) {
  return (
    <nav ref={ref} className={[styles.rail, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </nav>
  );
});
