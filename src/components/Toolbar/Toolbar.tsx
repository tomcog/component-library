import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Toolbar.module.css";

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
  /** The `<SegmentedControl>` children. */
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
 * **The gap is the argument.** 16 between controls against 4 between segments:
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
