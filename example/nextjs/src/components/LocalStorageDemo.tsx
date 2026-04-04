"use client";

import { useStorageState } from "synced-storage/react";

export default function LocalStorageDemo() {
  const [count, setCount] = useStorageState("ls-demo-counter", 0, {
    strategy: "localStorage",
  });

  return (
    <div className="border border-indigo-500/40 rounded-lg p-6 space-y-4">
      <div>
        <span className="text-xs text-indigo-400 uppercase tracking-widest font-semibold">localStorage State</span>
        <p className="text-zinc-400 text-sm mt-1">Persists across sessions, syncs across tabs in real time.</p>
      </div>
      <p className="text-5xl font-bold text-indigo-300 tabular-nums">{count}</p>
      <div className="flex gap-2">
        <button onClick={() => setCount((prev) => prev - 1)} className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-200 text-sm hover:bg-zinc-700">−1</button>
        <button onClick={() => setCount((prev) => prev + 1)} className="px-3 py-1.5 rounded bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400">+1</button>
        <button onClick={() => setCount(0)} className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700">Reset</button>
      </div>
    </div>
  );
}
