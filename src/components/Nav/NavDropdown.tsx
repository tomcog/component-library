import { forwardRef, useCallback, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import styles from "./Nav.module.css";

export interface NavDropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, "onToggle"> {
  /** Trigger label. Figma: a `Nav/Item` held in State=Hover while open. */
  label: ReactNode;
  /** Start open. Uncontrolled after that. */
  defaultOpen?: boolean;
  /** Fires whenever the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * A top-level nav entry that reveals sub-navigation on hover or focus.
 * Figma: `Nav/Dropdown` + `Nav/Dropdown/Item`.
 *
 * The trigger is a `<button>`, not a link — it opens a menu rather than
 * navigating — carrying `aria-expanded`/`aria-haspopup`, and the panel opens
 * on focus as well as hover so it is reachable by keyboard. Escape closes it
 * and returns focus to the trigger.
 */
export const NavDropdown = forwardRef<HTMLDivElement, NavDropdownProps>(function NavDropdown(
  { label, defaultOpen = false, onOpenChange, className, children, ...props },
  ref,
) {
  const [open, setOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const change = useCallback(
    (next: boolean) => {
      setOpen((prev) => {
        if (prev !== next) onOpenChange?.(next);
        return next;
      });
    },
    [onOpenChange],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      change(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      ref={ref}
      className={[styles.dropdown, open ? styles.open : null, className].filter(Boolean).join(" ")}
      onMouseEnter={() => change(true)}
      onMouseLeave={() => change(false)}
      // React's onFocus/onBlur are focusin/focusout, so they fire for
      // descendants too - that is what makes the panel keyboard-reachable.
      onFocus={() => change(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) change(false);
      }}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <button
        ref={triggerRef}
        type="button"
        className={[styles.item, styles.trigger, open ? styles.underlined : null]
          .filter(Boolean)
          .join(" ")}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => change(!open)}
      >
        {label}
      </button>
      <div className={styles.panel}>
        <div className={styles.panelInner}>{children}</div>
      </div>
    </div>
  );
});
