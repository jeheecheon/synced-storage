import { StorageClient } from "https://esm.sh/synced-storage@1.2.0/core";

const client = new StorageClient();
const store = client.getOrCreateStore("demo-message", "", { strategy: "localStorage" });
const val = document.getElementById("local-val");
const input = document.getElementById("local-input");

store.subscribe((v) => {
  val.textContent = v || "—";
});

document.getElementById("l-save").onclick = () => {
  if (input.value) {
    store.setItem(input.value);
  }
};

document.getElementById("l-clear").onclick = () => {
  store.removeItem();
  input.value = "";
};
