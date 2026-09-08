import { Children, cloneElement, forwardRef, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import styles from "./ButtonRound.module.css";
import { assignRef } from "../../internal/assignRef";

declare const process: { env: { NODE_ENV?: string } };

export type ButtonRoundSize = "xl" | "lg" | "md" | "sm";
/**
 * How much weight the button carries. `filled` is the tinted disc; `ghost`
 * drops the fill and rests as a muted glyph alone.
 *
 * NOT named `primary`, though that is what `Button` calls its filled variant:
 * `tone` already takes the value `"primary"` here, and one component holding
 * two props that both accept that word - meaning different things - is a
 * lookup table nobody should have to keep in their head. Not a boolean either,
 * so a third weight can join without changing the API shape.
 */
export type ButtonRoundVariant = "filled" | "ghost";
/**
 * What the button DOES, not what colour it is. `confirm` marks the affirmative
 * action - Save, Apply, Accept - and turns the hover fill green; `danger`
 * marks the destructive one - Delete, Discard, Remove - and turns it red.
 *
 * The pair is deliberate: they are "yes" and "no", and an app that recolours
 * its primary gets neither of them by accident.
 */
export type ButtonRoundTone = "primary" | "confirm" | "danger";

export interface ButtonRoundProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Decorative icon rendered inside the round button, e.g. any Lucide React icon. */
  icon: ReactNode;
  /** Figma: Size */
  size?: ButtonRoundSize;
  /**
   * Figma: the `Ghost` state, drawn at all four sizes (`220:11857`).
   * `ghost` removes the fill and rests as a `--ui-text-muted` glyph on
   * nothing; the geometry is untouched, so it lines up with a filled button
   * beside it. Defaults to `filled`.
   *
   * It answers the pointer with the SAME primary fill a filled button does -
   * transparent resting, primary on hover - which is what `NavRail` and
   * `BottomNav` already hand-roll for their chips, because until now this
   * library had no round button with a transparent resting state.
   */
  variant?: ButtonRoundVariant;
  /**
   * Figma: the `Confirm` and `Danger` states. Each turns the HOVER pair -
   * `--ui-confirm` / `--ui-text-on-confirm`, or `--ui-danger` /
   * `--ui-text-on-danger` - and leaves the resting and pressed appearances
   * alone. Defaults to `primary`.
   */
  tone?: ButtonRoundTone;
  /** Render the single child element, such as an anchor, as the control. */
  asChild?: boolean;
}

export const ButtonRound = forwardRef<HTMLButtonElement, ButtonRoundProps>(
  function ButtonRound(
    { icon, size = "lg", variant = "filled", tone = "primary", type = "button", className, asChild = false, children, ...props },
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

    const classes = [
      styles.button,
      styles[size],
      variant === "ghost" ? styles.ghost : null,
      tone !== "primary" ? styles[tone] : null,
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
