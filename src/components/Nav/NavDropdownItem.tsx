import { forwardRef } from "react";
import styles from "./Nav.module.css";
import { NavLink } from "./NavLink";
import type { NavLinkBaseProps } from "./NavLink";

export type NavDropdownItemProps = NavLinkBaseProps;

/**
 * A sub-navigation link inside `NavDropdown`. Figma: `Nav/Dropdown/Item`.
 *
 * On hover the label indents and a red pipe grows in at the right edge. The
 * indent lives on the label, not as padding on the link, so the pipe stays
 * pinned to the right edge instead of sliding with the text.
 *
 * Figma names the emphasised variant State=Hover but composes it to mark the
 * current sub-page, so it is both: `:hover` gives it transiently, `active`
 * pins it and adds `aria-current="page"`.
 */
export const NavDropdownItem = forwardRef<HTMLAnchorElement, NavDropdownItemProps>(
  function NavDropdownItem({ active = false, children, ...props }, ref) {
    const classes = [styles.subItem, active ? styles.subItemCurrent : null].filter(Boolean).join(" ");
    return (
      <NavLink
        ref={ref}
        componentName="NavDropdownItem"
        classes={classes}
        active={active}
        wrap={(label) => (
          <>
            <span className={styles.subLabel}>{label}</span>
            <span className={styles.pipe} aria-hidden="true" />
          </>
        )}
        {...props}
      >
        {children}
      </NavLink>
    );
  },
);
