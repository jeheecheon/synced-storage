export function safelyGet<T>(callback: () => T): T | undefined {
  try {
    return callback();
  } catch (e) {
    return undefined;
  }
}
