import { createContext } from "react";

/**
 * The id of a visible label that names the control inside it. `ToolbarGroup`
 * provides it and `SegmentedControl` reads it, so a group captioned "View"
 * announces as "View, radio group" without the consumer wiring
 * `aria-labelledby` by hand or repeating the caption as an `aria-label`.
 *
 * A context rather than `cloneElement`, for the reason `ActionsContext` gives:
 * cloning reaches only direct children and breaks the moment anything wraps
 * one. Lives here so neither component imports the other.
 */
export const GroupLabelContext = createContext<string | undefined>(undefined);
