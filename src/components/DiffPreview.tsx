"use client";

import type { FileEdit } from "@/types";

interface Props {
  edit: FileEdit;
  fileContent: string;
  contextLines?: number;
}

export default function DiffPreview({ edit, fileContent, contextLines = 3 }: Props) {
  const lines = fileContent.split("\n");
  const oldLines = edit.originalText.split("\n");
  const newLines = edit.newText.split("\n");

  // Locate the change in the file (1-indexed).
  let startIdx = lines.findIndex((_, i) =>
    lines.slice(i, i + oldLines.length).join("\n") === edit.originalText
  );
  if (startIdx === -1) startIdx = Math.max(0, edit.lineNumber - 1);

  const ctxStart = Math.max(0, startIdx - contextLines);
  const ctxEnd = Math.min(lines.length, startIdx + oldLines.length + contextLines);

  const before = lines.slice(ctxStart, startIdx);
  const after = lines.slice(startIdx + oldLines.length, ctxEnd);

  return (
    <div className="bg-bg-raised border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between text-sm">
        <span className="font-mono text-text">{edit.file}</span>
        <span className="font-mono text-xs">
          <span className="text-diff-add">+{newLines.length}</span>
          {" "}
          <span className="text-diff-remove">-{oldLines.length}</span>
        </span>
      </div>
      <pre className="overflow-x-auto text-xs font-mono leading-relaxed">
        {before.map((line, i) => (
          <DiffLine key={`b-${i}`} num={ctxStart + i + 1} text={line} kind="ctx" />
        ))}
        {oldLines.map((line, i) => (
          <DiffLine key={`o-${i}`} num={startIdx + i + 1} text={line} kind="del" />
        ))}
        {newLines.map((line, i) => (
          <DiffLine key={`n-${i}`} num={startIdx + i + 1} text={line} kind="add" />
        ))}
        {after.map((line, i) => (
          <DiffLine
            key={`a-${i}`}
            num={startIdx + oldLines.length + i + 1}
            text={line}
            kind="ctx"
          />
        ))}
      </pre>
      {edit.explanation && (
        <div className="px-4 py-3 border-t border-border text-sm text-text-muted">
          <span className="text-gold mr-2">›</span>
          {edit.explanation}
        </div>
      )}
    </div>
  );
}

function DiffLine({ num, text, kind }: { num: number; text: string; kind: "ctx" | "add" | "del" }) {
  const cls =
    kind === "add"
      ? "bg-diff-addBg border-l-2 border-diff-add text-text"
      : kind === "del"
      ? "bg-diff-removeBg border-l-2 border-diff-remove text-text"
      : "border-l-2 border-transparent text-text-muted";
  const prefix = kind === "add" ? "+" : kind === "del" ? "-" : " ";

  return (
    <div className={`flex ${cls}`}>
      <span className="select-none w-12 text-right pr-3 py-0.5 text-text-dim border-r border-border">
        {num}
      </span>
      <span className="select-none w-6 text-center py-0.5 text-text-dim">{prefix}</span>
      <span className="py-0.5 pr-4 whitespace-pre">{text || " "}</span>
    </div>
  );
}
