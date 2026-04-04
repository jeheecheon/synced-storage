import { CookieClient } from "https://esm.sh/synced-storage@1.2.0/core";

const client = new CookieClient();
const store = client.getOrCreateStore("demo-counter", 0);
const val = document.getElementById("cookie-val");

store.subscribe((v) => {
  val.textContent = v;
});

document.getElementById("c-inc").onclick = () => store.setItem(store.getItem() + 1);
document.getElementById("c-dec").onclick = () => store.setItem(store.getItem() - 1);
document.getElementById("c-reset").onclick = () => store.setItem(0);
