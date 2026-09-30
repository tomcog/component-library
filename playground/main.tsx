import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
// Import from source, not dist, so edits hot-reload.
import { Modal, Radio, RadioGroup, Toolbar, ToolbarExpander, ToolbarGroup, BottomNav, BottomNavItem, Button, ButtonRound, Card, Checkbox, ConfirmButton, InputSelect, InputText, InputTextarea, LayerController, LeftRail, Logo, Nav, NavDropdown, NavDropdownItem, NavItem, NavRail, NavSlat, NavSlatGroup, Pill, Segment, SegmentedControl, Spinner, Tab, Tabs, Tag } from "../src";
import type { ButtonVariant, ButtonSize, ButtonRoundSize, ButtonRoundVariant, CardVariant, LogoWeight, SegmentedControlSize } from "../src";
import "../src/fonts/fonts.css";
import "./playground.css";
import { LiveBottomNav, LiveButton, LiveButtonRound, LiveCard, LiveCheckbox, LiveInputSelect, LiveInputText, LiveInputTextarea, LiveLayerController, LiveLeftRail, LiveLogo, LiveModal, LiveNav, LiveNavDropdown, LiveNavRail, LivePill, LiveRadio, LiveSegmentedControl, LiveSpinner, LiveTabs, LiveTag, LiveToolbar } from "./live";
import { Row, Briefcase, House, Save, Trash2, PhotoGlyph, Undo, Redo, Outline, Eye, Frame, Magnifier, ZoomIn, ZoomOut, FileGlyph, FolderOpen, Images, FileX, Send, Grid, StickyNote, Picture, Info, Sparkle, FileText, Scale, Chevron, Layers } from "./shared";

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "tertiary", "ghost"];
const SIZES: ButtonSize[] = ["xl", "lg", "md", "sm"];
/* The playground's starting role colours - distinct from each other and from
   safety and danger - and TC Red, the library's own default for both. */
const PLAYGROUND_ACTION = "#0000ff";
const PLAYGROUND_BRAND = "#9802e8";
const TC_RED = "#e51a38";
const ROUND_SIZES: ButtonRoundSize[] = ["xl", "lg", "md", "sm"];
const ROUND_VARIANTS: ButtonRoundVariant[] = ["primary", "secondary", "tertiary", "ghost"];
const CARDS: CardVariant[] = ["flat", "float1", "float2"];
const SEGMENTED_SIZES: SegmentedControlSize[] = ["xl", "lg", "md", "sm"];
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
// The type scale: four LABEL steps - DM Sans Medium, which is nearly every
// string the library renders - their four BODY twins in Regular (same size and
// leading), and the one HEADING step, Bold, for Modal's title. Figma carries
// the same nine as bound text styles (Type/Label, Type/Body, Type/Heading).
const TYPE_WEIGHT = "--ui-type-label-font-weight";
type TypeStep = { key: string; figma: string; used: string; prefix: string; weight: string; sample: string };
const label = (key: string, figma: string, used: string): TypeStep =>
  ({ key, figma, used, prefix: `--ui-type-label-${key}`, weight: TYPE_WEIGHT, sample: "Navigation label" });
const TYPE_SCALE: TypeStep[] = [
  label("sm", "Type/Label SM", "Button Small \u00b7 BottomNav caption \u00b7 InputText label"),
  label("md", "Type/Label MD", "Button Medium"),
  label("lg", "Type/Label LG", "Button Large \u00b7 Nav item \u00b7 Nav dropdown item \u00b7 NavSlat \u00b7 Pill \u00b7 InputText value"),
  label("xl", "Type/Label XL", "Button XL"),
  ...(["sm", "md", "lg", "xl"] as const).map((k): TypeStep => ({
    key: `body-${k}`, figma: `Type/Body ${k.toUpperCase()}`, used: k === "lg" ? "Modal body \u00b7 the Regular twin of Label LG" : "Reading text - the Regular twin of the label step",
    prefix: `--ui-type-body-${k}`, weight: "--ui-type-body-font-weight", sample: "Body text reads at this size",
  })),
  { key: "heading", figma: "Type/Heading", used: "Modal title", prefix: "--ui-type-heading", weight: "--ui-type-heading-font-weight", sample: "Delete this job?" },
];
// The typeface tier: one identity, one role, one safety net. --ui-font-family
// is absent on purpose - it is an override hook read at the element, never
// declared, so there is no :root value to read back here.
const TYPEFACE_TOKENS = ["--ui-dm-sans", "--ui-font-primary", "--ui-font-fallback"];
const TYPE_TOKENS = [...new Set(TYPE_SCALE.flatMap((t) => [`${t.prefix}-font-size`, `${t.prefix}-line-height`, t.weight]))];

// Tier 2: the theming contract. Map all semantic tokens or none.
const SEMANTIC_TOKENS = [
  "--ui-action", "--ui-action-lighter", "--ui-text-on-action",
  "--ui-brand", "--ui-text-on-brand",
  "--ui-danger", "--ui-danger-lighter", "--ui-danger-darker", "--ui-text-on-danger",
  "--ui-safety", "--ui-safety-lighter", "--ui-safety-darker", "--ui-text-on-safety",
  "--ui-surface-inverse", "--ui-text-on-inverse",
  "--ui-surface-muted", "--ui-surface-muted-hover", "--ui-surface-muted-active",
  "--ui-text-default", "--ui-text-muted", "--ui-text-faint", "--ui-surface-raised",
  "--ui-surface-pale",
  "--ui-surface-disabled", "--ui-text-disabled",
  "--ui-border-default",
];
// Fill + the text meant to sit on it. A recolour that breaks contrast shows here.
const TOKEN_PAIRS: [string, string, string][] = [
  ["--ui-action", "--ui-text-on-action", "On action"],
  ["--ui-brand", "--ui-text-on-brand", "On brand"],
  ["--ui-danger", "--ui-text-on-danger", "On danger"],
  ["--ui-safety", "--ui-text-on-safety", "On safety"],
  ["--ui-danger-darker", "--ui-text-on-danger", "On danger darker"],
  ["--ui-safety-darker", "--ui-text-on-safety", "On safety darker"],
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
  "--ui-action-lighter": "color-mix(in srgb, var(--ui-action) 15%, var(--ui-white))",
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

function Specimen({ step, values }: { step: TypeStep; values: Record<string, string> }) {
  const fs = `${step.prefix}-font-size`;
  const lh = `${step.prefix}-line-height`;
  const num = (v?: string) => (v ? v.replace("px", "") : "?");
  return (
    <div className="specimen">
      <span className="specimenMeta">
        <span className="specimenName">{step.figma}</span>
        <span className="specimenToken">{step.prefix.replace("--ui-", "")}-*</span>
      </span>
      <span className="specimenValue">
        {num(values[fs])} / {num(values[lh])} / {values[step.weight] || "?"}
      </span>
      <span
        className="specimenSample"
        style={{
          fontFamily: "var(--ui-font-family)",
          fontSize: `var(${fs})`,
          lineHeight: `var(${lh})`,
          fontWeight: `var(${step.weight})` as React.CSSProperties["fontWeight"],
        }}
      >
        {step.sample}
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
  const [printLayer, setPrintLayer] = useState("turquoise");
  const [kindLayer, setKindLayer] = useState("lines");
  const [hiddenLayers, setHiddenLayers] = useState<string[]>(["lime"]);
  const [segSort, setSegSort] = useState("newest");
  const [tbView, setTbView] = useState("preview");
  const [tbZoom, setTbZoom] = useState("plot");
  const [modal, setModal] = useState<null | "drawn" | "danger" | "plain">(null);
  const [radios, setRadios] = useState<Record<string, string>>({ xl: "in", lg: "in", md: "in" });
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
  /* The two colour ROLES, settable apart - which is the whole point of their
     names. The playground opens with them blue and purple, so all four role
     colours (action, brand, safety, danger) are distinct and a component
     reading the wrong role shows it at a glance. The LIBRARY's tokens still
     default both to TC Red; the TC button puts the page back on that. */
  const [action, setAction] = useState(PLAYGROUND_ACTION);
  const [brand, setBrand] = useState(PLAYGROUND_BRAND);
  const [face, setFace] = useState(FACES[0].value);
  const [bottomTab, setBottomTab] = useState("JOBS");
  const [buttonLabel, setButtonLabel] = useState("Button label");
  const [page, setPage] = useState("/");
  const semantic = useTokenValues(SEMANTIC_TOKENS, [theme, action, brand]);
  const typeface = useTokenValues(TYPEFACE_TOKENS, [theme, action, brand, face]);
  const primitive = useTokenValues(PRIMITIVE_TOKENS, [theme, action, brand]);
  const type = useTokenValues(TYPE_TOKENS, [theme, action, brand]);
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
  const [pill, setPill] = useState("All");
  const [rail, setRail] = useState("/work");

  return (
    <div
      className="page ui-font-primary"
      data-theme={theme}
      style={{
        ["--ui-action" as string]: action,
        ["--ui-brand" as string]: brand,
        ["--ui-font-primary" as string]: face,
      }}
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
          {/* Two roles, not one. `action` moves every control in the page;
              `brand` moves the app's own chrome, which today is LayerController's
              layer number and its struck-through eye and nothing else - so if
              only that row changes, that is correct rather than broken. */}
          <label title="Controls: buttons, active nav, the selected segment, every focus ring">
            action
            <input type="color" value={action} onChange={(e) => setAction(e.target.value)} />
          </label>
          <label title="The app's own aesthetic: chrome, rules, labels. Today only LayerController reads it.">
            brand
            <input type="color" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </label>
          <label>
            font
            <select value={face} onChange={(e) => setFace(e.target.value)}>
              {FACES.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
            </select>
          </label>
          <button
            className="reset"
            onClick={() => { setAction(PLAYGROUND_ACTION); setBrand(PLAYGROUND_BRAND); setFace(FACES[0].value); }}
          >
            reset
          </button>
          {/* Both roles to TC Red - what an app gets from the library's own
              defaults, where action, brand and danger are one red. */}
          <button
            className="reset"
            title="Action and brand to TC Red, the library's own default"
            onClick={() => { setAction(TC_RED); setBrand(TC_RED); }}
          >
            TC
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
          "One name to repoint, exactly like --ui-action. Change `font` above: every component " +
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
        note="Live values, read off the themed element. Four label steps in DM Sans Medium - nearly every string the library renders - their four Regular body twins at the same size and leading, and one heading step in Bold, for Modal's title. The samples below are rendered at the tokens themselves, so a change to the scale moves them."
      >
        <div className="specimens">
          {TYPE_SCALE.map((t) => <Specimen key={t.key} step={t} values={type} />)}
        </div>
        <p className="note specimenFoot">
          Four label steps, their body twins and one heading, no duplicates - a step exists only where the type differs, and only where something uses it. NavSlat sits on LG like the horizontal
          nav; its 32px box is --ui-nav-rail-slat-height, geometry rather than a seventh scale step. Type is never
          themed, so none of these move between light and dark.
        </p>
      </Section>

      <Section
        title="Button"
        note={
          "Every variant at every size. Hover and press to see the interaction states. The last two "
          + "rows are the tones: tone=\"safety\" (the affirmative half of a decision - Save, Keep) and "
          + "tone=\"danger\" (the destructive one - Delete, Remove). A tone is not a fifth variant: "
          + "it cuts across all four, recolouring every state from the action colour to its role "
          + "colour, at rest included, each variant keeping its shape. Since 0.74.0 this is also "
          + "what ConfirmButton was. Safety's text and glyphs on light grounds are Safety/Darker - "
          + "the green itself is ~2:1 on white."
        }
      >
        <LiveButton label={buttonLabel} setLabel={setButtonLabel} />
        {SIZES.map((s) => (
          <Row key={s} label={s}>
            {VARIANTS.map((v) => (
              <Button key={v} variant={v} size={s} icon={<House />}>
                {buttonLabel}
              </Button>
            ))}
            <Button variant="primary" size={s} icon={<House />} disabled>
              Disabled
            </Button>
          </Row>
        ))}
        <Row label="safety">
          {VARIANTS.map((v) => (
            <Button key={v} variant={v} tone="safety" size="lg" icon={<Save />}>
              Save
            </Button>
          ))}
        </Row>
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
          "Button's four Levels and its danger tone, on a circle (since 0.73.0): primary is solid, "
          + "secondary (the default) the pale tint, tertiary the glyph alone, ghost a 1px ring - each "
          + "with Button's own hover, press and disabled, so a round and a rectangular button of the "
          + "same Level behave identically. The last two rows are the tones, safety and danger, which "
          + "recolour every Level at rest as well - an icon-only ConfirmButton is one of these since 0.74.0. variant=\"outline-light\" is the one Button has no twin of: a "
          + "button over a photo - a 40% black ground, a ring and glyph in 80% / 75% white, the whole "
          + "button at 75% opacity, identical in both themes; hover and press stay neutral (Figma "
          + "892:1700); disabled drops to 40%."
        }
      >
        <LiveButtonRound />
        {ROUND_SIZES.map((s) => (
          <Row key={s} label={s}>
            {ROUND_VARIANTS.map((v) => (
              <ButtonRound key={v} size={s} variant={v} icon={<House />} aria-label={`${s} ${v} home action`} />
            ))}
            <ButtonRound size={s} icon={<House />} aria-label={`${s} disabled action`} disabled />
            <ButtonRound size={s} variant="ghost" icon={<House />} aria-label={`${s} ghost disabled action`} disabled />
          </Row>
        ))}
        <Row label="safety">
          {ROUND_VARIANTS.map((v) => (
            <ButtonRound key={v} size="lg" variant={v} tone="safety" icon={<Save />} aria-label={`Save, ${v}`} />
          ))}
        </Row>
        <Row label="danger">
          {ROUND_VARIANTS.map((v) => (
            <ButtonRound key={v} size="lg" variant={v} tone="danger" icon={<Trash2 />} aria-label={`Delete, ${v}`} />
          ))}
        </Row>
        <Row label="outline-light, over a photo">
          {/* A stand-in photo: a sky-to-rock gradient, bright at the top so the
              scrim has to earn its keep. */}
          <div style={{ display: "flex", gap: 16, padding: 16, borderRadius: 8, background: "linear-gradient(160deg, #cfe8ff 0%, #9cc7e8 35%, #b98a5e 70%, #6b4a2e 100%)" }}>
            {ROUND_SIZES.map((s) => (
              <ButtonRound key={s} size={s} variant="outline-light" icon={<House />} aria-label={`${s} outline-light action`} />
            ))}
            <ButtonRound size="lg" variant="outline-light" icon={<House />} aria-label="lg outline-light disabled action" disabled />
          </div>
        </Row>
      </Section>

      <Section
        title="ConfirmButton"
        note={
          "DEPRECATED in 0.74.0. A confirmation is now a Button or ButtonRound with tone=\"safety\" or "
          + "tone=\"danger\"; this component renders exactly that (a label means Button, none means "
          + "ButtonRound; filled -> secondary, ghost -> tertiary) and warns once in dev. Each pair "
          + "below is the old call and its replacement, which render identically."
        }
      >
        <Row label="icon-only">
          <ConfirmButton tone="safety" icon={<Save />} aria-label="Save, old" />
          <ButtonRound tone="safety" icon={<Save />} aria-label="Save, new" />
          <span style={{ width: 16 }} />
          <ConfirmButton tone="danger" variant="ghost" icon={<Trash2 />} aria-label="Delete, old" />
          <ButtonRound tone="danger" variant="tertiary" icon={<Trash2 />} aria-label="Delete, new" />
        </Row>
        <Row label="labelled">
          <ConfirmButton tone="safety" icon={<Save />}>Save</ConfirmButton>
          <Button variant="secondary" tone="safety" icon={<Save />}>Save</Button>
          <span style={{ width: 16 }} />
          <ConfirmButton tone="danger" variant="ghost">Remove</ConfirmButton>
          <Button variant="tertiary" tone="danger">Remove</Button>
        </Row>
      </Section>

      <Section
        title="Modal"
        note={
          "A dialog that interrupts: icon, title, body, actions. Figma: Modal (853:583). A native "
          + "<dialog> opened with showModal() \u2014 the page behind goes inert under a 40% scrim, focus "
          + "stays inside and starts on the first action, and returns to the opener on close. Escape "
          + "closes it; a click outside does not. The title is the library's one heading step (Bold "
          + "24/32); the body is Body LG (Regular, 14/20), the action Buttons LG. 350 wide at most, shrinking to the viewport less 16 a side."
        }
      >
        <LiveModal />
        <Row label="open">
          <Button size="md" onClick={() => setModal("drawn")}>As drawn</Button>
          <Button size="md" variant="secondary" onClick={() => setModal("danger")}>Destructive</Button>
          <Button size="md" variant="tertiary" onClick={() => setModal("plain")}>No icon</Button>
        </Row>
        <Modal
          open={modal === "drawn"}
          onClose={() => setModal(null)}
          icon={<Save />}
          iconColor="brand"
          title="Are you sure you want to do this thing?"
          actions={<>
            <Button variant="tertiary" size="lg" onClick={() => setModal(null)}>Secondary action</Button>
            <Button size="lg" onClick={() => setModal(null)}>Primary action</Button>
          </>}
        >
          Because if you do this thing, this is what will happen and you&rsquo;ll be stuck with the
          consequences of taking this action I&rsquo;m warning you about.
        </Modal>
        <Modal
          open={modal === "danger"}
          onClose={() => setModal(null)}
          icon={<Trash2 />}
          iconColor="danger"
          title="Delete this job?"
          actions={<>
            <Button variant="tertiary" size="lg" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="primary" tone="danger" size="lg" icon={<Trash2 />} onClick={() => setModal(null)}>Delete</Button>
          </>}
        >
          Senior Product Designer at Acme will be removed. This cannot be undone.
        </Modal>
        <Modal
          open={modal === "plain"}
          onClose={() => setModal(null)}
          title="Unsaved changes"
          actions={<>
            <Button variant="tertiary" size="lg" onClick={() => setModal(null)}>Keep editing</Button>
            <Button variant="secondary" tone="safety" size="lg" onClick={() => setModal(null)}>Save</Button>
          </>}
        >
          You have edits that have not been saved yet.
        </Modal>
      </Section>

      <Section
        title="Toolbar"
        note={
          "A rounded bar holding a set of SegmentedControls, whatever they happen to be \u2014 the "
          + "groups below are just examples. It owns a ground, a 4px inset and the gap between its controls, and "
          + "nothing else: what a segment shows is Segment's business, so a bar of icon-only "
          + "controls and a bar of labelled ones are the same Toolbar with different children. The "
          + "gap is the argument \u2014 20 between controls against 4 between segments, so segments "
          + "crowd because they answer one question and controls stand apart because they answer "
          + "several. Each control picks its own selected ground with variant, which is why Preview "
          + "and Zoom below read dark while History stays brand \u2014 and History is actions, so it is a "
          + "group of buttons rather than a choice. role=\"group\", not "
          + "role=\"toolbar\": the ARIA toolbar pattern claims the arrow keys, and every "
          + "SegmentedControl inside has already bound them. A ToolbarGroup captions a control "
          + "(\"VIEW:\"), and the caption becomes that control's accessible name."
        }
      >
        <LiveToolbar />
        <Row label="tone=&quot;gray&quot;">
          <Toolbar aria-label="Drawing tools, gray">
            {/* `actions`: undo and redo are things you DO, not one-of-N. The
                track becomes a group, each segment a plain button. Identical
                to look at, which is the point - Figma draws both the same. */}
            <SegmentedControl size="sm" actions aria-label="History">
              <Segment icon={<Undo />}>Undo</Segment>
              <Segment icon={<Redo />}>Redo</Segment>
            </SegmentedControl>
            <SegmentedControl size="sm" variant="dark" aria-label="View">
              <Segment icon={<Outline />} selected={tbView === "outline"} onClick={() => setTbView("outline")}>Outline</Segment>
              <Segment icon={<Eye />} selected={tbView === "preview"} onClick={() => setTbView("preview")}>Preview</Segment>
            </SegmentedControl>
            <SegmentedControl size="sm" variant="dark" aria-label="Zoom">
              <Segment icon={<Frame />} selected={tbZoom === "plot"} onClick={() => setTbZoom("plot")}>Plot area</Segment>
              <Segment icon={<Outline />} selected={tbZoom === "paper"} onClick={() => setTbZoom("paper")}>Paper</Segment>
              <Segment icon={<Eye />} selected={tbZoom === "drawing"} onClick={() => setTbZoom("drawing")}>Drawing</Segment>
            </SegmentedControl>
          </Toolbar>
        </Row>
        {/* Posed on a pale ground, which is the page tone="white" exists for. */}
        <Row label="tone=&quot;white&quot;">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: 16, borderRadius: 12, background: "var(--ui-surface-pale)" }}>
            <Toolbar tone="white" aria-label="Drawing tools, white">
              <SegmentedControl size="sm" actions aria-label="History on white">
                <Segment icon={<Undo />}>Undo</Segment>
                <Segment icon={<Redo />}>Redo</Segment>
              </SegmentedControl>
              <SegmentedControl size="sm" variant="dark" aria-label="View on white">
                <Segment icon={<Outline />} selected={tbView === "outline"} onClick={() => setTbView("outline")}>Outline</Segment>
                <Segment icon={<Eye />} selected={tbView === "preview"} onClick={() => setTbView("preview")}>Preview</Segment>
              </SegmentedControl>
            </Toolbar>
          </div>
        </Row>
        {/* NextDraw's toolbar (87:1230): each group captioned. The caption names
            the control, so neither SegmentedControl carries an aria-label. */}
        <Row label="labelled groups">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: 16, borderRadius: 12, background: "var(--ui-surface-pale)" }}>
            <Toolbar tone="white" aria-label="Drawing tools, labelled">
              <ToolbarGroup label="VIEW:">
                <SegmentedControl size="sm" variant="dark">
                  <Segment icon={<Outline />} selected={tbView === "outline"} onClick={() => setTbView("outline")}>Hairline</Segment>
                  <Segment icon={<Eye />} selected={tbView === "preview"} onClick={() => setTbView("preview")}>Simulated</Segment>
                </SegmentedControl>
              </ToolbarGroup>
              <ToolbarGroup label="ZOOM:">
                <SegmentedControl size="sm" variant="dark">
                  <Segment icon={<Grid />} selected={tbZoom === "plot"} onClick={() => setTbZoom("plot")}>Print area</Segment>
                  <Segment icon={<StickyNote />} selected={tbZoom === "paper"} onClick={() => setTbZoom("paper")}>Paper</Segment>
                  <Segment icon={<Picture />} selected={tbZoom === "drawing"} onClick={() => setTbZoom("drawing")}>Drawing</Segment>
                </SegmentedControl>
              </ToolbarGroup>
            </Toolbar>
          </div>
        </Row>
        {/* Labelled and bare groups mix, and a labelled group's segments can
            still drop their own labels - the two are independent. */}
        <Row label="mixed">
          <Toolbar aria-label="Drawing tools, mixed">
            <SegmentedControl size="sm" actions aria-label="History mixed">
              <Segment icon={<Undo />} hideLabel>Undo</Segment>
              <Segment icon={<Redo />} hideLabel>Redo</Segment>
            </SegmentedControl>
            <ToolbarGroup label="VIEW:">
              <SegmentedControl size="sm" variant="dark">
                <Segment icon={<Outline />} hideLabel selected={tbView === "outline"} onClick={() => setTbView("outline")}>Hairline</Segment>
                <Segment icon={<Eye />} hideLabel selected={tbView === "preview"} onClick={() => setTbView("preview")}>Simulated</Segment>
              </SegmentedControl>
            </ToolbarGroup>
            <ToolbarGroup label="ZOOM:">
              <SegmentedControl size="sm" variant="dark">
                <Segment selected={tbZoom === "plot"} onClick={() => setTbZoom("plot")}>Print area</Segment>
                <Segment selected={tbZoom === "paper"} onClick={() => setTbZoom("paper")}>Paper</Segment>
                <Segment selected={tbZoom === "drawing"} onClick={() => setTbZoom("drawing")}>Drawing</Segment>
              </SegmentedControl>
            </ToolbarGroup>
          </Toolbar>
        </Row>
        {/* The same bar, with every segment switched to hideLabel. Nothing about
            the Toolbar changes - this is the point of it owning so little. */}
        <Row label="icon-only">
          <Toolbar aria-label="Drawing tools, icons">
            <SegmentedControl size="sm" actions aria-label="History icons">
              <Segment icon={<Undo />} hideLabel>Undo</Segment>
              <Segment icon={<Redo />} hideLabel>Redo</Segment>
            </SegmentedControl>
            <SegmentedControl size="sm" variant="dark" aria-label="View icons">
              <Segment icon={<Outline />} hideLabel selected={tbView === "outline"} onClick={() => setTbView("outline")}>Outline</Segment>
              <Segment icon={<Eye />} hideLabel selected={tbView === "preview"} onClick={() => setTbView("preview")}>Preview</Segment>
            </SegmentedControl>
            <SegmentedControl size="sm" variant="dark" aria-label="Zoom icons">
              <Segment icon={<Frame />} hideLabel selected={tbZoom === "plot"} onClick={() => setTbZoom("plot")}>Plot area</Segment>
              <Segment icon={<Outline />} hideLabel selected={tbZoom === "paper"} onClick={() => setTbZoom("paper")}>Paper</Segment>
              <Segment icon={<Eye />} hideLabel selected={tbZoom === "drawing"} onClick={() => setTbZoom("drawing")}>Drawing</Segment>
            </SegmentedControl>
          </Toolbar>
        </Row>
        {/* NextDraw's vertical bar (76:401). The children are written exactly as
            for a horizontal bar - labels and captions included - and the bar
            hides both: they stay as the accessible names. */}
        <Row label="vertical">
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: 16, borderRadius: 12, background: "var(--ui-surface-pale)" }}>
            <Toolbar orientation="vertical" tone="white" aria-label="Drawing tools, vertical">
              <ToolbarGroup label="VIEW:">
                <SegmentedControl size="sm">
                  <Segment icon={<Outline />} selected={tbView === "outline"} onClick={() => setTbView("outline")}>Hairline</Segment>
                  <Segment icon={<Eye />} selected={tbView === "preview"} onClick={() => setTbView("preview")}>Simulated</Segment>
                </SegmentedControl>
              </ToolbarGroup>
              <SegmentedControl size="sm" actions aria-label="History vertical">
                <Segment icon={<Undo />}>Undo</Segment>
                <Segment icon={<Redo />}>Redo</Segment>
              </SegmentedControl>
            </Toolbar>
            <Toolbar orientation="vertical" aria-label="Drawing tools, vertical gray">
              <SegmentedControl size="sm" variant="dark" aria-label="Zoom vertical">
                <Segment icon={<Grid />} selected={tbZoom === "plot"} onClick={() => setTbZoom("plot")}>Print area</Segment>
                <Segment icon={<StickyNote />} selected={tbZoom === "paper"} onClick={() => setTbZoom("paper")}>Paper</Segment>
                <Segment icon={<Picture />} selected={tbZoom === "drawing"} onClick={() => setTbZoom("drawing")}>Drawing</Segment>
              </SegmentedControl>
            </Toolbar>
          </div>
        </Row>
        {/* Text-only is simply a Segment with no icon - the third configuration,
            and it needs nothing from Toolbar either. */}
        <Row label="text-only">
          <Toolbar aria-label="Drawing tools, text">
            <SegmentedControl size="sm" variant="dark" aria-label="View text">
              <Segment selected={tbView === "outline"} onClick={() => setTbView("outline")}>Outline</Segment>
              <Segment selected={tbView === "preview"} onClick={() => setTbView("preview")}>Preview</Segment>
            </SegmentedControl>
            <SegmentedControl size="sm" aria-label="Zoom text">
              <Segment selected={tbZoom === "plot"} onClick={() => setTbZoom("plot")}>Plot area</Segment>
              <Segment selected={tbZoom === "paper"} onClick={() => setTbZoom("paper")}>Paper</Segment>
            </SegmentedControl>
          </Toolbar>
        </Row>
        {/* The expander as a SETTING (the default - no `actions`): the
            drawer stays open and its segments are a radio group, one on at a
            time, taking the selected ground (variant). Arrow keys move and
            select. Shares its state with the Zoom control above. */}
        <Row label="expander">
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
            <Toolbar aria-label="Drawing tools, expander">
              <SegmentedControl size="sm" actions aria-label="History expander">
                <Segment icon={<Undo />} hideLabel>Undo</Segment>
                <Segment icon={<Redo />} hideLabel>Redo</Segment>
              </SegmentedControl>
              <SegmentedControl size="sm" variant="dark" aria-label="View expander">
                <Segment icon={<Outline />} hideLabel selected={tbView === "outline"} onClick={() => setTbView("outline")}>Outline</Segment>
                <Segment icon={<Eye />} hideLabel selected={tbView === "preview"} onClick={() => setTbView("preview")}>Preview</Segment>
              </SegmentedControl>
              <ToolbarExpander size="sm" icon={<Magnifier />} label="Zoom">
                  <Segment icon={<Grid />} hideLabel selected={tbZoom === "plot"} onClick={() => setTbZoom("plot")}>Print area</Segment>
                  <Segment icon={<StickyNote />} hideLabel selected={tbZoom === "paper"} onClick={() => setTbZoom("paper")}>Paper</Segment>
                  <Segment icon={<Picture />} hideLabel selected={tbZoom === "drawing"} onClick={() => setTbZoom("drawing")}>Drawing</Segment>
                </ToolbarExpander>
            </Toolbar>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: 16, borderRadius: 12, background: "var(--ui-surface-pale)" }}>
              <Toolbar tone="white" aria-label="Drawing tools, expander labelled">
                <ToolbarExpander size="sm" icon={<Magnifier />} label="Zoom">
                  <Segment icon={<Grid />} selected={tbZoom === "plot"} onClick={() => setTbZoom("plot")}>Print area</Segment>
                  <Segment icon={<StickyNote />} selected={tbZoom === "paper"} onClick={() => setTbZoom("paper")}>Paper</Segment>
                  <Segment icon={<Picture />} selected={tbZoom === "drawing"} onClick={() => setTbZoom("drawing")}>Drawing</Segment>
                </ToolbarExpander>
              </Toolbar>
              <Toolbar orientation="vertical" tone="white" aria-label="Drawing tools, expander vertical">
                <SegmentedControl size="sm" actions aria-label="History expander vertical">
                  <Segment icon={<Undo />}>Undo</Segment>
                  <Segment icon={<Redo />}>Redo</Segment>
                </SegmentedControl>
                <ToolbarExpander size="sm" icon={<Magnifier />} label="Zoom">
                  <Segment icon={<Grid />} selected={tbZoom === "plot"} onClick={() => setTbZoom("plot")}>Print area</Segment>
                  <Segment icon={<StickyNote />} selected={tbZoom === "paper"} onClick={() => setTbZoom("paper")}>Paper</Segment>
                  <Segment icon={<Picture />} selected={tbZoom === "drawing"} onClick={() => setTbZoom("drawing")}>Drawing</Segment>
                </ToolbarExpander>
              </Toolbar>
            </div>
          </div>
        </Row>
        {/* The same bar with `actions`: plain buttons, none ever on. Clicking
            any revealed segment runs it and folds the panel, focus returning
            to File - closeOnAction, which defaults on. Set on the expander,
            so it is always every segment or none. */}
        <Row label="expander, actions">
          <Toolbar aria-label="Drawing tools, expander closes">
            <SegmentedControl size="sm" actions aria-label="History expander closes">
              <Segment icon={<Undo />} hideLabel>Undo</Segment>
              <Segment icon={<Redo />} hideLabel>Redo</Segment>
            </SegmentedControl>
            <SegmentedControl size="sm" variant="dark" aria-label="View expander closes">
              <Segment icon={<Outline />} hideLabel selected={tbView === "outline"} onClick={() => setTbView("outline")}>Outline</Segment>
              <Segment icon={<Eye />} hideLabel selected={tbView === "preview"} onClick={() => setTbView("preview")}>Preview</Segment>
            </SegmentedControl>
            <ToolbarExpander size="sm" icon={<FileGlyph />} label="File" actions>
              <Segment icon={<Save />} hideLabel>Save</Segment>
              <Segment icon={<FolderOpen />} hideLabel>Open</Segment>
              <Segment icon={<Images />} hideLabel>Export image</Segment>
              <Segment icon={<FileX />} hideLabel>Close</Segment>
              <Segment icon={<Send />} hideLabel>Send</Segment>
            </ToolbarExpander>
          </Toolbar>
        </Row>
        {/* Actions pressed in a run: closeOnAction={false} keeps the panel
            open, so zoom in can be clicked three times without reopening it.
            Still actions - nothing stays on. */}
        <Row label="expander, actions, stays open">
          <Toolbar aria-label="Drawing tools, expander stays open">
            <ToolbarExpander size="sm" icon={<Magnifier />} label="Zoom" actions closeOnAction={false}>
              <Segment icon={<ZoomIn />} hideLabel>Zoom in</Segment>
              <Segment icon={<ZoomOut />} hideLabel>Zoom out</Segment>
              <Segment icon={<Frame />} hideLabel>Fit to screen</Segment>
            </ToolbarExpander>
          </Toolbar>
        </Row>
        {/* Nothing forces SM. A bar of LG controls derives to 48 tall. */}
        <Row label="lg controls">
          <Toolbar aria-label="Drawing tools, large">
            <SegmentedControl actions aria-label="History large">
              <Segment icon={<Undo />}>Undo</Segment>
              <Segment icon={<Redo />}>Redo</Segment>
            </SegmentedControl>
            <SegmentedControl variant="dark" aria-label="View large">
              <Segment icon={<Outline />} selected={tbView === "outline"} onClick={() => setTbView("outline")}>Outline</Segment>
              <Segment icon={<Eye />} selected={tbView === "preview"} onClick={() => setTbView("preview")}>Preview</Segment>
            </SegmentedControl>
          </Toolbar>
        </Row>
      </Section>

      <Section
        title="SegmentedControl"
        note={
          "One choice from a short, fixed set \u2014 a filter row, a sort order. A radiogroup, "
          + "not a tablist and not a row of Pills: Tabs swaps what is shown inside the page, and a "
          + "Pill is one independent toggle, where these N options are mutually exclusive. Arrow "
          + "keys move and select, Home and End jump, and both wrap; only the current choice is in "
          + "the tab order. The track's pill is the only ground always drawn \u2014 an idle "
          + "segment has none, and hovering one changes the LABEL and its glyph alone \u2014 a ground is "
          + "what says chosen, and only the selected segment gets one. The selected pill is flush with the "
          + "track's ends, so that ground is seen in the 8px gaps between segments rather than as a "
          + "ring around the chosen one. A glyph shown beside a label sits at 0.65 so the label "
          + "leads; hideLabel draws it alone and at full strength, keeping the text as the "
          + "accessible name. Every height is the control ladder \u2014 48 / 40 / 32 / 24, the same "
          + "--ui-control-* tokens Button and ButtonRound read \u2014 so an icon-only segment is the "
          + "same circle a ButtonRound draws. The last row puts the two side by side. The columns are the three variants: action (the default), brand - both the project's own colours, so they move with the pickers above - and dark, the near-black that stays put. "
          + "tone picks the track's own ground \u2014 gray is the pale surface, white the raised one, "
          + "which is what a control sitting on a pale page wants."
        }
      >
        <LiveSegmentedControl />
        {SEGMENTED_SIZES.map((s) => (
          <Row key={s} label={s}>
            <SegmentedControl size={s} aria-label={`${s} work mode`}>
              <Segment selected={segMode === "all"} onClick={() => setSegMode("all")}>All</Segment>
              <Segment selected={segMode === "remote"} onClick={() => setSegMode("remote")}>Remote</Segment>
              <Segment selected={segMode === "hybrid"} onClick={() => setSegMode("hybrid")}>Hybrid</Segment>
            </SegmentedControl>
            <SegmentedControl size={s} variant="brand" aria-label={`${s} sort order, brand`}>
              <Segment selected={segSort === "newest"} onClick={() => setSegSort("newest")}>Newest</Segment>
              <Segment selected={segSort === "az"} onClick={() => setSegSort("az")}>A–Z</Segment>
            </SegmentedControl>
            <SegmentedControl size={s} variant="dark" aria-label={`${s} sort order`}>
              <Segment selected={segSort === "newest"} onClick={() => setSegSort("newest")}>Newest</Segment>
              <Segment selected={segSort === "az"} onClick={() => setSegSort("az")}>A–Z</Segment>
            </SegmentedControl>
          </Row>
        ))}
        <Row label="icons">
          {SEGMENTED_SIZES.map((s) => (
            <SegmentedControl key={s} size={s} aria-label={`${s} view with icons`}>
              <Segment icon={<House />} selected={segMode === "all"} onClick={() => setSegMode("all")}>Home</Segment>
              <Segment icon={<Save />} selected={segMode === "remote"} onClick={() => setSegMode("remote")}>Saved</Segment>
            </SegmentedControl>
          ))}
        </Row>
        {/* Posed on a pale ground, because that IS the case the white track
            exists for: the section's own card is white, and a gray track shown
            on it would only prove the easy half. Here the two sit side by side
            on the surface they collide with - NextJob's dashboard ground. */}
        <Row label="tone=&quot;white&quot;">
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, padding: 12, borderRadius: 8, background: "var(--ui-surface-pale)" }}>
          <SegmentedControl aria-label="Gray on a pale ground">
            <Segment selected>Gray</Segment>
            <Segment>track</Segment>
          </SegmentedControl>
          {SEGMENTED_SIZES.map((s) => (
            <SegmentedControl key={s} size={s} tone="white" aria-label={`${s} white work mode`}>
              <Segment selected={segMode === "all"} onClick={() => setSegMode("all")}>All</Segment>
              <Segment selected={segMode === "remote"} onClick={() => setSegMode("remote")}>Remote</Segment>
            </SegmentedControl>
          ))}
          <SegmentedControl tone="white" variant="dark" aria-label="White dark sort order">
            <Segment icon={<House />} selected={segSort === "newest"} onClick={() => setSegSort("newest")}>Newest</Segment>
            <Segment selected={segSort === "az"} onClick={() => setSegSort("az")}>A–Z</Segment>
          </SegmentedControl>
          </div>
        </Row>
        {/* hideLabel keeps the text as the accessible name and draws the glyph
            alone - and at FULL strength, where a glyph beside a label sits at
            0.65 so the label leads. The two rows above and below each other
            are the whole rule. */}
        <Row label="hideLabel">
          {SEGMENTED_SIZES.map((s) => (
            <SegmentedControl key={s} size={s} aria-label={`${s} icon-only view`}>
              <Segment icon={<House />} hideLabel selected={segMode === "all"} onClick={() => setSegMode("all")}>Home</Segment>
              <Segment icon={<Save />} hideLabel selected={segMode === "remote"} onClick={() => setSegMode("remote")}>Saved</Segment>
            </SegmentedControl>
          ))}
          <SegmentedControl variant="dark" aria-label="Icon-only dark">
            <Segment icon={<House />} hideLabel selected={segSort === "newest"} onClick={() => setSegSort("newest")}>Newest</Segment>
            <Segment icon={<Save />} hideLabel selected={segSort === "az"} onClick={() => setSegSort("az")}>A–Z</Segment>
          </SegmentedControl>
        </Row>
        {/* The circle claim, checkable by eye: a ButtonRound beside an
            icon-only Segment at each step. They read the same ladder, so if
            these ever stop matching, one of them has left it. */}
        <Row label="vs ButtonRound">
          {SEGMENTED_SIZES.map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SegmentedControl size={s} aria-label={`${s} circle check`}>
                <Segment icon={<House />} hideLabel selected>Home</Segment>
                <Segment icon={<Save />} hideLabel>Saved</Segment>
              </SegmentedControl>
              <ButtonRound size={s} icon={<House />} aria-label={`${s} round for comparison`} />
            </div>
          ))}
        </Row>
        {/* Figma draws the Disabled cell at all four sizes: no ground, label and
            glyph in Text/Disabled. The glyph needs no rule - currentColor greys
            it with the label. The third control is the case Figma cannot say,
            because State is one axis: a SELECTED segment that is disabled keeps
            its ground, so a locked group still answers "which one is chosen". */}
        <Row label="disabled">
          <SegmentedControl aria-label="Disabled example">
            <Segment selected>Available</Segment>
            <Segment disabled>Unavailable</Segment>
          </SegmentedControl>
          <SegmentedControl aria-label="Disabled with icons">
            <Segment icon={<House />} selected>Home</Segment>
            <Segment icon={<Save />} disabled>Saved</Segment>
          </SegmentedControl>
          <SegmentedControl variant="dark" aria-label="Whole group disabled">
            <Segment icon={<House />} selected disabled>Home</Segment>
            <Segment icon={<Save />} disabled>Saved</Segment>
          </SegmentedControl>
        </Row>
      </Section>

      <Section
        title="InputTextarea"
        note={
          "InputText's field made multi-line, and the third member of the same family: every "
          + "measurement reads InputText's token behind an --ui-input-textarea-* hook, so the three "
          + "cannot drift. It starts one line tall, identical to an InputText while empty \u2014 its text "
          + "just above the rule \u2014 and grows a line at a time as you type (rows=1, autoResize, the "
          + "defaults since 0.74.0). autoResize={false} gives a fixed box that scrolls. No resize grabber: on an underline-only "
          + "field the handle lands on the rule. A box dragged "
          + "wider would break out of the column it sits in, and autoResize covers the case anyway. No icon "
          + "slots, deliberately \u2014 a leading "
          + "glyph is anchored to one line of text and has nowhere to sit beside three."
        }
      >
        <LiveInputTextarea />
        <Row label="default">
          <InputTextarea
            style={{ width: 260 }}
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything worth remembering…"
          />
        </Row>
        <Row label="size md">
          <InputTextarea size="md" style={{ width: 260 }} label="Notes" placeholder="Anything worth remembering…" />
          <InputText size="md" style={{ width: 160 }} label="Company" defaultValue="Acme" />
        </Row>
        <Row label="beside a field">
          <InputText style={{ width: 160 }} label="Company" defaultValue="Acme" />
          <InputTextarea style={{ width: 260 }} label="Description" placeholder="Lines up with the field while empty" />
        </Row>
        <Row label="hideLabel">
          <InputTextarea style={{ width: 260 }} label="Description" hideLabel placeholder="label hidden, still named" />
        </Row>
        <Row label="grows">
          <InputTextarea
            style={{ width: 260 }}
            label="Grows to fit"
            value={grow}
            onChange={(e) => setGrow(e.target.value)}
          />
        </Row>
        <Row label="fixed, scrolls">
          <InputTextarea style={{ width: 260 }} label="Notes" rows={3} autoResize={false} placeholder="rows={3} autoResize={false}" />
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
          + "target. Only while unchecked: a checked row is already the answer. Checked swaps to a "
          + "single shape with the tick KNOCKED OUT of it, so the tick is the ground showing through "
          + "rather than a second colour on top \u2014 which is why disabled needs only one colour. "
          + "The glyph is four filled paths exported from the Figma set, not a lucide icon and not "
          + "swappable: no strokes anywhere, so it scales rather than carrying a per-size weight. "
          + "Tab to one and "
          + "press space \u2014 it is a real input, drawn at 1px behind the glyph rather than hidden, "
          + "so the keyboard and screen-reader behaviour is the browser's."
        }
      >
        <LiveCheckbox />
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
            <Checkbox size={s} label="Hidden label" hideLabel defaultChecked />
          </Row>
        ))}
      </Section>

      <Section
        title="Radio"
        note={
          "One option of a one-of-N choice, modelled on Checkbox: the same real input drawn 1px behind "
          + "the glyph, the same XL / LG / MD sizes and label, a ring and a dot where Checkbox has a square "
          + "and a tick. Hover an unchosen option \u2014 the dot is previewed in the action colour, and the "
          + "label with it. Disabled unchosen is a solid grey disc. RadioGroup is a radiogroup that hands its "
          + "radios one name, the chosen value and onValueChange; the arrow keys move and choose, because a "
          + "shared name is the browser's own radio group. Not SegmentedControl, which asks the same "
          + "question as a track of segments."
        }
      >
        <LiveRadio />
        {(["xl", "lg", "md"] as const).map((s) => (
          <Row key={s} label={s}>
            <RadioGroup aria-label={`Units ${s}`} size={s} value={radios[s]} onValueChange={(v) => setRadios((p) => ({ ...p, [s]: v }))}>
              <Radio value="in" label="Inches" />
              <Radio value="mm" label="Millimetres" />
              <Radio value="pt" label="Points (disabled)" disabled />
            </RadioGroup>
            <Radio size={s} label="Disabled chosen" disabled defaultChecked name={`demo-${s}`} />
          </Row>
        ))}
      </Section>

      <Section
        title="LayerController"
        note={
          "One layer of a drawing. The box is a radio drawn like a checkbox: rows sharing a name are one "
          + "group, so picking a layer moves the green printer to it (arrow keys move it too). Printed shows "
          + "the grey printer with a green tick on layers done this session; the chosen layer's green printer "
          + "wins. The eye hides a layer: its rules go, number and name grey out, the eye turns to a red eye-off, and "
          + "it can't be picked. The label can be a string or a borderless input, and handleProps turns the grip into a button."
        }
      >
        <LiveLayerController />
        <Row label="group">
          <div style={{ display: "flex", flexDirection: "column", gap: 4, width: 200 }}>
            {[
              { id: "navy", n: 4, color: "#211f45", name: "Navy blue" },
              { id: "lime", n: 3, color: "#3cb227", name: "Lime green" },
              { id: "turquoise", n: 2, color: "#00838a", name: "Turquoise" },
              { id: "pink", n: 1, color: "#ee3f89", name: "Pink", printed: true },
              { id: "gone", n: 0, color: "#fdb212", name: "Marigold", cut: true },
            ].map((l) => (
              <LayerController
                key={l.id}
                name="playground-print-layer"
                number={l.n}
                color={l.color}
                swatchCut={l.cut}
                label={l.name}
                printed={l.printed}
                visible={!hiddenLayers.includes(l.id)}
                onVisibleChange={(v) => setHiddenLayers((h) => (v ? h.filter((x) => x !== l.id) : [...h, l.id]))}
                checked={printLayer === l.id}
                onChange={() => setPrintLayer(l.id)}
                handleProps={{ "aria-label": `Move ${l.name}` }}
              />
            ))}
          </div>
        </Row>
        <Row label="icon">
          <div style={{ display: "flex", flexDirection: "column", gap: 4, width: 200 }}>
            {[
              { id: "photo", n: 2, color: "#211f45", name: "Photo", photo: true },
              { id: "lines", n: 1, color: "#ee3f89", name: "Lines" },
            ].map((l) => (
              <LayerController
                key={l.id}
                name="playground-kind-layer"
                purpose="draw"
                number={l.n}
                color={l.color}
                label={l.name}
                icon={l.photo ? <PhotoGlyph /> : undefined}
                checked={kindLayer === l.id}
                onChange={() => setKindLayer(l.id)}
              />
            ))}
          </div>
        </Row>
        <Row label="editable">
          <div style={{ width: 200 }}>
            <LayerController name="playground-edit" number={1} color="#ee3f89" aria-label="Print Pink" label={<input defaultValue="Pink" aria-label="Layer name" />} />
          </div>
        </Row>
      </Section>

      <Section
        title="Tabs"
        note={
          "An in-page view switcher \u2014 NOT a nav. Nav, NavRail and BottomNav move you between "
          + "pages and are built from links; this swaps what is shown inside the page you are already "
          + "on, so it is a real tablist of buttons. Click one, then use the arrow keys: they move "
          + "between tabs and select as they go, and Home/End jump to the ends. Only the selected tab "
          + "is in the tab order, so Tab enters and leaves the strip rather than walking through every "
          + "view. Every tab reserves the space of its rule, so selecting one moves nothing, and "
          + "the selected rule slides to the new tab rather than jumping."
        }
      >
        <LiveTabs />
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
        <LiveNav />
        <Row label="example">
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
        <LiveNavDropdown />
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
        <LiveNavRail />
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
        <LiveLeftRail />
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
        <LiveBottomNav />
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
        note="The brand mark at five weights. It defaults to --ui-tc-red - the fixed personal brand, not --ui-action: change the primary above and the mark stays TC red while everything else follows. Override it with --ui-logo-color, which inherits, so an ancestor can set it. Note an ancestor's plain `color` does NOT reach the mark: .logo declares its own colour, and its declaration beats inheritance."
      >
        <LiveLogo />
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
        <LiveSpinner />
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
        <LivePill />
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
        title="Tag"
        note={
          "A small label pill. Figma: State = Default | Hover \u2014 hover one and the label reddens, "
          + "which is the whole state: no fill change and no border. NOT Pill, though they look alike: "
          + "Pill is a filter TOGGLE carrying aria-pressed, and a Tag states a fact, so it renders a "
          + "span and has nothing to toggle. The two share Figma's Pill/Radius, so the corner cannot "
          + "drift between them. Type is Label MD at Medium with no letter-spacing \u2014 it carried the "
          + "library's only SemiBold string and its only letter-spacing until 0.55.0, and both were "
          + "faithful transcriptions of the Figma cells that had quietly made it the odd one out. "
          + "`count` puts a number before the label in the brand colour, one weight lighter: it is "
          + "context, so it is quieter than the thing it qualifies."
        }
      >
        <LiveTag />
        <Row label="labels">
          <Tag>Applied</Tag>
          <Tag>Remote</Tag>
          <Tag>Full-time</Tag>
        </Row>
        {/* The count is the second thing in the library to consume --ui-brand
            at all: it is chrome on a label rather than a control, which is the
            distinction the role names were rewritten for. Drag `brand` in the
            header and only these numbers move. */}
        <Row label="count">
          <Tag count={3}>Applied</Tag>
          <Tag count={12}>Remote</Tag>
          <Tag count={0}>Rejected</Tag>
          <Tag count={7} asChild>
            <button type="button" onClick={() => {}}>Figma Mastery</button>
          </Tag>
        </Row>
        <Row label="asChild \u2014 the whole pill is the control">
          <Tag asChild>
            <button type="button" onClick={() => {}}>Accessibility &amp; Inclusive Design</button>
          </Tag>
        </Row>
        <Row label="holding a trailing control">
          <Tag style={{ ["--ui-tag-gap" as any]: "6px" }}>
            <button type="button" onClick={() => {}}>Figma Mastery</button>
            <button type="button" onClick={() => {}} aria-label="Remove Figma Mastery" title="Remove">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </Tag>
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
        <LiveInputText />
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
        <Row label="size md">
          <InputText size="md" style={{ width: 180 }} label="Input label" icon={<Layers />} iconEnd={<Layers />} defaultValue="Home" />
          <InputText size="md" style={{ width: 180 }} label="Email address" placeholder="you@example.com" />
          <InputText size="md" style={{ width: 180 }} label="Date posted" type="date" />
        </Row>
        <Row label="md, disabled">
          <InputText size="md" style={{ width: 180 }} label="Input label" icon={<Layers />} value="Home" disabled readOnly />
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
        <Row label="hideLabel">
          <InputText style={{ width: 220 }} label="Search" hideLabel icon={<Layers />} placeholder="label hidden, still named" />
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
          "can still retune the select alone. The chevron is --ui-action: it is the part that says " +
          "there is more here, which makes it a call to action rather than chrome."
        }
      >
        <LiveInputSelect />
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
        <Row label="hideLabel">
          <InputSelect style={{ width: 220 }} label="Section" hideLabel defaultValue="Design">
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
        <Row label="size md">
          <InputSelect size="md" style={{ width: 180 }} label="Work mode" icon={<Layers />} defaultValue="Hybrid">
            <option>Remote</option>
            <option>Hybrid</option>
            <option>On-site</option>
          </InputSelect>
        </Row>
        <Row label="md family, one line">
          <InputText size="md" style={{ width: 160 }} label="Company" icon={<Layers />} defaultValue="Acme" />
          <InputSelect size="md" style={{ width: 160 }} label="Status" defaultValue="Saved">
            <option>Saved</option>
            <option>Applied</option>
          </InputSelect>
          <InputTextarea size="md" style={{ width: 200 }} label="Note" rows={1} defaultValue="One line" />
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
        <LiveCard />
        <div className="cards">
          {CARDS.map((v) => (
            <div key={v}>
              <Card variant={v} style={{ height: 120 }} />
              <p className="cardLabel">{v}</p>
            </div>
          ))}
        </div>
      </Section>

    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
