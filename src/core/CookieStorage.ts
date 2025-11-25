import {
  CookieStorageOption,
  Listener,
  Storage,
  Unsubscriber,
} from "@/types/client";
import { Optional } from "@/types/misc";
import { safelyGet } from "@/utils/misc";
import Cookies, { CookieChangeOptions } from "universal-cookie";

export class CookieStorage<Value = any> implements Storage<Value> {
  private readonly cookies: Cookies;
  private readonly name: string;
  private readonly defaultValue: Value;
  private readonly initialValue: Value;
  private readonly options?: CookieStorageOption;
  private cachedValue: Optional<Value>;

  constructor(
    args: {
      name: string;
      defaultValue: Value;
      initialValue: Value;
    },
    options?: CookieStorageOption
  ) {
    this.name = args.name;
    this.options = options;
    this.defaultValue = args.defaultValue;
    this.initialValue = args.initialValue;
    this.cookies = new Cookies(undefined, options);
  }

  public subscribe(listener: Listener): Unsubscriber {
    const handler = (options: CookieChangeOptions) => {
      if (options.name !== this.name) {
        return;
      }

      const deserialized = safelyGet<Value>(() => JSON.parse(options.value));
      this.cachedValue = deserialized ?? this.defaultValue;
      listener();
    };

    this.cookies.addChangeListener(handler);
    return () => this.cookies.removeChangeListener(handler);
  }

  public getSnapshot(): Value {
    if (this.cachedValue === undefined) {
      const raw = this.cookies.get(this.name);
      const deserialized = safelyGet<Value>(() => JSON.parse(raw));
      this.cachedValue = deserialized;
    }

    return this.cachedValue ?? this.defaultValue;
  }

  public getServerSnapshot(): Value {
    return this.initialValue ?? this.defaultValue;
  }

  public setValue(value: Value): void {
    const serialized = safelyGet(() => JSON.stringify(value));
    if (!serialized) {
      return;
    }

    this.cookies.set(this.name, serialized, this.options);
    this.cachedValue = value;
  }
}
