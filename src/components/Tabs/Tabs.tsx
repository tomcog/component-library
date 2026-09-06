import { forwardRef, useRef } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import styles from "./Tabs.module.css";

declare const process: { env: { NODE_ENV?: string } };

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** The `<Tab>` children. */
  children: ReactNode;
  /**
   * Actions pinned to the right of the strip. Rendered OUTSIDE the tablist,
   * because a tablist's children must be tabs - an action parked among them
   * would be a lie to a screen reader. The tabs still share the space that is
   * left, so the strip looks the same whether or not this is passed.
   */
  trailing?: ReactNode;
  /**
   * Names the tablist. Required in practice: a screen reader announces "tab
   * list" with nothing to say which one, on a page that may have several.
   */
  "aria-label"?: string;
}

/**
 * An in-page view switcher. Figma: `PageTabs` (364:420).
 *
 * NOT a nav. `Nav`, `NavRail` and `BottomNav` move you between PAGES and are
 * built from links; this swaps what is shown inside the page you are already
 * on, so it is a real `tablist` of buttons.
 *
 *     <Tabs aria-label="Job views">
 *       <Tab icon={<Info />} active onClick={() => setView("details")}>Details</Tab>
 *       <Tab icon={<Sparkles />} onClick={() => setView("brief")}>Brief</Tab>
 *     </Tabs>
 *
 * **Keyboard**: the arrow keys move between tabs and select as they go
 * (the "automatic activation" half of the ARIA pattern, which is what suits a
 * view switcher - the view follows the focus). Home and End jump to the ends.
 * Only the selected tab is in the tab order, so Tab enters and leaves the
 * strip rather than walking through every view.
 *
 * Selection is the consumer's: this fires the focused tab's own `onClick`, so
 * it composes with whatever state that handler already drives.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { children, trailing, className, ...props },
  ref,
) {
  const list = useRef<HTMLDivElement | null>(null);

  if (process.env.NODE_ENV !== "production") {
    if (props["aria-label"] == null && props["aria-labelledby"] == null) {
      console.warn(
        "[@tomcoggia/ui] Tabs: no accessible name. Pass `aria-label` - a page " +
          "can hold more than one tablist, and \"tab list\" alone does not say which.",
      );
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const tabs = Array.from(
      list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? [],
    );
    if (!tabs.length) return;
    const from = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (from === -1) return;
    event.preventDefault();

    // Wraps, as the pattern specifies: the ends are neighbours.
    const to =
      event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
      : event.key === "ArrowLeft" ? (from - 1 + tabs.length) % tabs.length
      : (from + 1) % tabs.length;

    tabs[to].focus();
    // Automatic activation: the view follows the focus. `click()` rather than a
    // callback of our own, so it runs whatever handler the tab already carries.
    tabs[to].click();
  }

  return (
    <div className={[styles.bar, className].filter(Boolean).join(" ")} {...props} ref={ref}>
      <div
        ref={list}
        role="tablist"
        aria-label={props["aria-label"]}
        aria-labelledby={props["aria-labelledby"]}
        className={styles.list}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
      {trailing != null ? <div className={styles.trailing}>{trailing}</div> : null}
    </div>
  );
});

/* `type` is omitted rather than defaulted: a button inside a form submits it
   unless told otherwise, and a tab must never submit anything - so the choice
   is not the consumer's to make. */
export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** The selected view. Sets `aria-selected` and the primary rule. */
  active?: boolean;
  /**
   * Decorative icon, e.g. any Lucide React icon. Always `aria-hidden`: the
   * label is the accessible name. Its stroke is `currentColor`, so it follows
   * the label through idle, hover and selected without a rule of its own.
   */
  icon?: ReactNode;
  /** Trailing content after the label - a count. The app paints it. */
  badge?: ReactNode;
}

/**
 * One tab in a `Tabs`. Figma: `PageTabs` (364:420).
 *
 * The rule under a tab is drawn at every state and only changes colour, so
 * selecting one moves nothing.
 */
export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { active = false, icon, badge, children, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={active}
      // Roving tabindex: Tab enters the strip at the selected view rather than
      // walking through every one of them.
      tabIndex={active ? 0 : -1}
      className={[styles.tab, active ? styles.current : null, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
      {badge}
    </button>
  );
});
