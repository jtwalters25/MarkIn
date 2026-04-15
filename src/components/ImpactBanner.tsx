"use client";

import { useState } from "react";
import type { ImpactReport } from "@/types";

export default function ImpactBanner({ impact }: { impact?: ImpactReport }) {
  const [open, setOpen] = useState(false);

  if (!impact || !impact.searched) return null;
  if (impact.totalCount === 0) {
    return (
      <div className="text-xs text-text-dim flex items-center gap-2">
        <span className="text-diff-add">✓</span>
        This text appears nowhere else on your site.
      </div>
    );
  }

  return (
    <div className="card p-4 border-gold/40 bg-gold/5">
      <div className="flex items-start gap-3">
        <span className="text-gold text-lg leading-none">↳</span>
        <div className="text-sm flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-gold">
              This text also appears on {impact.totalCount} other{" "}
              {impact.totalCount === 1 ? "page" : "pages"}
            </div>
            <button
              onClick={() => setOpen((o) => !o)}
              className="text-xs text-text-muted hover:text-gold"
            >
              {open ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-text-dim text-xs mt-1">
            Only the page above is being changed. The others stay as-is.
          </p>
          {open && impact.hits.length > 0 && (
            <ul className="mt-3 space-y-1">
              {impact.hits.map((h) => (
                <li key={h.path} className="text-xs">
                  <span className="text-text-muted">{h.path}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
