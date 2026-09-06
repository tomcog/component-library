import { forwardRef, useId } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import styles from "./InputSelect.module.css";

// Same literal-expression note as Button: bundlers substitute this exact
// string, and an optional chain silently never fires.
declare const process: { env: { NODE_ENV?: string } };

export interface InputSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Rendered BELOW the field, as InputText's is. Omit it and no `<label>` is
   * emitted, so pass `aria-label` instead or the control has no accessible
   * name.
   */
  label?: ReactNode;
  /** Leading icon, the same slot InputText has. Decorative (aria-hidden). */
  icon?: ReactNode;
  /** The `<option>` elements. */
  children: ReactNode;
}

/**
 * A dropdown: InputText's field with a chevron and a real `<select>` inside it.
 *
 * It is a native select on purpose. A listbox rebuilt out of divs has to
 * reimplement type-ahead, keyboard traversal, the mobile wheel picker and the
 * screen-reader contract, and gets them subtly wrong; the native control has
 * all of that already and the only thing it costs is styling the menu, which
 * this component does not attempt.
 *
 * `className` lands on the outer wrapper, every other prop spreads onto the
 * `<select>`, and the ref points at it.
 */
export const InputSelect = forwardRef<HTMLSelectElement, InputSelectProps>(function InputSelect(
  { label, icon, id, className, children, ...props },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;

  if (process.env.NODE_ENV !== "production") {
    const named =
      props["aria-label"] != null ||
      props["aria-labelledby"] != null ||
      props.title != null;
    if (label == null && !named) {
      console.warn(
        "[@tomcoggia/ui] InputSelect: no `label` and no accessible name. " +
          'Pass `label` or aria-label="…" - the chevron is aria-hidden and an ' +
          "option list is not a name.",
      );
    }
  }

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.field}>
        {icon ? (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <select ref={ref} id={selectId} className={styles.select} {...props}>
          {children}
        </select>
        {/* Out of the flow and pointer-transparent, so the select underneath
            spans the full field and a click anywhere on it opens the menu -
            including on the chevron. */}
        <span className={styles.chevron} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>
      {label != null ? (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      ) : null}
    </div>
  );
});
