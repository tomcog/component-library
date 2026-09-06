import { forwardRef, useCallback, useId, useLayoutEffect, useRef } from "react";
import type { ReactNode, TextareaHTMLAttributes } from "react";
import styles from "./InputTextarea.module.css";
import { assignRef } from "../../internal/assignRef";

// Same literal-expression note as Button: bundlers substitute this exact
// string, and an optional chain silently never fires.
declare const process: { env: { NODE_ENV?: string } };

export interface InputTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Rendered BELOW the field, as InputText's and InputSelect's are. Omit it
   * and no `<label>` is emitted, so pass `aria-label` instead or the control
   * has no accessible name.
   */
  label?: ReactNode;
  /**
   * Grow the box to fit its content instead of scrolling, and drop the resize
   * grabber. `rows` still sets the starting height, so it is the minimum.
   */
  autoResize?: boolean;
}

/**
 * A multi-line field: InputText's underlined box with its label beneath it,
 * made as tall as its `rows`.
 *
 * There are deliberately NO icon slots, unlike InputText and InputSelect. A
 * leading glyph is anchored to a single line of text; beside a three-line box
 * it either floats in the middle of an empty column or sits against the first
 * line pretending the other two are not there. Neither reads as the same
 * component, so the slot is omitted rather than left to be misused.
 *
 * `className` lands on the outer wrapper - the component's root box - while
 * every other prop spreads onto the `<textarea>`, which is also what the ref
 * points at.
 */
export const InputTextarea = forwardRef<HTMLTextAreaElement, InputTextareaProps>(
  function InputTextarea({ label, autoResize = false, id, rows = 3, className, ...props }, ref) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    if (process.env.NODE_ENV !== "production") {
      const named =
        props["aria-label"] != null ||
        props["aria-labelledby"] != null ||
        props.title != null;
      if (label == null && !named) {
        console.warn(
          "[@tomcoggia/ui] InputTextarea: no `label` and no accessible name. " +
            'Pass `label` or aria-label="…" - a placeholder is not a name.',
        );
      }
    }

    /* Measured, not calculated: height is reset to `auto` first so scrollHeight
       reports the content's natural height rather than the height the box is
       already holding, which would only ever grow and never shrink back. */
    const fit = useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoResize) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [autoResize]);

    /* Layout effect rather than effect: this runs before paint, so a textarea
       that arrives already holding text is never shown at the wrong height
       first. Re-runs on `value` so a controlled field follows its state, and
       on `rows` since that is the floor. */
    useLayoutEffect(fit, [fit, props.value, props.defaultValue, rows]);

    return (
      <div className={[styles.root, className].filter(Boolean).join(" ")}>
        <div className={styles.field}>
          <textarea
            ref={(node) => {
              innerRef.current = node;
              assignRef(ref, node);
            }}
            id={inputId}
            rows={rows}
            className={[styles.textarea, autoResize ? styles.autoResize : null]
              .filter(Boolean)
              .join(" ")}
            {...props}
            onInput={(event) => {
              fit();
              props.onInput?.(event);
            }}
          />
        </div>
        {label != null ? (
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
        ) : null}
      </div>
    );
  },
);
