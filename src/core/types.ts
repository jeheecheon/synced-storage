import { CookieSetOptions } from "universal-cookie";

export type Listener<TItem = any> = (newValue: TItem) => void;
export type Unsubscriber = () => void;

/**
 * Unified interface for cookie and web storage stores.
 *
 * Both `CookieStore` and `StorageStore` implement this interface,
 * so callers never need to know which backend they are using.
 */
export type Store<TItem = any> = {
  subscribe: (listener: Listener<TItem>) => Unsubscriber;
  getItem: () => TItem;
  getInitialItem: () => TItem;
  setItem: (item: TItem | ((prev: TItem) => TItem)) => void;
  removeItem: () => void;
};

export type BaseStoreOption = {
  strategy: "cookie" | "localStorage" | "sessionStorage";
};
export type CookieStoreOption = { strategy: "cookie" } & CookieSetOptions;
export type StorageStoreOption = {
  strategy: "localStorage" | "sessionStorage";
  expires?: Date;
};

/** A simple cookie key-value pair, typically from SSR cookie headers. */
export type CookieItem = {
  name: string;
  value: string;
};

export abstract class BaseStoreClient<TItem = unknown> {
  protected abstract readonly storeCache: Map<string, Readonly<Store<TItem>>>;
  public abstract getOrCreateStore(
    key: string,
    defaultItem: TItem,
    option: unknown,
  ): Readonly<Store<TItem>>;
}
