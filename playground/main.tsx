import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
// Import from source, not dist, so edits hot-reload.
import { BottomNav, BottomNavItem, Button, ButtonRound, Card, Checkbox, InputSelect, InputText, InputTextarea, LeftRail, Logo, Nav, NavDropdown, NavDropdownItem, NavItem, NavRail, NavSlat, NavSlatGroup, Pill, Segment, SegmentedControl, Spinner, Tab, Tabs } from "../src";
import type { ButtonVariant, ButtonSize, ButtonRoundSize, CardVariant, LogoWeight, SegmentedControlSize } from "../src";
import "../src/fonts/fonts.css";
import "./playground.css";

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "tertiary", "ghost"];
const SIZES: ButtonSize[] = ["xl", "lg", "md", "sm"];
const ROUND_SIZES: ButtonRoundSize[] = ["xl", "lg", "md", "sm"];
const CARDS: CardVariant[] = ["flat", "float1", "float2"];
const SEGMENTED_SIZES: SegmentedControlSize[] = ["lg", "md"];
const LOGO_WEIGHTS: LogoWeight[] = ["x-light", "light", "medium", "heavy", "x-heavy"];

/* Faces to audition. Each is a value for --ui-font-primary and nothing more -
   the point of the control is that swapping the face needs no other edit, and
   that the fallback stack survives the swap. Only DM Sans ships with the
   package; the rest are whatever the machine already has, which is also what a
   consuming app's own face would be. */
const FACES: { label: string; value: string }[] = [
  { label: "DM Sans (shipped)", value: 'var(--ui-dm-sans)' },
  { label: "Georgia", value: 'Georgia, serif' },
  { label: "Courier New", value: '"Courier New", monospace' },
  { label: "system-ui", value: 'system-ui' },
];

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
  { key: "sm", figma: "Type/Label SM", used: "Button Small \u00b7 BottomNav caption \u00b7 InputText label" },
  { key: "md", figma: "Type/Label MD", used: "Button Medium" },
  { key: "lg", figma: "Type/Label LG", used: "Button Large \u00b7 Nav item \u00b7 Nav dropdown item \u00b7 NavSlat \u00b7 Pill \u00b7 InputText value" },
  { key: "xl", figma: "Type/Label XL", used: "Button XL" },
];
const TYPE_WEIGHT = "--ui-type-label-font-weight";
// The typeface tier: one identity, one role, one safety net. --ui-font-family
// is absent on purpose - it is an override hook read at the element, never
// declared, so there is no :root value to read back here.
const TYPEFACE_TOKENS = ["--ui-dm-sans", "--ui-font-primary", "--ui-font-fallback"];
const TYPE_TOKENS = [
  ...TYPE_SCALE.flatMap((t) => [`--ui-type-label-${t.key}-font-size`, `--ui-type-label-${t.key}-line-height`]),
  TYPE_WEIGHT,
];

// Tier 2: the theming contract. Map all semantic tokens or none.
const SEMANTIC_TOKENS = [
  "--ui-primary", "--ui-primary-lighter", "--ui-text-on-primary",
  "--ui-accent", "--ui-text-on-accent",
  "--ui-danger", "--ui-text-on-danger",
  "--ui-confirm", "--ui-text-on-confirm",
  "--ui-surface-inverse", "--ui-text-on-inverse",
  "--ui-surface-muted", "--ui-surface-muted-hover", "--ui-surface-muted-active",
  "--ui-text-default", "--ui-text-muted", "--ui-text-faint", "--ui-surface-raised",
  "--ui-surface-pale",
  "--ui-surface-disabled", "--ui-text-disabled",
  "--ui-border-default",
];
// Fill + the text meant to sit on it. A recolour that breaks contrast shows here.
const TOKEN_PAIRS: [string, string, string][] = [
  ["--ui-primary", "--ui-text-on-primary", "On primary"],
  ["--ui-accent", "--ui-text-on-accent", "On accent"],
  ["--ui-danger", "--ui-text-on-danger", "On danger"],
  ["--ui-confirm", "--ui-text-on-confirm", "On confirm"],
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
// lucide `save`, the glyph the confirm tone was asked for.
const Save = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
    <path d="M7 3v4a1 1 0 0 0 1 1h7" />
  </svg>
);
// lucide `trash-2`, for the danger tone.
const Trash2 = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
  </svg>
);
const Info = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
  </svg>
);
const Sparkle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);
const FileText = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
  </svg>
);
const Scale = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);
const Chevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%">
    <path d="M9 18l6-6-6-6" />
  </svg>
);
const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const Layers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%">
    <path d="M12 2 2 7l10 5 10-5-10-5z" />
    <path d="m2 17 10 5 10-5" />
    <path d="m2 12 10 5 10-5" />
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

/* The jump menu addresses sections by this, and reads its labels back off the
   DOM - so a new Section joins the menu by existing, with no list to keep in
   step with it. */
const slug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function Section({ title, note, className, children }: { title: string; note?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={slug(title)} data-title={title} className={className}>
      <h2>{title}</h2>
      {note ? <p className="note">{note}</p> : null}
      {children}
    </section>
  );
}

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [segMode, setSegMode] = useState("all");
  const [segSort, setSegSort] = useState("newest");
  /* Read off the rendered DOM rather than kept as a constant beside the JSX.
     A hand-maintained list is one someone adds a Section without updating,
     and a jump menu missing the newest entry is worse than none. Runs once:
     the sections are static JSX. */
  const [sections, setSections] = useState<{ id: string; title: string }[]>([]);
  useEffect(() => {
    setSections(
      Array.from(document.querySelectorAll<HTMLElement>("section[id][data-title]"))
        .map((el) => ({ id: el.id, title: el.dataset.title as string })),
    );
  }, []);
  const [shell, setShell] = useState("/settings");
  const [primary, setPrimary] = useState("#e51a38");
  const [face, setFace] = useState(FACES[0].value);
  const [bottomTab, setBottomTab] = useState("JOBS");
  const [size, setSize] = useState<ButtonSize>("lg");
  const [loading, setLoading] = useState(false);
  const [lead, setLead] = useState(true);
  const [page, setPage] = useState("/");
  const semantic = useTokenValues(SEMANTIC_TOKENS, [theme, primary]);
  const typeface = useTokenValues(TYPEFACE_TOKENS, [theme, primary, face]);
  const primitive = useTokenValues(PRIMITIVE_TOKENS, [theme, primary]);
  const type = useTokenValues(TYPE_TOKENS, [theme, primary]);
  const [subPage, setSubPage] = useState("/work/b");
  const [where, setWhere] = useState("Home");
  const [mode, setMode] = useState("Remote");
  const [email, setEmail] = useState("");
  const [posted, setPosted] = useState("");
  const [salary, setSalary] = useState("220000");
  const [notes, setNotes] = useState("");
  const [view, setView] = useState("details");
  const [boxes, setBoxes] = useState<Record<string, boolean>>({ xl: true, lg: false, md: true });
  const [grow, setGrow] = useState("This one grows as you type. Add a few lines and the box follows, and the resize grabber is gone because two things setting the height is one too many.");
  const [trail, setTrail] = useState(false);
  const [pill, setPill] = useState("All");
  const [rail, setRail] = useState("/work");

  return (
    <div
      className="page ui-font-primary"
      data-theme={theme}
      style={{ ["--ui-primary" as string]: primary, ["--ui-font-primary" as string]: face }}
    >
      <header>
        <h1>@tomcoggia/ui</h1>
        <div className="controls">
          <label>
            jump to
            {/* Value is held at "" rather than tracking the selection, so
                picking the same section twice fires twice - a menu that
                silently ignored the second pick would read as broken. */}
            <select
              value=""
              onChange={(e) => {
                const target = document.getElementById(e.target.value);
                if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <option value="">section…</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>{sec.title}</option>
              ))}
            </select>
          </label>
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
          <label>
            font
            <select value={face} onChange={(e) => setFace(e.target.value)}>
              {FACES.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
            </select>
          </label>
          <button
            className="reset"
            onClick={() => { setPrimary("#e51a38"); setFace(FACES[0].value); }}
          >
            reset
          </button>
        </div>
      </header>

      <Section
        title="Colour tokens"
        note="Live values, read off the themed element - switch theme or pick a primary above and every semantic value follows."
      >
        <p className="groupLabel">
          Semantic <span>- the public API, 22 names an app overrides</span>
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
        title="Typeface"
        note={
          "One name to repoint, exactly like --ui-primary. Change `font` above: every component " +
          "follows, and so does this paragraph \u2014 the page carries the .ui-font-primary class, " +
          "which is how an app opts its OWN text in. The fallback stack is never restated, so a " +
          "face swap cannot drop it."
        }
      >
        <div className="faces">
          {TYPEFACE_TOKENS.map((t) => (
            <div key={t} className="faceRow">
              <span>
                <span className="faceName">{t.replace("--ui-", "")}</span>
                <br />
                <span className="faceRole">
                  {t === "--ui-dm-sans"
                    ? "identity \u2014 the face this package ships"
                    : t === "--ui-font-primary"
                      ? "role \u2014 the one an app overrides"
                      : "the tail, kept through any swap"}
                </span>
              </span>
              <span className="faceValue">{typeface[t] || "\u2014"}</span>
            </div>
          ))}
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

      <Section
        title="Button"
        note={
          "Every variant at every size. Hover and press to see the interaction states. The last "
          + "row is tone=\"danger\", which is not a fifth variant: danger cuts across the variants "
          + "rather than joining them \u2014 a destructive action can be loud or quiet and is "
          + "destructive either way. Hover and press each one: like ButtonRound's tones it changes "
          + "those pairs ONLY, so at rest a danger button is indistinguishable from its variant. "
          + "The red answers the pointer arriving rather than competing as a second resting style. "
          + "On a palette that splits --ui-primary from --ui-danger that means a Delete rests in "
          + "the CTA colour \u2014 the cost of one resting rhythm."
        }
      >
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
        <Row label="danger">
          {VARIANTS.map((v) => (
            <Button key={v} variant={v} tone="danger" size="lg" icon={<Trash2 />}>
              Delete
            </Button>
          ))}
        </Row>
      </Section>

      <Section
        title="ButtonRound"
        note={
          "Figma sizes and interaction states. Hover and press each icon button. The third in " +
          "each row is tone=\"confirm\" and the fourth tone=\"danger\" \u2014 both rest exactly like " +
          "the first, and answer the pointer in --ui-confirm and --ui-danger instead of " +
          "--ui-primary. A tone changes the hover pair only: pressed is the inverse surface for " +
          "every round button, whatever it goes on to do, and a destructive button that rested red " +
          "would be the loudest thing in its row. " +
          "The last two are variant=\"ghost\": no fill and a muted glyph at rest, then the same " +
          "primary fill as the first on hover \u2014 weight arriving with the pointer rather than a " +
          "second resting style. Disabled, a ghost stays unfilled, so switching a button off never " +
          "makes it louder than leaving it on."
        }
      >
        {ROUND_SIZES.map((s) => (
          <Row key={s} label={s}>
            <ButtonRound size={s} icon={<House />} aria-label={`${s} home action`} />
            <ButtonRound size={s} icon={<House />} aria-label={`${s} disabled action`} disabled />
            <ButtonRound size={s} tone="confirm" icon={<Save />} aria-label={`${s} save`} />
            <ButtonRound size={s} tone="danger" icon={<Trash2 />} aria-label={`${s} delete`} />
            <ButtonRound size={s} variant="ghost" icon={<House />} aria-label={`${s} ghost home action`} />
            <ButtonRound size={s} variant="ghost" icon={<House />} aria-label={`${s} ghost disabled action`} disabled />
          </Row>
        ))}
      </Section>

      <Section
        title="SegmentedControl"
        note={
          "One choice from a short, fixed set \u2014 a filter row, a sort order. A radiogroup, "
          + "not a tablist and not a row of Pills: Tabs swaps what is shown inside the page, and a "
          + "Pill is one independent toggle, where these N options are mutually exclusive. Arrow "
          + "keys move and select, Home and End jump, and both wrap; only the current choice is in "
          + "the tab order. The track's pale pill is the only ground always drawn \u2014 an idle "
          + "segment has none, and hovering one changes the LABEL alone, because a second ground "
          + "inside the track would read as two things chosen. The second column is variant=\"dark\"."
        }
      >
        {SEGMENTED_SIZES.map((s) => (
          <Row key={s} label={s}>
            <SegmentedControl size={s} aria-label={`${s} work mode`}>
              <Segment selected={segMode === "all"} onClick={() => setSegMode("all")}>All</Segment>
              <Segment selected={segMode === "remote"} onClick={() => setSegMode("remote")}>Remote</Segment>
              <Segment selected={segMode === "hybrid"} onClick={() => setSegMode("hybrid")}>Hybrid</Segment>
            </SegmentedControl>
            <SegmentedControl size={s} variant="dark" aria-label={`${s} sort order`}>
              <Segment selected={segSort === "newest"} onClick={() => setSegSort("newest")}>Newest</Segment>
              <Segment selected={segSort === "az"} onClick={() => setSegSort("az")}>A–Z</Segment>
            </SegmentedControl>
          </Row>
        ))}
        <Row label="icons">
          <SegmentedControl aria-label="View with icons">
            <Segment icon={<House />} selected={segMode === "all"} onClick={() => setSegMode("all")}>Home</Segment>
            <Segment icon={<Save />} selected={segMode === "remote"} onClick={() => setSegMode("remote")}>Saved</Segment>
          </SegmentedControl>
        </Row>
        <Row label="disabled">
          <SegmentedControl aria-label="Disabled example">
            <Segment selected>Available</Segment>
            <Segment disabled>Unavailable</Segment>
          </SegmentedControl>
        </Row>
      </Section>

      <Section
        title="InputTextarea"
        note={
          "InputText's field made multi-line, and the third member of the same family: every "
          + "measurement reads InputText's token behind an --ui-input-textarea-* hook, so the three "
          + "cannot drift. The one real departure is height \u2014 a single-line field is 32px because a "
          + "line is 32px, while this is as tall as its `rows`. No resize grabber: on an underline-only "
          + "field the handle lands on the rule. A box dragged "
          + "wider would break out of the column it sits in, and autoResize covers the case anyway. No icon "
          + "slots, deliberately \u2014 a leading "
          + "glyph is anchored to one line of text and has nowhere to sit beside three."
        }
      >
        <Row label="default">
          <InputTextarea
            style={{ width: 260 }}
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything worth remembering…"
          />
        </Row>
        <Row label="beside a field">
          <InputText style={{ width: 160 }} label="Company" defaultValue="Acme" />
          <InputTextarea style={{ width: 260 }} label="Description" rows={2} />
        </Row>
        <Row label="auto-resize">
          <InputTextarea
            style={{ width: 260 }}
            label="Grows to fit"
            autoResize
            rows={2}
            value={grow}
            onChange={(e) => setGrow(e.target.value)}
          />
        </Row>
        <Row label="disabled">
          <InputTextarea style={{ width: 260 }} label="Notes" value="Unavailable" disabled readOnly />
        </Row>
      </Section>

      <Section
        title="Checkbox"
        note={
          "Figma: the Checkbox set, sizes XL / LG / MD. Hover an unchecked box \u2014 the design "
          + "previews the tick in primary on an unfilled square, so the row says what clicking it will "
          + "do before it does it \u2014 and the LABEL previews with it, since the whole row is the hit "
          + "target. Only while unchecked: a checked row is already the answer. Checked fills the "
          + "square and reverses the tick out of it. Disabled follows Button exactly \u2014 a pale "
          + "--ui-surface-disabled ground carrying an --ui-text-disabled mark, with no rule around "
          + "it \u2014 so a dead checkbox and a dead button read as the same kind of thing. The ground "
          + "reaches the UNCHECKED box too: without it, removing the rule would erase the control "
          + "rather than mute it. Tab to one and "
          + "press space \u2014 it is a real input, drawn at 1px behind the glyph rather than hidden, "
          + "so the keyboard and screen-reader behaviour is the browser's."
        }
      >
        {(["xl", "lg", "md"] as const).map((s) => (
          <Row key={s} label={s}>
            <Checkbox
              size={s}
              label="Checkbox item"
              checked={boxes[s]}
              onChange={(e) => setBoxes((p) => ({ ...p, [s]: e.target.checked }))}
            />
            <Checkbox size={s} label="Unchecked" defaultChecked={false} />
            <Checkbox size={s} label="Disabled" disabled />
            <Checkbox size={s} label="Disabled checked" disabled defaultChecked />
          </Row>
        ))}
      </Section>

      <Section
        title="Tabs"
        note={
          "An in-page view switcher \u2014 NOT a nav. Nav, NavRail and BottomNav move you between "
          + "pages and are built from links; this swaps what is shown inside the page you are already "
          + "on, so it is a real tablist of buttons. Click one, then use the arrow keys: they move "
          + "between tabs and select as they go, and Home/End jump to the ends. Only the selected tab "
          + "is in the tab order, so Tab enters and leaves the strip rather than walking through every "
          + "view. The rule under each tab is drawn at every state and only changes colour, so "
          + "selecting one moves nothing."
        }
      >
        {(["lg", "xl"] as const).map((size) => (
          <Row key={size} label={size === "lg" ? "lg \u2014 14/21, icon 18" : "xl \u2014 18/24, icon 20"}>
            <div style={{ width: 576 }} data-tabs-size={size}>
              <Tabs size={size} aria-label={`Job views (${size})`}>
                {[
                  ["details", "Details", <Info key="d" />],
                  ["brief", "Brief", <Sparkle key="b" />],
                  ["post", "Post", <FileText key="p" />],
                  ["fit", "Fit", <Scale key="f" />],
                ].map(([id, label, ic]) => (
                  <Tab
                    key={id as string}
                    icon={ic as React.ReactNode}
                    active={view === id}
                    onClick={() => setView(id as string)}
                  >
                    {label as string}
                  </Tab>
                ))}
              </Tabs>
            </div>
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
                    sectionCurrent={!!s.sub?.some((c) => c.href === shell)}
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
                    sectionCurrent={!!s.sub?.some((c) => c.href === shell)}
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
        title="InputText"
        note={
          "The label sits UNDER the field, as drawn. Click or tab into one \u2014 active turns the " +
          "rule primary, and that is the whole treatment: no focus ring, unlike every other control " +
          "here. Icons are two independent slots and render identically \u2014 the same glyph is used " +
          "on both sides so the pair can be compared. Figma's instance draws a chevron in the " +
          "trailing slot, but a text field is not a select, so nothing is baked in. The date row " +
          "carries the two things a date input needs on top: a red calendar-plus indicator, and " +
          "its empty `mm/dd/yyyy` printed in the hint colour rather than at full value-black."
        }
      >
        <Row label="as drawn">
          <InputText
            style={{ width: 220 }}
            label="Input label"
            icon={<Layers />}
            iconEnd={<Layers />}
            value={where}
            onChange={(e) => setWhere(e.target.value)}
          />
        </Row>
        <Row label="no icons">
          <InputText
            style={{ width: 220 }}
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Row>
        <Row label="leading only">
          <InputText style={{ width: 220 }} label="Search" icon={<Layers />} placeholder="Type to filter…" />
        </Row>
        <Row label="no label">
          <InputText style={{ width: 220 }} aria-label="Search" icon={<Layers />} placeholder="aria-label instead" />
        </Row>
        <Row label="date">
          <InputText
            style={{ width: 220 }}
            label="Date posted"
            type="date"
            value={posted}
            onChange={(e) => setPosted(e.target.value)}
          />
        </Row>
        <Row label="number">
          <InputText
            style={{ width: 220 }}
            label="Min salary"
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </Row>
        <Row label="disabled">
          <InputText style={{ width: 220 }} label="Input label" icon={<Layers />} value="Home" disabled readOnly />
        </Row>
      </Section>

      <Section
        title="InputSelect"
        note={
          "InputText's field with a chevron and a real <select> inside it. Every measurement reads " +
          "InputText's token behind an --ui-input-select-* hook, so the two cannot drift while an app " +
          "can still retune the select alone. The chevron is --ui-primary: it is the part that says " +
          "there is more here, which makes it a call to action rather than chrome."
        }
      >
        <Row label="default">
          <InputSelect
            style={{ width: 220 }}
            label="Work mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option>Remote</option>
            <option>Hybrid</option>
            <option>On-site</option>
          </InputSelect>
        </Row>
        <Row label="leading icon">
          <InputSelect style={{ width: 220 }} label="Section" icon={<Layers />} defaultValue="Design">
            <option>Design</option>
            <option>Engineering</option>
          </InputSelect>
        </Row>
        <Row label="beside a text field">
          <InputText style={{ width: 200 }} label="Company" defaultValue="Acme" />
          <InputSelect style={{ width: 200 }} label="Status" defaultValue="Saved">
            <option>Saved</option>
            <option>Applied</option>
          </InputSelect>
        </Row>
        <Row label="disabled">
          <InputSelect style={{ width: 220 }} label="Work mode" defaultValue="Remote" disabled>
            <option>Remote</option>
          </InputSelect>
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
