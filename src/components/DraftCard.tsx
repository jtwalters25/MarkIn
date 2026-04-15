"use client";

import { useState } from "react";
import type { Draft, DraftEdit } from "@/types";
import DiffPreview from "./DiffPreview";

interface Props {
  draft: Draft;
  onResume?: (draft: Draft) => void;
  onSubmit?: (draft: Draft) => void;
  onDiscard?: (draft: Draft) => void;
}

function parseEdits(draft: Draft): DraftEdit[] {
  if (draft.editsJson) {
    try {
      const parsed = JSON.parse(draft.editsJson);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch {
      // fall through to legacy single-edit
    }
  }
  return [{
    file: draft.file,
    originalText: draft.oldText,
    newText: draft.newText,
    explanation: draft.explanation,
  }];
}

export default function DraftCard({ draft, onResume, onSubmit, onDiscard }: Props) {
  const [open, setOpen] = useState(false);
  const edits = parseEdits(draft);
  const multi = edits.length > 1;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <blockquote className="text-text italic">“{draft.request}”</blockquote>
          <div className="mt-2 text-xs text-text-dim flex flex-wrap gap-3">
            {multi ? (
              <span className="font-mono">{edits.length} files</span>
            ) : (
              <span className="font-mono">{edits[0].file}</span>
            )}
            <span>·</span>
            <span>{new Date(draft.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs text-text-muted hover:text-gold whitespace-nowrap"
        >
          {open ? "Hide diff" : multi ? `Show ${edits.length} diffs` : "Show diff"}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4">
          {edits.map((e, i) => (
            <div key={`${e.file}-${i}`} className="space-y-2">
              {multi && (
                <div className="text-xs uppercase tracking-widest text-text-dim">
                  Edit {i + 1} of {edits.length}
                </div>
              )}
              <DiffPreview
                edit={{
                  file: e.file,
                  originalText: e.originalText,
                  newText: e.newText,
                  lineNumber: 1,
                  explanation: e.explanation ?? "",
                }}
                fileContent={e.originalText}
              />
            </div>
          ))}
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
