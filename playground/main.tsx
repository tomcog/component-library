import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
// Import from source, not dist, so edits hot-reload.
import { BottomNav, BottomNavItem, Button, ButtonRound, Card, LeftRail, Logo, Nav, NavDropdown, NavDropdownItem, NavItem, NavRail, NavSlat, NavSlatGroup, Pill, Spinner } from "../src";
import type { ButtonVariant, ButtonSize, ButtonRoundSize, CardVariant, LogoWeight } from "../src";
import "../src/fonts/fonts.css";
import "./playground.css";

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "tertiary", "ghost"];
const SIZES: ButtonSize[] = ["xl", "large", "medium", "small"];
const ROUND_SIZES: ButtonRoundSize[] = ["xl", "large", "medium", "small"];
const CARDS: CardVariant[] = ["flat", "float1", "float2"];
const LOGO_WEIGHTS: LogoWeight[] = ["x-light", "light", "medium", "heavy", "x-heavy"];

// Tier 1: fixed palette, internal. An app should never alias these.
const PRIMITIVE_TOKENS = [
  "--ui-tc-red", "--ui-white", "--ui-ink",
  "--ui-neutral-100", "--ui-neutral-150", "--ui-neutral-300", "--ui-neutral-350",
  "--ui-neutral-400", "--ui-neutral-500", "--ui-neutral-550", "--ui-neutral-600",
  "--ui-neutral-650", "--ui-neutral-700", "--ui-neutral-800",
];
// The label scale. Every string this library renders is a UI label - DM Sans
// Medium, no body copy - so it is one ramp of six, and each component's type
// tokens alias into it. Figma carries the same six as bound text styles.
const TYPE_SCALE = [
  { key: "sm", figma: "Type/Label SM", used: "Button Small \u00b7 BottomNav caption" },
  { key: "md", figma: "Type/Label MD", used: "Button Medium" },
  { key: "lg", figma: "Type/Label LG", used: "Button Large \u00b7 Nav item \u00b7 Nav dropdown item \u00b7 NavSlat \u00b7 Pill" },
  { key: "xl", figma: "Type/Label XL", used: "Button XL" },
];
const TYPE_WEIGHT = "--ui-type-label-font-weight";
const TYPE_TOKENS = [
  ...TYPE_SCALE.flatMap((t) => [`--ui-type-label-${t.key}-font-size`, `--ui-type-label-${t.key}-line-height`]),
  TYPE_WEIGHT,
];

// Tier 2: the theming contract. Map all semantic tokens or none.
const SEMANTIC_TOKENS = [
  "--ui-primary", "--ui-primary-lighter", "--ui-text-on-primary",
  "--ui-surface-inverse", "--ui-text-on-inverse",
  "--ui-surface-muted", "--ui-surface-muted-hover", "--ui-surface-muted-active",
  "--ui-text-default", "--ui-text-muted", "--ui-surface-raised",
  "--ui-surface-pale",
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

// The two LeftRail frames, 482:2517 and 458:2612: five destinations, with
// Settings carrying three sub items.
const SHELL = [
  { href: "/dashboard", label: "Dashboard" },
  {
    href: "/settings",
    label: "Settings",
    sub: [
      { href: "/settings/overview", label: "Overview" },
      { href: "/settings/members", label: "Members" },
      { href: "/settings/billing", label: "Billing" },
    ],
  },
  { href: "/projects", label: "Projects" },
  { href: "/messages", label: "Messages" },
  { href: "/analytics", label: "Analytics" },
];

const Briefcase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

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

/* The playground draws its own icons rather than taking a dependency, so all
   five tabs share the two that exist. */
const BOTTOM_TABS = [
  { href: "/", label: "JOBS", icon: Briefcase },
  { href: "/resources", label: "RESOURCES", icon: House },
  { href: "/tasks", label: "TASKS", icon: Briefcase },
  { href: "/you", label: "YOU", icon: House },
  { href: "/search", label: "SEARCH", icon: Briefcase },
];


/* Some semantic colours are deliberately not declared on :root - composing a
   var() there freezes it against :root and a subtree override could never move
   it. Those live as fallbacks inside each component instead, so the panel has
   to resolve them the same way a component does rather than reading a name
   that is not there. Keep this in step with the component CSS. */
const DERIVED_TOKENS: Record<string, string> = {
  "--ui-primary-lighter": "color-mix(in srgb, var(--ui-primary) 15%, var(--ui-white))",
};

const tokenValue = (name: string) =>
  `var(${name}${DERIVED_TOKENS[name] ? `, ${DERIVED_TOKENS[name]}` : ""})`;

/* Resolved from the themed element, not from :root, so dark mode and a live
   primary override are reflected exactly as the components see them. A token
   with no declaration is read back off a probe carrying its component-side
   fallback, so the panel shows the colour that actually renders. */
function useTokenValues(names: string[], deps: unknown[]) {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const el = document.querySelector(".page");
    if (!el) return;
    const cs = getComputedStyle(el);

    const probe = document.createElement("span");
    probe.style.display = "none";
    el.appendChild(probe);

    const next: Record<string, string> = {};
    for (const n of names) {
      const declared = cs.getPropertyValue(n).trim();
      if (declared) {
        next[n] = declared;
        continue;
      }
      if (DERIVED_TOKENS[n]) {
        probe.style.backgroundColor = "";
        probe.style.backgroundColor = tokenValue(n);
        next[n] = `${getComputedStyle(probe).backgroundColor} (derived)`;
      } else {
        next[n] = "";
      }
    }

    probe.remove();
    setValues(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return values;
}

function Specimen({ step, values }: { step: (typeof TYPE_SCALE)[number]; values: Record<string, string> }) {
  const fs = `--ui-type-label-${step.key}-font-size`;
  const lh = `--ui-type-label-${step.key}-line-height`;
  const num = (v?: string) => (v ? v.replace("px", "") : "?");
  return (
    <div className="specimen">
      <span className="specimenMeta">
        <span className="specimenName">{step.figma}</span>
        <span className="specimenToken">type-label-{step.key}-*</span>
      </span>
      <span className="specimenValue">
        {num(values[fs])} / {num(values[lh])} / {values[TYPE_WEIGHT] || "?"}
      </span>
      <span
        className="specimenSample"
        style={{
          fontFamily: "var(--ui-font-family)",
          fontSize: `var(${fs})`,
          lineHeight: `var(${lh})`,
          fontWeight: `var(${TYPE_WEIGHT})` as React.CSSProperties["fontWeight"],
        }}
      >
        Navigation label
      </span>
      <span className="specimenUsed">{step.used}</span>
    </div>
  );
}

function Swatch({ name, value }: { name: string; value?: string }) {
  return (
    <div className="swatch">
      <span className="chip" style={{ background: tokenValue(name) }} />
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
  const [shell, setShell] = useState("/settings");
  const [primary, setPrimary] = useState("#e51a38");
  const [bottomTab, setBottomTab] = useState("JOBS");
  const [size, setSize] = useState<ButtonSize>("large");
  const [loading, setLoading] = useState(false);
  const [lead, setLead] = useState(true);
  const [page, setPage] = useState("/");
  const semantic = useTokenValues(SEMANTIC_TOKENS, [theme, primary]);
  const primitive = useTokenValues(PRIMITIVE_TOKENS, [theme, primary]);
  const type = useTokenValues(TYPE_TOKENS, [theme, primary]);
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
          Semantic <span>- the public API, 14 names an app overrides</span>
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

      <Section
        title="Type scale"
        note="Live values, read off the themed element. Every step is DM Sans Medium - the library renders labels only, no body copy. The samples below are rendered at the tokens themselves, so a change to the scale moves them."
      >
        <div className="specimens">
          {TYPE_SCALE.map((t) => <Specimen key={t.key} step={t} values={type} />)}
        </div>
        <p className="note specimenFoot">
          Four steps, no duplicates - a step exists only where the type differs, and only where something uses it. NavSlat sits on LG like the horizontal
          nav; its 32px box is --ui-nav-rail-slat-height, geometry rather than a seventh scale step. Type is never
          themed, so none of these move between light and dark.
        </p>
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
        <Row label="with icon">
          <NavRail aria-label="Sections with icons" style={{ width: 218 }}>
            {RAIL.map((r) => (
              <NavSlat
                key={r.href}
                icon={<Briefcase />}
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
        title="LeftRail"
        note="The app shell's left column - a brand slot over a NavRail. Figma: LeftRail-NoIcons (482:2517) and LeftRail-Icons (458:2612). Sub items sit flush under their parent and indent to line up with its label, which is 16 text-only and 40 once icons are on. Click a row to move the current page."
      >
        <Row label="text only">
          <LeftRail
            brand={<Logo weight="medium" size={50} label="Acme" />}
            style={{ width: 200, height: 500 }}
          >
            <NavRail aria-label="Shell sections">
              {SHELL.map((s) => {
                const slat = (
                  <NavSlat
                    key={s.href}
                    href={s.href}
                    active={shell === s.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setShell(s.href);
                    }}
                  >
                    {s.label}
                  </NavSlat>
                );
                if (!s.sub) return slat;
                return (
                  <NavSlatGroup key={s.href}>
                    {slat}
                    {s.sub.map((c) => (
                      <NavSlat
                        key={c.href}
                        level="secondary"
                        href={c.href}
                        active={shell === c.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setShell(c.href);
                        }}
                      >
                        {c.label}
                      </NavSlat>
                    ))}
                  </NavSlatGroup>
                );
              })}
            </NavRail>
          </LeftRail>
        </Row>
        <Row label="with icons">
          <LeftRail
            brand={<Logo weight="medium" size={50} label="Acme" />}
            style={{ width: 200, height: 500 }}
          >
            <NavRail aria-label="Shell sections with icons">
              {SHELL.map((s) => {
                const slat = (
                  <NavSlat
                    key={s.href}
                    icon={<Briefcase />}
                    href={s.href}
                    active={shell === s.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setShell(s.href);
                    }}
                  >
                    {s.label}
                  </NavSlat>
                );
                if (!s.sub) return slat;
                return (
                  <NavSlatGroup key={s.href}>
                    {slat}
                    {s.sub.map((c) => (
                      <NavSlat
                        key={c.href}
                        level="secondary"
                        href={c.href}
                        active={shell === c.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setShell(c.href);
                        }}
                      >
                        {c.label}
                      </NavSlat>
                    ))}
                  </NavSlatGroup>
                );
              })}
            </NavRail>
          </LeftRail>
        </Row>
      </Section>

      <Section
        title="BottomNav"
        note="The mobile counterpart to NavRail - the same destinations and the same chip, stacked with a caption. The bar paints itself but does not place itself, so it is shown docked in a 375-wide frame rather than pinned. Tap a tab to move the current page."
      >
        <Row label="tab bar">
          <div style={{ width: 375, border: "1px solid var(--ui-neutral-150)", borderRadius: 8, overflow: "hidden" }}>
            <BottomNav aria-label="Sections">
              {BOTTOM_TABS.map((t) => (
                <BottomNavItem
                  key={t.label}
                  href={t.href}
                  icon={<t.icon />}
                  current={bottomTab === t.label}
                  onClick={(e) => { e.preventDefault(); setBottomTab(t.label); }}
                >
                  {t.label}
                </BottomNavItem>
              ))}
            </BottomNav>
          </div>
        </Row>
      </Section>

      <Section
        title="Logo"
        note="The brand mark at five weights. It defaults to --ui-tc-red - the fixed personal brand, not --ui-primary: change the primary above and the mark stays TC red while everything else follows. Override it with --ui-logo-color, which inherits, so an ancestor can set it. Note an ancestor's plain `color` does NOT reach the mark: .logo declares its own colour, and its declaration beats inheritance."
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
          {/* Overridden via the custom property, set on an ancestor - the supported route. */}
          <span style={{ ["--ui-logo-color" as string]: "var(--ui-text-default)" } as React.CSSProperties}>
            <Logo weight="medium" size={44} />
          </span>
          <span
            style={{
              background: "var(--ui-surface-inverse)", padding: 10, borderRadius: 8, display: "inline-flex",
              ["--ui-logo-color" as string]: "var(--ui-text-on-inverse)",
            } as React.CSSProperties}
          >
            <Logo weight="medium" size={44} />
          </span>
        </Row>
        <Row label="named">
          <Logo weight="heavy" size={44} label="Tom Coggia" />
        </Row>
      </Section>

      <Section
        title="Spinner"
        note="The brand mark as a loading indicator - the ring turns, the T stays put. Medium weight only: a spinner is one thing an app shows while it waits, not a choice to make. Shares Logo's artwork rather than a copy of it. This is the page-level loader; Button's inline one is three pulsing dots, because a ring has too few pixels to read at button sizes."
      >
        <Row label="sizes">
          {[24, 40, 64, 96].map((n) => (
            <div key={n} style={{ textAlign: "center" }}>
              <Spinner size={n} label="Loading" />
              <p className="cardLabel">{n}</p>
            </div>
          ))}
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
