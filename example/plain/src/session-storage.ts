import { StorageClient } from "synced-storage/core";

import { el, stamp } from "./utils";

const EXPIRY_MS = 15_000;

export function init(storageClient: StorageClient): void {
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

  el("session-value").textContent = sessionStore.getItem() || "—";

  function startProgressBar(): void {
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
    if (expiryTimeout !== null) {
      clearTimeout(expiryTimeout);
    }

    sessionStore.setItem(`Set at ${stamp()}`);
    startProgressBar();

    expiryTimeout = setTimeout(() => {
      expiryTimeout = null;
      sessionStore.removeItem();
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
    el("session-value").textContent = "—";
    el("session-meta").textContent = `Reset at: ${stamp()}`;
  });
}
