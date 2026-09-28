import { Children, forwardRef, useContext, useId, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from "react";
import styles from "./Toolbar.module.css";
import hidden from "../../internal/visuallyHidden.module.css";
import { GroupLabelContext } from "../../internal/groupLabel";
import { ToolbarOrientationContext } from "../../internal/toolbarOrientation";
import type { ToolbarOrientation } from "../../internal/toolbarOrientation";
import { SegmentedControl, Segment } from "../SegmentedControl";
import type { SegmentedControlProps } from "../SegmentedControl";

export type { ToolbarOrientation };

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
   * Which way the bar runs. Defaults to `horizontal`. Figma: NextDraw's
   * vertical toolbar (76:401).
   *
   * `vertical` stacks the groups AND the segments inside each one, and is
   * glyphs only: every `Segment` in it draws as if given `hideLabel`, and a
   * `ToolbarGroup` caption is hidden the same way. Both stay in the
   * accessibility tree, so the label is still each segment's name and the
   * caption still names its control - pass them exactly as you would for a
   * horizontal bar. A segment with no `icon` draws empty here, and warns.
   */
  orientation?: ToolbarOrientation;
  /**
   * Names the bar. Required in practice: it is a group of groups, and
   * "group" alone tells a screen reader nothing about which one.
   */
  "aria-label"?: string;
}

/**
 * A rounded bar holding a set of `SegmentedControl`s, whatever they happen to
 * be - what the groups are is the consumer's. Figma: the `Toolbars` frame
 * (772:1200).
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
  { children, tone = "gray", orientation = "horizontal", className, ...props },
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
      className={[
        styles.toolbar,
        styles[tone],
        orientation === "vertical" ? styles.vertical : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <ToolbarOrientationContext.Provider value={orientation}>
        {children}
      </ToolbarOrientationContext.Provider>
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
  // A vertical bar is one glyph wide: the caption keeps naming the control
  // but is not drawn. Figma keeps the text layers and hides them.
  const vertical = useContext(ToolbarOrientationContext) === "vertical";
  const hasLabel = label != null && label !== false && label !== "";

  return (
    <div ref={ref} className={[styles.group, className].filter(Boolean).join(" ")} {...props}>
      {hasLabel && (
        <span id={labelId} className={vertical ? hidden.visuallyHidden : styles.label}>
          {label}
        </span>
      )}
      <GroupLabelContext.Provider value={hasLabel ? labelId : undefined}>
        {children}
      </GroupLabelContext.Provider>
    </div>
  );
});

export interface ToolbarExpanderProps
  extends Omit<SegmentedControlProps, "actions" | "variant" | "children"> {
  /** The trigger's glyph. The trigger is always icon-only. */
  icon: ReactNode;
  /**
   * The trigger's name - visually hidden, announced as the button's name with
   * its expanded state ("File, collapsed"). Also names the group when no
   * `aria-label` or `ToolbarGroup` caption does.
   */
  label: ReactNode;
  /** The `<Segment>`s revealed when open. They are actions, never a choice. */
  children: ReactNode;
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  /** Uncontrolled initial state. Defaults to closed. */
  defaultOpen?: boolean;
  /** Called with the next state when the trigger is clicked or Escape closes it. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Clicking any revealed segment closes the panel after its command runs,
   * and focus returns to the trigger. Defaults to `false`: the panel stays
   * open until the trigger is clicked again.
   *
   * A property of the EXPANDER, deliberately not of each segment: every
   * segment in one panel behaves the same, so there is no panel where some
   * actions fold it and others leave it standing.
   */
  closeOnAction?: boolean;
}

/**
 * One segment that opens to reveal more - a File button hiding Save, Open,
 * Export. Clicking the trigger again folds them back. Figma: the
 * `ToolbarExpander` set (820:866), State = Closed | Open.
 *
 *     <Toolbar aria-label="Drawing tools">
 *       <ToolbarExpander size="sm" icon={<File />} label="File">
 *         <Segment icon={<Save />} hideLabel>Save</Segment>
 *         <Segment icon={<FolderOpen />} hideLabel>Open</Segment>
 *       </ToolbarExpander>
 *     </Toolbar>
 *
 * **It is a `SegmentedControl` in `actions` mode with a disclosure button at
 * its head**, so the track, sizes, grounds and segments are exactly the ones
 * beside it and nothing is restated. Closed it is one icon-only segment; open,
 * the trigger takes the action ground and goes flat on the side facing what it
 * revealed, and the track runs on around them.
 *
 * **A disclosure, not a menu.** The trigger carries `aria-expanded` and
 * `aria-controls`; the revealed segments are ordinary buttons in the tab order
 * straight after it. A menu would claim arrow keys and focus trapping for what
 * is visually just more of the toolbar. Escape inside the panel closes it and
 * returns focus to the trigger. While closed the panel is `visibility:
 * hidden`, so its buttons are out of the tab order and the accessibility tree.
 *
 * **Whether an action closes it is `closeOnAction`**, set once for the whole
 * panel: either every revealed segment folds it after running, or none does.
 *
 * **Motion**: the panel grows from the trigger at `--ui-motion-base` while the
 * segments pop in one after another, `--ui-motion-stagger` apart; closing
 * folds them all at once. Under `prefers-reduced-motion` it switches
 * instantly - the motion is decoration, the open state is not. Chosen over a
 * plain wipe and a slide-out drawer, tried side by side in the playground.
 */
export const ToolbarExpander = forwardRef<HTMLDivElement, ToolbarExpanderProps>(
  function ToolbarExpander(
    {
      icon,
      label,
      children,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      closeOnAction = false,
      size = "lg",
      className,
      style,
      ...props
    },
    ref,
  ) {
    const [openState, setOpenState] = useState(defaultOpen);
    const open = openProp ?? openState;
    const panelId = useId();
    const trigger = useRef<HTMLButtonElement>(null);
    const groupLabel = useContext(GroupLabelContext);

    function setOpen(next: boolean) {
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
    }

    // Bubble phase, so the segment's own onClick - the command - has already
    // run. Keyboard activation arrives here too, as a click; a disabled
    // segment fires none, and a click in the gap between segments is ignored.
    function onPanelClick(event: MouseEvent<HTMLDivElement>) {
      if (!closeOnAction || !open) return;
      if (!(event.target as Element).closest("button")) return;
      setOpen(false);
      // The panel is about to be hidden; focus must not go down with it.
      trigger.current?.focus();
    }

    function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
      if (event.key !== "Escape" || !open) return;
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
    }

    const items = Children.toArray(children);

    return (
      <SegmentedControl
        ref={ref}
        size={size}
        actions
        // The label is the group's fallback name, so a lone expander needs
        // no aria-label of its own. A ToolbarGroup caption still wins.
        aria-label={
          props["aria-label"] ??
          (groupLabel == null && typeof label === "string" ? label : undefined)
        }
        className={[
          styles.expander,
          open ? styles.open : null,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          {
            // The track's gap for this size, re-read by the panel: it has to
            // cancel the gap before it while closed, and space its own
            // segments while open. See .panel.
            "--ui-toolbar-expander-gap": `var(--ui-segmented-${size}-track-gap)`,
            ...style,
          } as CSSProperties
        }
        {...props}
      >
        <Segment
          ref={trigger}
          icon={icon}
          hideLabel
          aria-expanded={open}
          aria-controls={panelId}
          className={styles.trigger}
          onClick={() => setOpen(!open)}
        >
          {label}
        </Segment>
        <div id={panelId} className={styles.panel} onKeyDown={onPanelKeyDown} onClick={onPanelClick}>
          <div className={styles.panelInner}>
            {items.map((item, i) => (
              // `display: contents`, so the wrapper changes no layout: it only
              // carries the segment's place in the sequence, which the
              // entrance stagger reads by inheritance.
              <span
                key={(item as { key?: string }).key ?? i}
                className={styles.item}
                style={{ "--ui-toolbar-expander-index": i } as CSSProperties}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </SegmentedControl>
    );
  },
);
