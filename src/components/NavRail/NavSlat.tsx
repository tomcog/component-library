import { forwardRef } from "react";
import styles from "./NavRail.module.css";
import { NavLink } from "../Nav/NavLink";
import type { NavLinkBaseProps } from "../Nav/NavLink";

export type NavSlatProps = NavLinkBaseProps;

/**
 * One row of a `NavRail`. Figma: `NavSlat`, at `Level=Primary`.
 *
 * | Figma state | here |
 * |---|---|
 * | Default | resting |
 * | Hover   | `:hover`, and `:focus-visible` |
 * | Active  | `active` |
 *
 * Hovering draws a pipe down the slat's leading edge and indents the label
 * past it. `active` marks the current page instead - a red label, with no
 * pipe and no indent - and sets `aria-current="page"`, since the design
 * signals it with colour alone.
 *
 * The prop is `active` and the class is `current`, matching `NavItem`:
 * `-active` is unavailable in CSS, where it already means pressed.
 */
export const NavSlat = forwardRef<HTMLAnchorElement, NavSlatProps>(function NavSlat(
  { active = false, children, ...props },
  ref,
) {
  const classes = [styles.slat, active ? styles.current : null].filter(Boolean).join(" ");

  return (
    <NavLink
      ref={ref}
      componentName="NavSlat"
      classes={classes}
      active={active}
      wrap={(label) => (
        <>
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
