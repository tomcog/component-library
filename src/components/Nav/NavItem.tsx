import { forwardRef } from "react";
import styles from "./Nav.module.css";
import { NavLink } from "./NavLink";
import type { NavLinkBaseProps } from "./NavLink";

export interface NavItemProps extends NavLinkBaseProps {
  /**
   * Pin the 4px rule on. Figma composes `Nav/Dropdown` with its heading held
   * in State=Hover to mark the open section; `NavDropdown` uses this for its
   * trigger. Ignored when `active` is set, which has its own treatment.
   */
  underlined?: boolean;
}

/**
 * A top-level navigation link. Figma: `Nav/Item`.
 *
 * | Figma state | here |
 * |---|---|
 * | Default | resting |
 * | Hover   | `:hover`, or `underlined` to pin it |
 * | On      | `active` |
 *
 * Text only - this nav has no icon variant.
 */
export const NavItem = forwardRef<HTMLAnchorElement, NavItemProps>(function NavItem(
  { active = false, underlined = false, children, ...props },
  ref,
) {
  const classes = [
    styles.item,
    active ? styles.current : null,
    underlined && !active ? styles.underlined : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <NavLink ref={ref} componentName="NavItem" classes={classes} active={active} {...props}>
      {children}
    </NavLink>
  );
});
