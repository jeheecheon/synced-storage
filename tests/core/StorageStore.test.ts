import { describe, it, expect, beforeEach } from "vitest";
import { StorageStore } from "@/core/StorageStore";

describe("StorageStore.setItem", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("sets a direct value", () => {
    const store = new StorageStore({
      key: "count",
      defaultItem: 0,
      strategy: "localStorage",
    });
    store.setItem(42);
    expect(store.getItem()).toBe(42);
  });

  it("applies a functional update using the current cached value", () => {
    const store = new StorageStore({
      key: "count",
      defaultItem: 0,
      strategy: "localStorage",
    });
    store.setItem(5);
    store.setItem((prev) => prev + 1);
    expect(store.getItem()).toBe(6);
  });

  it("handles rapid sequential functional updates without stale closure", () => {
    const store = new StorageStore({
      key: "count",
      defaultItem: 0,
      strategy: "localStorage",
    });
    store.setItem(0);
    store.setItem((prev) => prev + 1);
    store.setItem((prev) => prev + 1);
    store.setItem((prev) => prev + 1);
    expect(store.getItem()).toBe(3);
  });

  it("uses defaultItem as prev when store has no persisted value", () => {
    const store = new StorageStore({
      key: "count",
      defaultItem: 10,
      strategy: "localStorage",
    });
    store.setItem((prev) => prev * 2);
    expect(store.getItem()).toBe(20);
  });

  it("works with object values", () => {
    const store = new StorageStore({
      key: "obj",
      defaultItem: { x: 0 },
      strategy: "localStorage",
    });
    store.setItem({ x: 1 });
    store.setItem((prev) => ({ x: prev.x + 10 }));
    expect(store.getItem()).toEqual({ x: 11 });
  });

  it("persists the resolved value to localStorage", () => {
    const store = new StorageStore({
      key: "count",
      defaultItem: 0,
      strategy: "localStorage",
    });
    store.setItem(5);
    store.setItem((prev) => prev + 3);
    const raw = localStorage.getItem("count");
    expect(JSON.parse(raw!)).toBe(8);
  });
});
