"use client";

import { useState } from "react";
import type { FileEdit } from "@/types";
import { extractReadableText, getLocationLabel, guessSection, wordDiff } from "@/lib/readable";
import DiffPreview from "./DiffPreview";

interface Props {
  edit: FileEdit;
  fileContent: string;
}

export default function PlainPreview({ edit, fileContent }: Props) {
  const [showTech, setShowTech] = useState(false);

  const location = getLocationLabel(edit.file);
  const section = guessSection(fileContent, edit.originalText);
  const before = extractReadableText(edit.originalText) || edit.originalText;
  const after = extractReadableText(edit.newText) || edit.newText;
  const { before: beforeSegs, after: afterSegs } = wordDiff(before, after);

  return (
    <div className="space-y-3">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 text-sm text-gold font-medium">
          <span>📍</span>
          <span>
            {location}
            {section ? <span className="text-text-muted"> → {section}</span> : null}
          </span>
        </div>

        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-widest text-text-dim mb-2">Before</div>
          <div className="rounded-md bg-bg-subtle border border-border-subtle px-4 py-3 text-text-muted leading-relaxed">
            {beforeSegs.map((s, i) => (
              <span key={i} className={s.changed ? "line-through decoration-diff-remove/70" : ""}>
                {s.text}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-widest text-text-dim mb-2">After</div>
          <div className="rounded-md border border-diff-add/30 border-l-4 border-l-diff-add bg-diff-addBg px-4 py-3 text-text leading-relaxed">
            {afterSegs.map((s, i) => (
              <span key={i} className={s.changed ? "font-semibold text-diff-add" : ""}>
                {s.text}
              </span>
            ))}
          </div>
        </div>

        {edit.explanation && (
          <p className="mt-5 text-sm text-text-muted italic">
            &ldquo;{edit.explanation}&rdquo;
          </p>
        )}
      </div>

      <button
        onClick={() => setShowTech((s) => !s)}
        className="text-xs text-text-dim hover:text-text flex items-center gap-1"
      >
        <span className={`transition-transform inline-block ${showTech ? "rotate-90" : ""}`}>›</span>
        Technical details
      </button>

      {showTech && (
        <div className="pt-2">
          <DiffPreview edit={edit} fileContent={fileContent} />
        </div>
      )}
    </div>
  );
}
