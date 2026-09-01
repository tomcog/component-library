import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
// Import from source, not dist, so edits hot-reload.
import { Button } from "../src";
import type { ButtonVariant, ButtonSize } from "../src";
import "../src/fonts/fonts.css";
import "./playground.css";

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "tertiary", "ghost"];
const SIZES: ButtonSize[] = ["large", "medium", "small"];

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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="row">
      <span className="rowLabel">{label}</span>
      <div className="rowItems">{children}</div>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {note ? <p className="note">{note}</p> : null}
      {children}
    </section>
  );
}

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [brand, setBrand] = useState("#e51a38");
  const [size, setSize] = useState<ButtonSize>("large");
  const [loading, setLoading] = useState(false);
  const [lead, setLead] = useState(true);
  const [trail, setTrail] = useState(false);

  return (
    <div className="page" data-theme={theme} style={{ ["--ui-brand" as string]: brand }}>
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
            brand
            <input type="color" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </label>
          <button className="reset" onClick={() => setBrand("#e51a38")}>reset</button>
        </div>
      </header>

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
