"use client";

import { useState } from "react";
import { useStorageState } from "synced-storage/react";
import CodeBlock from "@/components/CodeBlock";

const SNIPPET = `import { useStorageState } from "synced-storage/react";

function MessageBox() {
  const [message, setMessage] = useStorageState(
    "message", "",
    { strategy: "localStorage" }
  );

  return <input value={message} onChange={e => setMessage(e.target.value)} />;
}`;

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
    <section className="border border-indigo-500/30 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-indigo-500/20 bg-indigo-500/5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <h2 className="text-indigo-400 font-semibold tracking-wide text-sm uppercase">
            localStorage State
          </h2>
        </div>
        <p className="text-zinc-500 text-xs mt-1">
          Persists across sessions, syncs across tabs in real time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
        <div className="p-6">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-medium">
            Usage
          </p>
          <CodeBlock code={SNIPPET} />
        </div>

        <div className="p-6 flex flex-col justify-center gap-4">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1 font-medium">
            Live Demo
          </p>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Draft</p>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { handleSave(); }
              }}
              placeholder="Type a message..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400 transition-colors text-sm font-bold"
            >
              Save
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors text-sm font-medium"
            >
              Clear
            </button>
          </div>
          <div className="bg-zinc-900 rounded-lg px-3 py-2 min-h-10">
            <p className="text-xs text-zinc-500 mb-1">Stored value</p>
            <p className="text-indigo-300 text-sm break-all">
              {message || <span className="text-zinc-600 italic">empty</span>}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
