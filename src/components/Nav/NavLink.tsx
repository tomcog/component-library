import { Children, cloneElement, forwardRef, isValidElement } from "react";
import type { AnchorHTMLAttributes, ReactElement, ReactNode } from "react";
import { assignRef } from "../../internal/assignRef";

// Exact expression `process.env.NODE_ENV` - bundlers substitute that literal,
// an optional chain does not match their define. Same note as Button.
declare const process: { env: { NODE_ENV?: string } };

export interface NavLinkBaseProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Marks this as the current page: applies the "on" treatment and sets
   * `aria-current="page"`. The consuming app decides what is current, so this
   * composes with any router:
   *
   *     <NavItem asChild active={pathname === "/resume"}>
   *       <Link href="/resume">Resume</Link>
   *     </NavItem>
   */
  active?: boolean;
  /**
   * Render the single child element instead of an `<a>`, merging classes,
   * props and refs into it - so a nav item can be a `next/link` and still be
   * a real link (cmd-click, "open in new tab", announced as a link).
   */
  asChild?: boolean;
}

interface NavLinkProps extends NavLinkBaseProps {
  /** Module classes for the concrete component. */
  classes: string;
  /** Wraps the label, e.g. to append NavDropdownItem's pipe. */
  wrap?: (label: ReactNode) => ReactNode;
  /** Used only in dev warnings. */
  componentName: string;
}

/**
 * Shared plumbing for the nav's link-shaped parts: `asChild`, ref merging and
 * `aria-current`. Internal - not exported from the package barrel.
 */
export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
  { active = false, asChild = false, classes, wrap, componentName, className, children, ...props },
  ref,
) {
  const child =
    asChild && isValidElement(children) ? (Children.only(children) as ReactElement<any>) : null;

  if (process.env.NODE_ENV !== "production") {
    if (asChild && !child) {
      console.warn(
        `[@tomcoggia/ui] ${componentName}: \`asChild\` expects exactly one React element child.`,
      );
    }
  }

  const shared = {
    className: [classes, className, child ? child.props.className : null]
      .filter(Boolean)
      .join(" "),
    // The design signals the current page with colour alone, which assistive
    // tech cannot see. aria-current carries the same meaning non-visually.
    "aria-current": active ? ("page" as const) : undefined,
  };

  if (child) {
    const childRef = (child as any).ref ?? child.props.ref;
    return cloneElement(
      child,
      {
        ...props,
        ...child.props,
        ...shared,
        ref: (node: HTMLAnchorElement | null) => {
          assignRef(ref, node);
          assignRef(childRef, node);
        },
      },
      wrap ? wrap(child.props.children) : child.props.children,
    );
  }

  return (
    <a ref={ref} {...props} {...shared}>
      {wrap ? wrap(children) : children}
    </a>
  );
});
