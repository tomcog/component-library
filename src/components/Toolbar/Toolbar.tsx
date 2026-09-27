import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Toolbar.module.css";
import { GroupLabelContext } from "../../internal/groupLabel";

declare const process: { env: { NODE_ENV?: string } };

/**
 * Which ground the BAR takes. Figma: the two frames in `Toolbars` (772:1200).
 *
 * The names say what the bar IS, matching `SegmentedControl`'s `tone` - and
 * Figma's layers are named for the page they sit ON, so the two read
 * inverted: `Toolbar on white` is `tone="gray"`, `Toolbar on gray` is
 * `tone="white"`. Pick by the bar, not by the page.
 *
 * `gray` is `--ui-surface-sunken` and `white` is `--ui-surface-raised`; both
 * are semantics, so both follow the theme.
 */
export type ToolbarTone = "gray" | "white";

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The `<SegmentedControl>`s, or `<ToolbarGroup>`s wrapping them when a
   * control wants a caption. The two mix freely.
   */
  children: ReactNode;
  /** The bar's own ground. Defaults to `gray`. */
  tone?: ToolbarTone;
  /**
   * Names the bar. Required in practice: it is a group of groups, and
   * "group" alone tells a screen reader nothing about which one.
   */
  "aria-label"?: string;
}

/**
 * A rounded bar holding several `SegmentedControl`s - undo/redo beside the
 * view beside the zoom target. Figma: the `Toolbars` frame (772:1200).
 *
 *     <Toolbar aria-label="Drawing tools">
 *       <SegmentedControl size="sm" aria-label="History">
 *         <Segment icon={<Undo />} hideLabel>Undo</Segment>
 *         <Segment icon={<Redo />} hideLabel>Redo</Segment>
 *       </SegmentedControl>
 *       <SegmentedControl size="sm" aria-label="View">
 *         <Segment icon={<Outline />} selected>Outline</Segment>
 *         <Segment icon={<Eye />}>Preview</Segment>
 *       </SegmentedControl>
 *     </Toolbar>
 *
 * **It is a container and nothing more.** A ground, a 4px inset, and the gap
 * between its controls. Every question of what a segment shows - icon and
 * label, label alone, icon alone - belongs to `Segment` and is changed there,
 * so a bar of icon-only controls and a bar of labelled ones are the same
 * Toolbar with different children.
 *
 * **The gap is the argument.** 20 between controls against 4 between segments:
 * segments crowd because they answer one question, controls stand apart
 * because they answer several. That ratio is what stops a toolbar reading as
 * one long row of options.
 *
 * **`role="group"`, deliberately not `role="toolbar"`.** The ARIA toolbar
 * pattern claims the arrow keys, and every `SegmentedControl` inside has
 * already bound them for its own options - a segmented control IS a composite
 * widget. Claiming a pattern this does not implement would be worse than not
 * claiming it, so Tab moves between controls and the arrows stay with the
 * control that owns them. Recorded as code-only in the doc.
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  { children, tone = "gray", className, ...props },
  ref,
) {
  if (process.env.NODE_ENV !== "production") {
    if (props["aria-label"] == null && props["aria-labelledby"] == null) {
      console.warn(
        "[@tomcoggia/ui] Toolbar: no accessible name. Pass `aria-label` - a page " +
          'can hold more than one, and "group" alone does not say which.',
      );
    }
  }

  return (
    <div
      ref={ref}
      role="group"
      className={[styles.toolbar, styles[tone], className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
});

export interface ToolbarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** The control(s) the group holds - usually one `<SegmentedControl>`. */
  children: ReactNode;
  /**
   * The caption drawn before the control, in Label MD. Rendered as given:
   * Figma writes it `VIEW:`, so the case and the colon are the consumer's
   * text, not a transform. Omit it and the group draws nothing of its own.
   */
  label?: ReactNode;
}

/**
 * One group in a `Toolbar`, with or without a caption. Figma: the NextDraw
 * toolbar (87:1230), where `VIEW:` and `ZOOM:` each lead their track.
 *
 *     <Toolbar aria-label="Drawing tools">
 *       <ToolbarGroup label="VIEW:">
 *         <SegmentedControl size="sm" variant="dark">...</SegmentedControl>
 *       </ToolbarGroup>
 *       <SegmentedControl size="sm" actions aria-label="History">...</SegmentedControl>
 *     </Toolbar>
 *
 * **The caption IS the control's name.** A labelled group hands its label's id
 * to the `SegmentedControl` inside, which uses it as `aria-labelledby`, so the
 * control needs no `aria-label` of its own and the visible text and the
 * announced one cannot drift apart. An explicit `aria-label` on the control
 * still wins.
 *
 * The wrapper itself carries no role: the control inside is already the
 * `radiogroup` (or `group`), and a second group around it would be announced
 * twice. Without a `label` it is a plain flex wrapper, so a bare
 * `SegmentedControl` and an unlabelled `ToolbarGroup` render the same.
 */
export const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(function ToolbarGroup(
  { children, label, className, ...props },
  ref,
) {
  const labelId = useId();
  const hasLabel = label != null && label !== false && label !== "";

  return (
    <div ref={ref} className={[styles.group, className].filter(Boolean).join(" ")} {...props}>
      {hasLabel && (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}
      <GroupLabelContext.Provider value={hasLabel ? labelId : undefined}>
        {children}
      </GroupLabelContext.Provider>
    </div>
  );
});
