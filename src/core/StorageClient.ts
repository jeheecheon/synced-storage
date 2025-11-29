import {
  type Store,
  BaseStoreClient,
  type StorageStoreOption,
} from "@/core/types";
import { StorageStore } from "@/core/StorageStore";

export class StorageClient extends BaseStoreClient {
  protected readonly storeCache: Map<string, Readonly<Store>>;

  constructor() {
    super();
    this.storeCache = new Map();
  }

  public getOrCreateStore<TItem = unknown>(
    key: string,
    defaultItem: TItem,
    option?: StorageStoreOption
  ): Readonly<Store<TItem>> {
    const strategy = option?.strategy ?? "localStorage";
    const storeKey = `${strategy}-${key}`;

    const store = this.storeCache.get(storeKey);
    if (store) {
      return store;
    }

    const newStore = new StorageStore<TItem>({
      key,
      defaultItem,
      strategy,
      expires: option?.expires,
    });
    this.storeCache.set(storeKey, newStore);

    return newStore;
  }
}
