import { describe, it, expect } from "vitest";
import { CookieClient } from "@/core/CookieClient";

describe("CookieClient", () => {
  describe("getOrCreateStore", () => {
    it("returns a store with expected methods", () => {
      const client = new CookieClient();
      const store = client.getOrCreateStore("key", "default");
      expect(store.getItem).toBeTypeOf("function");
      expect(store.setItem).toBeTypeOf("function");
      expect(store.removeItem).toBeTypeOf("function");
      expect(store.subscribe).toBeTypeOf("function");
      expect(store.getInitialItem).toBeTypeOf("function");
    });

    it("returns same instance on second call with same key", () => {
      const client = new CookieClient();
      const store1 = client.getOrCreateStore("key", "default");
      const store2 = client.getOrCreateStore("key", "default");
      expect(store1).toBe(store2);
    });

    it("different keys yield different stores", () => {
      const client = new CookieClient();
      const storeA = client.getOrCreateStore("a", "default");
      const storeB = client.getOrCreateStore("b", "default");
      expect(storeA).not.toBe(storeB);
    });
  });

  describe("SSR initial cookies", () => {
    it("getInitialItem returns parsed value from ssrCookies", () => {
      const client = new CookieClient([
        { name: "k", value: JSON.stringify({ x: 1 }) },
      ]);
      const store = client.getOrCreateStore("k", { x: 0 });
      expect(store.getInitialItem()).toEqual({ x: 1 });
    });

    it("falls back to defaultItem for invalid JSON in ssrCookies", () => {
      const client = new CookieClient([
        { name: "k", value: "not-json" },
      ]);
      const store = client.getOrCreateStore("k", "fallback");
      expect(store.getInitialItem()).toBe("fallback");
    });

    it("falls back to defaultItem when key not in ssrCookies", () => {
      const client = new CookieClient([
        { name: "other", value: JSON.stringify("val") },
      ]);
      const store = client.getOrCreateStore("missing", "fallback");
      expect(store.getInitialItem()).toBe("fallback");
    });

    it("works with no ssrCookies", () => {
      const client = new CookieClient();
      const store = client.getOrCreateStore("k", "default");
      expect(store.getInitialItem()).toBe("default");
    });
  });
});
