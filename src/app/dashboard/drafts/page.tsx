"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import DraftCard from "@/components/DraftCard";
import type { Draft } from "@/types";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/drafts");
    const data = await res.json();
    setDrafts(data.drafts ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function discard(d: Draft) {
    await fetch(`/api/drafts?id=${d.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-10 max-w-4xl mx-auto w-full space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Drafts</h1>
          <p className="text-text-muted text-sm mt-1">
            Saved-for-later changes. Resume editing, ship now, or discard.
          </p>
        </header>

        {loading ? (
          <div className="text-text-dim">Loading…</div>
        ) : drafts.length === 0 ? (
          <div className="card p-8 text-center text-text-muted">
            No drafts yet. Save a change for later from the editor.
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((d) => (
              <DraftCard
                key={d.id}
                draft={d}
                onResume={() => (window.location.href = "/dashboard")}
                onSubmit={() => alert("TODO: submit draft as PR via /api/submit")}
                onDiscard={discard}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
