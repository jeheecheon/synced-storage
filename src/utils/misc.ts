export function safelyGet<T>(callback: () => T): T | undefined {
  try {
    return callback();
  } catch (e) {
    console.warn("[synced-storage]", e);
    return undefined;
  }
}

export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === "function";
}

export function isServer(): boolean {
  return typeof window !== "object";
}

export function isBrowser(): boolean {
  return typeof window === "object";
}
