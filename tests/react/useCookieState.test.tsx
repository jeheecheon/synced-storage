import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, renderHook, act } from "@testing-library/react";
import React from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
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

  it("dynamic component mount after setState (CSR navigation bug regression test)", () => {
    document.cookie = "office-mode=true; path=/";
    const ssrCookies = [{ name: "office-mode", value: "true" }];

    let updateOfficeMode!: (val: boolean) => void;
    let mountComponentB!: () => void;

    let renderCount = 0;
    const renderedValues: boolean[] = [];
    const effectValues: boolean[] = [];

    function ComponentA() {
      const [, setState] = useCookieState("office-mode", false);
      updateOfficeMode = setState;

      return null;
    }

    function ComponentB() {
      const [state] = useCookieState("office-mode", false);
      renderCount++;
      renderedValues.push(state);

      React.useEffect(() => {
        effectValues.push(state);
      }, [state]);

      return <div>{String(state)}</div>;
    }

    function App() {
      const [showB, setShowB] = React.useState(false);
      mountComponentB = () => setShowB(true);

      return (
        <SyncedStorageProvider ssrCookies={ssrCookies}>
          <ComponentA />
          {showB && <ComponentB />}
        </SyncedStorageProvider>
      );
    }

    render(<App />);

    act(() => {
      updateOfficeMode(false);
    });

    act(() => {
      mountComponentB();
    });

    expect(renderCount).toBe(1);
    expect(renderedValues).toEqual([false]);
    expect(effectValues).toEqual([false]);
  });

  it("SSR hydration with renderToString and hydrateRoot", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    document.cookie = `theme=${encodeURIComponent(JSON.stringify("dark"))}; path=/`;
    const ssrCookies = [{ name: "theme", value: JSON.stringify("dark") }];

    function ThemeComponent() {
      const [theme] = useCookieState("theme", "light");

      return <div data-testid="theme">{theme}</div>;
    }

    const app = (
      <SyncedStorageProvider ssrCookies={ssrCookies}>
        <ThemeComponent />
      </SyncedStorageProvider>
    );

    const html = renderToString(app);
    expect(html).toContain("dark");

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    let root: ReturnType<typeof hydrateRoot>;
    act(() => {
      root = hydrateRoot(container, app);
    });

    expect(container.textContent).toBe("dark");
    expect(errorSpy).not.toHaveBeenCalled();

    act(() => {
      root.unmount();
    });

    document.body.removeChild(container);
    errorSpy.mockRestore();
  });

  it("storing and reading null cookie state when defaultValue is a non-null string", () => {
    const { result } = renderHook(
      () => useCookieState<string | null>("nullable-cookie", "default-value"),
      { wrapper },
    );

    expect(result.current[0]).toBe("default-value");

    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBeNull();

    const { result: secondResult } = renderHook(
      () => useCookieState<string | null>("nullable-cookie", "default-value"),
      { wrapper },
    );

    expect(secondResult.current[0]).toBeNull();
  });
});

