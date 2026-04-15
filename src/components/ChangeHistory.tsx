"use client";

import type { Change } from "@/types";

export default function ChangeHistory({ changes }: { changes: Change[] }) {
  if (!changes.length) {
    return (
      <div className="card p-8 text-center text-text-muted">
        No changes yet. Your shipped edits will appear here.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {changes.map((c) => (
        <li key={c.id} className="card p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <blockquote className="text-text italic">“{c.request}”</blockquote>
              <div className="mt-2 text-xs text-text-dim flex flex-wrap gap-3">
                <span className="font-mono">{c.file}</span>
                <span>·</span>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
                <span>·</span>
                <StatusBadge status={c.status} />
              </div>
            </div>
            {c.prUrl && (
              <a
                href={c.prUrl}
                target="_blank"
                rel="noreferrer"
                className="text-gold text-sm hover:underline whitespace-nowrap"
              >
                PR #{c.prNumber} ↗
              </a>
            )}
          </div>
          {c.explanation && (
            <p className="mt-3 text-sm text-text-muted">{c.explanation}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

function StatusBadge({ status }: { status: Change["status"] }) {
  const map: Record<Change["status"], string> = {
    submitted: "text-gold border-gold/40",
    merged: "text-diff-add border-diff-add/40",
    closed: "text-diff-remove border-diff-remove/40",
  };
  return (
    <span className={`px-1.5 py-0.5 rounded border text-[10px] uppercase tracking-wider ${map[status]}`}>
      {status}
    </span>
  );
}
