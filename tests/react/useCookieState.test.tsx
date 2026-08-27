import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { SyncedStorageProvider } from "@/react/SyncedStorageProvider";
import { useCookieState } from "@/react/useCookieState";

function clearCookies() {
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
}

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SyncedStorageProvider, null, children);

describe("useCookieState", () => {
  beforeEach(() => {
    clearCookies();
  });

  it("returns the default value on first render", () => {
    const { result } = renderHook(() => useCookieState("count", 0), {
      wrapper,
    });
    expect(result.current[0]).toBe(0);
  });

  it("setState reference is stable across re-renders", () => {
    const { result } = renderHook(() => useCookieState("count", 0), {
      wrapper,
    });
    const setStateBefore = result.current[1];
    act(() => {
      result.current[1](1);
    });
    expect(result.current[1]).toBe(setStateBefore);
  });

  it("updates state when called with a direct value", () => {
    const { result } = renderHook(() => useCookieState("count", 0), {
      wrapper,
    });
    act(() => {
      result.current[1](99);
    });
    expect(result.current[0]).toBe(99);
  });

  it("updates state when called with a functional update", () => {
    const { result } = renderHook(() => useCookieState("count", 0), {
      wrapper,
    });
    act(() => {
      result.current[1](5);
    });
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    expect(result.current[0]).toBe(6);
  });

  it("rapid sequential functional updates produce correct final value", () => {
    const { result } = renderHook(() => useCookieState("count", 0), {
      wrapper,
    });
    act(() => {
      result.current[1]((prev) => prev + 1);
      result.current[1]((prev) => prev + 1);
      result.current[1]((prev) => prev + 1);
    });
    expect(result.current[0]).toBe(3);
  });

  it("does not cause extra re-renders or effect re-triggers on mount with object state", () => {
    let renderCount = 0;
    let effectTriggerCount = 0;

    function TestComponent() {
      const [state] = useCookieState("user", { name: "Alice", age: 20 });
      renderCount++;

      React.useEffect(() => {
        effectTriggerCount++;
      }, [state]);

      return <div>{state.name}</div>;
    }

    renderHook(() => null, {
      wrapper: () => (
        <SyncedStorageProvider>
          <TestComponent />
        </SyncedStorageProvider>
      ),
    });

    expect(renderCount).toBe(1);
    expect(effectTriggerCount).toBe(1);
  });

  it("does not cause extra re-renders when initialized with SSR cookies for object state", () => {
    let renderCount = 0;
    let effectTriggerCount = 0;

    const initialData = { name: "Alice", items: [1, 2, 3] };
    const serialized = encodeURIComponent(JSON.stringify(initialData));
    document.cookie = `user=${serialized}; path=/`;

    const ssrCookies = [{ name: "user", value: serialized }];

    function TestComponent() {
      const [state] = useCookieState("user", { name: "", items: [] });
      renderCount++;

      React.useEffect(() => {
        effectTriggerCount++;
      }, [state]);

      return <div>{state.name}</div>;
    }

    renderHook(() => null, {
      wrapper: () => (
        <SyncedStorageProvider ssrCookies={ssrCookies}>
          <TestComponent />
        </SyncedStorageProvider>
      ),
    });

    expect(renderCount).toBe(1);
    expect(effectTriggerCount).toBe(1);
  });
});

