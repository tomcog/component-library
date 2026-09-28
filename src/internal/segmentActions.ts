import { createContext } from "react";

/**
 * Whether the Segments below are ACTIONS (plain buttons) or a CHOICE (radios).
 * `SegmentedControl` provides it from its `actions` prop; `ToolbarExpander`
 * provides it for its panel, which is a choice unless `closeOnAction` is set -
 * even though the expander's own track, holding its disclosure trigger, is a
 * row of actions. `Segment` reads it, because the same element is a radio in a
 * choice and a plain button in a row of actions.
 *
 * A context rather than `cloneElement`, which reaches only direct children and
 * breaks the moment anything wraps one. Lives here so neither component
 * imports the other's internals.
 */
export const ActionsContext = createContext(false);
