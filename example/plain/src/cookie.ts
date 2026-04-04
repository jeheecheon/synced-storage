import { CookieClient } from "synced-storage/core";

import { el, stamp } from "./utils";

export function init(): void {
  const cookieClient = new CookieClient();
  const cookieStore = cookieClient.getOrCreateStore<number>("demo-counter", 0);

  cookieStore.subscribe((value) => {
    el("cookie-value").textContent = String(value);
    el("cookie-meta").textContent = `Last updated: ${stamp()}`;
  });

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
}
