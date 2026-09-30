import { forwardRef, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { Button } from "../Button";
import { ButtonRound } from "../ButtonRound";

declare const process: { env: { NODE_ENV?: string } };

/**
 * DEPRECATED since 0.74.0 - a confirmation is now a `Button` or `ButtonRound`
 * with a `tone`. This wrapper renders exactly that, so existing code keeps
 * working, and warns once in dev. It will be removed in a later release.
 *
 *     <ConfirmButton tone="safety" icon={<Save />} aria-label="Save" />
 *     -> <ButtonRound tone="safety" icon={<Save />} aria-label="Save" />
 *
 *     <ConfirmButton tone="danger" variant="ghost">Delete</ConfirmButton>
 *     -> <Button tone="danger" variant="tertiary">Delete</Button>
 *
 * `variant="filled"` (the default) is `variant="secondary"` - the tinted disc
 * or box; `variant="ghost"` is `variant="tertiary"` - the glyph or label alone.
 * A label as children means `Button`; none means `ButtonRound`. What moves in
 * the swap: hover and press follow Button's ladder (the fill darkening from
 * the role colour) instead of this component's own lighter/darker tints, and
 * its `--ui-confirm-button-*` colour hooks no longer apply - the tone's are
 * `--ui-button-*` / `--ui-button-round-*`.
 */
export type ConfirmButtonSize = "xl" | "lg" | "md" | "sm";
/** @deprecated Use `tone` on `Button` / `ButtonRound`. */
export type ConfirmButtonTone = "safety" | "danger";
/** @deprecated `filled` is `secondary`, `ghost` is `tertiary`, on `Button` / `ButtonRound`. */
export type ConfirmButtonVariant = "filled" | "ghost";

/** @deprecated Use `ButtonProps` / `ButtonRoundProps` with a `tone`. */
export interface ConfirmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  tone: ConfirmButtonTone;
  size?: ConfirmButtonSize;
  variant?: ConfirmButtonVariant;
  asChild?: boolean;
  /** A label makes it a `Button`; without one it is a `ButtonRound`. */
  children?: ReactNode;
}

let warned = false;

/** @deprecated Since 0.74.0: `Button` or `ButtonRound` with `tone`. See the type's note. */
export const ConfirmButton = forwardRef<HTMLButtonElement, ConfirmButtonProps>(
  function ConfirmButton(
    { icon, tone, size = "lg", variant = "filled", asChild = false, children, ...props },
    ref,
  ) {
    if (process.env.NODE_ENV !== "production" && !warned) {
      warned = true;
      console.warn(
        "[@tomcoggia/ui] ConfirmButton is deprecated since 0.74.0. Use <Button tone> for a " +
          "labelled confirmation or <ButtonRound tone> for an icon-only one; " +
          'variant "filled" -> "secondary", "ghost" -> "tertiary".',
      );
    }
    const level = variant === "ghost" ? "tertiary" : "secondary";
    // With asChild the child element's own children are the label.
    const label = asChild && isValidElement(children)
      ? (children as ReactElement<any>).props.children
      : children;
    const labelled = label != null && label !== false;

    return labelled ? (
      <Button ref={ref} variant={level} tone={tone} size={size} icon={icon} asChild={asChild} {...props}>
        {children}
      </Button>
    ) : (
      <ButtonRound ref={ref} variant={level} tone={tone} size={size} icon={icon} asChild={asChild} {...props}>
        {children}
      </ButtonRound>
    );
  },
);
