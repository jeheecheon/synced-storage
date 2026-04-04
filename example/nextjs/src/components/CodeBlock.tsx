"use client";

type Props = { code: string };

export default function CodeBlock({ code }: Props) {
  return (
    <pre className="bg-zinc-900 rounded-lg p-4 text-sm font-mono text-zinc-300 overflow-x-auto leading-relaxed whitespace-pre">
      <code>{code}</code>
    </pre>
  );
}
