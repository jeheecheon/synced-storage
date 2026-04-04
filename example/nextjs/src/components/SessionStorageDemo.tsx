"use client";

import { useStorageState } from "synced-storage/react";

export default function SessionStorageDemo() {
  const [count, setCount] = useStorageState("ss-demo-counter", 0, {
    strategy: "sessionStorage",
  });

  return (
    <div className="border border-emerald-500/40 rounded-lg p-6 space-y-4">
      <div>
        <span className="text-xs text-emerald-400 uppercase tracking-widest font-semibold">sessionStorage State</span>
        <p className="text-zinc-400 text-sm mt-1">Tab-scoped, cleared on close.</p>
      </div>
      <p className="text-5xl font-bold text-emerald-300 tabular-nums">{count}</p>
      <div className="flex gap-2">
        <button onClick={() => setCount((prev) => prev - 1)} className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-200 text-sm hover:bg-zinc-700">−1</button>
        <button onClick={() => setCount((prev) => prev + 1)} className="px-3 py-1.5 rounded bg-emerald-500 text-zinc-950 text-sm font-semibold hover:bg-emerald-400">+1</button>
        <button onClick={() => setCount(0)} className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700">Reset</button>
      </div>
    </div>
  );
}
