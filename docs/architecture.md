# Architecture

**Last Updated:** April 4, 2026
**Architecture:** Two-Layer Library (Framework-Agnostic Core + Framework Bindings)

---

## Overview

`synced-storage` is a reactive storage library with a strict two-layer design: a framework-agnostic **core** that handles all storage logic, and thin **framework bindings** that wire it into UI frameworks.

### Core Principles

1. **Framework isolation:** The core has zero framework dependencies. It can run in Node, a Web Worker, or any future runtime.
2. **Single interface:** `CookieStore` and `StorageStore` both implement `Store<TItem>` — callers never need to know which backend they're talking to.
3. **Client as factory:** Clients (`CookieClient`, `StorageClient`) own the store cache. Same key always returns the same store instance.
4. **React state is source of truth:** Hooks hold state in React — not in the store. This prevents stale closure bugs with functional `setState`.
5. **Same-tab sync via synthetic events:** `StorageStore.setItem` dispatches a synthetic `StorageEvent` so all subscribers in the same tab receive updates, mirroring the native cross-tab behavior.

---

## Directory Structure

```
src/
├── core/
│   ├── types.ts              # Store<TItem>, BaseStoreClient, option types
│   ├── CookieClient.ts       # Factory + cache for CookieStore instances
│   ├── CookieStore.ts        # Cookie read/write/subscribe via universal-cookie
│   ├── StorageClient.ts      # Factory + cache for StorageStore instances
│   ├── StorageStore.ts       # localStorage/sessionStorage read/write/subscribe
│   └── index.ts              # Re-exports for synced-storage/core
│
├── react/
│   ├── SyncedStorageProvider.tsx   # Context — instantiates both clients
│   ├── useCookieState.ts           # [state, setState] for cookies
│   ├── useStorageState.ts          # [state, setState] for localStorage/sessionStorage
│   └── index.ts                    # Re-exports for synced-storage/react
│
├── types/
│   └── misc.ts               # Nullable<T>, Optional<T>, Maybe<T>
│
├── utils/
│   └── misc.ts               # safelyGet, isFunction, isBrowser
│
└── index.ts                  # Barrel (not a public entry point)
```

---

## Core Layer (`src/core/`)

### `Store<TItem>` Interface

The single interface implemented by both store types:

```typescript
type Store<TItem> = {
  subscribe: (listener: Listener<TItem>) => Unsubscriber;
  getItem: () => TItem;
  getInitialItem: () => TItem;
  setItem: (item: TItem | ((prev: TItem) => TItem)) => void;
  removeItem: () => void;
};
```

`setItem` accepts both a value and a functional updater — consistent with React's `setState` API.

### `BaseStoreClient`

Abstract base for both clients. Enforces the `storeCache` and `getOrCreateStore` contract:

```typescript
abstract class BaseStoreClient<TItem = unknown> {
  protected abstract readonly storeCache: Map<string, Readonly<Store<TItem>>>;
  public abstract getOrCreateStore(key, defaultItem, option): Readonly<Store<TItem>>;
}
```

### `CookieClient` / `CookieStore`

- `CookieClient` caches stores by `key`; accepts `initialCookies` for SSR hydration
- On construction, `CookieClient` resolves the initial value: parses the matching SSR cookie if present, otherwise falls back to `defaultItem`
- `CookieStore` wraps `universal-cookie`; change notifications come from `Cookies.addChangeListener`
- All values are JSON-serialized before writing; `safelyGet(() => JSON.parse(...))` guards deserialization — failures fall back to `defaultItem`

```typescript
const client = new CookieClient(ssrCookies); // ssrCookies: CookieListItem[]
const store = client.getOrCreateStore("theme", "light");

store.subscribe((value) => console.log(value));
store.setItem("dark");
```

### `StorageClient` / `StorageStore`

- `StorageClient` caches stores by `${strategy}-${key}` — same key under different strategies is a different store
- `StorageStore` reads/writes `localStorage` or `sessionStorage` based on `strategy`
- **Cross-tab sync:** subscribes to `window.storage` (native browser event, fires only for other tabs)
- **Same-tab sync:** `setItem` and `removeItem` manually dispatch a synthetic `StorageEvent` on `window` so same-tab subscribers also fire
- **Key expiration:** if `expires` is set, a `setTimeout` fires at the deadline, resets the value to `defaultItem`, and marks `isExpired = true` to block further writes

```typescript
const client = new StorageClient();
const store = client.getOrCreateStore("count", 0, {
  strategy: "localStorage",
  expires: new Date("2026-12-31"),
});
```

---

## React Layer (`src/react/`)

### `SyncedStorageProvider`

Creates one `CookieClient` and one `StorageClient` instance per provider, memoized on `ssrCookies`. Exposes them via React context.

```tsx
<SyncedStorageProvider ssrCookies={(await cookies()).getAll()}>
  {children}
</SyncedStorageProvider>
```

Both clients are instantiated here — not inside the hooks — so the store cache is shared across all hooks in the tree.

### `useCookieState` / `useStorageState`

Both hooks follow the same pattern:

1. Read the store from context via the client
2. Initialize React state with `store.getInitialItem()` (SSR-safe: uses the hydrated value)
3. In `useLayoutEffect`: sync to `store.getItem()` (handles any update between SSR and mount), then subscribe for future changes
4. Return `[state, setState]` where `setState` calls `store.setItem`

**Why React state, not `store.getItem()`:**

```typescript
// WRONG — stale closure: `store` captured at call time, getItem() may lag
const setState = (action) => _setState(store.getItem());

// CORRECT — React's own updater receives the latest value
const setState = useCallback((action) => {
  store.setItem(action); // store fires listener → _setState(value)
}, [store]);
```

The store is the write path; React state is the read path.

---

## Data Flow

### Write (same tab)

```
setState(newVal)
  → store.setItem(newVal)
    → serialize → write to storage
    → dispatch synthetic StorageEvent
      → store subscriber fires
        → _setState(newVal)          ← React re-renders
```

### Write (cross-tab)

```
Tab A: store.setItem(newVal) → writes to localStorage
  → browser fires native StorageEvent on Tab B's window
    → Tab B's store subscriber fires
      → Tab B's _setState(newVal)    ← Tab B re-renders
```

### SSR Hydration (cookie)

```
Server: CookieClient(ssrCookies) → store.getInitialItem() = parsed SSR value
  → useCookieState: useState(store.getInitialItem())   ← no flash
Client: useLayoutEffect → store.getItem() (live cookie) → _setState if changed
```

---

## Exports

| Entry point | Contents |
|---|---|
| `synced-storage/core` | `CookieClient`, `StorageClient`, `CookieStore`, `StorageStore`, `Store`, `BaseStoreClient` |
| `synced-storage/react` | `useCookieState`, `useStorageState`, `SyncedStorageProvider` |

Both entries ship ESM (`.mjs`) + CJS (`.js`) + TypeScript declarations. `sideEffects: false` enables tree-shaking.

---

## Adding a Framework Adapter

To add a Svelte, SolidJS, or Vue adapter:

**Step 1 — Create `src/<framework>/` directory.**

**Step 2 — Instantiate both clients** (same as `SyncedStorageProvider`):

```typescript
import { CookieClient, StorageClient } from "synced-storage/core";

const cookieClient = new CookieClient();
const storageClient = new StorageClient();
```

**Step 3 — Wire `store.subscribe` into the framework's reactivity system.** The pattern:

- Initialize reactive state with `store.getInitialItem()`
- On mount: sync to `store.getItem()`, then call `store.subscribe(setValue)`
- On unmount: call the returned unsubscriber
- Expose a setter that calls `store.setItem`

**Step 4 — Add the entry point to `tsup.config.ts` and `package.json#exports`:**

```json
{
  "exports": {
    "./svelte": {
      "import": "./dist/svelte/index.mjs",
      "require": "./dist/svelte/index.js"
    }
  }
}
```

The core is the only dependency — no React needed.

---

## FAQ

### Q: Why is `getInitialItem` separate from `getItem`?

**A:** For SSR cookie hydration. `getInitialItem` returns the value parsed from the server-side cookie passed to `CookieClient`. `getItem` reads the live cookie from the browser. Using `getInitialItem` for `useState` initialization prevents a hydration mismatch; `getItem` in `useLayoutEffect` syncs to the live value after mount.

### Q: Why dispatch a synthetic `StorageEvent` for same-tab writes?

**A:** The browser only fires `window.storage` for changes made by *other* tabs. Writing from the same tab produces no event. Dispatching a synthetic one unifies the subscription model: all subscribers use `window.addEventListener("storage", ...)` regardless of which tab triggered the change.

### Q: Why cache stores in the client instead of the hook?

**A:** If hooks created stores directly, two hooks using the same key would get two independent store instances with separate subscriber lists. Caching in the client guarantees that `getOrCreateStore("theme", ...)` always returns the same object — so all subscribers share one notification channel.

### Q: Can `StorageStore` be used outside the browser?

**A:** No. It accesses `localStorage`, `sessionStorage`, and `window` directly. The `isBrowser()` guard in the expiration logic is the only SSR accommodation. For SSR use cases, use `CookieClient` with `initialCookies`.
