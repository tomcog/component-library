import { forwardRef, useRef } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import styles from "./Tabs.module.css";

declare const process: { env: { NODE_ENV?: string } };

/**
 * Figma: the `Size` axis on `Tabs/Item` (646:2357).
 *
 * Only two steps, because only two are drawn. This is NOT the four-step
 * `xl | lg | md | sm` axis Button and ButtonRound carry - a step exists here
 * when something uses it, the same rule that cut the type scale from six to
 * four.
 */
export type TabsSize = "xl" | "lg";

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** The `<Tab>` children. */
  children: ReactNode;
  /**
   * `lg` (the default) is 14/21 with an 18 icon and a 32px strip; `xl` is
   * 18/24 with a 20 icon and a 35px strip. Nothing else moves between them -
   * the gaps, the padding and the rule are shared.
   *
   * It sits on the STRIP, not on each `Tab`, though Figma models it per item.
   * A strip is one size throughout: a per-tab size would let a caller build a
   * ragged row whose rules do not line up, and the rule is the one part of
   * this component that has to be continuous. Figma has no way to express
   * "this applies to the whole assembly" other than repeating the axis on the
   * item, so that difference is a modelling artefact, not drift.
   */
  size?: TabsSize;
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
 * An in-page view switcher. Figma: the `Tabs/Item` set (646:2357) and the
 * `Tabs` strip set (648:13715), both carrying a `Size` axis of LG | XL.
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
 * A larger strip is one prop, and the icons and type grow together:
 *
 *     <Tabs size="xl" aria-label="Resource types">
 *       <Tab active onClick={() => setTab("companies")}>Companies</Tab>
 *       <Tab onClick={() => setTab("sites")}>Job sites</Tab>
 *       <Tab onClick={() => setTab("people")}>People</Tab>
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
  { children, trailing, size = "lg", className, ...props },
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
    <div
      className={[styles.bar, styles[size], className].filter(Boolean).join(" ")}
      {...props}
      ref={ref}
    >
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
 * One tab in a `Tabs`. Figma: the `Tabs/Item` set (646:2357).
 *
 * The rule under a tab is drawn at every state and only changes colour, so
 * selecting one moves nothing.
 *
 * It carries no `size` of its own - the strip sets that for every tab in it.
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
