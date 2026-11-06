import type {
  CookieStoreOption,
  Listener,
  Store,
  Unsubscriber,
} from "@/core/types";
import { type Optional } from "@/types/misc";
import { isEqual, isFunction } from "@/utils/misc";
import Cookies, { type CookieChangeOptions } from "universal-cookie";

export class CookieStore<TItem> implements Store<TItem> {
  private readonly cookies: Cookies;
  private readonly name: string;
  private readonly defaultItem: TItem;
  private readonly initialItem: TItem;
  private readonly option?: CookieStoreOption;
  private cachedItem: Optional<TItem>;
  private hasCachedItem: boolean;

  constructor(
    args: {
      name: string;
      defaultItem: TItem;
      initialItem: TItem;
    },
    option?: CookieStoreOption,
  ) {
    this.name = args.name;
    this.option = option;
    this.defaultItem = args.defaultItem;
    this.initialItem = args.initialItem;
    this.cookies = new Cookies(undefined, option);
    this.hasCachedItem = false;
  }

  public subscribe(listener: Listener<TItem>): Unsubscriber {
    const handler = (options: CookieChangeOptions) => {
      if (options.name !== this.name) {
        return;
      }

      const next: TItem =
        options.value !== undefined ? options.value : this.defaultItem;

      if (!this.hasCachedItem || !isEqual(this.cachedItem, next)) {
        this.cachedItem = next;
        this.hasCachedItem = true;
      }

      listener(this.cachedItem as TItem);
    };

    this.cookies.addChangeListener(handler);

    return () => this.cookies.removeChangeListener(handler);
  }

  public getItem(): TItem {
    if (!this.hasCachedItem) {
      const raw = this.cookies.get(this.name);
      const next = raw !== undefined ? (raw as TItem) : this.defaultItem;
      const initial = this.getInitialItem();

      this.cachedItem = isEqual(next, initial) ? initial : next;
      this.hasCachedItem = true;
    }

    return this.cachedItem as TItem;
  }

  public getInitialItem(): TItem {
    return this.initialItem !== undefined ? this.initialItem : this.defaultItem;
  }

  public setItem(item: TItem | ((prev: TItem) => TItem)): void {
    const next = isFunction(item) ? item(this.getItem()) : item;
    const current = this.hasCachedItem
      ? (this.cachedItem as TItem)
      : this.getInitialItem();
    const resolved = isEqual(current, next) ? current : next;

    this.cachedItem = resolved;
    this.hasCachedItem = true;
    this.cookies.set(this.name, resolved, this.option);
  }

  public removeItem(): void {
    this.cachedItem = this.defaultItem;
    this.hasCachedItem = true;
    this.cookies.remove(this.name);
  }
}
