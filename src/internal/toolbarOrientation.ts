import { createContext } from "react";

/**
 * Which way the `Toolbar` around a control runs. `Toolbar` provides it;
 * `SegmentedControl` reads it to stack its segments, `Segment` to drop its
 * visible label, and `ToolbarGroup` to hide its caption - a vertical bar is
 * one glyph wide and has room for nothing else.
 *
 * A context for the reason `GroupLabelContext` gives: cloning reaches only
 * direct children and breaks the moment anything wraps one. Outside a
 * Toolbar it is `horizontal`, which changes nothing.
 */
export type ToolbarOrientation = "horizontal" | "vertical";

export const ToolbarOrientationContext = createContext<ToolbarOrientation>("horizontal");
