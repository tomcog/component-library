// One live instance per component, with a control for each prop, shown at the
// top of that component's section. Each demo owns its state, so main.tsx only
// places them. The posed rows below each demo stay as the reference: every
// variant at once. This is the place to try one combination.
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  BottomNav, BottomNavItem, Button, ButtonRound, Card, Checkbox, InputSelect,
  InputText, InputTextarea, LayerController, LeftRail, Logo, Modal, Nav, NavDropdown,
  NavDropdownItem, NavItem, NavRail, NavSlat, Pill, Radio, RadioGroup, Segment, SegmentedControl,
  Spinner, Tab, Tabs, Tag, Toolbar, ToolbarExpander, ToolbarGroup,
} from "../src";
import type {
  ButtonRoundSize, ButtonRoundTone, ButtonRoundVariant, ButtonSize, ButtonTone, ButtonVariant, CardVariant,
  CheckboxSize, InputTextSize,
  LogoWeight, ModalIconColor, NavSlatLevel, RadioSize, SegmentedControlSize,
  SegmentedControlTone, SegmentedControlVariant, ToolbarOrientation, ToolbarTone,
} from "../src";
import {
  Briefcase, Eye, FileGlyph, FileText, FolderOpen, Grid, House, Images, Info, Layers,
  Magnifier, Outline, Picture, Redo, Save, Scale, Sparkle, StickyNote, Trash2, Undo, Row,
} from "./shared";

const SIZES4 = ["xl", "lg", "md", "sm"] as const;
const SIZES3 = ["xl", "lg", "md"] as const;
const INPUT_SIZES = ["lg", "md"] as const;

/* -- controls ------------------------------------------------------------ */

function Controls({ children }: { children: ReactNode }) {
  return <div className="controls">{children}</div>;
}

function Pick<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: readonly T[]; onChange: (v: T) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Check({ label, checked, onChange, disabled }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <label>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} /> {label}
    </label>
  );
}

function Text({ label, value, onChange, width = 140 }: {
  label: string; value: string; onChange: (v: string) => void; width?: number;
}) {
  return (
    <label>
      {label}
      <input type="text" value={value} style={{ width }} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Num({ label, value, onChange, min, max }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number;
}) {
  return (
    <label>
      {label}
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <code>{value}</code>
    </label>
  );
}

/* A live demo: its controls, then the one instance they drive, then a rule
   setting it apart from the posed reference rows below. */
function Live({ controls, children }: { controls: ReactNode; children: ReactNode }) {
  return (
    <>
      <Controls>{controls}</Controls>
      <Row label="live">{children}</Row>
      <hr className="demoRule" />
    </>
  );
}

const pale: CSSProperties = { display: "flex", alignItems: "flex-start", padding: 16, borderRadius: 12, background: "var(--ui-surface-pale)" };

/* -- actions ------------------------------------------------------------- */

// The label is lifted: it also drives the Button section's variant grid.
export function LiveButton({ label, setLabel }: { label: string; setLabel: (v: string) => void }) {
  const [variant, setVariant] = useState<ButtonVariant>("primary");
  const [tone, setTone] = useState<ButtonTone>("default");
  const [size, setSize] = useState<ButtonSize>("lg");
  const [icon, setIcon] = useState(true);
  const [iconEnd, setIconEnd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  return (
    <Live
      controls={<>
        <Pick label="variant" value={variant} options={["primary", "secondary", "tertiary", "ghost"]} onChange={setVariant} />
        <Pick label="size" value={size} options={SIZES4} onChange={setSize} />
        <Pick label="tone" value={tone} options={["default", "safety", "danger"]} onChange={setTone} />
        <Text label="label" value={label} onChange={setLabel} />
        <Check label="icon" checked={icon} onChange={setIcon} />
        <Check label="iconEnd" checked={iconEnd} onChange={setIconEnd} />
        <Check label="loading" checked={loading} onChange={setLoading} />
        <Check label="disabled" checked={disabled} onChange={setDisabled} />
      </>}
    >
      <Button
        variant={variant}
        tone={tone}
        size={size}
        loading={loading}
        disabled={disabled}
        icon={icon ? (tone === "danger" ? <Trash2 /> : tone === "safety" ? <Save /> : <House />) : undefined}
        iconEnd={iconEnd ? <Layers /> : undefined}
      >
        {label}
      </Button>
    </Live>
  );
}

export function LiveButtonRound() {
  const [variant, setVariant] = useState<ButtonRoundVariant>("secondary");
  const [size, setSize] = useState<ButtonRoundSize>("lg");
  const [tone, setTone] = useState<ButtonRoundTone>("default");
  const [disabled, setDisabled] = useState(false);
  const button = (
    <ButtonRound variant={variant} size={size} tone={tone} disabled={disabled} icon={tone === "danger" ? <Trash2 /> : tone === "safety" ? <Save /> : <House />} aria-label={tone === "danger" ? "Delete" : tone === "safety" ? "Save" : "Home"} />
  );
  return (
    <Live
      controls={<>
        <Pick label="variant" value={variant} options={["primary", "secondary", "tertiary", "ghost", "outline-light"]} onChange={setVariant} />
        <Pick label="size" value={size} options={SIZES4} onChange={setSize} />
        <Pick label="tone" value={tone} options={["default", "safety", "danger"]} onChange={setTone} />
        <Check label="disabled" checked={disabled} onChange={setDisabled} />
      </>}
    >
      {/* outline-light is for a button over a photo, so it is posed on one. */}
      {variant === "outline-light" ? (
        <div style={{ display: "flex", padding: 16, borderRadius: 8, background: "linear-gradient(160deg, #cfe8ff 0%, #9cc7e8 35%, #b98a5e 70%, #6b4a2e 100%)" }}>
          {button}
        </div>
      ) : button}
    </Live>
  );
}

export function LiveModal() {
  const [open, setOpen] = useState(false);
  const [iconColor, setIconColor] = useState<ModalIconColor>("danger");
  const [icon, setIcon] = useState(true);
  const [destructive, setDestructive] = useState(true);
  const [title, setTitle] = useState("Delete this job?");
  const [body, setBody] = useState("Senior Product Designer at Acme will be removed. This cannot be undone.");
  return (
    <Live
      controls={<>
        <Pick label="iconColor" value={iconColor} options={["default", "brand", "danger"]} onChange={setIconColor} />
        <Check label="icon" checked={icon} onChange={setIcon} />
        <Check label="destructive answer" checked={destructive} onChange={setDestructive} />
        <Text label="title" value={title} onChange={setTitle} width={180} />
        <Text label="body" value={body} onChange={setBody} width={260} />
      </>}
    >
      <Button size="md" onClick={() => setOpen(true)}>Open</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        icon={icon ? (destructive ? <Trash2 /> : <Save />) : undefined}
        iconColor={iconColor}
        title={title}
        actions={<>
          <Button variant="tertiary" size="md" onClick={() => setOpen(false)}>Cancel</Button>
          {destructive ? (
            <Button variant="primary" tone="danger" size="md" icon={<Trash2 />} onClick={() => setOpen(false)}>Delete</Button>
          ) : (
            <Button size="md" onClick={() => setOpen(false)}>Save</Button>
          )}
        </>}
      >
        {body}
      </Modal>
    </Live>
  );
}

/* -- toolbar and segmented ---------------------------------------------- */

export function LiveToolbar() {
  const [tone, setTone] = useState<ToolbarTone>("gray");
  const [orientation, setOrientation] = useState<ToolbarOrientation>("horizontal");
  const [size, setSize] = useState<SegmentedControlSize>("sm");
  const [variant, setVariant] = useState<SegmentedControlVariant>("dark");
  const [captions, setCaptions] = useState(false);
  const [iconOnly, setIconOnly] = useState(false);
  const [history, setHistory] = useState(true);
  const [expander, setExpander] = useState(true);
  const [actions, setActions] = useState(false);
  const [closeOnAction, setCloseOnAction] = useState(true);
  const [view, setView] = useState("preview");
  const [zoom, setZoom] = useState("plot");
  const [file, setFile] = useState("save");

  const viewCtl = (
    <SegmentedControl size={size} variant={variant} aria-label={captions ? undefined : "View"}>
      <Segment icon={<Outline />} hideLabel={iconOnly} selected={view === "outline"} onClick={() => setView("outline")}>Outline</Segment>
      <Segment icon={<Eye />} hideLabel={iconOnly} selected={view === "preview"} onClick={() => setView("preview")}>Preview</Segment>
    </SegmentedControl>
  );
  const zoomCtl = (
    <SegmentedControl size={size} variant={variant} aria-label={captions ? undefined : "Zoom"}>
      <Segment icon={<Grid />} hideLabel={iconOnly} selected={zoom === "plot"} onClick={() => setZoom("plot")}>Print area</Segment>
      <Segment icon={<StickyNote />} hideLabel={iconOnly} selected={zoom === "paper"} onClick={() => setZoom("paper")}>Paper</Segment>
      <Segment icon={<Picture />} hideLabel={iconOnly} selected={zoom === "drawing"} onClick={() => setZoom("drawing")}>Drawing</Segment>
    </SegmentedControl>
  );
  return (
    <Live
      controls={<>
        <Pick label="tone" value={tone} options={["gray", "white"]} onChange={setTone} />
        <Pick label="orientation" value={orientation} options={["horizontal", "vertical"]} onChange={setOrientation} />
        <Pick label="size" value={size} options={SIZES4} onChange={setSize} />
        <Pick label="variant" value={variant} options={["primary", "dark"]} onChange={setVariant} />
        <Check label="captions" checked={captions} onChange={setCaptions} />
        <Check label="hideLabel" checked={iconOnly} onChange={setIconOnly} />
        <Check label="history (actions)" checked={history} onChange={setHistory} />
        <Check label="expander" checked={expander} onChange={setExpander} />
        <Check label="actions" checked={actions} disabled={!expander} onChange={setActions} />
        <Check label="closeOnAction" checked={closeOnAction} disabled={!expander || !actions} onChange={setCloseOnAction} />
      </>}
    >
      {/* tone="white" is posed on the pale ground it exists for. */}
      <div style={{ ...pale, background: tone === "white" ? pale.background : undefined }}>
        <Toolbar tone={tone} orientation={orientation} aria-label="Drawing tools, live">
          {history ? (
            <SegmentedControl size={size} actions aria-label="History">
              <Segment icon={<Undo />} hideLabel={iconOnly}>Undo</Segment>
              <Segment icon={<Redo />} hideLabel={iconOnly}>Redo</Segment>
            </SegmentedControl>
          ) : null}
          {captions ? (
            <>
              <ToolbarGroup label="VIEW:">{viewCtl}</ToolbarGroup>
              <ToolbarGroup label="ZOOM:">{zoomCtl}</ToolbarGroup>
            </>
          ) : <>{viewCtl}{zoomCtl}</>}
          {expander ? (
            /* Keyed on actions: a setting and a row of actions are different
               panels, so switching remounts rather than morphing one. */
            <ToolbarExpander key={String(actions)} size={size} icon={<FileGlyph />} label="File" actions={actions} closeOnAction={actions ? closeOnAction : undefined}>
              <Segment icon={<Save />} hideLabel={iconOnly} selected={!actions && file === "save"} onClick={() => setFile("save")}>Save</Segment>
              <Segment icon={<FolderOpen />} hideLabel={iconOnly} selected={!actions && file === "open"} onClick={() => setFile("open")}>Open</Segment>
              <Segment icon={<Images />} hideLabel={iconOnly} selected={!actions && file === "export"} onClick={() => setFile("export")}>Export image</Segment>
            </ToolbarExpander>
          ) : null}
        </Toolbar>
      </div>
    </Live>
  );
}

export function LiveSegmentedControl() {
  const [size, setSize] = useState<SegmentedControlSize>("lg");
  const [variant, setVariant] = useState<SegmentedControlVariant>("primary");
  const [tone, setTone] = useState<SegmentedControlTone>("gray");
  const [actions, setActions] = useState(false);
  const [icons, setIcons] = useState(true);
  const [hideLabel, setHideLabel] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [value, setValue] = useState("preview");
  const items: [string, string, ReactNode][] = [
    ["outline", "Outline", <Outline key="o" />],
    ["preview", "Preview", <Eye key="p" />],
    ["zoom", "Zoom", <Magnifier key="z" />],
  ];
  return (
    <Live
      controls={<>
        <Pick label="size" value={size} options={SIZES4} onChange={setSize} />
        <Pick label="variant" value={variant} options={["primary", "dark"]} onChange={setVariant} />
        <Pick label="tone" value={tone} options={["gray", "white"]} onChange={setTone} />
        <Check label="actions" checked={actions} onChange={setActions} />
        <Check label="icon" checked={icons} onChange={(v) => { setIcons(v); if (!v) setHideLabel(false); }} />
        <Check label="hideLabel" checked={hideLabel} disabled={!icons} onChange={setHideLabel} />
        <Check label="last disabled" checked={disabled} onChange={setDisabled} />
      </>}
    >
      <div style={{ ...pale, background: tone === "white" ? pale.background : undefined }}>
        <SegmentedControl key={String(actions)} size={size} variant={variant} tone={tone} actions={actions} aria-label="View, live">
          {items.map(([id, label, glyph], i) => (
            <Segment
              key={id}
              icon={icons ? glyph : undefined}
              hideLabel={hideLabel}
              disabled={disabled && i === items.length - 1}
              selected={actions ? undefined : value === id}
              onClick={() => setValue(id)}
            >
              {label}
            </Segment>
          ))}
        </SegmentedControl>
      </div>
    </Live>
  );
}

/* -- form controls ------------------------------------------------------ */

export function LiveInputText() {
  const [size, setSize] = useState<InputTextSize>("lg");
  const [label, setLabel] = useState("Company");
  const [placeholder, setPlaceholder] = useState("Acme");
  const [type, setType] = useState<"text" | "email" | "date" | "password">("text");
  const [hideLabel, setHideLabel] = useState(false);
  const [icon, setIcon] = useState(true);
  const [iconEnd, setIconEnd] = useState(false);
  const [disabled, setDisabled] = useState(false);
  return (
    <Live
      controls={<>
        <Pick label="size" value={size} options={INPUT_SIZES} onChange={setSize} />
        <Pick label="type" value={type} options={["text", "email", "date", "password"]} onChange={setType} />
        <Text label="label" value={label} onChange={setLabel} />
        <Text label="placeholder" value={placeholder} onChange={setPlaceholder} />
        <Check label="hideLabel" checked={hideLabel} onChange={setHideLabel} />
        <Check label="icon" checked={icon} onChange={setIcon} />
        <Check label="iconEnd" checked={iconEnd} onChange={setIconEnd} />
        <Check label="disabled" checked={disabled} onChange={setDisabled} />
      </>}
    >
      <InputText
        style={{ width: 240 }}
        size={size}
        type={type}
        label={label}
        placeholder={placeholder}
        hideLabel={hideLabel}
        icon={icon ? <Layers /> : undefined}
        iconEnd={iconEnd ? <Layers /> : undefined}
        disabled={disabled}
      />
    </Live>
  );
}

export function LiveInputSelect() {
  const [size, setSize] = useState<InputTextSize>("lg");
  const [label, setLabel] = useState("Work mode");
  const [hideLabel, setHideLabel] = useState(false);
  const [icon, setIcon] = useState(true);
  const [disabled, setDisabled] = useState(false);
  return (
    <Live
      controls={<>
        <Pick label="size" value={size} options={INPUT_SIZES} onChange={setSize} />
        <Text label="label" value={label} onChange={setLabel} />
        <Check label="hideLabel" checked={hideLabel} onChange={setHideLabel} />
        <Check label="icon" checked={icon} onChange={setIcon} />
        <Check label="disabled" checked={disabled} onChange={setDisabled} />
      </>}
    >
      <InputSelect style={{ width: 240 }} size={size} label={label} hideLabel={hideLabel} icon={icon ? <Layers /> : undefined} disabled={disabled} defaultValue="Hybrid">
        <option>Remote</option>
        <option>Hybrid</option>
        <option>On-site</option>
      </InputSelect>
    </Live>
  );
}

export function LiveInputTextarea() {
  const [size, setSize] = useState<InputTextSize>("lg");
  const [label, setLabel] = useState("Notes");
  const [placeholder, setPlaceholder] = useState("Anything worth remembering");
  const [hideLabel, setHideLabel] = useState(false);
  const [autoResize, setAutoResize] = useState(true);
  const [disabled, setDisabled] = useState(false);
  return (
    <Live
      controls={<>
        <Pick label="size" value={size} options={INPUT_SIZES} onChange={setSize} />
        <Text label="label" value={label} onChange={setLabel} />
        <Text label="placeholder" value={placeholder} onChange={setPlaceholder} width={200} />
        <Check label="hideLabel" checked={hideLabel} onChange={setHideLabel} />
        <Check label="autoResize" checked={autoResize} onChange={setAutoResize} />
        <Check label="disabled" checked={disabled} onChange={setDisabled} />
      </>}
    >
      {/* Keyed on autoResize: it is read when the field mounts. */}
      <InputTextarea key={String(autoResize)} style={{ width: 280 }} size={size} label={label} placeholder={placeholder} hideLabel={hideLabel} autoResize={autoResize} disabled={disabled} />
    </Live>
  );
}

export function LiveCheckbox() {
  const [size, setSize] = useState<CheckboxSize>("lg");
  const [label, setLabel] = useState("Remote only");
  const [hideLabel, setHideLabel] = useState(false);
  const [checked, setChecked] = useState(true);
  const [disabled, setDisabled] = useState(false);
  return (
    <Live
      controls={<>
        <Pick label="size" value={size} options={SIZES3} onChange={setSize} />
        <Text label="label" value={label} onChange={setLabel} />
        <Check label="hideLabel" checked={hideLabel} onChange={setHideLabel} />
        <Check label="checked" checked={checked} onChange={setChecked} />
        <Check label="disabled" checked={disabled} onChange={setDisabled} />
      </>}
    >
      <Checkbox size={size} label={label} hideLabel={hideLabel} checked={checked} disabled={disabled} onChange={(e) => setChecked(e.target.checked)} />
    </Live>
  );
}

export function LiveRadio() {
  const [size, setSize] = useState<RadioSize>("lg");
  const [hideLabel, setHideLabel] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [value, setValue] = useState("cm");
  return (
    <Live
      controls={<>
        <Pick label="size" value={size} options={SIZES3} onChange={setSize} />
        <Check label="hideLabel" checked={hideLabel} onChange={setHideLabel} />
        <Check label="last disabled" checked={disabled} onChange={setDisabled} />
      </>}
    >
      <RadioGroup aria-label="Units, live" size={size} value={value} onValueChange={setValue}>
        <Radio value="cm" label="Centimetres" hideLabel={hideLabel} />
        <Radio value="in" label="Inches" hideLabel={hideLabel} />
        <Radio value="px" label="Pixels" hideLabel={hideLabel} disabled={disabled} />
      </RadioGroup>
    </Live>
  );
}

export function LiveLayerController() {
  const [label, setLabel] = useState("Pink");
  const [color, setColor] = useState("#ee3f89");
  const [purpose, setPurpose] = useState<"print" | "draw">("print");
  const [printed, setPrinted] = useState(false);
  const [swatchCut, setSwatchCut] = useState(false);
  const [icon, setIcon] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hideVisibility, setHideVisibility] = useState(false);
  const [hideHandle, setHideHandle] = useState(false);
  const [checked, setChecked] = useState(true);
  return (
    <Live
      controls={<>
        <Text label="label" value={label} onChange={setLabel} width={100} />
        <label>color<input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
        <Pick label="purpose" value={purpose} options={["print", "draw"]} onChange={setPurpose} />
        <Check label="checked" checked={checked} onChange={setChecked} />
        <Check label="printed" checked={printed} onChange={setPrinted} />
        <Check label="swatchCut" checked={swatchCut} onChange={setSwatchCut} />
        <Check label="icon" checked={icon} onChange={setIcon} />
        <Check label="visible" checked={visible} onChange={setVisible} />
        <Check label="hideVisibility" checked={hideVisibility} onChange={setHideVisibility} />
        <Check label="hideHandle" checked={hideHandle} onChange={setHideHandle} />
      </>}
    >
      <div style={{ width: 200 }}>
        <LayerController
          name="live-layer"
          number={1}
          label={label}
          color={color}
          purpose={purpose}
          printed={printed}
          swatchCut={swatchCut}
          icon={icon ? <Picture /> : undefined}
          visible={visible}
          onVisibleChange={setVisible}
          hideVisibility={hideVisibility}
          hideHandle={hideHandle}
          checked={checked}
          onChange={() => setChecked(true)}
          handleProps={{ "aria-label": `Move ${label}` }}
        />
      </div>
    </Live>
  );
}

/* -- navigation --------------------------------------------------------- */

const TAB_ITEMS: [string, string, ReactNode][] = [
  ["details", "Details", <Info key="d" />],
  ["brief", "Brief", <Sparkle key="b" />],
  ["post", "Post", <FileText key="p" />],
  ["fit", "Fit", <Scale key="f" />],
];

export function LiveTabs() {
  const [icons, setIcons] = useState(true);
  const [active, setActive] = useState("details");
  return (
    <Live
      controls={<>
        <Check label="icon" checked={icons} onChange={setIcons} />
      </>}
    >
      <div style={{ width: 576 }}>
        <Tabs aria-label="Job views, live">
          {TAB_ITEMS.map(([id, label, glyph]) => (
            <Tab key={id} icon={icons ? glyph : undefined} active={active === id} onClick={() => setActive(id)}>
              {label}
            </Tab>
          ))}
        </Tabs>
      </div>
    </Live>
  );
}

const NAV_PAGES = [
  { href: "/", label: "Jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/contacts", label: "Contacts" },
];

export function LiveNav() {
  const [underlined, setUnderlined] = useState(true);
  const [dropdown, setDropdown] = useState(true);
  const [page, setPage] = useState("/");
  return (
    <Live
      controls={<>
        <Check label="underlined" checked={underlined} onChange={setUnderlined} />
        <Check label="dropdown" checked={dropdown} onChange={setDropdown} />
      </>}
    >
      <Nav aria-label="Main, live">
        {NAV_PAGES.map((p) => (
          <NavItem key={p.href} href={p.href} underlined={underlined} active={page === p.href} onClick={(e) => { e.preventDefault(); setPage(p.href); }}>
            {p.label}
          </NavItem>
        ))}
        {dropdown ? (
          <NavDropdown label="My work">
            <NavDropdownItem href="/work/a" active={page === "/work/a"} onClick={(e) => { e.preventDefault(); setPage("/work/a"); }}>Applications</NavDropdownItem>
            <NavDropdownItem href="/work/b" active={page === "/work/b"} onClick={(e) => { e.preventDefault(); setPage("/work/b"); }}>Saved</NavDropdownItem>
          </NavDropdown>
        ) : null}
      </Nav>
    </Live>
  );
}

export function LiveNavDropdown() {
  const [label, setLabel] = useState("My work");
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [active, setActive] = useState("/work/a");
  return (
    <Live
      controls={<>
        <Text label="label" value={label} onChange={setLabel} />
        <Check label="defaultOpen" checked={defaultOpen} onChange={setDefaultOpen} />
      </>}
    >
      {/* Keyed on defaultOpen: it only applies when the dropdown mounts. */}
      <NavDropdown key={String(defaultOpen)} label={label} defaultOpen={defaultOpen}>
        {[["/work/a", "Applications"], ["/work/b", "Saved"], ["/work/c", "Archived"]].map(([href, text]) => (
          <NavDropdownItem key={href} href={href} active={active === href} onClick={(e) => { e.preventDefault(); setActive(href); }}>{text}</NavDropdownItem>
        ))}
      </NavDropdown>
    </Live>
  );
}

const RAIL_PAGES = [
  { href: "/jobs", label: "Jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/contacts", label: "Contacts" },
];

export function LiveNavRail() {
  const [level, setLevel] = useState<NavSlatLevel>("primary");
  const [icon, setIcon] = useState(false);
  const [badge, setBadge] = useState(false);
  const [sectionCurrent, setSectionCurrent] = useState(false);
  const [active, setActive] = useState("/jobs");
  return (
    <Live
      controls={<>
        <Pick label="level" value={level} options={["primary", "secondary"]} onChange={setLevel} />
        <Check label="icon" checked={icon} onChange={setIcon} />
        <Check label="badge (Companies)" checked={badge} onChange={setBadge} />
        <Check label="sectionCurrent (Contacts)" checked={sectionCurrent} onChange={setSectionCurrent} />
      </>}
    >
      <NavRail aria-label="Sections, live" style={{ width: 218 }}>
        {RAIL_PAGES.map((r) => (
          <NavSlat
            key={r.href}
            level={level}
            href={r.href}
            icon={icon ? <Briefcase /> : undefined}
            badge={badge && r.href === "/companies" ? 4 : undefined}
            sectionCurrent={sectionCurrent && r.href === "/contacts"}
            active={active === r.href}
            onClick={(e) => { e.preventDefault(); setActive(r.href); }}
          >
            {r.label}
          </NavSlat>
        ))}
      </NavRail>
    </Live>
  );
}

export function LiveLeftRail() {
  const [brand, setBrand] = useState(true);
  const [icon, setIcon] = useState(false);
  const [active, setActive] = useState("/jobs");
  return (
    <Live
      controls={<>
        <Check label="brand" checked={brand} onChange={setBrand} />
        <Check label="icon" checked={icon} onChange={setIcon} />
      </>}
    >
      <LeftRail brand={brand ? <Logo weight="medium" size={50} label="Acme" /> : undefined} style={{ width: 200, height: 320 }}>
        <NavRail aria-label="Shell sections, live">
          {RAIL_PAGES.map((r) => (
            <NavSlat key={r.href} href={r.href} icon={icon ? <Briefcase /> : undefined} active={active === r.href} onClick={(e) => { e.preventDefault(); setActive(r.href); }}>
              {r.label}
            </NavSlat>
          ))}
        </NavRail>
      </LeftRail>
    </Live>
  );
}

const BOTTOM_ITEMS = [
  { label: "Jobs", icon: Briefcase },
  { label: "Home", icon: House },
  { label: "Saved", icon: Save },
  { label: "Layers", icon: Layers },
  { label: "Search", icon: Magnifier },
];

export function LiveBottomNav() {
  const [count, setCount] = useState(4);
  const [current, setCurrent] = useState("Jobs");
  return (
    <Live controls={<Num label="items" value={count} min={2} max={5} onChange={setCount} />}>
      <div style={{ width: 375, border: "1px solid var(--ui-neutral-150)", borderRadius: 8, overflow: "hidden" }}>
        <BottomNav aria-label="Sections, live">
          {BOTTOM_ITEMS.slice(0, count).map((t) => (
            <BottomNavItem key={t.label} href={`#${t.label}`} icon={<t.icon />} current={current === t.label} onClick={(e) => { e.preventDefault(); setCurrent(t.label); }}>
              {t.label}
            </BottomNavItem>
          ))}
        </BottomNav>
      </div>
    </Live>
  );
}

/* -- display ------------------------------------------------------------ */

export function LiveLogo() {
  const [weight, setWeight] = useState<LogoWeight>("medium");
  const [size, setSize] = useState(56);
  const [label, setLabel] = useState("");
  return (
    <Live
      controls={<>
        <Pick label="weight" value={weight} options={["x-light", "light", "medium", "heavy", "x-heavy"]} onChange={setWeight} />
        <Num label="size" value={size} min={16} max={120} onChange={setSize} />
        <Text label="label (empty = decorative)" value={label} onChange={setLabel} />
      </>}
    >
      <Logo weight={weight} size={size} label={label || undefined} />
    </Live>
  );
}

export function LiveSpinner() {
  const [size, setSize] = useState(32);
  const [label, setLabel] = useState("Loading");
  return (
    <Live
      controls={<>
        <Num label="size" value={size} min={12} max={96} onChange={setSize} />
        <Text label="label (empty = decorative)" value={label} onChange={setLabel} />
      </>}
    >
      <Spinner size={size} label={label || undefined} />
    </Live>
  );
}

export function LivePill() {
  const [label, setLabel] = useState("Remote");
  const [selected, setSelected] = useState(true);
  const [disabled, setDisabled] = useState(false);
  return (
    <Live
      controls={<>
        <Text label="label" value={label} onChange={setLabel} />
        <Check label="selected" checked={selected} onChange={setSelected} />
        <Check label="disabled" checked={disabled} onChange={setDisabled} />
      </>}
    >
      <Pill selected={selected} disabled={disabled} onClick={() => setSelected(!selected)}>{label}</Pill>
    </Live>
  );
}

export function LiveTag() {
  const [label, setLabel] = useState("Applied");
  const [showCount, setShowCount] = useState(true);
  const [count, setCount] = useState(3);
  return (
    <Live
      controls={<>
        <Text label="label" value={label} onChange={setLabel} />
        <Check label="count" checked={showCount} onChange={setShowCount} />
        <Num label="value" value={count} min={0} max={120} onChange={setCount} />
      </>}
    >
      <Tag count={showCount ? count : undefined}>{label}</Tag>
    </Live>
  );
}

export function LiveCard() {
  const [variant, setVariant] = useState<CardVariant>("float1");
  const [height, setHeight] = useState(120);
  return (
    <Live
      controls={<>
        <Pick label="variant" value={variant} options={["flat", "float1", "float2"]} onChange={setVariant} />
        <Num label="height" value={height} min={40} max={240} onChange={setHeight} />
      </>}
    >
      <Card variant={variant} style={{ width: 280, height }} />
    </Live>
  );
}
