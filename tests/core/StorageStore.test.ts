import { afterEach, describe, it, expect, beforeEach, vi } from "vitest";
import { StorageStore } from "@/core/StorageStore";
import { type Nullable, type Optional } from "@/types/misc";

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

  it("stores and retrieves null value when defaultItem is non-null, and resets on removeItem", () => {
    const store = new StorageStore<Nullable<string>>({
      key: "null-test",
      defaultItem: "default-val",
      strategy: "localStorage",
    });

    store.setItem(null);
    expect(store.getItem()).toBeNull();
    expect(localStorage.getItem("null-test")).toBe("null");

    const store2 = new StorageStore<Nullable<string>>({
      key: "null-test",
      defaultItem: "default-val",
      strategy: "localStorage",
    });
    expect(store2.getItem()).toBeNull();

    store.removeItem();
    expect(store.getItem()).toBe("default-val");
    expect(localStorage.getItem("null-test")).toBeNull();
  });

  it("returns the exact same reference as getInitialItem when localStorage deeply matches defaultItem", () => {
    const defaultObj = { a: 1, nested: { b: 2 } };
    localStorage.setItem("ref-test", JSON.stringify({ a: 1, nested: { b: 2 } }));

    const store = new StorageStore({
      key: "ref-test",
      defaultItem: defaultObj,
      strategy: "localStorage",
    });

    expect(store.getItem()).toBe(store.getInitialItem());
    expect(store.getItem()).toBe(defaultObj);
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

  it("delivers the exact same object reference to multiple subscribers on update", () => {
    const store = new StorageStore<{ count: number }>({
      key: "multi-sub-update",
      defaultItem: { count: 0 },
      strategy: "localStorage",
    });

    let received1: Optional<{ count: number }>;
    let received2: Optional<{ count: number }>;

    store.subscribe((val) => {
      received1 = val;
    });
    store.subscribe((val) => {
      received2 = val;
    });

    store.setItem({ count: 1 });

    expect(received1).toEqual({ count: 1 });
    expect(received2).toEqual({ count: 1 });
    expect(received1).toBe(received2);
  });

  it("delivers the exact same object reference to multiple subscribers on cross-tab StorageEvent", () => {
    const store = new StorageStore<{ msg: string }>({
      key: "cross-tab",
      defaultItem: { msg: "default" },
      strategy: "localStorage",
    });

    let received1: Optional<{ msg: string }>;
    let received2: Optional<{ msg: string }>;

    store.subscribe((val) => {
      received1 = val;
    });
    store.subscribe((val) => {
      received2 = val;
    });

    const event = new StorageEvent("storage", {
      key: "cross-tab",
      newValue: JSON.stringify({ msg: "from-other-tab" }),
      oldValue: JSON.stringify({ msg: "default" }),
    });
    window.dispatchEvent(event);

    expect(received1).toEqual({ msg: "from-other-tab" });
    expect(received2).toEqual({ msg: "from-other-tab" });
    expect(received1).toBe(received2);
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
