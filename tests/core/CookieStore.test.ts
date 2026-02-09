import { describe, it, expect, vi } from "vitest";
import { CookieStore } from "@/core/CookieStore";

let testId = 0;
function uniqueKey() {
  return `test-cookie-${++testId}`;
}

function createStore<T>(
  name: string,
  defaultItem: T,
  initialItem?: T
) {
  return new CookieStore({
    name,
    defaultItem,
    initialItem: initialItem ?? defaultItem,
  });
}

describe("CookieStore", () => {
  describe("getItem", () => {
    it("returns defaultItem when cookie does not exist", () => {
      const store = createStore(uniqueKey(), "default");
      expect(store.getItem()).toBe("default");
    });

    it("returns parsed value after setItem", () => {
      const store = createStore(uniqueKey(), { count: 0 });
      store.setItem({ count: 5 });
      expect(store.getItem()).toEqual({ count: 5 });
    });

    it("returns defaultItem for unparseable cookie value", () => {
      const key = uniqueKey();
      document.cookie = `${key}=not-valid-json`;
      const store = createStore(key, "fallback");
      expect(store.getItem()).toBe("fallback");
    });
  });

  describe("getInitialItem", () => {
    it("returns initialItem when provided", () => {
      const store = createStore(uniqueKey(), "default", "ssr-value");
      expect(store.getInitialItem()).toBe("ssr-value");
    });

    it("returns defaultItem when initialItem is undefined", () => {
      const store = createStore(uniqueKey(), "default", undefined);
      expect(store.getInitialItem()).toBe("default");
    });
  });

  describe("setItem", () => {
    it("serializes and stores value", () => {
      const store = createStore(uniqueKey(), { x: 0 });
      store.setItem({ x: 1 });
      expect(store.getItem()).toEqual({ x: 1 });
    });

    it("silently no-ops for unserializable values", () => {
      const store = createStore(uniqueKey(), "default");
      const circular: any = {};
      circular.self = circular;
      expect(() => store.setItem(circular)).not.toThrow();
      expect(store.getItem()).toBe("default");
    });
  });

  describe("removeItem", () => {
    it("getItem returns defaultItem after removal", () => {
      const store = createStore(uniqueKey(), "default");
      store.setItem("value");
      store.removeItem();
      expect(store.getItem()).toBe("default");
    });
  });

  describe("subscribe", () => {
    it("listener called when setItem triggers change", () => {
      const key = uniqueKey();
      const store = createStore(key, "default");
      const listener = vi.fn();
      const unsub = store.subscribe(listener);

      store.setItem("new-value");
      expect(listener).toHaveBeenCalled();

      unsub();
    });

    it("listener not called for different cookie name", () => {
      const store1 = createStore(uniqueKey(), "default");
      const store2 = createStore(uniqueKey(), "default");
      const listener = vi.fn();
      const unsub = store1.subscribe(listener);

      store2.setItem("change");
      expect(listener).not.toHaveBeenCalled();

      unsub();
    });

    it("unsubscribe stops notifications", () => {
      const store = createStore(uniqueKey(), "default");
      const listener = vi.fn();
      const unsub = store.subscribe(listener);

      unsub();
      store.setItem("after-unsub");
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
