import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import styles from "./NavRail.module.css";

export type NavSlatGroupProps = HTMLAttributes<HTMLDivElement>;

/**
 * A primary `NavSlat` and the sub items under it. Figma: the `With sub` frame
 * inside `LeftRail` (482:2572 / 469:14379).
 *
 *     <NavSlatGroup>
 *       <NavSlat asChild active icon={<Settings />}><Link href="/settings">Settings</Link></NavSlat>
 *       <NavSlat asChild level="secondary"><Link href="/settings/members">Members</Link></NavSlat>
 *     </NavSlatGroup>
 *
 * The group exists to do two things the rail cannot do for a loose slat:
 *
 * - **Close the gap.** Inside it the slats sit flush, so a parent and its
 *   children read as one block rather than as five evenly-spaced rows. The
 *   rail's own gap still separates the group from what surrounds it.
 * - **Indent the sub items** so their labels line up under the parent's. That
 *   is 16 on a text-only rail, and chip + gap once icons are on. It picks
 *   between them with `:has()` rather than taking a prop - Figma expresses the
 *   same thing as two hand-set frames, at `pl-16` and `pl-40`.
 *
 * Not a landmark and not a list: it is a presentational wrapper inside the
 * rail's `<nav>`, so it carries no role of its own.
 */
export const NavSlatGroup = forwardRef<HTMLDivElement, NavSlatGroupProps>(function NavSlatGroup(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={[styles.group, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
});
