import {
  type CookieStoreOption,
  type CookieItem,
  type Store,
  BaseStoreClient,
} from "@/core/types";
import { safelyGet } from "@/utils/misc";
import { CookieStore } from "@/core/CookieStore";

/**
 * Factory that creates and caches `CookieStore` instances.
 *
 * Pass `initialCookies` (from the server's `Cookie` header) to enable
 * SSR hydration — the parsed value is used as each store's initial item.
 */
export class CookieClient extends BaseStoreClient {
  private readonly initialCookies: CookieItem[];
  protected readonly storeCache: Map<string, Readonly<Store>>;

  constructor(initialCookies?: CookieItem[]) {
    super();
    this.initialCookies = initialCookies ?? [];
    this.storeCache = new Map();
  }

  public getOrCreateStore<TItem = unknown>(
    key: string,
    defaultItem: TItem,
    option?: CookieStoreOption,
  ): Readonly<Store<TItem>> {
    const store = this.storeCache.get(key);
    if (store) {
      return store;
    }

    const cookie = this.initialCookies.find((cookie) => cookie.name === key);
    const initialItem = cookie?.value
      ? (safelyGet<TItem>(() => JSON.parse(cookie.value)) ?? defaultItem)
      : defaultItem;

    const newStore = new CookieStore<TItem>(
      {
        name: key,
        defaultItem,
        initialItem,
      },
      option,
    );
    this.storeCache.set(key, newStore);

    return newStore;
  }
}
