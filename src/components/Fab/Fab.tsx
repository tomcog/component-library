import { Children, cloneElement, forwardRef, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import styles from "./Fab.module.css";
import hidden from "../../internal/visuallyHidden.module.css";
import { assignRef } from "../../internal/assignRef";

declare const process: { env: { NODE_ENV?: string } };

export interface FabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Decorative glyph on the disc, e.g. any Lucide React icon. Figma: the Button/Round's `Icon`. */
  icon: ReactNode;
  /**
   * The label beside the disc - also the control's accessible name. Figma:
   * `FabText`. With `asChild`, the child's own children are the label.
   */
  children?: ReactNode;
  /**
   * Hide the label on screen while keeping it as the accessible name, leaving
   * the disc alone. Figma: `Label` off.
   */
  hideLabel?: boolean;
  /** Render the single child element, such as a link, as the control. */
  asChild?: boolean;
}

export const Fab = forwardRef<HTMLButtonElement, FabProps>(function Fab(
  { icon, hideLabel = false, asChild = false, type = "button", className, children, ...props },
  ref,
) {
  const child =
    asChild && isValidElement(children) ? (Children.only(children) as ReactElement<any>) : null;
  const label: ReactNode = child ? child.props.children : children;

  if (process.env.NODE_ENV !== "production") {
    const named =
      props["aria-label"] != null || props["aria-labelledby"] != null || props.title != null;
    if (label == null && !named) {
      console.warn(
        "[@tomcoggia/ui] Fab: no label and no accessible name. The icon is aria-hidden, " +
          "so pass a label (hideLabel keeps it off screen) or aria-label.",
      );
    }
    if (asChild && !child) {
      console.warn("[@tomcoggia/ui] Fab: `asChild` expects exactly one React element child.");
    }
  }

  const classes = [styles.fab, className, child?.props.className].filter(Boolean).join(" ");

  const body = (
    <>
      <span className={styles.disc} aria-hidden="true">
        <span className={styles.icon}>{icon}</span>
      </span>
      {label != null ? (
        <span className={hideLabel ? hidden.visuallyHidden : styles.label}>{label}</span>
      ) : null}
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
        ref: (node: HTMLButtonElement | null) => {
          assignRef(ref, node);
          assignRef(childRef, node);
        },
      },
      body,
    );
  }

  return (
    <button ref={ref} type={type} className={classes} {...props}>
      {body}
    </button>
  );
});
