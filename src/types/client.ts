import { CookieSetOptions } from "universal-cookie";

export type Listener = () => void;
export type Unsubscriber = () => void;

export type Store<TItem = any> = {
  subscribe: (listener: Listener) => Unsubscriber;
  getItem: () => TItem;
  getInitialItem: () => TItem;
  setItem: (item: TItem) => void;
  removeItem: () => void;
};

export type BaseStoreOption = {
  strategy: "cookie" | "localStorage" | "sessionStorage";
};
export type CookieStoreOption = { strategy: "cookie" } & CookieSetOptions;
export type StorageStoreOption = {
  strategy: "localStorage" | "sessionStorage";
};

export abstract class BaseStoreClient<TItem = unknown> {
  protected abstract readonly storeCache: Map<string, Readonly<Store<TItem>>>;
  public abstract getOrCreateStore(
    key: string,
    defaultItem: TItem,
    option: unknown
  ): Readonly<Store<TItem>>;
}
