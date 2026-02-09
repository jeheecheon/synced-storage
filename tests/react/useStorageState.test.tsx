import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useStorageState } from "@/react/useStorageState";
import { SyncedStorageProvider } from "@/react/SyncedStorageProvider";

afterEach(cleanup);

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <SyncedStorageProvider>{children}</SyncedStorageProvider>;
}

describe("useStorageState", () => {
  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useStorageState("k", "default"));
    }).toThrow("useStorageState must be used within a SyncedStorageProvider");
  });

  it("returns defaultValue as initial state", () => {
    const { result } = renderHook(() => useStorageState("k", "default"), { wrapper });
    expect(result.current[0]).toBe("default");
  });

  it("reads existing storage value on mount", () => {
    localStorage.setItem("pre", JSON.stringify("existing"));
    const { result } = renderHook(() => useStorageState("pre", "default"), { wrapper });
    expect(result.current[0]).toBe("existing");
  });

  it("setState with direct value updates state", () => {
    const { result } = renderHook(() => useStorageState("direct", "default"), { wrapper });

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
  });

  it("setState persists value to localStorage", () => {
    const { result } = renderHook(() => useStorageState("persist-check", "default"), { wrapper });

    act(() => {
      result.current[1]("persisted");
    });

    expect(localStorage.getItem("persist-check")).toBe(JSON.stringify("persisted"));
  });

  it("setState with function updater uses current React state", () => {
    const { result } = renderHook(() => useStorageState("fn", 0), { wrapper });

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it("state updates on external StorageEvent", () => {
    const { result } = renderHook(() => useStorageState("ext", "default"), { wrapper });

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "ext",
          newValue: JSON.stringify("from-other-tab"),
        })
      );
    });

    expect(result.current[0]).toBe("from-other-tab");
  });

  it("works with sessionStorage strategy", () => {
    sessionStorage.setItem("sess", JSON.stringify("session-val"));
    const { result } = renderHook(
      () => useStorageState("sess", "default", { strategy: "sessionStorage" }),
      { wrapper }
    );
    expect(result.current[0]).toBe("session-val");
  });

  it("consecutive functional setStates use fresh state", () => {
    const { result } = renderHook(() => useStorageState("counter", 0), { wrapper });

    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });
});
