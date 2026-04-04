import { CookieClient, StorageClient } from "synced-storage/core";

// ── helpers ──────────────────────────────────────────────────────────────────

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function stamp(): string {
  return new Date().toLocaleTimeString();
}

// ── Cookie store ─────────────────────────────────────────────────────────────

const cookieClient = new CookieClient();
const cookieStore = cookieClient.getOrCreateStore<number>("demo-counter", 0);

cookieStore.subscribe((value) => {
  el("cookie-value").textContent = String(value);
  el("cookie-meta").textContent = `Last updated: ${stamp()}`;
});

// Render initial value
el("cookie-value").textContent = String(cookieStore.getItem());

el("cookie-inc").addEventListener("click", () => {
  cookieStore.setItem((prev) => prev + 1);
});

el("cookie-dec").addEventListener("click", () => {
  cookieStore.setItem((prev) => prev - 1);
});

el("cookie-reset").addEventListener("click", () => {
  cookieStore.setItem(0);
});

// ── localStorage store ────────────────────────────────────────────────────────

const storageClient = new StorageClient();
const localStore = storageClient.getOrCreateStore<string>(
  "demo-message",
  "",
  { strategy: "localStorage" },
);

localStore.subscribe((value) => {
  el("local-value").textContent = value || "—";
  el("local-meta").textContent = `Last updated: ${stamp()}`;
});

// Render initial value
el("local-value").textContent = localStore.getItem() || "—";

el("local-save").addEventListener("click", () => {
  const input = el<HTMLInputElement>("local-input");
  localStore.setItem(input.value);
  input.value = "";
});

el<HTMLInputElement>("local-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    el("local-save").click();
  }
});

el("local-clear").addEventListener("click", () => {
  localStore.removeItem();
  el("local-value").textContent = "—";
  el("local-meta").textContent = `Cleared at: ${stamp()}`;
});

// ── sessionStorage store with expiry ─────────────────────────────────────────

const EXPIRY_MS = 15_000;
let timerInterval: ReturnType<typeof setInterval> | null = null;
let expiryTimeout: ReturnType<typeof setTimeout> | null = null;
let expiryAt: number | null = null;

const sessionStore = storageClient.getOrCreateStore<string>(
  "demo-session",
  "",
  { strategy: "sessionStorage" },
);

sessionStore.subscribe((value) => {
  el("session-value").textContent = value || "—";
  el("session-meta").textContent = `Last updated: ${stamp()}`;
});

// Render initial value
el("session-value").textContent = sessionStore.getItem() || "—";

function startProgressBar() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
  }

  expiryAt = Date.now() + EXPIRY_MS;

  timerInterval = setInterval(() => {
    if (expiryAt === null) { return; }

    const remaining = expiryAt - Date.now();
    const pct = Math.max(0, (remaining / EXPIRY_MS) * 100);
    const bar = el("timer-bar");
    bar.style.width = `${pct}%`;
    bar.style.background = pct > 40 ? "#10b981" : pct > 15 ? "#f59e0b" : "#ef4444";

    if (remaining <= 0) {
      clearInterval(timerInterval!);
      timerInterval = null;
      expiryAt = null;
    }
  }, 200);
}

el("session-set").addEventListener("click", () => {
  // Cancel any in-flight expiry so re-clicking resets the timer cleanly
  if (expiryTimeout !== null) {
    clearTimeout(expiryTimeout);
  }

  sessionStore.setItem(`Set at ${stamp()}`);
  startProgressBar();

  // After EXPIRY_MS, remove the item — subscriber fires and updates the display
  expiryTimeout = setTimeout(() => {
    expiryTimeout = null;
    sessionStore.removeItem();
    // Override the generic "—" from the subscriber with a more informative label
    el("session-value").textContent = "(expired)";
    el("session-meta").textContent = `Expired at: ${stamp()}`;
  }, EXPIRY_MS);
});

el("session-reset").addEventListener("click", () => {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (expiryTimeout !== null) {
    clearTimeout(expiryTimeout);
    expiryTimeout = null;
  }

  expiryAt = null;
  el("timer-bar").style.width = "0%";
  sessionStore.removeItem();
  // Override subscriber output with "—" for the reset state
  el("session-value").textContent = "—";
  el("session-meta").textContent = `Reset at: ${stamp()}`;
});
