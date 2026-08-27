import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { SyncedStorageProvider } from "@/react/SyncedStorageProvider";
import { useStorageState } from "@/react/useStorageState";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SyncedStorageProvider, null, children);

describe("useStorageState", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("returns the default value on first render", () => {
    const { result } = renderHook(
      () => useStorageState("key", 0, { strategy: "localStorage" }),
      { wrapper },
    );
    expect(result.current[0]).toBe(0);
  });

  it("setState reference is stable across re-renders", () => {
    const { result } = renderHook(
      () => useStorageState("key", 0, { strategy: "localStorage" }),
      { wrapper },
    );
    const setStateBefore = result.current[1];
    act(() => {
      result.current[1](1);
    });
    expect(result.current[1]).toBe(setStateBefore);
  });

  it("updates state when called with a direct value", () => {
    const { result } = renderHook(
      () => useStorageState("key", 0, { strategy: "localStorage" }),
      { wrapper },
    );
    act(() => {
      result.current[1](99);
    });
    expect(result.current[0]).toBe(99);
  });

  it("updates state when called with a functional update", () => {
    const { result } = renderHook(
      () => useStorageState("key", 0, { strategy: "localStorage" }),
      { wrapper },
    );
    act(() => {
      result.current[1](5);
    });
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    expect(result.current[0]).toBe(6);
  });

  it("rapid sequential functional updates produce correct final value", () => {
    const { result } = renderHook(
      () => useStorageState("key", 0, { strategy: "localStorage" }),
      { wrapper },
    );
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
      const [state] = useStorageState("user", { name: "Alice", age: 20 });
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

  it("does not cause extra re-renders on mount when storage already contains equal object", () => {
    const existing = { name: "Alice", roles: ["admin"] };
    localStorage.setItem("user", JSON.stringify(existing));

    let renderCount = 0;
    let effectTriggerCount = 0;

    function TestComponent() {
      const [state] = useStorageState("user", {
        name: "Alice",
        roles: ["admin"],
      });
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
});

