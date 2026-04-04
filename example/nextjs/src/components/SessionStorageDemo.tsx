"use client";

import { useState, useEffect, useRef } from "react";
import { useStorageState } from "synced-storage/react";

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
    <div className="border border-emerald-500/40 rounded-lg p-6 space-y-4">
      <div>
        <span className="text-xs text-emerald-400 uppercase tracking-widest font-semibold">sessionStorage State</span>
        <p className="text-zinc-400 text-sm mt-1">Tab-scoped, cleared on close — with optional expiry.</p>
      </div>
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { handleSave(); }
        }}
        placeholder="Type a note..."
        className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-200 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
      />
      <button
        onClick={handleSave}
        disabled={!draft.trim()}
        className="px-3 py-1.5 rounded bg-emerald-500 text-zinc-950 text-sm font-semibold hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Save (15s expiry)
      </button>
      <div className="bg-zinc-900 rounded px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-zinc-500">Stored value</p>
          {remaining !== null && remaining > 0 && (
            <span className="text-xs text-emerald-400 tabular-nums">expires in {formatRemaining(remaining)}</span>
          )}
          {expired && (
            <span className="text-xs text-zinc-500 italic">expired</span>
          )}
        </div>
        <p className="text-emerald-300 text-sm break-all">
          {note
            ? note
            : <span className="text-zinc-600 italic">{expired ? "(expired)" : "empty"}</span>
          }
        </p>
      </div>
    </div>
  );
}
