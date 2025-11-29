# Synced Storage

Synced Storage keeps cookies, localStorage, and sessionStorage aligned with your UI. The core package is framework agnostic, while the React entry point simply wraps those primitives with familiar hooks.

## Why Synced Storage

- Works anywhere – import `synced-storage/core` inside Node scripts, server components, or any framework.
- Feels native in React – hooks mimic `useState`, so external storage reads/writes slot right into existing patterns.
- Zero layout shift for cookies – hydrate with the same value rendered on the server, especially handy in Next.js.

## Install

```bash
pnpm add synced-storage
# or
npm install synced-storage
```

## Quick Start (React)

1. **Wrap the app once** – every hook requires the provider.

```tsx
// app/layout.tsx (Next.js)
import { cookies } from "next/headers";
import { SyncedStorageProvider } from "synced-storage/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <SyncedStorageProvider ssrCookies={cookies().getAll()}>
          {children}
        </SyncedStorageProvider>
      </body>
    </html>
  );
}
```

2. **Persist cookies with `useCookieState`** – server and client share the same initial value, so no flicker after hydration.

```tsx
// app/profile/DisplayName.tsx
"use client";

import { useCookieState } from "synced-storage/react";

export function DisplayName() {
  const [name, setName] = useCookieState("displayName", "Guest", {
    strategy: "cookie",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return (
    <section>
      <p>Hello, {name}!</p>
      <button onClick={() => setName((prev) => `${prev}!`)}>
        Add excitement
      </button>
    </section>
  );
}
```

3. **Use `useStorageState` for local/session storage** – same API, changes broadcast across tabs.

```tsx
// app/settings/ThemeToggle.tsx
"use client";

import { useStorageState } from "synced-storage/react";

export function ThemeToggle() {
  const [theme, setTheme] = useStorageState("theme", "light", {
    strategy: "localStorage",
  });

  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <button onClick={() => setTheme(nextTheme)}>
      Switch to {nextTheme} mode
    </button>
  );
}
```

## API Cheat Sheet

### `SyncedStorageProvider`

| Prop          | Description                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `ssrCookies?` | Pass `cookies().getAll()` (Next.js) or any `CookieListItem[]` captured on the server so cookie hooks match between SSR and client. |
| `children`    | Render tree. Hooks throw if a provider isn’t present.                                                                              |

### `useCookieState(key, defaultValue, option?)`

| Field                        | Description                                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `key: string`                | Cookie name used by the store.                                                                                                |
| `defaultValue: TValue`       | Value returned when the cookie is missing; also drives the initial server render.                                             |
| `option?: CookieStoreOption` | Cookie metadata (`path`, `domain`, `secure`, `maxAge`, etc.), mirroring `universal-cookie` plus the required `strategy` flag. |

Returns the standard `[value, setValue]` tuple. Calling `setValue` writes to the cookie and updates every subscriber.

### `useStorageState(key, defaultValue, option?)`

| Field                         | Description                                                          |
| ----------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `key: string`                 | Storage key persisted to `localStorage` or `sessionStorage`.         |
| `defaultValue: TValue`        | Initial value when storage is empty; also used for the first render. |
| `option?: StorageStoreOption` | Choose `strategy: "localStorage"                                     | "sessionStorage"`, and optionally set `expires: Date` to auto-reset back to the default when the timer elapses. |

Returns `[value, setValue]`. Writes update the selected Web Storage bucket, emit the storage event, and stay synchronized across tabs.

## Core Usage Without React

```ts
import { CookieClient } from "synced-storage/core";

const cookies = new CookieClient(initialCookiesFromServer);
const themeStore = cookies.getOrCreateStore("theme", "light");

themeStore.setItem("dark");
const currentTheme = themeStore.getItem();
```

Each client exposes the same `Store` interface (`getItem`, `setItem`, `subscribe`, `removeItem`), so you can plug it into any environment.

## Example App

There is a ready-to-run Next.js demo under `example/` that wraps the provider, feeds SSR cookies, and shows the state staying in sync before and after hydration.
