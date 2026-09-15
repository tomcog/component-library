import { forwardRef } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import styles from "./LayerController.module.css";

export interface LayerControllerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "children"> {
  /** The layer's position, shown in the accent colour before the swatch. */
  number: ReactNode;
  /** The swatch colour - any CSS colour. Omit it and the swatch is not drawn. */
  color?: string;
  /**
   * The layer name. A string, or a control such as a borderless `<input>` when
   * the name is editable in place - it inherits this row's type and colour.
   */
  label: ReactNode;
  /**
   * Printed this session. Draws the grey printer with a green tick in the box
   * while the layer is not the chosen one; the chosen layer's green printer
   * always wins.
   */
  printed?: boolean;
  /**
   * Props for the grip at the end of the row. Pass them to make the grip a
   * `<button>` (for drag or keyboard reordering); omit them and the grip is
   * decorative.
   */
  handleProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  /** Class for the outer row. Every other prop spreads onto the radio. */
  className?: string;
}

/**
 * One layer of a drawing, with a box that picks it as the layer to print.
 * Figma: `LayerController` (719:555).
 *
 *     <LayerController name="print-layer" number={2} color="#00838a"
 *       label="Turquoise" checked={target === id} onChange={() => setTarget(id)} />
 *
 * **The box is a radio, drawn like a checkbox.** Only one layer prints at a
 * time, so rows sharing a `name` are one radio group: picking a layer moves the
 * green printer to it, and arrow keys move it along the group. It is a real
 * `<input type="radio">` at 1px behind the icon - the Checkbox pattern - so
 * focus, keyboard, forms and the screen-reader contract are the browser's. An
 * empty box is the resting state; there is no "none of them" once one is picked,
 * which is how a radio group behaves.
 *
 * The accessible name defaults to "Print " plus `label` when it is a string;
 * pass `aria-label` when the label is a control.
 */
export const LayerController = forwardRef<HTMLInputElement, LayerControllerProps>(function LayerController(
  { number, color, label, printed = false, handleProps, className, checked, ...props },
  ref,
) {
  const ariaLabel = props["aria-label"] ?? (typeof label === "string" ? `Print ${label}` : undefined);
  const state = checked ? "target" : printed ? "printed" : "empty";

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} data-state={state}>
      <label className={styles.control}>
        <input ref={ref} type="radio" className={styles.input} checked={checked} {...props} aria-label={ariaLabel} />
        {state === "target" && <PrinterIcon className={styles.icon} />}
        {state === "printed" && <PrintedIcon className={styles.icon} />}
      </label>
      <div className={styles.layer}>
        <span className={styles.lead}>
          <span className={styles.number}>{number}</span>
          {color ? <span className={styles.swatch} style={{ background: color }} aria-hidden /> : null}
          <span className={styles.label}>{label}</span>
        </span>
        {handleProps ? (
          <button type="button" {...handleProps} className={[styles.handle, handleProps.className].filter(Boolean).join(" ")}>
            <GripIcon />
          </button>
        ) : (
          <span className={styles.handle} aria-hidden>
            <GripIcon />
          </span>
        )}
      </div>
    </div>
  );
});

/* The three glyphs are Figma's exported vectors (lucide/printer, lucide/printed
   and icon-end), with their fills and strokes moved onto currentColor and
   tokens so they theme. */

function PrinterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        className={styles.strokeConfirm}
        d="M4 12H2.66667C2.31304 12 1.97391 11.8595 1.72386 11.6095C1.47381 11.3594 1.33333 11.0203 1.33333 10.6667V7.33333C1.33333 6.97971 1.47381 6.64057 1.72386 6.39052C1.97391 6.14048 2.31304 6 2.66667 6H13.3333C13.687 6 14.0261 6.14048 14.2761 6.39052C14.5262 6.64057 14.6667 6.97971 14.6667 7.33333V10.6667C14.6667 11.0203 14.5262 11.3594 14.2761 11.6095C14.0261 11.8595 13.687 12 13.3333 12H12M4 6V2C4 1.82319 4.07024 1.65362 4.19526 1.5286C4.32029 1.40357 4.48986 1.33333 4.66667 1.33333H11.3333C11.5101 1.33333 11.6797 1.40357 11.8047 1.5286C11.9298 1.65362 12 1.82319 12 2V6M4.66667 9.33333H11.3333C11.7015 9.33333 12 9.63181 12 10V14C12 14.3682 11.7015 14.6667 11.3333 14.6667H4.66667C4.29848 14.6667 4 14.3682 4 14V10C4 9.63181 4.29848 9.33333 4.66667 9.33333Z"
      />
    </svg>
  );
}

function PrintedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path className={styles.strokeMuted} d="M9 14.6667H4.66667C4.48986 14.6667 4.32029 14.5964 4.19526 14.4714C4.07024 14.3464 4 14.1768 4 14V10C4 9.82319 4.07024 9.65362 4.19526 9.52859C4.32029 9.40357 4.48986 9.33333 4.66667 9.33333H11.3333C11.5101 9.33333 11.6797 9.40357 11.8047 9.52859C11.9298 9.65362 12 9.82319 12 10V10.3333" />
      <path className={styles.strokeConfirm} d="M10.6667 12.6667L12 14L14.6667 11.3333" />
      <path className={styles.strokeMuted} d="M4 12H2.66667C2.31304 12 1.97391 11.8595 1.72386 11.6095C1.47381 11.3594 1.33333 11.0203 1.33333 10.6667V7.33333C1.33333 6.97971 1.47381 6.64057 1.72386 6.39052C1.97391 6.14048 2.31304 6 2.66667 6H13.3333C13.687 6 14.0261 6.14048 14.2761 6.39052C14.5262 6.64057 14.6667 6.97971 14.6667 7.33333V8.66667" />
      <path className={styles.strokeMuted} d="M4 6V2C4 1.82319 4.07024 1.65362 4.19526 1.5286C4.32029 1.40357 4.48986 1.33333 4.66667 1.33333H11.3333C11.5101 1.33333 11.6797 1.40357 11.8047 1.5286C11.9298 1.65362 12 1.82319 12 2V6" />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg className={styles.grip} viewBox="0 0 12 12" aria-hidden>
      <path d="M4.5 8.625C4.98314 8.62513 5.37451 9.01708 5.37451 9.50024C5.37438 9.9833 4.98306 10.3746 4.5 10.3748C4.01695 10.3746 3.62489 9.9833 3.62476 9.50024C3.62476 9.01708 4.01687 8.62514 4.5 8.625Z" />
      <path d="M7.5 8.625C7.98314 8.62513 8.37451 9.01708 8.37451 9.50024C8.37438 9.9833 7.98306 10.3746 7.5 10.3748C7.01695 10.3746 6.62489 9.9833 6.62476 9.50024C6.62476 9.01708 7.01687 8.62514 7.5 8.625Z" />
      <path d="M4.5 5.12476C4.98305 5.12489 5.37436 5.51696 5.37451 6C5.37438 6.48306 4.98306 6.87438 4.5 6.87451C4.01695 6.87438 3.62489 6.48305 3.62476 6C3.6249 5.51696 4.01696 5.12489 4.5 5.12476Z" />
      <path d="M7.5 5.12476C7.98305 5.12489 8.37436 5.51696 8.37451 6C8.37438 6.48306 7.98306 6.87438 7.5 6.87451C7.01695 6.87438 6.62489 6.48305 6.62476 6C6.6249 5.51696 7.01696 5.12489 7.5 5.12476Z" />
      <path d="M4.5 1.62524C4.98314 1.62538 5.37451 2.01732 5.37451 2.50049C5.37423 2.98342 4.98296 3.37487 4.5 3.375C4.01704 3.37486 3.62504 2.98342 3.62476 2.50049C3.62476 2.01732 4.01687 1.62538 4.5 1.62524Z" />
      <path d="M7.5 1.62524C7.98314 1.62538 8.37451 2.01732 8.37451 2.50049C8.37423 2.98342 7.98296 3.37487 7.5 3.375C7.01704 3.37486 6.62504 2.98342 6.62476 2.50049C6.62476 2.01732 7.01687 1.62538 7.5 1.62524Z" />
    </svg>
  );
}
