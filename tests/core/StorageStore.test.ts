import { afterEach, describe, it, expect, beforeEach, vi } from "vitest";
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

describe("StorageStore.subscribe", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("pushes new value to listener on setItem", () => {
    const store = new StorageStore({
      key: "push-test",
      defaultItem: 0,
      strategy: "localStorage",
    });

    const received: number[] = [];
    store.subscribe((value) => received.push(value));

    store.setItem(42);
    expect(received).toEqual([42]);
  });

  it("pushes updated value on functional setItem", () => {
    const store = new StorageStore({
      key: "push-fn",
      defaultItem: 0,
      strategy: "localStorage",
    });

    const received: number[] = [];
    store.subscribe((value) => received.push(value));

    store.setItem(5);
    store.setItem((prev) => prev + 1);
    expect(received).toEqual([5, 6]);
  });

  it("notifies multiple subscribers with pushed value", () => {
    const store = new StorageStore({
      key: "multi",
      defaultItem: 0,
      strategy: "localStorage",
    });

    const received1: number[] = [];
    const received2: number[] = [];
    store.subscribe((value) => received1.push(value));
    store.subscribe((value) => received2.push(value));

    store.setItem(10);
    expect(received1).toEqual([10]);
    expect(received2).toEqual([10]);
  });

  it("pushes defaultItem to listener on removeItem", () => {
    const store = new StorageStore({
      key: "remove-test",
      defaultItem: "default",
      strategy: "localStorage",
    });

    store.setItem("value");

    const received: string[] = [];
    store.subscribe((value) => received.push(value));

    store.removeItem();
    expect(received).toEqual(["default"]);
  });

  it("returns unsubscriber that stops notifications", () => {
    const store = new StorageStore({
      key: "unsub",
      defaultItem: 0,
      strategy: "localStorage",
    });

    const received: number[] = [];
    const unsub = store.subscribe((value) => received.push(value));

    store.setItem(1);
    unsub();
    store.setItem(2);

    expect(received).toEqual([1]);
  });
});

describe("StorageStore expiration timer", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts expiration timer at construction, not at subscribe", () => {
    const expires = new Date(Date.now() + 1000);
    const store = new StorageStore({
      key: "expire",
      defaultItem: "default",
      strategy: "localStorage",
      expires,
    });

    store.setItem("value");
    expect(store.getItem()).toBe("value");

    // Timer was set in constructor — advance without subscribing
    vi.advanceTimersByTime(1000);
    expect(store.getItem()).toBe("default");
  });

  it("notifies subscribers when expiration resets value", () => {
    const expires = new Date(Date.now() + 500);
    const store = new StorageStore({
      key: "expire-notify",
      defaultItem: 0,
      strategy: "localStorage",
      expires,
    });

    store.setItem(42);

    const received: number[] = [];
    store.subscribe((value) => received.push(value));

    vi.advanceTimersByTime(500);

    expect(received).toEqual([0]);
    expect(store.getItem()).toBe(0);
  });

  it("rejects setItem after expiration", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const expires = new Date(Date.now() + 100);
    const store = new StorageStore({
      key: "expire-reject",
      defaultItem: 0,
      strategy: "localStorage",
      expires,
    });

    store.setItem(10);
    vi.advanceTimersByTime(100);

    store.setItem(20);
    expect(store.getItem()).toBe(0);
    expect(warnSpy).toHaveBeenCalledWith(
      'localStorage store "expire-reject" is expired',
    );
  });
});
