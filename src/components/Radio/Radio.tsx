import { createContext, forwardRef, useContext, useId } from "react";
import type { ChangeEvent, HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import styles from "./Radio.module.css";
import hidden from "../../internal/visuallyHidden.module.css";

declare const process: { env: { NODE_ENV?: string } };

/** Figma: Size. The same three Checkbox has - there is no SM. */
export type RadioSize = "xl" | "lg" | "md";

/* What a RadioGroup hands its radios: one name, the chosen value, and the
   handler - so a group of radios is wired once, not per radio. A context for
   the reason GroupLabelContext gives: cloning reaches only direct children. */
interface RadioGroupState {
  name: string;
  value: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
  size: RadioSize | undefined;
}
const RadioGroupContext = createContext<RadioGroupState | null>(null);

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /**
   * The text beside the circle. The whole row is a `<label>`, so this both
   * names the option and extends its hit target. Omit it and pass `aria-label`.
   */
  label?: ReactNode;
  /** Figma: Size. Defaults to `lg`, or the group's size inside a RadioGroup. */
  size?: RadioSize;
  /** Hide the label on screen, keeping it as the accessible name. */
  hideLabel?: boolean;
  /** The option's value. Inside a RadioGroup it decides `checked`. */
  value?: string;
}

/**
 * One option of a one-of-N choice: a circle and its label. Figma: `Radio`.
 * Modelled on `Checkbox` - the same real input drawn 1px behind the glyph, the
 * same three sizes and geometry, the same states - with a ring and a dot where
 * Checkbox has a square and a tick.
 *
 *     <RadioGroup aria-label="Units" value={unit} onValueChange={setUnit}>
 *       <Radio value="in" label="Inches" />
 *       <Radio value="mm" label="Millimetres" />
 *     </RadioGroup>
 *
 * **A real `<input type="radio">`.** The browser already moves between radios
 * that share a `name` with the arrow keys, checking as it goes, and Tab enters
 * the group at the checked one - so nothing here re-implements that.
 *
 * NOT SegmentedControl: that is the same one-of-N question drawn as a track of
 * segments, for a short set that sits in a toolbar or a filter row. A Radio is
 * the form-field shape - a column of labelled options.
 *
 * Standalone it takes `name`, `checked` and `onChange` like any input; inside a
 * RadioGroup those come from the group.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, hideLabel = false, size, className, value, checked, onChange, name, ...props },
  ref,
) {
  const group = useContext(RadioGroupContext);
  const resolvedSize = size ?? group?.size ?? "lg";

  if (process.env.NODE_ENV !== "production") {
    const named = props["aria-label"] != null || props["aria-labelledby"] != null || props.title != null;
    if (label == null && !named) {
      console.warn(
        "[@tomcoggia/ui] Radio: no `label` and no accessible name. " +
          'Pass `label` or aria-label="…" - the circle is aria-hidden on its own.',
      );
    }
  }

  const inGroup = group != null && value !== undefined;
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    if (inGroup && event.target.checked) group.onValueChange?.(value);
  }

  return (
    <label className={[styles.root, styles[resolvedSize], className].filter(Boolean).join(" ")}>
      <input
        ref={ref}
        type="radio"
        className={styles.input}
        name={group?.name ?? name}
        value={value}
        checked={inGroup ? group.value === value : checked}
        onChange={handleChange}
        {...props}
      />
      <span className={styles.slot}>
        {/* Drawn on Checkbox's 16-unit box: the ring is the same 13-unit
            outline Checkbox's square is (1.5 to 14.5), 1 unit thick, so a
            Radio and a Checkbox of one size are the same size. All four shapes
            are in the DOM at every state and only their opacity moves - the
            dot fades in, the glyph never reflows - exactly as Checkbox does.
            Each is one closed shape in currentColor. */}
        <svg className={styles.glyph} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          {/* Unchecked: the ring, as a filled annulus rather than a stroke. */}
          <path className={styles.ring} fillRule="evenodd" d="M8 1.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13Zm0 1a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11Z" />
          {/* The dot, radius 4.5 - a 1-unit gap inside the 1-unit ring, so
              ring, gap and dot are three even bands. Hover previews it over
              the ring, unchecked only; checked keeps it. */}
          <circle className={styles.dot} cx="8" cy="8" r="4.5" />
          {/* Disabled unchecked: the same disc with no hole, as Checkbox's
              disabled box is solid. */}
          <circle className={styles.solid} cx="8" cy="8" r="6.5" />
        </svg>
      </span>
      {label != null ? (
        <span className={hideLabel ? hidden.visuallyHidden : styles.label}>{label}</span>
      ) : null}
    </label>
  );
});

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** The `<Radio>` options, each with a `value`. */
  children: ReactNode;
  /** The chosen option's value. Controlled: pair with `onValueChange`. */
  value?: string;
  /** Called with the newly chosen option's value. */
  onValueChange?: (value: string) => void;
  /** The shared input name. Generated when omitted - a group needs one. */
  name?: string;
  /** The size for every radio in the group. A radio's own `size` still wins. */
  size?: RadioSize;
  /**
   * Names the group. Required in practice: "radio group" alone does not say
   * which question the options answer. Or pass `aria-labelledby`.
   */
  "aria-label"?: string;
}

/**
 * A set of `Radio`s answering one question. A `role="radiogroup"` that gives
 * its radios one `name`, the chosen `value` and the change handler, stacked in
 * a column. Code-only as a container - Figma draws the Radio itself.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { children, value, onValueChange, name, size, className, ...props },
  ref,
) {
  const generated = useId();
  if (process.env.NODE_ENV !== "production") {
    if (props["aria-label"] == null && props["aria-labelledby"] == null) {
      console.warn(
        "[@tomcoggia/ui] RadioGroup: no accessible name. Pass `aria-label` - " +
          '"radio group" alone does not say which question it answers.',
      );
    }
  }
  return (
    <div
      ref={ref}
      role="radiogroup"
      className={[styles.group, className].filter(Boolean).join(" ")}
      {...props}
    >
      <RadioGroupContext.Provider value={{ name: name ?? generated, value, onValueChange, size }}>
        {children}
      </RadioGroupContext.Provider>
    </div>
  );
});
