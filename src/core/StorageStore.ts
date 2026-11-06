import type { Listener, Store, Unsubscriber } from "@/core/types";
import { type Optional } from "@/types/misc";
import { isBrowser, isEqual, isFunction, safelyGet } from "@/utils/misc";

export class StorageStore<TItem> implements Store<TItem> {
  private readonly key: string;
  private readonly defaultItem: TItem;
  private readonly strategy: "localStorage" | "sessionStorage";
  private readonly expires?: Date;
  private isExpired: boolean;
  private cachedItem: Optional<TItem>;
  private hasCachedItem: boolean;

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
    this.hasCachedItem = false;

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

      const deserialized =
        event.newValue !== null && event.newValue !== undefined
          ? safelyGet<TItem>(() => JSON.parse(event.newValue!))
          : undefined;
      const next = deserialized !== undefined ? deserialized : this.defaultItem;

      if (!this.hasCachedItem || !isEqual(this.cachedItem, next)) {
        this.cachedItem = next;
        this.hasCachedItem = true;
      }

      listener(this.cachedItem as TItem);
    };

    window.addEventListener("storage", handler);

    return () => window.removeEventListener("storage", handler);
  }

  public getItem(): TItem {
    if (!isBrowser()) {
      return this.hasCachedItem ? (this.cachedItem as TItem) : this.defaultItem;
    }

    if (!this.hasCachedItem) {
      const serialized = this.getStorage().getItem(this.key);
      const deserialized =
        serialized !== null
          ? safelyGet<TItem>(() => JSON.parse(serialized))
          : undefined;
      const next = deserialized !== undefined ? deserialized : this.defaultItem;
      const initial = this.getInitialItem();

      this.cachedItem = isEqual(next, initial) ? initial : next;
      this.hasCachedItem = true;
    }

    return this.cachedItem as TItem;
  }

  public getInitialItem(): TItem {
    return this.defaultItem;
  }

  public setItem(item: TItem | ((prev: TItem) => TItem)): void {
    if (!isBrowser()) {
      return;
    }

    const prev = this.getItem();
    const next = isFunction(item) ? item(prev) : item;
    const serialized = safelyGet(() => JSON.stringify(next));

    if (!serialized) {
      return;
    }

    if (this.isExpired) {
      console.warn(`${this.strategy} store "${this.key}" is expired`);
      return;
    }

    const resolved = isEqual(prev, next) ? prev : next;
    const event = new StorageEvent("storage", {
      key: this.key,
      newValue: serialized,
      oldValue: safelyGet(() => JSON.stringify(prev)),
    });

    this.cachedItem = resolved;
    this.hasCachedItem = true;
    this.getStorage().setItem(this.key, serialized);
    window.dispatchEvent(event);
  }

  public removeItem(): void {
    if (!isBrowser()) {
      return;
    }

    const prev = this.getItem();
    const event = new StorageEvent("storage", {
      key: this.key,
      newValue: undefined,
      oldValue: safelyGet(() => JSON.stringify(prev)),
    });

    this.cachedItem = this.defaultItem;
    this.hasCachedItem = true;
    this.getStorage().removeItem(this.key);
    window.dispatchEvent(event);
  }

  private getStorage(): Storage {
    return this.strategy === "localStorage" ? localStorage : sessionStorage;
  }
}
