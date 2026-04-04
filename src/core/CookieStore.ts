import type {
  CookieStoreOption,
  Listener,
  Store,
  Unsubscriber,
} from "@/core/types";
import { type Optional } from "@/types/misc";
import { isFunction, safelyGet } from "@/utils/misc";
import Cookies, { type CookieChangeOptions } from "universal-cookie";

export class CookieStore<TItem> implements Store<TItem> {
  private readonly cookies: Cookies;
  private readonly name: string;
  private readonly defaultItem: TItem;
  private readonly initialItem: TItem;
  private readonly option?: CookieStoreOption;
  private cachedItem: Optional<TItem>;

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
  }

  public subscribe(listener: Listener<TItem>): Unsubscriber {
    const handler = (options: CookieChangeOptions) => {
      if (options.name !== this.name) {
        return;
      }

      const deserialized = safelyGet<TItem>(() => JSON.parse(options.value));
      this.cachedItem = deserialized ?? this.defaultItem;
      listener(this.cachedItem);
    };

    this.cookies.addChangeListener(handler);
    return () => this.cookies.removeChangeListener(handler);
  }

  public getItem(): TItem {
    if (this.cachedItem === undefined) {
      this.cachedItem = this.cookies.get(this.name);
    }

    return this.cachedItem ?? this.defaultItem;
  }

  public getInitialItem(): TItem {
    return this.initialItem ?? this.defaultItem;
  }

  public setItem(item: TItem | ((prev: TItem) => TItem)): void {
    const next = isFunction(item) ? item(this.getItem()) : item;
    const serialized = safelyGet(() => JSON.stringify(next));

    if (!serialized) {
      return;
    }

    this.cachedItem = next;
    this.cookies.set(this.name, serialized, this.option);
  }

  public removeItem(): void {
    this.cookies.remove(this.name);
    this.cachedItem = undefined;
  }
}
