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
