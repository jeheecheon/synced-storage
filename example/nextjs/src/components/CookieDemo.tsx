"use client";

import { useCookieState } from "synced-storage/react";

export default function CookieDemo() {
  const [count, setCount] = useCookieState("cookie-counter", 0);

  return (
    <div className="border border-amber-500/40 rounded-lg p-6 space-y-4">
      <div>
        <span className="text-xs text-amber-400 uppercase tracking-widest font-semibold">
          Cookie State
        </span>
        <p className="text-zinc-400 text-sm mt-1">
          Persists across sessions via HTTP cookie.
        </p>
      </div>
      <p className="text-5xl font-bold text-amber-300 tabular-nums">{count}</p>
      <div className="flex gap-2">
        <button
          onClick={() => setCount((prev) => prev - 1)}
          className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-200 text-sm hover:bg-zinc-700"
        >
          −1
        </button>
        <button
          onClick={() => setCount((prev) => prev + 1)}
          className="px-3 py-1.5 rounded bg-amber-500 text-zinc-950 text-sm font-semibold hover:bg-amber-400"
        >
          +1
        </button>
        <button
          onClick={() => setCount(0)}
          className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
