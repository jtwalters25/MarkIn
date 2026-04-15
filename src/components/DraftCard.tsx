"use client";

import { useState } from "react";
import type { Draft } from "@/types";
import DiffPreview from "./DiffPreview";

interface Props {
  draft: Draft;
  onResume?: (draft: Draft) => void;
  onSubmit?: (draft: Draft) => void;
  onDiscard?: (draft: Draft) => void;
}

export default function DraftCard({ draft, onResume, onSubmit, onDiscard }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <blockquote className="text-text italic">“{draft.request}”</blockquote>
          <div className="mt-2 text-xs text-text-dim flex flex-wrap gap-3">
            <span className="font-mono">{draft.file}</span>
            <span>·</span>
            <span>{new Date(draft.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs text-text-muted hover:text-gold whitespace-nowrap"
        >
          {open ? "Hide diff" : "Show diff"}
        </button>
      </div>

      {open && (
        <div className="mt-4">
          <DiffPreview
            edit={{
              file: draft.file,
              originalText: draft.oldText,
              newText: draft.newText,
              lineNumber: 1,
              explanation: draft.explanation,
            }}
            fileContent={draft.oldText}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {onResume && (
          <button onClick={() => onResume(draft)} className="btn-ghost">Resume</button>
        )}
        {onSubmit && (
          <button onClick={() => onSubmit(draft)} className="btn-gold">Send for review</button>
        )}
        {onDiscard && (
          <button onClick={() => onDiscard(draft)} className="btn-danger">Discard</button>
        )}
      </div>
    </div>
  );
}
