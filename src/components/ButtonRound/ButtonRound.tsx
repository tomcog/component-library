import { Children, cloneElement, forwardRef, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import styles from "./ButtonRound.module.css";
import { assignRef } from "../../internal/assignRef";

declare const process: { env: { NODE_ENV?: string } };

export type ButtonRoundSize = "xl" | "lg" | "md" | "sm";
/**
 * How much weight the button carries - Button's four Levels, on a circle
 * (since 0.73.0), plus `outline-light` for a button over a photo:
 *
 * - `primary`: a solid action disc with a white glyph.
 * - `secondary` (the default): the pale action tint with an action glyph,
 *   filling solid when reached for. What `filled` was.
 * - `tertiary`: the glyph alone; a pale tint arrives on hover. What `ghost`
 *   was.
 * - `ghost`: a 1px action ring around the glyph, dropping away as the tint
 *   arrives - Button's Ghost.
 * - `outline-light`: a translucent dark ground, a light ring and glyph, the
 *   same in either theme - for a button over a photo or video.
 *
 * Each Level's rest, hover, press and disabled are Button's own, so a round
 * and a rectangular button of the same Level behave identically.
 */
export type ButtonRoundVariant = "primary" | "secondary" | "tertiary" | "ghost" | "outline-light";

/** Button's tone, on a round button: `danger` recolours every Level's every state. */
export type ButtonRoundTone = "primary" | "danger";

export interface ButtonRoundProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Decorative icon rendered inside the round button, e.g. any Lucide React icon. */
  icon: ReactNode;
  /** Figma: Size */
  size?: ButtonRoundSize;
  /**
   * Figma: Level. Defaults to `secondary` - not `primary` as on Button - so a
   * row of round toolbar actions rests tinted rather than as solid discs.
   *
   * `"filled"` is the pre-0.73.0 name for `secondary`; it still works, and
   * warns in dev.
   */
  variant?: ButtonRoundVariant | "filled";
  /**
   * Figma: Tone. `danger` is the destructive action - every state of every
   * Level moves from the action colour to danger, at rest included, exactly
   * as on Button. Ignored by `outline-light`. Defaults to `primary`.
   */
  tone?: ButtonRoundTone;
  /** Render the single child element, such as an anchor, as the control. */
  asChild?: boolean;
}

const VARIANT_CLASS: Record<ButtonRoundVariant, string | undefined> = {
  primary: styles.primary,
  secondary: styles.secondary,
  tertiary: styles.tertiary,
  ghost: styles.ghost,
  "outline-light": styles.outlineLight,
};

export const ButtonRound = forwardRef<HTMLButtonElement, ButtonRoundProps>(
  function ButtonRound(
    { icon, size = "lg", variant: variantProp = "secondary", tone = "primary", type = "button", className, asChild = false, children, ...props },
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

    if (process.env.NODE_ENV !== "production" && variantProp === "filled") {
      console.warn(
        '[@tomcoggia/ui] ButtonRound: variant="filled" was renamed "secondary" in 0.73.0. ' +
          "It still works; rename it.",
      );
    }
    const variant: ButtonRoundVariant = variantProp === "filled" ? "secondary" : variantProp;

    const classes = [
      styles.button,
      styles[size],
      VARIANT_CLASS[variant],
      tone === "danger" && variant !== "outline-light" ? styles.danger : null,
      className,
      child?.props.className,
    ]
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
