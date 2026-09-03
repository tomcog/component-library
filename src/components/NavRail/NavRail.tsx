import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import styles from "./NavRail.module.css";

export type NavRailProps = HTMLAttributes<HTMLElement>;

/**
 * Left rail navigation - a vertical column of sections, each optionally
 * disclosing its own sub items. Figma: the `NavSlat` set (444:791),
 * assembled at 442:17349.
 *
 * Renders a `<nav>` landmark. A page with more than one nav should label
 * each so they can be told apart:
 *
 *     <NavRail aria-label="Sections">
 *       <NavSlat asChild icon={<Briefcase />}>
 *         <Link href="/jobs">Jobs</Link>
 *       </NavSlat>
 *       <NavSlat asChild active icon={<Briefcase />}>
 *         <Link href="/work">Work</Link>
 *       </NavSlat>
 *       <NavSlat asChild level="secondary" icon={<SquareCode />}>
 *         <Link href="/work/api">API</Link>
 *       </NavSlat>
 *     </NavRail>
 *
 * Sub items are siblings of their section, not children of it. That is what
 * Figma draws, and it keeps the rail a flat list a consumer can build by
 * mapping over routes - the pipe joins up on its own because consecutive sub
 * items sit flush. Rendering them only while their section is current is the
 * app's call, the same way `active` is.
 *
 * This is a separate component from `Nav`, not a variant of it: different
 * type scale, different anatomy, different Figma set.
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
