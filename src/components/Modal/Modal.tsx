import { forwardRef, useEffect, useId, useRef } from "react";
import type { DialogHTMLAttributes, ReactNode, SyntheticEvent } from "react";
import styles from "./Modal.module.css";
import { assignRef } from "../../internal/assignRef";

/**
 * The icon's colour. Figma: `Icon Color`. `default` is the muted grey
 * (`--ui-text-muted`), for a Modal that informs; `brand` takes `--ui-brand`,
 * for one that should carry the identity; `danger` takes `--ui-danger`, and a
 * destructive Modal always takes it - the icon matches the red answer. It is
 * never the action colour - the icon acts on nothing.
 */
export type ModalIconColor = "default" | "brand" | "danger";

export interface ModalProps
  extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "title" | "open" | "onClose"> {
  /** Whether the Modal is showing. It is controlled: the consumer owns this. */
  open: boolean;
  /**
   * Asked to close - on Escape, or if something inside closes the dialog
   * natively (a `<form method="dialog">`). Set `open` to false in response.
   * A click outside does NOT call it: a stray click cannot dismiss an
   * "are you sure?". The action buttons close it through their own handlers.
   */
  onClose: () => void;
  /** Figma: `Title`. Drawn in the heading step, and the dialog's accessible name. */
  title: ReactNode;
  /**
   * Figma: `Icon?` / `Icon`. Decorative, `aria-hidden`, drawn at 48 - it names
   * the kind of moment, it acts on nothing. Its colour is `iconColor`.
   */
  icon?: ReactNode;
  /**
   * Figma: `Icon Color`. The muted grey by default, or `brand`. A destructive
   * Modal - one answered by a `tone="danger"` button - is always `danger`.
   */
  iconColor?: ModalIconColor;
  /**
   * The buttons that answer it, right-aligned in the order given - dismiss
   * first, answer last, as Figma draws Tertiary then Primary. Pass them at
   * `size="lg"`, one step up from the body text, as Figma draws them. Focus starts on the
   * first, so the safe choice is the one a stray Enter presses. A destructive
   * answer is `<Button variant="primary" tone="danger">`: red at rest with a
   * white label, and the danger colour on hover and press - and the icon is
   * then always `iconColor="danger"`.
   */
  actions?: ReactNode;
  /** Figma: `Body`. Body LG (Regular, 14/20), and the dialog's accessible description. */
  children?: ReactNode;
}

/**
 * A dialog that interrupts: an icon, a title, a body and the actions that
 * answer it. Figma: `Modal` (853:583).
 *
 *     <Modal
 *       open={confirming}
 *       onClose={() => setConfirming(false)}
 *       icon={<Trash2 />}
 *       iconColor="danger"
 *       title="Delete this job?"
 *       actions={<>
 *         <Button variant="tertiary" size="lg" onClick={() => setConfirming(false)}>Cancel</Button>
 *         <Button variant="primary" tone="danger" size="lg" onClick={remove}>Delete</Button>
 *       </>}
 *     >
 *       Acme's listing will be removed. This cannot be undone.
 *     </Modal>
 *
 * **A native `<dialog>`, opened with `showModal()`.** That is the real element
 * for this, and it brings what a hand-built overlay has to fake: the rest of
 * the page becomes inert, focus stays inside and returns where it came from
 * on close, the dialog sits in the top layer above every stacking context,
 * and `::backdrop` is the scrim. No dependency, no portal.
 *
 * Escape closes it; a click outside does not - alert-dialog behaviour, the
 * same NextJob's delete dialogs have. The page underneath does not scroll
 * while it is open. All of that is code-only; Figma draws the one pose.
 */
export const Modal = forwardRef<HTMLDialogElement, ModalProps>(function Modal(
  { open, onClose, title, icon, iconColor = "default", actions, children, className, onCancel, ...props },
  ref,
) {
  const dialog = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const bodyId = useId();
  const hasBody = children != null && children !== false;
  // The latest `open`, read inside the native close event: a close WE caused
  // (open went false) must not be reported back as a request to close.
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    onCancel?.(event);
    // Escape would close the dialog natively and leave `open` stale. Keep the
    // consumer in charge: ask, and let the prop close it.
    event.preventDefault();
    onClose();
  }

  function handleClose() {
    // Closed by something native (a form with method="dialog") while the
    // consumer still thinks it is open - bring the state back in line.
    if (openRef.current) onClose();
  }

  return (
    <dialog
      ref={(node) => {
        dialog.current = node;
        assignRef(ref, node);
      }}
      className={[styles.modal, className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
      aria-describedby={hasBody ? bodyId : undefined}
      onCancel={handleCancel}
      onClose={handleClose}
      {...props}
    >
      {icon != null ? (
        <span
          className={[
            styles.icon,
            iconColor === "brand" ? styles.iconBrand : iconColor === "danger" ? styles.iconDanger : null,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {hasBody ? (
        <div id={bodyId} className={styles.body}>
          {children}
        </div>
      ) : null}
      {actions != null ? <div className={styles.actions}>{actions}</div> : null}
    </dialog>
  );
});
