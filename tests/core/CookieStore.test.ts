import { describe, it, expect, beforeEach } from "vitest";
import { CookieStore } from "@/core/CookieStore";

function clearCookies() {
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
}

describe("CookieStore.setItem", () => {
  beforeEach(() => {
    clearCookies();
  });

  it("sets a direct value", () => {
    const store = new CookieStore({
      name: "count",
      defaultItem: 0,
      initialItem: 0,
    });
    store.setItem(42);
    expect(store.getItem()).toBe(42);
  });

  it("applies a functional update using the current cached value", () => {
    const store = new CookieStore({
      name: "count",
      defaultItem: 0,
      initialItem: 0,
    });
    store.setItem(5);
    store.setItem((prev) => prev + 1);
    expect(store.getItem()).toBe(6);
  });

  it("handles rapid sequential functional updates without stale closure", () => {
    const store = new CookieStore({
      name: "count",
      defaultItem: 0,
      initialItem: 0,
    });
    store.setItem(0);
    store.setItem((prev) => prev + 1);
    store.setItem((prev) => prev + 1);
    store.setItem((prev) => prev + 1);
    expect(store.getItem()).toBe(3);
  });

  it("uses defaultItem as prev when cookie has no value", () => {
    const store = new CookieStore({
      name: "count",
      defaultItem: 10,
      initialItem: 10,
    });
    store.setItem((prev) => prev * 2);
    expect(store.getItem()).toBe(20);
  });

  it("getItem reads pre-existing cookie without double-parsing", () => {
    // First store sets a value into the cookie
    const store1 = new CookieStore({
      name: "preexist",
      defaultItem: 0,
      initialItem: 0,
    });
    store1.setItem(42);

    // Second store (simulates new page load) reads the same cookie
    const store2 = new CookieStore({
      name: "preexist",
      defaultItem: 0,
      initialItem: 0,
    });
    expect(store2.getItem()).toBe(42);
  });

  it("functional update on pre-existing cookie uses stored value, not defaultItem", () => {
    // Store 1 writes an object cookie
    const store1 = new CookieStore({
      name: "obj",
      defaultItem: { count: 0, name: "John" },
      initialItem: { count: 0, name: "John" },
    });
    store1.setItem({ count: 5, name: "John" });

    // Store 2 (new instance, simulating page reload) does a functional update
    const store2 = new CookieStore({
      name: "obj",
      defaultItem: { count: 0, name: "John" },
      initialItem: { count: 0, name: "John" },
    });
    store2.setItem((prev) => ({ ...prev, count: prev.count + 1 }));
    expect(store2.getItem()).toEqual({ count: 6, name: "John" });
  });

  it("works with object values", () => {
    const store = new CookieStore({
      name: "obj",
      defaultItem: { x: 0 },
      initialItem: { x: 0 },
    });
    store.setItem({ x: 1 });
    store.setItem((prev) => ({ x: prev.x + 10 }));
    expect(store.getItem()).toEqual({ x: 11 });
  });
});
