"use client";

import { useState, useEffect, useRef } from "react";
import { useStorageState } from "synced-storage/react";
import CodeBlock from "@/components/CodeBlock";

const SNIPPET = `import { useStorageState } from "synced-storage/react";

function SessionNote() {
  const [note, setNote] = useStorageState(
    "session-note", "",
    {
      strategy: "sessionStorage",
      expires: new Date(Date.now() + 15_000),
    }
  );

  return <p>{note || "(expires in 15s)"}</p>;
}`;

const EXPIRY_MS = 15_000;

export default function SessionStorageDemo() {
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
  const [note, setNote] = useStorageState("ss-demo-note", "", {
    strategy: "sessionStorage",
    expires: expiresAt,
  });
  const [draft, setDraft] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!expiresAt) { return; }

    if (intervalRef.current) { clearInterval(intervalRef.current); }

    intervalRef.current = setInterval(() => {
      const left = expiresAt.getTime() - Date.now();

      if (left <= 0) {
        setRemaining(0);
        setExpired(true);
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setExpiresAt(undefined);

        return;
      }

      setRemaining(left);
    }, 200);

    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); }
    };
  }, [expiresAt]);

  function handleSave() {
    if (!draft.trim()) { return; }

    const expiry = new Date(Date.now() + EXPIRY_MS);

    setExpiresAt(expiry);
    setExpired(false);
    setRemaining(EXPIRY_MS);
    setNote(draft);
  }

  function formatRemaining(ms: number) {
    const s = Math.ceil(ms / 1000);
    return `${s}s`;
  }

  return (
    <section className="border border-emerald-500/30 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <h2 className="text-emerald-400 font-semibold tracking-wide text-sm uppercase">
            sessionStorage State
          </h2>
        </div>
        <p className="text-zinc-500 text-xs mt-1">
          Tab-scoped, cleared on close — with optional expiry
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
            <p className="text-xs text-zinc-500 mb-1">Note</p>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { handleSave(); }
              }}
              placeholder="Type a note..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={!draft.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed self-start"
          >
            Save (15s expiry)
          </button>
          <div className="bg-zinc-900 rounded-lg px-3 py-2 min-h-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-zinc-500">Stored value</p>
              {remaining !== null && remaining > 0 && (
                <span className="text-xs text-emerald-400 tabular-nums">
                  expires in {formatRemaining(remaining)}
                </span>
              )}
              {expired && (
                <span className="text-xs text-zinc-500 italic">expired</span>
              )}
            </div>
            <p className="text-emerald-300 text-sm break-all">
              {note
                ? note
                : <span className="text-zinc-600 italic">
                    {expired ? "(expired)" : "empty"}
                  </span>
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
