import {
  type CookieStorageOption,
  type Storage,
  StorageClient,
} from "@/types/client";
import { safelyGet } from "@/utils/misc";
import { CookieStorage } from "@/core";

export class CookieClient extends StorageClient {
  private readonly initialCookies: CookieListItem[];
  protected readonly storageCache: Map<string, Readonly<Storage>>;

  constructor(initialCookies: CookieListItem[]) {
    super();
    this.initialCookies = initialCookies;
    this.storageCache = new Map();
  }

  public getOrCreateStorage<
    TStorageOption extends CookieStorageOption,
    TValue = unknown
  >(
    key: string,
    defaultValue: TValue,
    options?: TStorageOption
  ): Readonly<Storage<TValue>> {
    const storage = this.storageCache.get(key);
    if (storage) {
      return storage;
    }

    const cookie = this.initialCookies.find((cookie) => cookie.name === key);
    const initialValue =
      safelyGet<TValue>(() => JSON.parse(cookie?.value!)) ?? defaultValue;

    const newStorage = new CookieStorage<TValue>(
      {
        name: key,
        defaultValue,
        initialValue,
      },
      options
    );
    this.storageCache.set(key, newStorage);

    return newStorage;
  }
}
