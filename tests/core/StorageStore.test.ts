import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StorageStore } from "@/core/StorageStore";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

function createStore<T>(
  key: string,
  defaultItem: T,
  opts?: { strategy?: "localStorage" | "sessionStorage"; expires?: Date }
) {
  return new StorageStore({
    key,
    defaultItem,
    strategy: opts?.strategy ?? "localStorage",
    expires: opts?.expires,
  });
}

describe("StorageStore", () => {
  describe("getItem", () => {
    it("returns defaultItem when storage is empty", () => {
      const store = createStore("key", "default");
      expect(store.getItem()).toBe("default");
    });

    it("returns parsed value from localStorage", () => {
      localStorage.setItem("key", JSON.stringify({ count: 5 }));
      const store = createStore("key", { count: 0 });
      expect(store.getItem()).toEqual({ count: 5 });
    });

    it("returns defaultItem for unparseable value", () => {
      localStorage.setItem("key", "bad-json");
      const store = createStore("key", "fallback");
      expect(store.getItem()).toBe("fallback");
    });

    it("works with sessionStorage strategy", () => {
      sessionStorage.setItem("key", JSON.stringify("session-val"));
      const store = createStore("key", "default", { strategy: "sessionStorage" });
      expect(store.getItem()).toBe("session-val");
    });
  });

  describe("getInitialItem", () => {
    it("always returns defaultItem", () => {
      const store = createStore("key", "default");
      expect(store.getInitialItem()).toBe("default");
    });
  });

  describe("setItem", () => {
    it("writes serialized value to localStorage", () => {
      const store = createStore("key", { a: 0 });
      store.setItem({ a: 1 });
      expect(localStorage.getItem("key")).toBe(JSON.stringify({ a: 1 }));
    });

    it("dispatches StorageEvent on window", () => {
      const store = createStore("key", "default");
      const spy = vi.fn();
      window.addEventListener("storage", spy);

      store.setItem("new");
      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0].key).toBe("key");

      window.removeEventListener("storage", spy);
    });

    it("silently no-ops for unserializable values", () => {
      const store = createStore("key", "default");
      const circular: any = {};
      circular.self = circular;
      expect(() => store.setItem(circular)).not.toThrow();
      expect(localStorage.getItem("key")).toBeNull();
    });

    it("works with sessionStorage strategy", () => {
      const store = createStore("key", "default", { strategy: "sessionStorage" });
      store.setItem("val");
      expect(sessionStorage.getItem("key")).toBe(JSON.stringify("val"));
      expect(localStorage.getItem("key")).toBeNull();
    });
  });

  describe("removeItem", () => {
    it("removes from localStorage", () => {
      const store = createStore("key", "default");
      store.setItem("val");
      store.removeItem();
      expect(localStorage.getItem("key")).toBeNull();
    });

    it("getItem returns defaultItem after removal", () => {
      const store = createStore("key", "default");
      store.setItem("val");
      store.removeItem();
      expect(store.getItem()).toBe("default");
    });

    it("dispatches StorageEvent on window", () => {
      const store = createStore("key", "default");
      store.setItem("val");
      const spy = vi.fn();
      window.addEventListener("storage", spy);

      store.removeItem();
      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0].key).toBe("key");

      window.removeEventListener("storage", spy);
    });
  });

  describe("subscribe", () => {
    it("listener called when StorageEvent dispatched for matching key", () => {
      const store = createStore("key", "default");
      const listener = vi.fn();
      const unsub = store.subscribe(listener);

      window.dispatchEvent(
        new StorageEvent("storage", { key: "key", newValue: JSON.stringify("new") })
      );
      expect(listener).toHaveBeenCalledOnce();

      unsub();
    });

    it("listener not called for different key", () => {
      const store = createStore("key", "default");
      const listener = vi.fn();
      const unsub = store.subscribe(listener);

      window.dispatchEvent(
        new StorageEvent("storage", { key: "other", newValue: JSON.stringify("val") })
      );
      expect(listener).not.toHaveBeenCalled();

      unsub();
    });

    it("unsubscribe removes event listener", () => {
      const store = createStore("key", "default");
      const listener = vi.fn();
      const unsub = store.subscribe(listener);
      unsub();

      window.dispatchEvent(
        new StorageEvent("storage", { key: "key", newValue: JSON.stringify("val") })
      );
      expect(listener).not.toHaveBeenCalled();
    });

    it("same-tab setItem triggers subscriber", () => {
      const store = createStore("key", "default");
      const listener = vi.fn();
      const unsub = store.subscribe(listener);

      store.setItem("updated");
      expect(listener).toHaveBeenCalledOnce();
      expect(store.getItem()).toBe("updated");

      unsub();
    });

    it("same-tab removeItem triggers subscriber", () => {
      const store = createStore("key", "default");
      store.setItem("val");
      const listener = vi.fn();
      const unsub = store.subscribe(listener);

      store.removeItem();
      expect(listener).toHaveBeenCalledOnce();
      expect(store.getItem()).toBe("default");

      unsub();
    });
  });

  describe("expiration", () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it("resets to defaultItem after expiration", () => {
      const expires = new Date(Date.now() + 5000);
      const store = createStore("key", "default", { expires });
      store.setItem("val");

      const listener = vi.fn();
      store.subscribe(listener);

      vi.advanceTimersByTime(5000);
      expect(store.getItem()).toBe("default");
    });

    it("setItem warns and no-ops after expiration", () => {
      const expires = new Date(Date.now() + 1000);
      const store = createStore("key", "default", { expires });
      const listener = vi.fn();
      store.subscribe(listener);

      vi.advanceTimersByTime(1000);
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      store.setItem("after-expire");
      expect(warnSpy).toHaveBeenCalled();
      expect(store.getItem()).toBe("default");

      warnSpy.mockRestore();
    });

    it("no expiration when expires not set", () => {
      const store = createStore("key", "default");
      store.setItem("val");
      const listener = vi.fn();
      store.subscribe(listener);

      vi.advanceTimersByTime(100000);
      expect(store.getItem()).toBe("val");
    });
  });
});
