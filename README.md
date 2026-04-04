# Synced Storage

Battle-tested, framework-agnostic utility for syncing **cookies**, **localStorage**, and **sessionStorage** with application state. Ships with first-class React bindings — adapters for Svelte, SolidJS, and Vue are on the way.

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
        {/* ssrCookies is optional — only needed in SSR environments */}
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
| `synced-storage/core`  | `CookieClient`, `StorageClient`, `CookieStore`, `StorageStore` |
| `synced-storage/react` | `useCookieState`, `useStorageState`, `SyncedStorageProvider`   |

## Examples

| Example                               | Stack                 | What it shows                                                                                      |
| ------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| [`examples/nextjs/`](./example/nextjs) | Next.js 16 + React    | SSR cookie hydration, `useCookieState`, `useStorageState`                                          |
| [`examples/plain/`](./example/plain)   | Vanilla JS (no build) | `CookieClient`, `StorageClient` — open `index.html` to navigate; 3 pages, CDN import via importmap |

## License

MIT
