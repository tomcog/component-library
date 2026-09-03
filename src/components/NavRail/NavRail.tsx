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
 *       <NavSlatGroup>
 *         <NavSlat asChild active icon={<Briefcase />}>
 *           <Link href="/work">Work</Link>
 *         </NavSlat>
 *         <NavSlat asChild level="secondary" icon={<SquareCode />}>
 *           <Link href="/work/api">API</Link>
 *         </NavSlat>
 *       </NavSlatGroup>
 *     </NavRail>
 *
 * A section that discloses sub items wraps them in a `NavSlatGroup`, which
 * owns the reveal. Every direct child of the rail is therefore a section or a
 * group, which is why the rail can carry a plain gap.
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
