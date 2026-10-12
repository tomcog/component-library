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
   * Strike the swatch through with a diagonal rule: the colour is shown and
   * cancelled at once, for a colour nothing available can draw - a plotter with
   * no pen in that ink, a palette the colour isn't in. It marks a fact about the
   * colour, so it changes nothing else about the row: the swatch still opens
   * whatever it opened, and the layer still prints. Figma: 741:386.
   */
  swatchCut?: boolean;
  /**
   * The layer name. A string, or a control such as a borderless `<input>` when
   * the name is editable in place - it inherits this row's type and colour.
   */
  label: ReactNode;
  /**
   * Printed this session. Draws the grey printer with a green tick in the box
   * while the layer is not the chosen one; the chosen layer's green target
   * always wins.
   */
  printed?: boolean;
  /**
   * What picking a layer means, which is not the same in every app. `print` is
   * the default and is a plotter's: the picked layer is the one that will be
   * printed, so the box is a target and `printed` marks the ones already done.
   * `draw` is an editor's: the picked layer is the one being drawn on, so the
   * box is a pen nib and `printed` means nothing. The row is otherwise identical
   * - same geometry, same swatch, same eye - because it is the same layer.
   */
  purpose?: "print" | "draw";
  /**
   * What kind of layer this is, as a glyph in the box: a photo, say, among
   * drawn layers. It stays in the box whether or not the layer is picked -
   * muted at rest, in the picked colour in place of the printer or nib when
   * picked - so the kind always shows. Pass an icon that draws in
   * `currentColor` (a lucide icon does); it is sized to the box's 16px glyph
   * and given the same stroke weight. Leave it out for an ordinary layer.
   */
  icon?: ReactNode;
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
   * What the row is called in the eye's tooltip: "Hide layer", or "Hide path" for a row that is a
   * path rather than a layer. The accessible name still uses `label`. Defaults to `"layer"`.
   */
  noun?: string;
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
  /**
   * Leave the grip off the row, for lists whose order isn't the reader's to
   * change - a list that only reports an order set somewhere else. A decorative
   * grip invites a drag that does nothing, so a row that can't be reordered
   * should not show one. Defaults to `false`: the grip shows.
   */
  hideHandle?: boolean;
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
 * `purpose="draw"` turns the box into a pen nib for an editor, where the picked
 * layer is the one being drawn on rather than the one that will be printed.
 * `icon` puts a kind of layer in the box instead - a photo among drawn layers -
 * muted at rest and in the picked colour when picked.
 *
 * **The box is a radio, drawn like a checkbox.** Only one layer prints at a
 * time, so rows sharing a `name` are one radio group: picking a layer moves the
 * green target to it, and arrow keys move it along the group. It is a real
 * `<input type="radio">` at 1px behind the icon - the Checkbox pattern - so
 * focus, keyboard, forms and the screen-reader contract are the browser's. An
 * empty box is the resting state; there is no "none of them" once one is picked,
 * which is how a radio group behaves.
 *
 * The accessible name defaults to "Print " plus `label` when it is a string;
 * pass `aria-label` when the label is a control.
 */
export const LayerController = forwardRef<HTMLInputElement, LayerControllerProps>(function LayerController(
  { number, color, swatchProps, swatchCut = false, label, printed = false, purpose = "print", icon, visible = true, onVisibleChange, noun = "layer", hideVisibility = false, handleProps, hideHandle = false, className, checked, disabled, ...props },
  ref,
) {
  const verb = purpose === "draw" ? "Draw on" : "Print";
  const ariaLabel = props["aria-label"] ?? (typeof label === "string" ? `${verb} ${label}` : undefined);
  // Nothing has been "already drawn on", so `printed` only has a state to show in a plotter's row.
  const state = !visible ? "empty" : checked ? "target" : printed && purpose === "print" ? "printed" : "empty";
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
        {icon ? (
          // A kind of layer shows whatever the state; picking it only changes its colour.
          <span className={styles.kind} aria-hidden>{icon}</span>
        ) : (
          <>
            {state === "target" && (purpose === "draw" ? <PenToolIcon className={styles.icon} /> : <TargetIcon className={styles.icon} />)}
            {state === "printed" && <PrintedIcon className={styles.icon} />}
          </>
        )}
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
            >
              {swatchCut && <CutMark />}
            </button>
          ) : color ? (
            <span className={styles.swatch} style={{ background: color }} aria-hidden>
              {swatchCut && <CutMark />}
            </span>
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
            title={visible ? `Hide ${noun}` : `Show ${noun}`}
            onClick={() => onVisibleChange(!visible)}
          >
            {visible ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        ) : (
          <span className={styles.eye} aria-hidden>
            {visible ? <EyeIcon /> : <EyeOffIcon />}
          </span>
        )}
        {hideHandle ? null : handleProps ? (
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

/* Figma's own line across the swatch (741:386), at the box it is drawn in: a
   16px circle inside an 18.12 box, so the rule runs past the colour at both
   ends. Kept as the vector rather than redrawn with a gradient, because the
   overhang and the 3px weight are the whole of what makes it read as a cut. */
function CutMark() {
  return (
    <svg className={styles.cut} viewBox="0 0 18.1213 18.1213" fill="none" aria-hidden>
      <path className={styles.cutStroke} d="M17.0607 1.06066L1.06066 17.0607" />
    </svg>
  );
}

/* The printed glyph and icon-end are Figma's exported vectors (lucide/printed and icon-end), with their fills and strokes moved onto currentColor and
   tokens so they theme. */

/* lucide/target, at its 24-unit box with the 1.5 stroke, as pen-tool below: the layer the plotter
   aims at next. It replaced lucide/printer in 0.80. */
function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <g className={styles.strokeConfirm} strokeWidth={1.5}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </g>
    </svg>
  );
}

/* lucide/pen-tool, at the 24-unit box it is drawn in. Its stroke is 1.5 there, which is the same
   fraction of the box as the 1 the 16-unit glyphs carry, so it lands at the same weight. */
function PenToolIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <g className={styles.strokeConfirm} strokeWidth={1.5}>
        <path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" />
        <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" />
        <path d="m2.3 2.3 7.286 7.286" />
        <circle cx="11" cy="11" r="2" />
      </g>
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

// lucide/eye and lucide/eye-off, drawn as lines - their 24-unit box shown at the 12px handle size,
// the stroke held at --ui-layer-controller-eye-stroke-width on screen.
function EyeIcon() {
  return (
    <svg className={styles.eyeGlyph} viewBox="0 0 24 24" aria-hidden>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className={styles.eyeGlyph} viewBox="0 0 24 24" aria-hidden>
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
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
