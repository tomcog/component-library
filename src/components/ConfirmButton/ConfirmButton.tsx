import { Children, cloneElement, forwardRef, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import styles from "./ConfirmButton.module.css";
import { assignRef } from "../../internal/assignRef";

declare const process: { env: { NODE_ENV?: string } };

export type ConfirmButtonSize = "xl" | "lg" | "md" | "sm";
/**
 * Which half of the answer this button is. `safety` is the one that keeps the
 * user's work - Save, Apply, Accept, Keep; `danger` is the one that destroys
 * it - Delete, Discard, Remove.
 *
 * Figma calls this axis `Style`, which cannot be the prop name here: the props
 * interface extends `ButtonHTMLAttributes`, where `style` is already the inline
 * style object. `tone` is what `Button` calls the same kind of axis, so it is
 * the name a reader of this library already has.
 *
 * There is no default. Every other variant prop in the library defaults,
 * because every other one has an obvious neutral; this one does not. A
 * confirmation button that came out safety-green because nobody passed a tone
 * would be wrong in the one place being wrong is expensive, and TypeScript
 * asking the question costs a word.
 */
export type ConfirmButtonTone = "safety" | "danger";
/**
 * How much weight the button carries at rest. `filled` rests on the tinted
 * disc - `--ui-safety-lighter` or `--ui-danger-lighter`; `ghost` drops the
 * disc and rests as the coloured glyph alone.
 *
 * Same two names, and the same axis, as `ButtonRound`'s `variant`, so the two
 * round buttons read alike. What differs is the resting COLOUR: a ghost
 * ButtonRound rests `--ui-text-muted`, because it is a toolbar control with
 * nothing to say until you reach for it, while a ghost ConfirmButton keeps its
 * role colour, because the whole reason this component exists is that a
 * confirmation must be readable before the pointer arrives.
 */
export type ConfirmButtonVariant = "filled" | "ghost";

export interface ConfirmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Decorative icon rendered inside the round button, e.g. any Lucide React icon. */
  icon: ReactNode;
  /**
   * Figma: `Style`. Required - see {@link ConfirmButtonTone} for why this one
   * prop has no default.
   */
  tone: ConfirmButtonTone;
  /**
   * Figma: `Size`, which the set draws at XL only. The other three are the
   * code's, and they are `ButtonRound`'s sizes by construction - the geometry
   * tokens alias it - so a confirmation sits level with the toolbar buttons
   * beside it at any size. Defaults to `lg`, as `ButtonRound` does.
   */
  size?: ConfirmButtonSize;
  /** Figma: the `Ghost` state. Defaults to `filled`. */
  variant?: ConfirmButtonVariant;
  /** Render the single child element, such as an anchor, as the control. */
  asChild?: boolean;
}

/**
 * The round button at the end of a decision: the two halves of "are you sure?".
 *
 * Figma: `ConfirmButton` (735:398), which was lifted out of `Button/Round`'s
 * `State=Confirm` and `State=Danger` cells. The split is the design: those
 * cells recoloured HOVER only and rested in the brand, so a Delete and a Save
 * looked identical to a user who had not yet moved the pointer. That is the
 * right behaviour for a toolbar, where a row of round buttons wants one resting
 * rhythm and a red disc would shout - and exactly the wrong behaviour for a
 * confirmation, where the entire job of the control is to be read BEFORE it is
 * pressed. ButtonRound kept the rhythm; this keeps the reading.
 */
export const ConfirmButton = forwardRef<HTMLButtonElement, ConfirmButtonProps>(
  function ConfirmButton(
    { icon, tone, size = "lg", variant = "filled", type = "button", className, asChild = false, children, ...props },
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
        "[@tomcoggia/ui] ConfirmButton: icon-only buttons need an accessible name. " +
          'Pass aria-label, aria-labelledby, or title.',
      );
    }

    const classes = [
      styles.button,
      styles[size],
      styles[tone],
      variant === "ghost" ? styles.ghost : null,
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
