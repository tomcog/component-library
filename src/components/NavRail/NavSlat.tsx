import { forwardRef } from "react";
import type { ReactNode } from "react";
import styles from "./NavRail.module.css";
import { NavLink } from "../Nav/NavLink";
import type { NavLinkBaseProps } from "../Nav/NavLink";

export type NavSlatLevel = "primary" | "secondary";

export interface NavSlatProps extends NavLinkBaseProps {
  /**
   * Figma: `Level`. `primary` is a top-level section, drawn with a round icon
   * chip; `secondary` is one of its sub items, drawn against the pipe.
   */
  level?: NavSlatLevel;
  /**
   * Decorative icon, e.g. any Lucide React icon. Figma: the `Icon?` property.
   * Rendered inside the chip on a primary slat, beside the pipe on a
   * secondary one. Always `aria-hidden` - the label is the accessible name.
   *
   * Optional, matching Figma's `Icon?`. Leaving it out drops the chip
   * entirely rather than leaving an empty one, so the label closes up - what
   * hiding the layer does to Figma's auto-layout. A sub item keeps its pipe
   * either way: the pipe is the rail, not part of the icon.
   */
  icon?: ReactNode;
}

/**
 * One row of a `NavRail`. Figma: `NavSlat`.
 *
 * | Figma state | here |
 * |---|---|
 * | Default | resting |
 * | Hover   | `:hover` |
 * | Active  | `active` |
 *
 * `active` marks the current page and sets `aria-current="page"`, since the
 * design signals it with colour alone. The prop is `active` and the class is
 * `current`, matching `NavItem`: `-active` is unavailable in CSS, where it
 * already means pressed.
 */
export const NavSlat = forwardRef<HTMLAnchorElement, NavSlatProps>(function NavSlat(
  { level = "primary", icon, active = false, children, ...props },
  ref,
) {
  const classes = [styles.slat, styles[level], active ? styles.current : null]
    .filter(Boolean)
    .join(" ");

  const iconNode = icon ? (
    <span className={styles.icon} aria-hidden="true">
      {icon}
    </span>
  ) : null;

  return (
    <NavLink
      ref={ref}
      componentName="NavSlat"
      classes={classes}
      active={active}
      wrap={(label) => (
        <>
          {level === "secondary" ? (
            <>
              <span className={styles.pipe} aria-hidden="true" />
              <span className={styles.content}>
                {iconNode}
                {label}
              </span>
            </>
          ) : (
            <>
              {icon ? (
                <span className={styles.chip} aria-hidden="true">
                  <span className={styles.icon}>{icon}</span>
                </span>
              ) : null}
              {label}
            </>
          )}
        </>
      )}
      {...props}
    >
      {children}
    </NavLink>
  );
});
