import { describe, it, expect, beforeEach } from "vitest";
import { StorageClient } from "@/core/StorageClient";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe("StorageClient", () => {
  describe("getOrCreateStore", () => {
    it("returns a store with expected methods", () => {
      const client = new StorageClient();
      const store = client.getOrCreateStore("key", "default");
      expect(store.getItem).toBeTypeOf("function");
      expect(store.setItem).toBeTypeOf("function");
      expect(store.removeItem).toBeTypeOf("function");
      expect(store.subscribe).toBeTypeOf("function");
      expect(store.getInitialItem).toBeTypeOf("function");
    });

    it("returns cached store on second call with same key", () => {
      const client = new StorageClient();
      const store1 = client.getOrCreateStore("key", "default");
      const store2 = client.getOrCreateStore("key", "default");
      expect(store1).toBe(store2);
    });

    it("defaults strategy to localStorage", () => {
      const client = new StorageClient();
      const store = client.getOrCreateStore("key", "default");
      store.setItem("val");
      expect(localStorage.getItem("key")).toBe(JSON.stringify("val"));
      expect(sessionStorage.getItem("key")).toBeNull();
    });

    it("different strategies for same key yield different stores", () => {
      const client = new StorageClient();
      const local = client.getOrCreateStore("key", "default", { strategy: "localStorage" });
      const session = client.getOrCreateStore("key", "default", { strategy: "sessionStorage" });
      expect(local).not.toBe(session);
    });

    it("same key with same strategy returns same instance", () => {
      const client = new StorageClient();
      const s1 = client.getOrCreateStore("key", "d", { strategy: "sessionStorage" });
      const s2 = client.getOrCreateStore("key", "d", { strategy: "sessionStorage" });
      expect(s1).toBe(s2);
    });
  });
});
