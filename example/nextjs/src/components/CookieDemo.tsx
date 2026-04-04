"use client";

import { useCookieState } from "synced-storage/react";
import CodeBlock from "@/components/CodeBlock";

const SNIPPET = `import { useCookieState } from "synced-storage/react";

function CookieCounter() {
  const [count, setCount] = useCookieState("counter", 0);

  return (
    <button onClick={() => setCount(prev => prev + 1)}>
      Count: {count}
    </button>
  );
}`;

export default function CookieDemo() {
  const [count, setCount] = useCookieState("cookie-counter", 0);

  function handleIncrement() {
    setCount((prev) => prev + 1);
  }

  function handleDecrement() {
    setCount((prev) => prev - 1);
  }

  function handleReset() {
    setCount(0);
  }

  return (
    <section className="border border-amber-500/30 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-amber-500/20 bg-amber-500/5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <h2 className="text-amber-400 font-semibold tracking-wide text-sm uppercase">
            Cookie State
          </h2>
        </div>
        <p className="text-zinc-500 text-xs mt-1">
          Persists across browser sessions via HTTP cookie
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
        <div className="p-6">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-medium">
            Usage
          </p>
          <CodeBlock code={SNIPPET} />
        </div>

        <div className="p-6 flex flex-col justify-center">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-medium">
            Live Demo
          </p>
          <div className="text-7xl font-bold text-amber-400 tabular-nums mb-8 text-center">
            {count}
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleDecrement}
              className="px-4 py-2 rounded-lg border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-colors text-sm font-medium"
            >
              −1
            </button>
            <button
              onClick={handleIncrement}
              className="px-4 py-2 rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors text-sm font-bold"
            >
              +1
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors text-sm font-medium"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
