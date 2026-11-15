import { forwardRef, useId, useState } from "react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import styles from "./InputText.module.css";
import hidden from "../../internal/visuallyHidden.module.css";
import sizes from "../../internal/inputSize.module.css";

// Same literal-expression note as Button: bundlers substitute this exact
// string, and an optional chain silently never fires.
declare const process: { env: { NODE_ENV?: string } };

/**
 * The two steps the whole input family shares. `lg` is the 32px field; `md` is
 * the compact 24px one. InputSelect and InputTextarea are typed on THIS rather
 * than on `InputTextSize`, so that adding a size to one component cannot
 * silently widen the other two's API to a value they do not implement.
 */
export type InputFieldSize = "lg" | "md";

/**
 * Figma: Size. The shared steps, plus `xl`, which is this component's alone -
 * Figma draws the XL cell for `Input-Text` only (`1055:2245`). XL is LG's box
 * with a bigger value and caption, not a bigger field: top-aligned beside an
 * LG field, the rule lands on the same pixel. See InputText.module.css.
 */
export type InputTextSize = InputFieldSize | "xl";

/**
 * The native `size` attribute (a width in characters) is omitted so `size`
 * can be the design's size step. Width is the wrapper's job here - see
 * `className` - so the attribute had no use on this component.
 */
export interface InputTextProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Figma: Size. Defaults to `lg`. */
  size?: InputTextSize;
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
  /**
   * Hide the label on screen while keeping it as the control's accessible
   * name. Defaults to `false`: the label shows. Pass a `label` with it -
   * a hidden label is still the name a screen reader announces.
   */
  hideLabel?: boolean;
}

/**
 * A single-line text field: an underlined box with its label beneath it.
 * Figma: `Input-Text` - `Size=LG` (553:5455) and `Size=MD` (725:703).
 *
 * `className` lands on the outer wrapper - the component's root box - while
 * every other prop spreads onto the `<input>`, which is also what the ref
 * points at. So `style` and layout classes size the field, and `placeholder`,
 * `value`, `onChange`, `disabled` and friends reach the control.
 */
export const InputText = forwardRef<HTMLInputElement, InputTextProps>(function InputText(
  { label, hideLabel = false, size = "lg", icon, iconEnd, id, type = "text", className, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  /* Date-like inputs render `mm/dd/yyyy` when empty. That string is a HINT -
     it is the placeholder in every sense except the one CSS recognises, since
     a date input has no `placeholder` attribute and so never matches
     `:placeholder-shown`. Chrome draws it inside ::-webkit-datetime-edit,
     which takes the input's own `color`, so an empty field printed its hint at
     full value-black next to text fields printing theirs faint.
     There is no CSS selector for "this input has no value", so emptiness is
     published as an attribute for the stylesheet to hook - see the
     ::-webkit-datetime-edit rule in InputText.module.css. */
  const controlledValue = props.value;
  const isControlled = controlledValue !== undefined;
  const [uncontrolledFilled, setUncontrolledFilled] = useState(
    () => props.defaultValue != null && props.defaultValue !== "",
  );
  const filled = isControlled
    ? controlledValue !== "" && controlledValue != null
    : uncontrolledFilled;

  // Only the uncontrolled case needs the listener, and setState with an
  // unchanged boolean bails out, so a keystroke that does not cross the
  // empty/filled line costs no render.
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!isControlled) {
      const next = event.currentTarget.value !== "";
      setUncontrolledFilled((prev) => (prev === next ? prev : next));
    }
    props.onChange?.(event);
  }

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

  // MD comes from the shared module and XL from this component's own; see the
  // note on `InputTextSize` for why they live apart.
  const sizeClass = size === "md" ? sizes.md : size === "xl" ? styles.xl : null;

  return (
    <div className={[styles.root, sizeClass, className].filter(Boolean).join(" ")}>
      <div className={styles.field}>
        {slot(icon)}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={styles.input}
          {...props}
          onChange={handleChange}
          data-filled={filled ? "" : undefined}
        />
        {slot(iconEnd)}
      </div>
      {label != null ? (
        <label className={hideLabel ? hidden.visuallyHidden : styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
    </div>
  );
});
