import { forwardRef, useCallback, useEffect, useId, useRef } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { assignRef } from "../../internal/assignRef";
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
  const inner = useRef<HTMLSelectElement | null>(null);

  /**
   * Line the CHOSEN row up with the field's own value, the way a macOS popup
   * button does - so opening the menu does not move the thing you are looking
   * at. The picker anchors under the select, and the shift is
   *
   *     border + padding + row/2 + value line-height/2 + index * row
   *
   * all of which are tokens except the index, which is what this supplies.
   *
   * **`beforetoggle` does not fire for a select's picker** - measured in
   * Chrome 148, where opening one emits only pointerdown / mousedown / focus /
   * click. Nor does `toggle`. Do not "restore" them: `"onbeforetoggle" in el`
   * is TRUE on every HTMLElement, inherited from the popover API, so it feeds
   * back a confident yes and detects nothing. That false positive cost a
   * debugging round here.
   *
   * `pointerdown` and `keydown` are the two things that precede an open, and
   * both fire while the index is still correct and before the picker paints -
   * so the menu is never drawn in the wrong place and then corrected.
   *
   * Both the index AND the option count go out, because Chrome opens the
   * picker above the field as readily as below it and the module has to solve
   * for either - see the note on the alignment rule in the CSS.
   *
   * The `:open` guard is what makes arrowing through an OPEN menu safe:
   * every arrow press is a keydown, and re-reading the index then would walk
   * the menu up the screen under the pointer. Syncing only while closed also
   * makes controlled and uncontrolled selects behave identically, since the
   * index is read from the DOM at the last possible moment either way.
   */
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    if (
      typeof CSS === "undefined" ||
      typeof CSS.supports !== "function" ||
      !CSS.supports("selector(::picker(select))")
    ) {
      return;
    }

    // The row height, read through the same fallback chain the CSS uses so an
    // app that retunes either token is measured on its own terms.
    const rowHeight = () => {
      const cs = getComputedStyle(el);
      const px = (v: string) => Number.parseFloat(v) || 0;
      return (
        px(cs.getPropertyValue("--ui-input-select-option-height")) ||
        px(cs.getPropertyValue("--ui-input-select-height")) ||
        px(cs.getPropertyValue("--ui-input-text-height")) ||
        32
      );
    };

    const sync = () => {
      if (el.matches(":open")) return;

      // Align only when the menu FITS. Chrome does not shrink an oversized
      // picker - it pins it to the viewport edge and lets the rest hang off -
      // so shifting a very long list up by index*row just buries more of it.
      // NextJob has a 165-option company select where aligning cut the visible
      // rows from ~31 to ~12. Falling back to Chrome's own placement shows the
      // most options, which is what matters once the list stops fitting.
      const fits = el.options.length * rowHeight() <= window.innerHeight;
      if (!fits) {
        el.removeAttribute("data-ui-picker-aligned");
        return;
      }
      el.setAttribute("data-ui-picker-aligned", "");

      // selectedIndex is -1 when nothing is selected; the first row is the
      // sensible thing to line up with then.
      el.style.setProperty(
        "--ui-input-select-picker-index",
        String(Math.max(0, el.selectedIndex)),
      );
      // The COUNT is needed as well as the index: Chrome opens the picker
      // above the field as readily as below it, and the flipped case measures
      // from the menu's far edge, so it depends on how tall the menu is.
      el.style.setProperty("--ui-input-select-picker-count", String(el.options.length));
    };

    el.addEventListener("pointerdown", sync, true);
    el.addEventListener("keydown", sync, true);
    sync();
    return () => {
      el.removeEventListener("pointerdown", sync, true);
      el.removeEventListener("keydown", sync, true);
      el.removeAttribute("data-ui-picker-aligned");
    };
  }, []);

  const setRefs = useCallback(
    (node: HTMLSelectElement | null) => {
      inner.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

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
        <select ref={setRefs} id={selectId} className={styles.select} {...props}>
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
