"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ChangeHistory from "@/components/ChangeHistory";
import type { Change } from "@/types";

export default function HistoryPage() {
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/submit")
      .then((r) => r.json())
      .then((d) => setChanges(d.changes ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-10 max-w-4xl mx-auto w-full space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">History</h1>
          <p className="text-text-muted text-sm mt-1">
            Every change you&apos;ve sent through MarkIn.
          </p>
        </header>

        {loading ? (
          <div className="text-text-dim">Loading…</div>
        ) : (
          <ChangeHistory changes={changes} />
        )}

        {/* TODO: audit trail export (CSV/PDF for compliance) */}
      </main>
    </div>
  );
}
