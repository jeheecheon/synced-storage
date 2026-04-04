"use client";

import { useState } from "react";
import { useStorageState } from "synced-storage/react";

export default function LocalStorageDemo() {
  const [message, setMessage] = useStorageState("ls-demo-message", "", {
    strategy: "localStorage",
  });
  const [draft, setDraft] = useState(message);

  function handleSave() {
    setMessage(draft);
  }

  function handleClear() {
    setDraft("");
    setMessage("");
  }

  return (
    <div className="border border-indigo-500/40 rounded-lg p-6 space-y-4">
      <div>
        <span className="text-xs text-indigo-400 uppercase tracking-widest font-semibold">localStorage State</span>
        <p className="text-zinc-400 text-sm mt-1">Persists across sessions, syncs across tabs in real time.</p>
      </div>
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { handleSave(); }
        }}
        placeholder="Type a message..."
        className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-200 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
      />
      <div className="flex gap-2">
        <button onClick={handleSave} className="px-3 py-1.5 rounded bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400">Save</button>
        <button onClick={handleClear} className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700">Clear</button>
      </div>
      <div className="bg-zinc-900 rounded px-3 py-2">
        <p className="text-xs text-zinc-500 mb-1">Stored value</p>
        <p className="text-indigo-300 text-sm break-all">
          {message || <span className="text-zinc-600 italic">empty</span>}
        </p>
      </div>
    </div>
  );
}
