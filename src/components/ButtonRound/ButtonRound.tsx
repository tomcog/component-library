import { Children, cloneElement, forwardRef, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import styles from "./ButtonRound.module.css";
import { assignRef } from "../../internal/assignRef";

declare const process: { env: { NODE_ENV?: string } };

export type ButtonRoundSize = "xl" | "large" | "medium" | "small";

export interface ButtonRoundProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Decorative icon rendered inside the round button, e.g. any Lucide React icon. */
  icon: ReactNode;
  /** Figma: Size */
  size?: ButtonRoundSize;
  /** Render the single child element, such as an anchor, as the control. */
  asChild?: boolean;
}

export const ButtonRound = forwardRef<HTMLButtonElement, ButtonRoundProps>(
  function ButtonRound(
    { icon, size = "large", type = "button", className, asChild = false, children, ...props },
    ref,
  ) {
    const child =
      asChild && isValidElement(children)
        ? (Children.only(children) as ReactElement<any>)
        : null;

    if (
      process.env.NODE_ENV !== "production" &&
      props["aria-label"] == null &&
      props["aria-labelledby"] == null &&
      props.title == null
    ) {
      console.warn(
        "[@tomcoggia/ui] ButtonRound: icon-only buttons need an accessible name. " +
          'Pass aria-label, aria-labelledby, or title.',
      );
    }

    const classes = [styles.button, styles[size], className, child?.props.className]
      .filter(Boolean)
      .join(" ");

    const body = (
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
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
  },
);
