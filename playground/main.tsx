import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
// Import from source, not dist, so edits hot-reload.
import { Button, ButtonRound, Card, Nav, NavItem, NavDropdown, NavDropdownItem, NavRail, NavSlat, Pill, Logo } from "../src";
import type { ButtonVariant, ButtonSize, ButtonRoundSize, CardVariant, LogoWeight } from "../src";
import "../src/fonts/fonts.css";
import "./playground.css";

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "tertiary", "ghost"];
const SIZES: ButtonSize[] = ["large", "medium", "small"];
const ROUND_SIZES: ButtonRoundSize[] = ["large", "medium", "small"];
const CARDS: CardVariant[] = ["flat", "float1", "float2"];
const LOGO_WEIGHTS: LogoWeight[] = ["x-light", "light", "medium", "heavy", "x-heavy"];

// Tier 1: fixed palette, internal. An app should never alias these.
const PRIMITIVE_TOKENS = [
  "--ui-tc-red", "--ui-white", "--ui-ink",
  "--ui-neutral-100", "--ui-neutral-150", "--ui-neutral-300", "--ui-neutral-350",
  "--ui-neutral-400", "--ui-neutral-500", "--ui-neutral-550", "--ui-neutral-600",
  "--ui-neutral-650", "--ui-neutral-700", "--ui-neutral-800",
];
// Tier 2: the theming contract. Map all semantic tokens or none.
const SEMANTIC_TOKENS = [
  "--ui-primary", "--ui-primary-lighter", "--ui-text-on-primary",
  "--ui-surface-inverse", "--ui-text-on-inverse",
  "--ui-surface-muted", "--ui-surface-muted-hover", "--ui-surface-muted-active",
  "--ui-text-default", "--ui-text-muted", "--ui-surface-raised",
  "--ui-surface-disabled", "--ui-text-disabled",
];
// Fill + the text meant to sit on it. A recolour that breaks contrast shows here.
const TOKEN_PAIRS: [string, string, string][] = [
  ["--ui-primary", "--ui-text-on-primary", "On primary"],
  ["--ui-surface-inverse", "--ui-text-on-inverse", "On inverse"],
  ["--ui-surface-muted", "--ui-text-default", "On muted"],
  ["--ui-surface-raised", "--ui-text-default", "On raised"],
  ["--ui-surface-disabled", "--ui-text-disabled", "Disabled"],
];

const PAGES = [
  { href: "/", label: "Home" },
  { href: "/resume", label: "Resume" },
  { href: "/projects", label: "My Work" },
];
const SUB_PAGES = [
  { href: "/work/a", label: "Discovery Brief" },
  { href: "/work/b", label: "CampPal" },
  { href: "/work/c", label: "PodcastPal" },
  { href: "/work/d", label: "NextJob" },
];

const RAIL = [
  { href: "/", label: "Navigation label" },
  { href: "/work", label: "Navigation label" },
  { href: "/resume", label: "Navigation label" },
  { href: "/writing", label: "Navigation label" },
  { href: "/contact", label: "Navigation label" },
];

const House = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M9 22V12h6v10" />
  </svg>
);
const Chevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

/* Resolved from the themed element, not from :root, so dark mode and a live
   primary override are reflected exactly as the components see them. */
function useTokenValues(names: string[], deps: unknown[]) {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const el = document.querySelector(".page");
    if (!el) return;
    const cs = getComputedStyle(el);
    const next: Record<string, string> = {};
    for (const n of names) next[n] = cs.getPropertyValue(n).trim();
    setValues(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return values;
}

function Swatch({ name, value }: { name: string; value?: string }) {
  return (
    <div className="swatch">
      <span className="chip" style={{ background: `var(${name})` }} />
      <span className="swatchMeta">
        <span className="swatchName">{name.replace("--ui-", "")}</span>
        <span className="swatchValue">{value || "unset"}</span>
      </span>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="row">
      <span className="rowLabel">{label}</span>
      <div className="rowItems">{children}</div>
    </div>
  );
}

function Section({ title, note, className, children }: { title: string; note?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={className}>
      <h2>{title}</h2>
      {note ? <p className="note">{note}</p> : null}
      {children}
    </section>
  );
}

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [primary, setPrimary] = useState("#e51a38");
  const [size, setSize] = useState<ButtonSize>("large");
  const [loading, setLoading] = useState(false);
  const [lead, setLead] = useState(true);
  const [page, setPage] = useState("/");
  const semantic = useTokenValues(SEMANTIC_TOKENS, [theme, primary]);
  const primitive = useTokenValues(PRIMITIVE_TOKENS, [theme, primary]);
  const [subPage, setSubPage] = useState("/work/b");
  const [trail, setTrail] = useState(false);
  const [pill, setPill] = useState("All");
  const [rail, setRail] = useState("/work");

  return (
    <div className="page" data-theme={theme} style={{ ["--ui-primary" as string]: primary }}>
      <header>
        <h1>@tomcoggia/ui</h1>
        <div className="controls">
          <label>
            theme
            <select value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark")}>
              <option value="light">light</option>
              <option value="dark">dark</option>
            </select>
          </label>
          <label>
            primary
            <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
          </label>
          <button className="reset" onClick={() => setPrimary("#e51a38")}>reset</button>
        </div>
      </header>

      <Section
        title="Colour tokens"
        note="Live values, read off the themed element - switch theme or pick a primary above and every semantic value follows."
      >
        <p className="groupLabel">
          Semantic <span>- the public API, 13 names an app overrides</span>
        </p>
        <div className="swatches">
          {SEMANTIC_TOKENS.map((t) => <Swatch key={t} name={t} value={semantic[t]} />)}
        </div>

        <p className="groupLabel">
          Pairings <span>- fill with the text meant to sit on it</span>
        </p>
        <div className="pairs">
          {TOKEN_PAIRS.map(([bg, fg, label]) => (
            <div key={label} className="pair" style={{ background: `var(${bg})`, color: `var(${fg})` }}>
              {label}
            </div>
          ))}
        </div>

        <p className="groupLabel">
          Primitive <span>- internal, never aliased by an app</span>
        </p>
        <div className="swatches">
          {PRIMITIVE_TOKENS.map((t) => <Swatch key={t} name={t} value={primitive[t]} />)}
        </div>
      </Section>

      <Section title="Button" note="Every variant at every size. Hover and press to see the interaction states.">
        {SIZES.map((s) => (
          <Row key={s} label={s}>
            {VARIANTS.map((v) => (
              <Button key={v} variant={v} size={s} icon={<House />}>
                Button label
              </Button>
            ))}
            <Button variant="primary" size={s} icon={<House />} disabled>
              Disabled
            </Button>
          </Row>
        ))}
      </Section>

      <Section title="ButtonRound" note="Figma sizes and interaction states. Hover and press each icon button.">
        {ROUND_SIZES.map((s) => (
          <Row key={s} label={s}>
            <ButtonRound size={s} icon={<House />} aria-label={`${s} home action`} />
            <ButtonRound size={s} icon={<House />} aria-label={`${s} disabled action`} disabled />
          </Row>
        ))}
      </Section>

      <Section title="Loading" note="Content is hidden but keeps its space, so the width never changes.">
        {SIZES.map((s) => (
          <Row key={s} label={s}>
            {VARIANTS.map((v) => (
              <Button key={v} variant={v} size={s} icon={<House />} loading>
                Button label
              </Button>
            ))}
          </Row>
        ))}
      </Section>

      <Section title="Icons" note="icon and iconEnd are independent slots; both may be set.">
        <Row label="lead">
          <Button icon={<House />}>Leading</Button>
        </Row>
        <Row label="trail">
          <Button iconEnd={<Chevron />}>Trailing</Button>
        </Row>
        <Row label="both">
          <Button icon={<House />} iconEnd={<Chevron />}>Both</Button>
        </Row>
        <Row label="icon only">
          <Button icon={<House />} aria-label="Go home" />
        </Row>
      </Section>

      <Section title="asChild" note="Renders a real <a>. Cmd-click it — it behaves like a link, not a button.">
        <Row label="link">
          <Button asChild>
            <a href="https://example.com" target="_blank" rel="noreferrer">Open example.com</a>
          </Button>
          <Button asChild variant="ghost" iconEnd={<Chevron />}>
            <a href="https://example.com" target="_blank" rel="noreferrer">Ghost link</a>
          </Button>
        </Row>
      </Section>

      <Section
        title="Nav"
        note="Figma: Nav + Nav/Item. Hover a resting item to draw the 4px rule; the current page is red and carries aria-current=page."
      >
        <Row label="live">
          <Nav aria-label="Example">
            {PAGES.map((p) => (
              <NavItem
                key={p.href}
                href={p.href}
                active={page === p.href}
                onClick={(e) => {
                  e.preventDefault();
                  setPage(p.href);
                }}
              >
                {p.label}
              </NavItem>
            ))}
            <NavDropdown label="My work">
              {SUB_PAGES.map((sp) => (
                <NavDropdownItem
                  key={sp.href}
                  href={sp.href}
                  active={subPage === sp.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setSubPage(sp.href);
                  }}
                >
                  {sp.label}
                </NavDropdownItem>
              ))}
            </NavDropdown>
          </Nav>
        </Row>
        <p className="note">
          Click an item - the current page moves, and so does aria-current. Now on
          <code> {page} </code>.
        </p>
        <Row label="pinned">
          <Nav aria-label="Pinned rule example">
            <NavItem href="#">Default</NavItem>
            <NavItem href="#" underlined>Underlined</NavItem>
            <NavItem href="#" active>On</NavItem>
          </Nav>
        </Row>
        <Row label="asChild">
          <Nav aria-label="asChild example">
            <NavItem asChild>
              <a href="https://example.com" target="_blank" rel="noreferrer">Real link</a>
            </NavItem>
          </Nav>
        </Row>
      </Section>

      <Section
        title="NavDropdown"
        note="Hover or tab to the trigger to open. On a sub item the label indents and the red pipe is drawn top to bottom; the current page is red text only."
      >
        <Row label="dropdown">
          <NavDropdown label="My Work">
            {SUB_PAGES.map((sp) => (
              <NavDropdownItem
                key={sp.href}
                href={sp.href}
                active={subPage === sp.href}
                onClick={(e) => {
                  e.preventDefault();
                  setSubPage(sp.href);
                }}
              >
                {sp.label}
              </NavDropdownItem>
            ))}
          </NavDropdown>
        </Row>
      </Section>

      <Section
        title="NavRail"
        note="Left rail, text only. Figma: the NavSlat set at Level=Primary. Hover a row - the pipe draws top to bottom and the label indents past it. The current page is red, with no pipe and no indent, and hovering it adds neither."
      >
        <Row label="rail">
          <NavRail aria-label="Sections" style={{ width: 218 }}>
            {RAIL.map((r) => (
              <NavSlat
                key={r.href}
                href={r.href}
                active={rail === r.href}
                onClick={(e) => {
                  e.preventDefault();
                  setRail(r.href);
                }}
              >
                {r.label}
              </NavSlat>
            ))}
          </NavRail>
        </Row>
      </Section>

      <Section
        title="Logo"
        note="The brand mark at five weights. Drawn in currentColor, so it takes the colour of whatever it sits in - shown here in text colour, brand red, and reversed on ink."
      >
        <Row label="weights">
          {LOGO_WEIGHTS.map((w) => (
            <div key={w} style={{ textAlign: "center" }}>
              <Logo weight={w} size={56} />
              <p className="cardLabel">{w}</p>
            </div>
          ))}
        </Row>
        <Row label="colour">
          <Logo weight="medium" size={44} />
          <Logo weight="medium" size={44} style={{ color: "var(--ui-primary)" }} />
          <span style={{ background: "var(--ui-surface-inverse)", padding: 10, borderRadius: 8, display: "inline-flex" }}>
            <Logo weight="medium" size={44} style={{ color: "var(--ui-text-on-inverse)" }} />
          </span>
        </Row>
        <Row label="named">
          <Logo weight="heavy" size={44} label="Tom Coggia" />
        </Row>
      </Section>

      <Section
        title="Pill"
        note="Filter toggle. Figma: State = On | Off. Click to toggle - aria-pressed follows, and Off darkens its label on hover."
      >
        <Row label="filters">
          {["All", "Remote", "Hybrid", "On-site"].map((f) => (
            <Pill key={f} selected={pill === f} onClick={() => setPill(f)}>{f}</Pill>
          ))}
        </Row>
        <Row label="disabled">
          <Pill disabled>Unavailable</Pill>
        </Row>
      </Section>

      <Section
        title="Card"
        className="cardSection"
        note="Container only - fill, radius and elevation. No padding and no internal layout: what goes inside has not been designed yet. Sized by its parent, so these are stretched by the grid rather than fixed at Figma's 350x200."
      >
        <div className="cards">
          {CARDS.map((v) => (
            <div key={v}>
              <Card variant={v} style={{ height: 120 }} />
              <p className="cardLabel">{v}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Playground" note="Toggle props against a single instance.">
        <div className="controls">
          <label>
            size
            <select value={size} onChange={(e) => setSize(e.target.value as ButtonSize)}>
              {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label><input type="checkbox" checked={lead} onChange={(e) => setLead(e.target.checked)} /> icon</label>
          <label><input type="checkbox" checked={trail} onChange={(e) => setTrail(e.target.checked)} /> iconEnd</label>
          <label><input type="checkbox" checked={loading} onChange={(e) => setLoading(e.target.checked)} /> loading</label>
        </div>
        <Row label="result">
          {VARIANTS.map((v) => (
            <Button
              key={v}
              variant={v}
              size={size}
              loading={loading}
              icon={lead ? <House /> : undefined}
              iconEnd={trail ? <Chevron /> : undefined}
            >
              Button label
            </Button>
          ))}
        </Row>
      </Section>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
