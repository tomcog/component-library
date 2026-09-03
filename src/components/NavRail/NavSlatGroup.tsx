import { Children, forwardRef, isValidElement } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./NavRail.module.css";

export interface NavSlatGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Hold the group open regardless of hover, focus or the current page. An
   * escape hatch for an app that knows a section is open for a reason the
   * rail cannot see - a sub-route, say, that is not itself a slat.
   */
  open?: boolean;
  /**
   * The section, then its sub items. The **first child is the section**; every
   * child after it is disclosed by that section.
   */
  children?: ReactNode;
}

/**
 * A section and the sub items it discloses. Figma frames these together at
 * `442:17349` to hold them at gap 0; here the frame also owns the reveal.
 *
 *     <NavSlatGroup>
 *       <NavSlat asChild active icon={<Briefcase />}><Link href="/work">Work</Link></NavSlat>
 *       <NavSlat asChild level="secondary"><Link href="/work/api">API</Link></NavSlat>
 *     </NavSlatGroup>
 *
 * Sub items are hidden until the group is hovered or focused, and stay open
 * while anything inside it is the current page - so a section you have
 * navigated into does not collapse under the pointer as you move away.
 *
 * Splitting on the first child rather than on `level` keeps the reveal a
 * property of position, not of a prop: whatever is first is the thing that
 * discloses the rest, and a group of one is just a section.
 */
export const NavSlatGroup = forwardRef<HTMLDivElement, NavSlatGroupProps>(
  function NavSlatGroup({ open = false, className, children, ...props }, ref) {
    const items = Children.toArray(children).filter(isValidElement);
    const [section, ...subItems] = items;

    return (
      <div
        ref={ref}
        className={[styles.group, open ? styles.open : null, className].filter(Boolean).join(" ")}
        {...props}
      >
        {section}
        <div className={styles.subItems}>{subItems}</div>
      </div>
    );
  },
);
