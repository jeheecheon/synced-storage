import { CookieSetOptions } from "universal-cookie";

export type Listener<TItem = any> = (newValue: TItem) => void;
export type Unsubscriber = () => void;

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

export abstract class BaseStoreClient<TItem = unknown> {
  protected abstract readonly storeCache: Map<string, Readonly<Store<TItem>>>;
  public abstract getOrCreateStore(
    key: string,
    defaultItem: TItem,
    option: unknown,
  ): Readonly<Store<TItem>>;
}
