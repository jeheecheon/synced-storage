import {
  type Store,
  BaseStoreClient,
  StorageStoreOption,
} from "@/types/client";
import { StorageStore } from "./StorageStore";

export class StorageClient extends BaseStoreClient {
  protected readonly storeCache: Map<string, Readonly<Store>>;

  constructor() {
    super();
    this.storeCache = new Map();
  }

  public getOrCreateStore<TItem = unknown>(
    _key: string,
    defaultItem: TItem,
    option?: StorageStoreOption
  ): Readonly<Store<TItem>> {
    const strategy = option?.strategy ?? "localStorage";
    const key = `${strategy}:${_key}`;

    const store = this.storeCache.get(key);
    if (store) {
      return store;
    }

    const newStore = new StorageStore<TItem>({
      name: key,
      defaultItem,
      storage: strategy === "sessionStorage" ? sessionStorage : localStorage,
    });
    this.storeCache.set(key, newStore);

    return newStore;
  }
}
