import { CookieSetOptions } from "universal-cookie";

export type Listener = () => void;
export type Unsubscriber = () => void;

export type Storage<Value = any> = {
  subscribe: (listener: Listener) => Unsubscriber;
  getSnapshot: () => Value;
  getServerSnapshot: () => Value;
  setValue: (value: Value) => void;
};

export interface StorageOption {
  strategy: "cookie" | "localStorage" | "sessionStorage";
}

export interface CookieStorageOption extends StorageOption, CookieSetOptions {}
export interface LocalStorageOption extends StorageOption {
  expires?: Date;
}
export interface SessionStorageOption extends StorageOption {
  expires?: Date;
}

export type StorageClient<Value = any> = {
  storageCache: Map<string, Readonly<Storage<Value>>>;
  getOrCreateStorage<TStorageOption extends StorageOption>(
    key: string,
    defaultValue: Value,
    options?: TStorageOption
  ): Readonly<Storage<Value>>;
};
