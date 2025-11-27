export function safelyGet<T>(callback: () => T): T | undefined {
  try {
    return callback();
  } catch (e) {
    return undefined;
  }
}

export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === "function";
}

export function compareDeep(a: any, b: any): boolean {
  // TODO: replace this with actual deep comparison
  return JSON.stringify(a) === JSON.stringify(b);
}

export function isServer(): boolean {
  return typeof window !== "object";
}

export function isBrowser(): boolean {
  return typeof window === "object";
}
