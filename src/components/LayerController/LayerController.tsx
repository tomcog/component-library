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
   * Props for the swatch. Pass them to make the swatch a `<button>` - to open
   * a colour picker, say; omit them and the swatch is decorative. Pass an
   * `aria-label`: the swatch has no text of its own.
   */
  swatchProps?: ButtonHTMLAttributes<HTMLButtonElement>;
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
   * Whether the layer is shown. A hidden layer drops both rules, greys its
   * number and name, shows the red eye-off, and can't be picked to print.
   * Defaults to `true`.
   */
  visible?: boolean;
  /**
   * Called with the new visibility when the eye is clicked. Pass it to make
   * the eye a toggle button; omit it and the eye only shows the state.
   */
  onVisibleChange?: (visible: boolean) => void;
  /**
   * Leave the eye off the row, for views where visibility isn't something to
   * change. Defaults to `false`: the eye shows.
   */
  hideVisibility?: boolean;
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
  { number, color, swatchProps, label, printed = false, visible = true, onVisibleChange, hideVisibility = false, handleProps, className, checked, disabled, ...props },
  ref,
) {
  const ariaLabel = props["aria-label"] ?? (typeof label === "string" ? `Print ${label}` : undefined);
  const state = !visible ? "empty" : checked ? "target" : printed ? "printed" : "empty";
  const labelText = typeof label === "string" ? label : "layer";

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} data-state={state} data-visible={visible}>
      <label className={styles.control}>
        <input
          ref={ref}
          type="radio"
          className={styles.input}
          checked={visible ? checked : false}
          disabled={disabled || !visible}
          {...props}
          aria-label={ariaLabel}
        />
        {state === "target" && <PrinterIcon className={styles.icon} />}
        {state === "printed" && <PrintedIcon className={styles.icon} />}
      </label>
      <div className={styles.layer}>
        <span className={styles.lead}>
          <span className={styles.number}>{number}</span>
          {color && swatchProps ? (
            <button
              type="button"
              {...swatchProps}
              className={[styles.swatch, styles.swatchButton, swatchProps.className].filter(Boolean).join(" ")}
              style={{ ...swatchProps.style, background: color }}
            />
          ) : color ? (
            <span className={styles.swatch} style={{ background: color }} aria-hidden />
          ) : null}
          <span className={styles.label}>{label}</span>
        </span>
        <span className={styles.end}>
        {hideVisibility ? null : onVisibleChange ? (
          <button
            type="button"
            className={styles.eye}
            aria-pressed={!visible}
            aria-label={visible ? `Hide ${labelText}` : `Show ${labelText}`}
            title={visible ? "Hide layer" : "Show layer"}
            onClick={() => onVisibleChange(!visible)}
          >
            {visible ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        ) : (
          <span className={styles.eye} aria-hidden>
            {visible ? <EyeIcon /> : <EyeOffIcon />}
          </span>
        )}
        {handleProps ? (
          <button type="button" {...handleProps} className={[styles.handle, handleProps.className].filter(Boolean).join(" ")}>
            <GripIcon />
          </button>
        ) : (
          <span className={styles.handle} aria-hidden>
            <GripIcon />
          </span>
        )}
        </span>
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

function EyeIcon() {
  return (
    <svg className={styles.eyeGlyph} viewBox="0 0 12 12" aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d="M6.00031 4.125C7.0357 4.12517 7.87531 4.96457 7.87531 6C7.87531 7.03543 7.0357 7.87483 6.00031 7.875C4.96478 7.875 4.12531 7.03553 4.12531 6C4.12531 4.96447 4.96478 4.125 6.00031 4.125ZM6.00031 4.875C5.37899 4.875 4.87531 5.37868 4.87531 6C4.87531 6.62132 5.37899 7.125 6.00031 7.125C6.62149 7.12483 7.12531 6.62122 7.12531 6C7.12531 5.37878 6.62149 4.87517 6.00031 4.875Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M6.00031 2.12549C7.13894 2.12555 8.25254 2.46336 9.1988 3.09668C10.0858 3.69041 10.7892 4.51889 11.2313 5.4873L11.3162 5.68286L11.3206 5.69604C11.3934 5.89236 11.3935 6.1084 11.3206 6.30469C11.3191 6.30879 11.3179 6.31309 11.3162 6.31714C10.8821 7.36972 10.145 8.26996 9.1988 8.90332C8.25254 9.53664 7.13894 9.87445 6.00031 9.87451C4.8617 9.87451 3.7481 9.53656 2.80183 8.90332C1.85567 8.27 1.11854 7.36967 0.684396 6.31714C0.682756 6.31316 0.681486 6.30873 0.680001 6.30469C0.607115 6.10834 0.607188 5.89242 0.680001 5.69604L0.684396 5.68286C1.11856 4.63024 1.85557 3.73001 2.80183 3.09668C3.74814 2.46336 4.86163 2.12549 6.00031 2.12549ZM6.00031 2.87549C5.01022 2.87549 4.04215 3.16934 3.21931 3.71997C2.40011 4.26825 1.76132 5.04669 1.38313 5.95679L1.37507 6C1.37507 6.01431 1.37748 6.02882 1.38239 6.04248C1.76054 6.95297 2.39984 7.73156 3.21931 8.28003C4.04215 8.83066 5.01023 9.12451 6.00031 9.12451C6.99041 9.12445 7.9585 8.83073 8.78132 8.28003C9.60072 7.73158 10.2394 6.95291 10.6175 6.04248C10.6275 6.01477 10.6277 5.98445 10.6175 5.95679C10.2393 5.04692 9.60029 4.26819 8.78132 3.71997C7.95854 3.16934 6.99035 2.87555 6.00031 2.87549Z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className={styles.eyeGlyph} viewBox="0 0 12 12" aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d="M0.734779 0.734785C0.881193 0.58838 1.1186 0.588441 1.26505 0.734785L11.2648 10.7345C11.4113 10.881 11.4112 11.1184 11.2648 11.2648C11.1184 11.4113 10.881 11.4113 10.7345 11.2648L8.68009 9.21037C8.03661 9.54951 7.33452 9.76517 6.60953 9.84245C5.78955 9.92983 4.96002 9.84008 4.17789 9.57878C3.39582 9.31746 2.67932 8.89049 2.07658 8.3278C1.47378 7.76503 0.998619 7.07896 0.684242 6.31657C0.682605 6.31257 0.681353 6.30818 0.679847 6.30412C0.607013 6.10775 0.606975 5.89184 0.679847 5.69548L0.684242 5.68303C1.09763 4.68064 1.78474 3.81847 2.66251 3.19279L0.734779 1.26506C0.588433 1.1186 0.588366 0.881198 0.734779 0.734785ZM3.20158 3.73185C2.39252 4.27835 1.7592 5.05095 1.38297 5.95622L1.37492 6.00017C1.37495 6.01402 1.37759 6.02792 1.38224 6.04118C1.65563 6.69998 2.0671 7.2924 2.58854 7.77922C3.11271 8.26858 3.73579 8.63962 4.41593 8.86686C5.09605 9.09408 5.8174 9.17283 6.53043 9.09685C7.08283 9.03793 7.61951 8.88565 8.12052 8.6508L7.03287 7.56315C6.72387 7.76753 6.35963 7.87835 5.98405 7.87517C5.49249 7.87089 5.0221 7.67341 4.67448 7.32585C4.32684 6.97821 4.12943 6.5079 4.12516 6.01628C4.12192 5.64068 4.23212 5.27588 4.43644 4.96672L3.20158 3.73185ZM4.98576 5.51603C4.91277 5.66889 4.87369 5.83718 4.87516 6.00969C4.87772 6.30466 4.99617 6.58699 5.20475 6.79558C5.41332 7.00408 5.69573 7.1226 5.99064 7.12517C6.16297 7.12659 6.33079 7.08672 6.48356 7.01384L4.98576 5.51603Z" />
      <path d="M5.32194 2.1652C6.56785 2.01676 7.82862 2.28022 8.9108 2.9152C9.9253 3.5105 10.7309 4.40208 11.2216 5.46696L11.3161 5.68229L11.3205 5.69475C11.3933 5.89104 11.3932 6.10707 11.3205 6.30339C11.319 6.30735 11.3177 6.31191 11.3161 6.31584C11.1195 6.79233 10.8593 7.24086 10.5434 7.64811C10.4165 7.8116 10.1811 7.84143 10.0175 7.71477C9.85392 7.5878 9.82391 7.35176 9.95084 7.18815C10.223 6.83726 10.447 6.45128 10.6173 6.04118C10.6272 6.01353 10.6276 5.98304 10.6173 5.95549C10.2007 4.95247 9.46837 4.11174 8.53141 3.56193C7.59054 3.00985 6.49452 2.78108 5.41129 2.91008C5.20564 2.93459 5.01905 2.7876 4.99454 2.58195C4.97025 2.37653 5.11655 2.18984 5.32194 2.1652Z" />
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
