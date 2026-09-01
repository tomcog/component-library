# Component Library — Starter Brief

## Goal
Stand up a standalone, publishable package (`@yourscope/ui`) containing one component (Button) with CSS Modules + design tokens, ready to `npm link` into an existing app for testing before publishing.

Replace `@yourscope` with the actual npm scope/org name before running.

## Repo structure

```
ui-library/
├── src/
│   ├── components/
│   │   └── Button/
│   │       ├── Button.tsx
│   │       ├── Button.module.css
│   │       └── index.ts
│   ├── tokens.css
│   └── index.ts
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── .gitignore
```

## package.json

```json
{
  "name": "@yourscope/ui",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

## tsup.config.ts

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  injectStyle: false, // keep CSS as separate output files
  loader: {
    ".module.css": "copy",
  },
});
```

Note: CSS Modules output handling with tsup can be finicky — if `injectStyle`/loader config doesn't cleanly emit scoped CSS, fall back to a small Vite library-mode build instead (`vite build --lib`), which has first-class CSS Modules support out of the box. Try tsup first since it's simpler; swap to Vite lib mode if the CSS pipeline fights you.

## src/tokens.css

```css
:root {
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Color — placeholders, replace with real brand values */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-active: #1e40af;
  --color-neutral-100: #f5f5f5;
  --color-neutral-900: #171717;
  --color-danger: #dc2626;

  /* Type */
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-weight-medium: 500;
}
```

## src/components/Button/Button.module.css

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: none;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.primary {
  background: var(--color-primary);
  color: white;
}
.primary:hover { background: var(--color-primary-hover); }
.primary:active { background: var(--color-primary-active); }

.secondary {
  background: var(--color-neutral-100);
  color: var(--color-neutral-900);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## src/components/Button/Button.tsx

```tsx
import { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={[styles.button, styles[variant], className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
```

*(Placeholder API — before finalizing, audit the existing apps' current button implementations for real variants/states in use: size, loading, icon-only, etc. Adjust props accordingly rather than guessing ahead of the audit.)*

## src/components/Button/index.ts
```ts
export { Button } from "./Button";
```

## src/index.ts
```ts
export * from "./components/Button";
import "./tokens.css";
```

## Steps for Claude Code to execute
1. Scaffold the file tree above with the given contents.
2. `npm install` (or pnpm/yarn per existing app conventions) to pull in tsup/TypeScript/React.
3. Run `npm run build` and confirm `dist/` outputs `index.js`, `index.d.ts`, and the Button's CSS.
4. In one target app's `node_modules`, run `npm link` from the ui-library repo, then `npm link @yourscope/ui` from the app, and confirm the Button imports and renders with scoped styles applied (not leaking into or colliding with the app's existing CSS).
5. Report back what worked and any tsup/CSS Modules issues hit, so the next component can avoid the same friction.
