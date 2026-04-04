import { StorageClient } from "synced-storage/core";

import { el, stamp } from "./utils";

export function init(storageClient: StorageClient): void {
  const localStore = storageClient.getOrCreateStore<string>(
    "demo-message",
    "",
    { strategy: "localStorage" },
  );

  localStore.subscribe((value) => {
    el("local-value").textContent = value || "—";
    el("local-meta").textContent = `Last updated: ${stamp()}`;
  });

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
}
