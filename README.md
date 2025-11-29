# Synced Storage

Synced Storage keeps external stores (cookies, localStorage, sessionStorage) in lockstep with your UI. The core package stays framework-agnostic, while the optional React layer simply provides ergonomic hooks built on top of those primitives.

## Highlights

- **Framework-agnostic core** – import `synced-storage/core` to use the same storage clients inside any runtime or framework without React.
- **React-friendly hooks** – `useCookieState` (and its storage sibling) mirrors the semantics of `useState`, so persisting remote storage feels exactly like updating component state.
- **SSR-stable cookies** – pass server-side cookies to the provider and `useCookieState` will emit identical values during SSR and after hydration, preventing layout shifts.

## Installation

```bash
pnpm add synced-storage
# or
npm install synced-storage
```

## React Quick Start

1. **Wrap your tree with the provider** (required for every hook):

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

2. **Use the hook exactly like `useState`, but against cookies**:

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

Because the server passes the same cookie values to the `SyncedStorageProvider`, the hook returns the correct initial value during SSR and after hydration—no flicker or layout shift.

## API Reference

### `SyncedStorageProvider`

- **`ssrCookies?: CookieListItem[]`** – optional array of cookies captured on the server (e.g., `cookies().getAll()` in Next.js). Providing this ensures the hook can read the real cookie value before the browser takes over.
- Wrap every component that calls `useCookieState` or any future storage hooks. The hooks will throw if no provider is found.

### `useCookieState(key, defaultValue, option?)`

| Parameter                    | Description                                                                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key: string`                | Cookie name used internally by the store.                                                                                                           |
| `defaultValue: TValue`       | Fallback value when no cookie exists. Keeps server and client renders aligned.                                                                      |
| `option?: CookieStoreOption` | Optional cookie metadata (path, domain, secure, maxAge, etc.). This maps directly to `universal-cookie` options plus the `strategy: "cookie"` flag. |

Return value matches React’s `useState` tuple: `[value: TValue, setValue: Dispatch<SetStateAction<TValue>>]`. Updates go straight into the cookie and notify every subscriber that shares the same key.

## Using the Core Layer Elsewhere

Need the same behavior outside React? Import clients directly:

```ts
import { CookieClient } from "synced-storage/core";

const cookies = new CookieClient(initialCookiesFromServer);
const themeStore = cookies.getOrCreateStore("theme", "light");

themeStore.setItem("dark");
const currentTheme = themeStore.getItem();
```

The core clients expose a simple `Store` interface (`getItem`, `setItem`, `subscribe`, etc.), so you can plug them into any framework or even a Node process.

## Example Project

See the `example/` directory for a runnable Next.js demo that wires up the provider, feeds SSR cookies, and showcases how the value stays perfectly in sync before and after hydration.
