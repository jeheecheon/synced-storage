import type { Listener, Store, Unsubscriber } from "@/types/client";
import { type Optional } from "@/types/misc";
import { safelyGet } from "@/utils/misc";

export class StorageStore<TItem> implements Store<TItem> {
  private readonly name: string;
  private readonly defaultItem: TItem;
  private readonly storage: Storage;
  private cachedItem: Optional<TItem>;

  constructor(args: { name: string; defaultItem: TItem; storage: Storage }) {
    this.name = args.name;
    this.defaultItem = args.defaultItem;
    this.storage = args.storage;
  }

  public subscribe(listener: Listener): Unsubscriber {
    const handler = (event: StorageEvent) => {
      if (event.key !== this.name) {
        return;
      }

      const deserialized = safelyGet<TItem>(() => JSON.parse(event.newValue!));
      this.cachedItem = deserialized ?? this.defaultItem;
      listener();
    };

    listener();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }

  public getItem(): TItem {
    if (this.cachedItem === undefined) {
      const raw = this.storage.getItem(this.name);
      const deserialized = safelyGet<TItem>(() => JSON.parse(raw!));
      this.cachedItem = deserialized;
    }

    return this.cachedItem ?? this.defaultItem;
  }

  public getInitialItem(): TItem {
    return this.defaultItem;
  }

  public setItem(item: TItem): void {
    const serialized = safelyGet(() => JSON.stringify(item));
    if (!serialized) {
      return;
    }

    this.storage.setItem(this.name, serialized);
    this.cachedItem = item;
  }

  public removeItem(): void {
    this.storage.removeItem(this.name);
    this.cachedItem = undefined;
  }
}
