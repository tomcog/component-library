import type { Ref } from "react";

/**
 * Write a node into whichever ref shape React handed us. Shared by every
 * component that supports `asChild`, where the child's own ref and the ref
 * forwarded to us both have to be satisfied from one callback.
 */
export function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref && typeof ref === "object") (ref as { current: T | null }).current = value;
}
