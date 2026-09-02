import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import styles from "./Nav.module.css";

export type NavProps = HTMLAttributes<HTMLElement>;

/**
 * Horizontal sitewide navigation. Figma: `Nav` - 32px gap, right-aligned,
 * vertically centred.
 *
 * Renders a `<nav>` landmark. If a page has more than one, give each an
 * `aria-label` so they can be told apart:
 *
 *     <Nav aria-label="Main">
 *       <NavItem asChild active><Link href="/">Home</Link></NavItem>
 *       <NavItem asChild><Link href="/resume">Resume</Link></NavItem>
 *     </Nav>
 *
 * The logo is deliberately not part of this component - it sits beside the
 * nav in the page header, not inside it.
 */
export const Nav = forwardRef<HTMLElement, NavProps>(function Nav(
  { className, children, ...props },
  ref,
) {
  return (
    <nav ref={ref} className={[styles.nav, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </nav>
  );
});
