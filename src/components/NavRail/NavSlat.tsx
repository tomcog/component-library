import { forwardRef } from "react";
import type { ReactNode } from "react";
import styles from "./NavRail.module.css";
import { NavLink } from "../Nav/NavLink";
import type { NavLinkBaseProps } from "../Nav/NavLink";

export type NavSlatLevel = "primary" | "secondary";

export interface NavSlatProps extends NavLinkBaseProps {
  /**
   * Figma: the `Level` axis. `secondary` is a sub item - muted, indented
   * under its parent, and never carrying a chip even if one is passed.
   *
   * Sub items belong inside a `NavSlatGroup`, which closes the gap between
   * them and supplies the indent. On its own a `secondary` slat still reads
   * correctly, it is just not grouped with a parent.
   */
  level?: NavSlatLevel;
  /**
   * Decorative icon, e.g. any Lucide React icon. Figma: the `Icon?` property.
   * Optional - without one the slat is text alone and closes up, which is what
   * hiding the layer does to Figma's auto-layout.
   *
   * Always `aria-hidden`: the label is the accessible name. It sits in a round
   * chip that borrows `ButtonRound`'s geometry but is an inert `<span>` - a
   * `<button>` cannot be nested inside the slat's `<a>`.
   */
  icon?: ReactNode;
}

/**
 * One row of a `NavRail`. Figma: `NavSlat`, at `Level=Primary`.
 *
 * | Figma state | here |
 * |---|---|
 * | Default | resting |
 * | Hover   | `:hover`, and `:focus-visible` |
 * | Active  | `active` |
 *
 * Hovering draws a pipe down the leading edge of the label and indents it
 * past. With an `icon`, the chip fills too - primary on hover, and
 * primary-lighter when current. `active` marks the current page instead - a red label, with no
 * pipe and no indent - and sets `aria-current="page"`, since the design
 * signals it with colour alone.
 *
 * The prop is `active` and the class is `current`, matching `NavItem`:
 * `-active` is unavailable in CSS, where it already means pressed.
 */
export const NavSlat = forwardRef<HTMLAnchorElement, NavSlatProps>(function NavSlat(
  { active = false, level = "primary", icon, children, ...props },
  ref,
) {
  // Figma draws no chip on a sub item, and there is no Level=Secondary
  // variant carrying one - so the slot is dropped rather than rendered small.
  const sub = level === "secondary";
  const chip = sub ? null : icon;

  const classes = [
    styles.slat,
    sub ? styles.secondary : null,
    chip ? styles.withIcon : null,
    active ? styles.current : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <NavLink
      ref={ref}
      componentName="NavSlat"
      classes={classes}
      active={active}
      wrap={(label) => (
        <>
          {chip ? (
            <span className={styles.chip} aria-hidden="true">
              <span className={styles.icon}>{chip}</span>
            </span>
          ) : null}
          <span className={styles.pipe} aria-hidden="true" />
          <span className={styles.label}>{label}</span>
        </>
      )}
      {...props}
    >
      {children}
    </NavLink>
  );
});
