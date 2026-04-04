import { StorageClient } from "https://esm.sh/synced-storage@1.2.0/core";

const client = new StorageClient();
const val = document.getElementById("session-val");
const bar = document.getElementById("bar");

let store = null;
let barTimer = null;

function initStore(expires) {
  if (store) {
    store.removeItem();
  }

  store = client.getOrCreateStore("demo-session-" + Date.now(), "active!", {
    strategy: "sessionStorage",
    expires,
  });

  store.subscribe((v) => {
    val.textContent = v || "—";

    if (!v) {
      bar.style.width = "0%";
    }
  });
}

document.getElementById("s-set").onclick = () => {
  const expires = new Date(Date.now() + 15000);

  initStore(expires);

  if (barTimer) {
    clearInterval(barTimer);
  }

  const end = expires.getTime();

  barTimer = setInterval(() => {
    const left = end - Date.now();

    if (left <= 0) {
      bar.style.width = "0%";
      clearInterval(barTimer);
      return;
    }

    bar.style.width = (left / 15000) * 100 + "%";
  }, 100);
};

document.getElementById("s-reset").onclick = () => {
  if (store) {
    store.removeItem();
  }

  if (barTimer) {
    clearInterval(barTimer);
  }

  bar.style.width = "0%";
};
