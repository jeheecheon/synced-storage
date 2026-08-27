import { describe, it, expect } from "vitest";
import { isEqual, isFunction, isServer, isBrowser, safelyGet } from "@/utils/misc";

describe("misc utils", () => {
  describe("isEqual", () => {
    it("compares primitive values correctly", () => {
      expect(isEqual(1, 1)).toBe(true);
      expect(isEqual(1, 2)).toBe(false);
      expect(isEqual("hello", "hello")).toBe(true);
      expect(isEqual("hello", "world")).toBe(false);
      expect(isEqual(true, true)).toBe(true);
      expect(isEqual(true, false)).toBe(false);
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(undefined, undefined)).toBe(true);
      expect(isEqual(null, undefined)).toBe(false);
      expect(isEqual(NaN, NaN)).toBe(true);
      expect(isEqual(0, -0)).toBe(true);
    });

    it("compares arrays correctly", () => {
      expect(isEqual([], [])).toBe(true);
      expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(isEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
      expect(isEqual([{ a: 1 }, [2]], [{ a: 1 }, [2]])).toBe(true);
      expect(isEqual([{ a: 1 }], [{ a: 2 }])).toBe(false);
    });

    it("compares objects correctly", () => {
      expect(isEqual({}, {})).toBe(true);
      expect(isEqual({ a: 1, b: "2" }, { a: 1, b: "2" })).toBe(true);
      expect(isEqual({ a: 1, b: "2" }, { b: "2", a: 1 })).toBe(true);
      expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(isEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
      expect(isEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } })).toBe(true);
      expect(isEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } })).toBe(false);
    });

    it("compares different types", () => {
      expect(isEqual({}, [])).toBe(false);
      expect(isEqual([], {})).toBe(false);
      expect(isEqual(null, {})).toBe(false);
      expect(isEqual({}, null)).toBe(false);
      expect(isEqual(1, "1")).toBe(false);
    });

    it("compares Date and RegExp instances", () => {
      const d1 = new Date(1700000000000);
      const d2 = new Date(1700000000000);
      const d3 = new Date(1700000000001);
      expect(isEqual(d1, d2)).toBe(true);
      expect(isEqual(d1, d3)).toBe(false);

      expect(isEqual(/test/g, /test/g)).toBe(true);
      expect(isEqual(/test/g, /test/i)).toBe(false);
      expect(isEqual(/test1/g, /test2/g)).toBe(false);
    });
  });

  describe("safelyGet", () => {
    it("returns callback result if no error thrown", () => {
      expect(safelyGet(() => 42)).toBe(42);
    });

    it("returns undefined if error is thrown", () => {
      expect(
        safelyGet(() => {
          throw new Error("fail");
        }),
      ).toBeUndefined();
    });
  });

  describe("isFunction", () => {
    it("identifies functions", () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function () {})).toBe(true);
      expect(isFunction({})).toBe(false);
      expect(isFunction(null)).toBe(false);
    });
  });

  describe("environment helpers", () => {
    it("identifies browser/server correctly", () => {
      expect(typeof isServer()).toBe("boolean");
      expect(typeof isBrowser()).toBe("boolean");
    });
  });
});
