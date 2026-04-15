"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import type { ScheduledPR } from "@/types";

export default function ScheduledPage() {
  const [items, setItems] = useState<ScheduledPR[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/schedule");
    const data = await res.json();
    setItems(data.scheduled ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function cancel(id: string) {
    await fetch(`/api/schedule?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-10 max-w-4xl mx-auto w-full space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Scheduled</h1>
          <p className="text-text-muted text-sm mt-1">
            Changes that will be sent for review automatically at the time you set.
          </p>
        </header>

        {loading ? (
          <div className="text-text-dim">Loading…</div>
        ) : items.length === 0 ? (
          <div className="card p-8 text-center text-text-muted">
            Nothing scheduled. From the editor, pick &ldquo;Schedule for later&rdquo; instead of &ldquo;Send for review.&rdquo;
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((s) => (
              <li key={s.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <blockquote className="text-text italic">&ldquo;{s.request}&rdquo;</blockquote>
                    <div className="mt-2 text-xs text-text-dim flex flex-wrap gap-3">
                      <StatusBadge status={s.status} />
                      <span>·</span>
                      <span>Fires {new Date(s.scheduledFor).toLocaleString()}</span>
                      <span>·</span>
                      <span>{s.edits.length} change{s.edits.length === 1 ? "" : "s"}</span>
                    </div>
                    {s.failureReason && (
                      <div className="mt-2 text-xs text-diff-remove">{s.failureReason}</div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {s.prUrl && (
                      <a href={s.prUrl} target="_blank" rel="noreferrer" className="text-gold text-sm hover:underline whitespace-nowrap">
                        Change #{s.prNumber} ↗
                      </a>
                    )}
                    {s.status === "pending" && (
                      <button onClick={() => cancel(s.id)} className="btn-danger py-1 text-xs">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                <ul className="mt-3 text-xs text-text-dim space-y-1">
                  {s.edits.map((e, i) => (
                    <li key={i} className="font-mono">{e.file}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: ScheduledPR["status"] }) {
  const map: Record<ScheduledPR["status"], string> = {
    pending: "text-gold border-gold/40",
    submitted: "text-diff-add border-diff-add/40",
    failed: "text-diff-remove border-diff-remove/40",
    cancelled: "text-text-dim border-border",
  };
  const labels: Record<ScheduledPR["status"], string> = {
    pending: "scheduled",
    submitted: "sent",
    failed: "failed",
    cancelled: "cancelled",
  };
  return (
    <span className={`px-1.5 py-0.5 rounded border text-[10px] uppercase tracking-wider ${map[status]}`}>
      {labels[status]}
    </span>
  );
}
