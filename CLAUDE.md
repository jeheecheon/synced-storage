# synced-storage

Framework-agnostic utility for syncing cookies, localStorage, and sessionStorage with app state. Ships React bindings; Svelte, SolidJS, Vue adapters planned.

## Git

- Do NOT commit unless the user explicitly requests it

### Commit Messages

Format: `<type>: <content>`

- Types: `feat`, `refactor`, `fix`, `chore`, `docs`
- Content: short, English only
- NEVER add `Co-Authored-By`, `Co-authored-by`, or any AI/bot attribution

## Commands

```bash
pnpm dev              # Watch mode (tsup)
pnpm build            # Production build (ESM + CJS + .d.ts)
pnpm clean            # Remove dist/
pnpm package:publish  # Build + publish to npm
pnpm dev:nextjs       # Build + start Next.js example :3000
```

Next.js example (`./example/nextjs/`):

```bash
pnpm --filter example-nextjs dev     # Next.js dev server :3000
pnpm --filter example-nextjs build
pnpm --filter example-nextjs lint    # ESLint (only in example-nextjs)
```

Plain example (`./example/plain/`): `index.html`, no build step — open directly in browser.

## Architecture

Two-layer design: framework-agnostic core + framework-specific bindings.

### Core (`src/core/`)

Both store types implement `Store<TItem>` (`subscribe`, `getItem`, `getInitialItem`, `setItem`, `removeItem`). Values are JSON-serialized; deserialization failures fall back to `defaultItem`.

- **CookieClient / CookieStore** — wraps `universal-cookie`; caches stores by key; accepts initial cookies for SSR hydration
- **StorageClient / StorageStore** — wraps `localStorage`/`sessionStorage`; dispatches `StorageEvent` for same-tab sync; listens `window.storage` for cross-tab sync; supports key expiration via `setTimeout`

### React (`src/react/`)

- **SyncedStorageProvider** — context providing both clients; accepts optional `ssrCookies`
- **useCookieState / useStorageState** — `[state, setState]` tuples; subscribe via `useLayoutEffect`
- Source of truth for functional `setState` is React's own state, not `store.getItem()` — prevents stale closure bugs

## Exports

- `synced-storage/core` — store clients (framework-agnostic)
- `synced-storage/react` — hooks + provider

## Tooling

- **pnpm** workspace (root + `./example/nextjs/`); no root-level linter
- **tsup** — ESM + CJS, declarations, source maps, no minification
- **TypeScript** — strict, ES2020, `@/*` → `src/*`
- **Peer dep:** `react >=16.8.0` (optional)

## Code Style

- Early returns must use braces: `if (cond) { return; }` — never `if (cond) return;`
- Add blank line after closing `}` before the next statement

## CLAUDE.md Editing

- Use precise technical terms; no filler
- Keep entries minimal to reduce token/context waste
