import { Children, cloneElement, forwardRef, isValidElement } from "react";
import type {
  ButtonHTMLAttributes,
  MouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import styles from "./Button.module.css";
import { assignRef } from "../../internal/assignRef";

// Written as the exact expression `process.env.NODE_ENV` because that is the
// literal string bundlers substitute - an optional chain (process.env?.NODE_ENV)
// does NOT match their define and silently never fires. Same pattern React uses.
declare const process: { env: { NODE_ENV?: string } };

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";
/**
 * What the button DOES, not what colour it is. `danger` is a destructive action
 * (Delete, Remove, Discard); `safety` the affirmative half of a decision (Save,
 * Confirm, Keep). Either recolours EVERY state of the variant from the action
 * colour to its role colour, at rest included, each variant keeping its shape.
 *
 * A tone, NOT a fifth variant: it cuts ACROSS the variants. A destructive
 * action can be a loud primary or a quiet ghost and is destructive either way.
 *
 * Since 0.74.0 this is also what `ConfirmButton` was: a confirmation is a
 * Button (or ButtonRound) with a tone - `secondary` for ConfirmButton's tinted
 * disc, `tertiary` for its glyph alone. `default` was called `primary` until
 * 0.74.0, which clashed with `variant="primary"`; `"primary"` still works and
 * warns in dev.
 */
export type ButtonTone = "default" | "safety" | "danger";

export type ButtonSize = "xl" | "lg" | "md" | "sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Figma: Level */
  variant?: ButtonVariant;
  /**
   * Figma: Tone. `danger` or `safety` recolours every state of the variant, at
   * rest included, into that role colour - the same tones `ButtonRound`
   * carries. Defaults to `default`, the action colour. `"primary"` is the
   * pre-0.74.0 name for `default`.
   */
  tone?: ButtonTone | "primary";
  /** Figma: Size */
  size?: ButtonSize;
  /**
   * Leading icon. Figma: `Icon Start?` + `ButtonIcon`.
   * Icons are decorative (aria-hidden), so a Button with no children must be
   * given an `aria-label`.
   */
  icon?: ReactNode;
  /**
   * Trailing icon. Figma: `Icon End?` + `ButtonIcon`.
   * Both may be set at once; that is unusual but the design system allows it.
   */
  iconEnd?: ReactNode;
  /**
   * Shows a spinner and blocks activation while an action is in flight.
   * The label and icons stay in place (hidden, not removed), so the button
   * does not change size. The label text is never rewritten - if you want
   * "Saving…" instead of "Save", pass it yourself. Figma: State=Loading.
   */
  loading?: boolean;
  /**
   * Render the single child element instead of a <button>, merging this
   * component's classes and props into it. Use for navigation, so the element
   * is a real link (cmd-click, "open in new tab", announced as a link):
   *
   *     <Button asChild><Link href="/settings">Settings</Link></Button>
   *
   * Preferred over an `as` prop because it composes with framework link
   * components (next/link and friends) without per-element typing.
   */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    tone: toneProp = "default",
    size = "lg",
    icon,
    iconEnd,
    loading = false,
    asChild = false,
    onClick,
    // Native default is "submit", which silently submits any enclosing form.
    type = "button",
    className,
    children,
    ...props
  },
  ref,
) {
  const child =
    asChild && isValidElement(children) ? (Children.only(children) as ReactElement<any>) : null;

  if (process.env.NODE_ENV !== "production") {
    const named =
      props["aria-label"] != null ||
      props["aria-labelledby"] != null ||
      props.title != null;
    const label = child ? child.props.children : children;
    if ((icon || iconEnd) && label == null && !named) {
      console.warn(
        "[@tomcoggia/ui] Button: an icon-only Button has no accessible name. " +
          'Icons are aria-hidden, so pass aria-label="…" describing the action.',
      );
    }
    if (toneProp === "primary") {
      console.warn(
        '[@tomcoggia/ui] Button: tone="primary" was renamed "default" in 0.74.0. It still works; rename it.',
      );
    }
    if (asChild && !child) {
      console.warn(
        "[@tomcoggia/ui] Button: `asChild` expects exactly one React element child.",
      );
    }
  }

  // Two real slots rather than one node reordered by CSS: row-reverse would put
  // the visual order out of step with the DOM/reading order.
  const slot = (node: ReactNode) =>
    node ? (
      <span className={styles.icon} aria-hidden="true">
        {node}
      </span>
    ) : null;

  const tone: ButtonTone = toneProp === "primary" ? "default" : toneProp;
  const classes = [
    styles.button,
    styles[size],
    styles[variant],
    tone === "default" ? null : styles[tone],
    loading ? styles.loading : null,
    className,
    child ? child.props.className : null,
  ]
    .filter(Boolean)
    .join(" ");

  const body = (label: ReactNode) => (
    <>
      <span className={styles.content}>
        {slot(icon)}
        {label}
        {slot(iconEnd)}
      </span>
      {loading ? (
        <span className={styles.spinner} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      ) : null}
    </>
  );

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    if (loading) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    child?.props.onClick?.(e);
    onClick?.(e as MouseEvent<HTMLButtonElement>);
  };

  // aria-disabled rather than the disabled attribute: a disabled control loses
  // focus and drops out of the tab order mid-interaction.
  const shared = {
    className: classes,
    "aria-busy": loading || undefined,
    "aria-disabled": loading || undefined,
    onClick: handleClick,
  };

  if (child) {
    const childRef = (child as any).ref ?? child.props.ref;
    return cloneElement(
      child,
      {
        ...props,
        ...child.props,
        ...shared,
        ref: (node: HTMLButtonElement | null) => {
          assignRef(ref, node);
          assignRef(childRef, node);
        },
      },
      body(child.props.children),
    );
  }

  return (
    <button ref={ref} type={type} {...props} {...shared}>
      {body(children)}
    </button>
  );
});
