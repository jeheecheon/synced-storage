# Synced Storage

[![npm version](https://img.shields.io/npm/v/synced-storage)](https://www.npmjs.com/package/synced-storage)
[![npm downloads](https://img.shields.io/npm/dm/synced-storage)](https://www.npmjs.com/package/synced-storage)
[![bundle size](https://deno.bundlejs.com/badge?q=synced-storage&treeshake=[*])](https://bundlejs.com/?q=synced-storage&treeshake=[*])
[![license](https://img.shields.io/npm/l/synced-storage)](https://github.com/jeheecheon/synced-storage/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Framework-agnostic utility for syncing **cookies**, **localStorage**, and **sessionStorage** with application state. Ships with first-class React bindings — adapters for Svelte, SolidJS, and Vue are on the way.

## Why?

Client-side storage is invisible to the server. When UI state lives in `localStorage`, SSR renders the default state and the client corrects it after hydration, causing a visible layout shift — a sidebar the user collapsed last visit snaps shut after first paint.

`synced-storage` treats cookies as state the server can read. Pass the request's cookies to the provider, and the server renders the same initial state the client hydrates with.

Note that reading request cookies opts a route into dynamic rendering (`cookies()` in Next.js disables static rendering and ISR for that route), so SSR cookie hydration fits pages that are already rendered per-request. For static pages, keep the state in `localStorage` and accept the client-side correction.

For state that doesn't need SSR, the same API syncs `localStorage` across tabs and `localStorage`/`sessionStorage` within a tab.

## Features

- **Unified API** — read, write, and subscribe to cookies and web storage through the same interface
- **SSR-ready** — hydrate cookie values on the server; the client picks up seamlessly
- **Cross-tab & same-tab sync** — storage changes propagate across tabs via native `StorageEvent` and within the same tab via synthetic events
- **Key expiration** — set a `Date` on any storage key and it auto-resets when it expires
- **Functional setState** — `setState(prev => ...)` always receives the latest value, no stale closures
- **Portable core** — zero React dependency; use the core with any framework
- **Tiny footprint** — single production dependency (`universal-cookie`)
- **Tree-shakeable** — ESM + CJS with `sideEffects: false`
- **Fully typed** — written in TypeScript with exported declarations
- **Tested** — core stores and React hooks covered with Vitest + Testing Library

## Installation

```bash
npm install synced-storage
```

## Core Usage (Any Framework)

Use the storage core directly — no React required.

```ts
import { CookieClient } from "synced-storage/core";

const client = new CookieClient();
const store = client.getOrCreateStore("theme", "light");

store.subscribe((value) => {
  console.log(`theme changed to ${value}`);
});

store.setItem("dark");
```

## Quick Start (React)

### 1. Wrap your app with SyncedStorageProvider

```tsx
import { cookies } from "next/headers";
import { SyncedStorageProvider } from "synced-storage/react";

export default async function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* ssrCookies lets the server render with the client's cookie state,
            preventing hydration mismatch and layout shift (optional — SSR only) */}
        <SyncedStorageProvider ssrCookies={(await cookies()).getAll()}>
          {children}
        </SyncedStorageProvider>
      </body>
    </html>
  );
}
```

### 2. Cookie state

```tsx
import { useCookieState } from "synced-storage/react";

function PersonDetails() {
  const [person, setPerson] = useCookieState("person", {
    name: "Jane",
    age: 30,
  });

  return (
    <div>
      <p>
        {person.name}, {person.age}
      </p>
      <button
        onClick={() => setPerson((prev) => ({ ...prev, age: prev.age + 1 }))}
      >
        +1
      </button>
    </div>
  );
}
```

### 3. Local / session storage

```tsx
import { useStorageState } from "synced-storage/react";

type Theme = "light" | "dark";

function ThemeToggle() {
  const [theme, setTheme] = useStorageState<Theme>("theme", "light", {
    strategy: "localStorage", // or "sessionStorage"
  });

  return (
    <div>
      <p>{theme}</p>
      <button
        onClick={() =>
          setTheme((prev) => (prev === "light" ? "dark" : "light"))
        }
      >
        Toggle theme
      </button>
    </div>
  );
}
```

## Exports

| Entry point            | Contents                                                       |
| ---------------------- | -------------------------------------------------------------- |
| `synced-storage`       | Same as `synced-storage/core`                                  |
| `synced-storage/core`  | `CookieClient`, `StorageClient`, `CookieStore`, `StorageStore` |
| `synced-storage/react` | `useCookieState`, `useStorageState`, `SyncedStorageProvider`   |

## Examples

| Example                                 | Stack                 | What it shows                                                                                      |
| --------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| [`examples/nextjs/`](./examples/nextjs) | Next.js 16 + React    | SSR cookie hydration, `useCookieState`, `useStorageState`                                          |
| [`examples/plain/`](./examples/plain)   | Vanilla JS (no build) | `CookieClient`, `StorageClient` — open `index.html` to navigate; 3 pages, CDN import via importmap |

## License

MIT
