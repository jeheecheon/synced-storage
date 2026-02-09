# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`synced-storage` — framework-agnostic utility for syncing cookies, localStorage, and sessionStorage with app state. Ships React bindings; Svelte, SolidJS, Vue adapters planned.

## Commands

```bash
pnpm dev              # Watch mode (tsup)
pnpm build            # Production build (ESM + CJS + .d.ts)
pnpm clean            # Remove dist/
pnpm package:publish  # Build + publish to npm
```

Example app (Next.js, `./example/`):

```bash
pnpm --filter example dev     # Dev server :3000
pnpm --filter example build
pnpm --filter example lint    # ESLint (only in example)
```

No root-level linter configured.

## Architecture

Two-layer design: framework-agnostic core + framework-specific bindings.

### Core (`src/core/`)

Reactive store pattern. Both store types implement `Store<TItem>` (`subscribe`, `getItem`, `getInitialItem`, `setItem`, `removeItem`). All values JSON-serialized; deserialization failures fall back to `defaultItem`.

- **CookieClient / CookieStore** — wraps `universal-cookie`. Caches stores by key. Accepts initial cookies for SSR hydration.
- **StorageClient / StorageStore** — wraps `localStorage`/`sessionStorage`. Dispatches `StorageEvent` for same-tab sync, listens `window.storage` for cross-tab sync. Supports key expiration via `setTimeout`.

### React (`src/react/`)

- **SyncedStorageProvider** — context providing both clients. Accepts optional `ssrCookies`.
- **useCookieState / useStorageState** — `[state, setState]` tuples. Subscribe via `useLayoutEffect`.

**Important:** Source of truth for functional `setState` is React's own state, not `store.getItem()`. This prevents stale closure bugs.

## Exports

- `synced-storage/core` — store clients (framework-agnostic)
- `synced-storage/react` — hooks + provider

## Tooling

- **pnpm** workspace (root + `./example/`)
- **tsup** — ESM + CJS, declarations, source maps, no minification
- **TypeScript** — strict, ES2020, `@/*` → `src/*`
- **Peer dep:** `react >=16.8.0` (optional)

## Code Style

- Early returns must use braces: `if (cond) { return; }` — never single-line `if (cond) return;`
- Add a blank line after closing braces `}` before the next statement
