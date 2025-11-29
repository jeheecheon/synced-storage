import {
  type CookieStoreOption,
  type Store,
  BaseStoreClient,
} from "@/core/types";
import { safelyGet } from "@/utils/misc";
import { CookieStore } from "@/core/CookieStore";

export class CookieClient extends BaseStoreClient {
  private readonly initialCookies: CookieListItem[];
  protected readonly storeCache: Map<string, Readonly<Store>>;

  constructor(initialCookies?: CookieListItem[]) {
    super();
    this.initialCookies = initialCookies ?? [];
    this.storeCache = new Map();
  }

  public getOrCreateStore<TItem = unknown>(
    key: string,
    defaultItem: TItem,
    option?: CookieStoreOption
  ): Readonly<Store<TItem>> {
    const store = this.storeCache.get(key);
    if (store) {
      return store;
    }

    const cookie = this.initialCookies.find((cookie) => cookie.name === key);
    const initialItem =
      safelyGet<TItem>(() => JSON.parse(cookie?.value!)) ?? defaultItem;

    const newStore = new CookieStore<TItem>(
      {
        name: key,
        defaultItem,
        initialItem,
      },
      option
    );
    this.storeCache.set(key, newStore);

    return newStore;
  }
}
