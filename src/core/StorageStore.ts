import type { Listener, Store, Unsubscriber } from "@/core/types";
import { type Optional } from "@/types/misc";
import { isBrowser, isFunction, safelyGet } from "@/utils/misc";

export class StorageStore<TItem> implements Store<TItem> {
  private readonly key: string;
  private readonly defaultItem: TItem;
  private readonly strategy: "localStorage" | "sessionStorage";
  private readonly expires?: Date;
  private isExpired: boolean;
  private cachedItem: Optional<TItem>;

  constructor(args: {
    key: string;
    defaultItem: TItem;
    strategy: "localStorage" | "sessionStorage";
    expires?: Date;
  }) {
    this.key = args.key;
    this.defaultItem = args.defaultItem;
    this.strategy = args.strategy;
    this.expires = args.expires;
    this.isExpired = false;

    if (this.expires && isBrowser()) {
      const leftTime = this.expires.getTime() - Date.now();

      if (leftTime <= 0) {
        this.isExpired = true;
        return;
      }

      setTimeout(() => {
        this.setItem(this.defaultItem);
        this.isExpired = true;
      }, leftTime);
    }
  }

  public subscribe(listener: Listener<TItem>): Unsubscriber {
    if (!isBrowser()) {
      return () => {};
    }

    const handler = (event: StorageEvent) => {
      if (event.key !== this.key) {
        return;
      }

      const deserialized = safelyGet<TItem>(() => JSON.parse(event.newValue!));
      this.cachedItem = deserialized ?? this.defaultItem;
      listener(this.cachedItem);
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }

  public getItem(): TItem {
    if (!isBrowser()) {
      return this.cachedItem ?? this.defaultItem;
    }

    if (this.cachedItem === undefined) {
      const serialized = this.getStorage().getItem(this.key);
      const deserialized = safelyGet<TItem>(() => JSON.parse(serialized!));
      this.cachedItem = deserialized;
    }

    return this.cachedItem ?? this.defaultItem;
  }

  public getInitialItem(): TItem {
    return this.defaultItem;
  }

  public setItem(item: TItem | ((prev: TItem) => TItem)): void {
    if (!isBrowser()) {
      return;
    }

    const next = isFunction(item) ? item(this.getItem()) : item;
    const serialized = safelyGet(() => JSON.stringify(next));

    if (!serialized) {
      return;
    }

    if (this.isExpired) {
      console.warn(`${this.strategy} store "${this.key}" is expired`);
      return;
    }

    const event = new StorageEvent("storage", {
      key: this.key,
      newValue: serialized,
      oldValue: safelyGet(() => JSON.stringify(this.getItem())),
    });

    this.cachedItem = next;
    this.getStorage().setItem(this.key, serialized);
    window.dispatchEvent(event);
  }

  public removeItem(): void {
    if (!isBrowser()) {
      return;
    }

    const event = new StorageEvent("storage", {
      key: this.key,
      newValue: undefined,
      oldValue: safelyGet(() => JSON.stringify(this.getItem())),
    });

    this.cachedItem = undefined;
    this.getStorage().removeItem(this.key);
    window.dispatchEvent(event);
  }

  private getStorage(): Storage {
    return this.strategy === "localStorage" ? localStorage : sessionStorage;
  }
}
