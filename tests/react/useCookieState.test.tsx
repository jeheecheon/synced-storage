import { describe, it, expect, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useCookieState } from "@/react/useCookieState";
import { SyncedStorageProvider } from "@/react/SyncedStorageProvider";

afterEach(cleanup);

function wrapper({ children }: { children: React.ReactNode }) {
  return <SyncedStorageProvider>{children}</SyncedStorageProvider>;
}

function ssrWrapper(ssrCookies: CookieListItem[]) {
  return ({ children }: { children: React.ReactNode }) => (
    <SyncedStorageProvider ssrCookies={ssrCookies}>{children}</SyncedStorageProvider>
  );
}

describe("useCookieState", () => {
  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useCookieState("k", "default"));
    }).toThrow("useCookieState must be used within a SyncedStorageProvider");
  });

  it("returns defaultValue as initial state", () => {
    const { result } = renderHook(() => useCookieState("k", "default"), { wrapper });
    expect(result.current[0]).toBe("default");
  });

  it("setState with direct value updates state", () => {
    const { result } = renderHook(() => useCookieState("direct-set", "default"), { wrapper });

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
  });

  it("setState persists value to cookie", () => {
    const { result } = renderHook(() => useCookieState("persist-check", "default"), { wrapper });

    act(() => {
      result.current[1]("persisted");
    });

    expect(document.cookie).toContain("persist-check=");
  });

  it("setState with function updater uses current React state", () => {
    const { result } = renderHook(() => useCookieState("fn-update", 0), { wrapper });

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it("returns initialItem from SSR cookies", () => {
    const cookies = [{ name: "ssr-key", value: JSON.stringify("ssr-value") }];
    const { result } = renderHook(
      () => useCookieState("ssr-key", "default"),
      { wrapper: ssrWrapper(cookies) }
    );
    expect(result.current[0]).toBe("ssr-value");
  });

  it("consecutive functional setStates use fresh state", () => {
    const { result } = renderHook(() => useCookieState("counter", 0), { wrapper });

    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });
});
