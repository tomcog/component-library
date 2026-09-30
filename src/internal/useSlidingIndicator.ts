import { useEffect, useLayoutEffect } from "react";
import type { RefObject } from "react";

/**
 * Keeps ONE indicator element over whichever child of a container is selected,
 * so a change of selection slides it there instead of one ground fading out
 * and another in. SegmentedControl's thumb uses it; Tabs carries its own
 * horizontal-only version of the same idea (the rule under a tab).
 *
 * The container cannot see which child is selected from its props - that
 * lives on each child - so this reads the DOM: `selector` finds the selected
 * child, and the indicator is given its width, height and offset.
 *
 * First placement happens before paint and without a transition, so the
 * indicator is simply there on arrival instead of sliding in from the corner.
 * Only after that is `readyAttribute` set on the container, which is what the
 * CSS keys its transition (and the hand-over from the child's own ground) on.
 * After that it follows: a selection change flips an attribute, and a child's
 * size moves when the web font lands, a label changes, or the size steps -
 * none of which re-render the container.
 */
export function useSlidingIndicator(
  container: RefObject<HTMLElement | null>,
  indicator: RefObject<HTMLElement | null>,
  selector: string,
  readyAttribute: string,
  enabled = true,
) {
  function place() {
    const box = container.current;
    const mark = indicator.current;
    if (!box || !mark) return;
    const selected = box.querySelector<HTMLElement>(selector);
    if (!selected) {
      mark.style.width = "0px";
      mark.style.height = "0px";
      return;
    }
    // Rects, not offset*: those round to whole pixels, and a label's width
    // rarely is one, so the indicator would overhang by a fraction.
    const from = box.getBoundingClientRect();
    const to = selected.getBoundingClientRect();
    mark.style.width = `${to.width}px`;
    mark.style.height = `${to.height}px`;
    mark.style.transform = `translate(${to.left - from.left - box.clientLeft}px, ${to.top - from.top - box.clientTop}px)`;
  }

  useLayoutEffect(() => {
    if (!enabled) return;
    place();
    const frame = requestAnimationFrame(() => container.current?.setAttribute(readyAttribute, ""));
    return () => {
      cancelAnimationFrame(frame);
      container.current?.removeAttribute(readyAttribute);
    };
  }, [enabled]);

  useEffect(() => {
    const node = container.current;
    if (!enabled || !node) return;
    const sizes = new ResizeObserver(() => place());
    const watch = () => {
      sizes.disconnect();
      sizes.observe(node);
      Array.from(node.children).forEach((child) => sizes.observe(child));
    };
    const changes = new MutationObserver((records) => {
      if (records.some((r) => r.type === "childList")) watch();
      place();
    });
    watch();
    changes.observe(node, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-checked", "aria-selected", "class"],
    });
    return () => {
      sizes.disconnect();
      changes.disconnect();
    };
  }, [enabled]);
}
