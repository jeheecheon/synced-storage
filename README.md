# Synced Storage

A small, framework‑agnostic utility for syncing **cookies**, **localStorage**, and **sessionStorage** with application state.  
The core is fully portable — it isn’t tied to React — so adapters for **Svelte**, **SolidJS**, and **Vue** will be added soon.

---

## What this package does

### ✔ One simple, unified API

Use the same pattern to read, write, and sync values across cookies and browser storage.

### ✔ Works in both server and client environments

Cookie values can be hydrated on the server, and the browser side seamlessly continues from that state.

### ✔ Portable core

The core logic does not depend on React, making it easy to support any UI framework.

---

## Installation

```bash
npm install synced-storage
```

---

## Quick start (React)

### 1. Wrap your app with SyncedStorageProvider

```tsx
import { cookies } from "next/headers";
import { SyncedStorageProvider } from "synced-storage/react";

export default async function RootLayout({ children }) {
  const initialCookies = await cookies();

  return (
    <html>
      <body>
        {/* `ssrCookies` is optional – only pass this in SSR env. */}
        <SyncedStorageProvider ssrCookies={initialCookies.getAll()}>
          {children}
        </SyncedStorageProvider>
      </body>
    </html>
  );
}
```

### 2. Cookie state

```tsx
"use client";

import { useCookieState } from "synced-storage/react";

export function DisplayName() {
  const [name, setName] = useCookieState<string>("displayName", "Guest");

  return (
    <div>
      <p>Hello, {name}</p>
      <button onClick={() => setName((n) => n + "!")}>Add excitement</button>
    </div>
  );
}
```

### 3. Local/session storage

```tsx
"use client";

import { useStorageState } from "synced-storage/react";

export function ThemeToggle() {
  const [theme, setTheme] = useStorageState<string>("theme", "light");

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Toggle theme
    </button>
  );
}
```

---

## Core usage (any framework)

You can use the storage core directly — no React required.

```ts
import { CookieClient } from "synced-storage/core";

const cookieClient = new CookieClient();
const store = cookieClient.getOrCreateStore<string>("theme", "light");

store.subscribe(() => {
  const value = store.getItem();
  console.log(`Changed to ${value}`);
});

store.setItem("dark");
```

---

## Example

A working Next.js example lives in the `example/` folder.  
It demonstrates SSR cookies, client hydration, and synced web storage.

---

## License

MIT
