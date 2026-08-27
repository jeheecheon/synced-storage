import { describe, it, expect, assert, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { useContext } from "react";
import {
  SyncedStorageProvider,
  SyncedStorageContext,
} from "@/react/SyncedStorageProvider";

function TestConsumer() {
  const ctx = useContext(SyncedStorageContext);
  if (!ctx) {
    return <div data-testid="ctx">null</div>;
  }

  return <div data-testid="ctx">provided</div>;
}

afterEach(cleanup);

describe("SyncedStorageProvider", () => {
  it("renders children", () => {
    render(
      <SyncedStorageProvider>
        <span data-testid="child">hello</span>
      </SyncedStorageProvider>,
    );
    expect(screen.getByTestId("child").textContent).toBe("hello");
  });

  it("provides cookieClient and storageClient through context", () => {
    render(
      <SyncedStorageProvider>
        <TestConsumer />
      </SyncedStorageProvider>,
    );
    expect(screen.getByTestId("ctx").textContent).toBe("provided");
  });

  it("cookieClient receives ssrCookies", () => {
    function SsrConsumer() {
      const ctx = useContext(SyncedStorageContext);
      assert(ctx, "context is null");

      const store = ctx.cookieClient.getOrCreateStore("k", "default");
      return <div data-testid="val">{store.getInitialItem()}</div>;
    }

    render(
      <SyncedStorageProvider
        ssrCookies={[{ name: "k", value: JSON.stringify("ssr-val") }]}
      >
        <SsrConsumer />
      </SyncedStorageProvider>,
    );
    expect(screen.getByTestId("val").textContent).toBe("ssr-val");
  });

  it("context is null outside provider", () => {
    render(<TestConsumer />);
    expect(screen.getByTestId("ctx").textContent).toBe("null");
  });

  it("maintains stable client instances when ssrCookies prop reference changes on parent rerender", () => {
    let capturedCtx1: any;
    let capturedCtx2: any;

    function Consumer({ renderId }: { renderId: number }) {
      const ctx = useContext(SyncedStorageContext);
      if (renderId === 1) {
        capturedCtx1 = ctx;
      } else {
        capturedCtx2 = ctx;
      }
      return <div>{ctx?.cookieClient ? "ready" : "none"}</div>;
    }

    const { rerender } = render(
      <SyncedStorageProvider ssrCookies={[{ name: "k", value: "1" }]}>
        <Consumer renderId={1} />
      </SyncedStorageProvider>,
    );

    // Re-render with new array reference
    rerender(
      <SyncedStorageProvider ssrCookies={[{ name: "k", value: "1" }]}>
        <Consumer renderId={2} />
      </SyncedStorageProvider>,
    );

    expect(capturedCtx1).toBe(capturedCtx2);
    expect(capturedCtx1.cookieClient).toBe(capturedCtx2.cookieClient);
    expect(capturedCtx1.storageClient).toBe(capturedCtx2.storageClient);
  });
});

