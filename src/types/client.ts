import { CookieSetOptions } from "universal-cookie";

export type Listener = () => void;
export type Unsubscriber = () => void;

export type Storage<Value = any> = {
  subscribe: (listener: Listener) => Unsubscriber;
  getSnapshot: () => Value;
  getServerSnapshot: () => Value;
  setValue: (value: Value) => void;
};

export interface StrategyOption {
  strategy?: "cookie" | "localStorage" | "sessionStorage";
}
export interface BaseCookieStorageOption extends CookieSetOptions {}
export interface CookieStorageOption
  extends StrategyOption,
    BaseCookieStorageOption {}

export type StorageClient<Value = any> = {
  storageCache: Map<string, Readonly<Storage<Value>>>;
  getOrCreateStorage<TStorageOption extends StrategyOption>(
    key: string,
    defaultValue: Value,
    options?: TStorageOption
  ): Readonly<Storage<Value>>;
};
