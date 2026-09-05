import { Children, cloneElement, forwardRef, isValidElement } from "react";
import type { AnchorHTMLAttributes, ReactElement, ReactNode } from "react";
import styles from "./BottomNav.module.css";
import { assignRef } from "../../internal/assignRef";

export interface BottomNavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Any Lucide React icon. Decorative — the label names the destination. */
  icon: ReactNode;
  /**
   * Marks this as the current page: the tinted chip, the primary label, and
   * `aria-current="page"`. The consuming app decides what is current, so this
   * composes with any router.
   */
  current?: boolean;
  /**
   * Render the single child element instead of an `<a>`, merging classes,
   * props and refs into it — so a tab can be a `next/link` and still be a
   * real link. Same escape hatch as NavSlat.
   */
  asChild?: boolean;
  children: ReactNode;
}

/**
 * One destination in a `BottomNav`. Figma: `BottomNav/Item`.
 *
 * The icon sits in the same chip `NavRail` uses — a Button/Round Medium box
 * carrying the rail's fills — with the label beneath it. States: resting is a
 * transparent chip with a muted glyph; hover fills the chip; current tints it
 * and reddens the label. Hovering the current tab adds nothing.
 */
export const BottomNavItem = forwardRef<HTMLAnchorElement, BottomNavItemProps>(
  function BottomNavItem({ icon, current = false, asChild = false, className, children, ...props }, ref) {
    const child =
      asChild && isValidElement(children) ? (Children.only(children) as ReactElement<any>) : null;

    const classes = [styles.item, current ? styles.current : null, className, child?.props.className]
      .filter(Boolean)
      .join(" ");

    const body = (label: ReactNode) => (
      <>
        {/* Inert: the item is already the control. */}
        <span className={styles.chip} aria-hidden="true">
          <span className={styles.icon}>{icon}</span>
        </span>
        <span className={styles.label}>{label}</span>
      </>
    );

    if (child) {
      const childRef = (child as any).ref ?? child.props.ref;
      return cloneElement(
        child,
        {
          ...props,
          ...child.props,
          className: classes,
          "aria-current": current ? "page" : undefined,
          ref: (n: HTMLAnchorElement) => {
            assignRef(ref, n);
            assignRef(childRef, n);
          },
        },
        body(child.props.children),
      );
    }

    return (
      <a ref={ref} className={classes} aria-current={current ? "page" : undefined} {...props}>
        {body(children)}
      </a>
    );
  },
);
