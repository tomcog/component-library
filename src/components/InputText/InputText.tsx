import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./InputText.module.css";

// Same literal-expression note as Button: bundlers substitute this exact
// string, and an optional chain silently never fires.
declare const process: { env: { NODE_ENV?: string } };

export interface InputTextProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Figma: the `Input Label` text property. Rendered BELOW the field, which is
   * where the design puts it - see InputText.module.css. Omit it and no
   * `<label>` is emitted, so pass `aria-label` instead or the field has no
   * accessible name.
   */
  label?: ReactNode;
  /**
   * Leading icon. Figma: `lucide/layers`. Decorative (aria-hidden), so it
   * never stands in for the label.
   */
  icon?: ReactNode;
  /**
   * Trailing icon. Figma's instance draws `lucide/chevron-down`, but it is a
   * slot rather than part of the component: a text field is not a select, and
   * baking in a disclosure chevron would say it was. Both slots may be set.
   */
  iconEnd?: ReactNode;
}

/**
 * A single-line text field: an underlined box with its label beneath it.
 * Figma: `Input-Text` (553:5455).
 *
 * `className` lands on the outer wrapper - the component's root box - while
 * every other prop spreads onto the `<input>`, which is also what the ref
 * points at. So `style` and layout classes size the field, and `placeholder`,
 * `value`, `onChange`, `disabled` and friends reach the control.
 */
export const InputText = forwardRef<HTMLInputElement, InputTextProps>(function InputText(
  { label, icon, iconEnd, id, type = "text", className, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  if (process.env.NODE_ENV !== "production") {
    const named =
      props["aria-label"] != null ||
      props["aria-labelledby"] != null ||
      props.title != null;
    if (label == null && !named) {
      console.warn(
        "[@tomcoggia/ui] InputText: no `label` and no accessible name. " +
          'Pass `label` or aria-label="…" - icons are aria-hidden and a ' +
          "placeholder is not a name.",
      );
    }
  }

  // Two real slots rather than one node reordered by CSS, exactly as Button
  // does it: row-reverse would put the visual order out of step with the DOM.
  const slot = (node: ReactNode) =>
    node ? (
      <span className={styles.icon} aria-hidden="true">
        {node}
      </span>
    ) : null;

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.field}>
        {slot(icon)}
        <input ref={ref} id={inputId} type={type} className={styles.input} {...props} />
        {slot(iconEnd)}
      </div>
      {label != null ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
    </div>
  );
});
