import { Children, cloneElement, forwardRef, isValidElement } from "react";
import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import styles from "./Tag.module.css";
import { assignRef } from "../../internal/assignRef";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** The label, and any control the caller wants inside the pill. */
  children: ReactNode;
  /**
   * Render the single child element - a `<button>` or an `<a>` - as the tag
   * itself, rather than wrapping it. Use it when the whole pill is the
   * control, so there is one element rather than a span holding a button.
   */
  asChild?: boolean;
  /**
   * A number shown before the label, in the brand colour and one weight
   * lighter than it - "3 Applied" is one tag saying the thing appears three
   * times, not a tag called "3 Applied".
   *
   * It is context, so it is quieter than what it qualifies: the label is
   * Medium and this is Regular, and the colour is `--ui-brand` rather than the
   * label's muted grey. It keeps that colour on hover too, since hover is the
   * LABEL's state.
   *
   * `0` renders. Only `undefined` leaves the prefix off, because a tag that
   * genuinely counts zero of something is saying something, and a `count`
   * prop that silently vanished at zero would be the kind of falsy-check bug
   * that is very hard to see.
   */
  count?: number;
}

/**
 * A small label pill. Figma: the `Tag` set (685:584), one axis
 * `State` = Default | Hover.
 *
 *     <Tag>Applied</Tag>
 *     <Tag asChild><button onClick={rename}>{skill.name}</button></Tag>
 *
 * **Not `Pill`, though they look alike.** `Pill` is a filter TOGGLE - a real
 * `<button>` carrying `aria-pressed`, with an on and an off state the user
 * switches between. A tag states a fact about the thing it sits on: it has
 * nothing to toggle and no pressed state, so it renders a `<span>` and there
 * is no `selected` prop. Reaching for `Pill` to get a rounded label is how a
 * screen reader ends up announcing "toggle button, not pressed" about a word.
 *
 * The two DO share a radius - `--ui-tag-radius` falls through to
 * `--ui-pill-radius`, which is Figma's `Pill/Radius` bound on both sets - so
 * the corner cannot drift between them.
 *
 * **Hover reddens the label and changes nothing else.** There is no fill
 * change and no border in the design, so the colour is the whole state. A tag
 * that is not interactive still takes it, which is what Figma draws; pass
 * `--ui-tag-text-hover` the resting colour to opt out.
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { children, className, asChild = false, count, ...props },
  ref,
) {
  const child =
    asChild && isValidElement(children)
      ? (Children.only(children) as ReactElement<any>)
      : null;

  const classes = [styles.tag, className, child?.props.className]
    .filter(Boolean)
    .join(" ");

  /* Checked against undefined, not truthiness: see `count`. Built from the
     CHILD's children under asChild, so the prefix lands inside the button or
     link the caller supplied rather than replacing it. */
  const label = child ? child.props.children : children;
  const content =
    count === undefined ? (
      label
    ) : (
      <>
        <span className={styles.count}>{count}</span>
        {label}
      </>
    );

  if (child) {
    const childRef = (child as any).ref ?? child.props.ref;
    return cloneElement(
      child,
      {
        ...props,
        ...child.props,
        className: classes,
        ref: (node: HTMLSpanElement | null) => {
          assignRef(ref, node);
          assignRef(childRef, node);
        },
      },
      content,
    );
  }

  return (
    <span ref={ref} className={classes} {...props}>
      {content}
    </span>
  );
});
