"use client";

import type { ThinkingStep } from "@/types";

export const DEFAULT_STEPS: ThinkingStep[] = [
  { id: "understand", label: "Understanding your request…", status: "pending" },
  { id: "scan", label: "Scanning your site…", status: "pending" },
  { id: "identify", label: "Finding the right page…", status: "pending" },
  { id: "generate", label: "Drafting the change…", status: "pending" },
  { id: "preview", label: "Preparing preview…", status: "pending" },
];

export default function ThinkingSteps({ steps }: { steps: ThinkingStep[] }) {
  return (
    <ul className="space-y-3">
      {steps.map((step) => (
        <li key={step.id} className="flex items-center gap-3 text-sm">
          {step.status === "done" ? (
            <span className="w-5 h-5 rounded-full bg-gold/15 text-gold flex items-center justify-center">
              ✓
            </span>
          ) : step.status === "active" ? (
            <span className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            </span>
          ) : (
            <span className="w-5 h-5 rounded-full border border-border" />
          )}
          <span
            className={
              step.status === "done"
                ? "text-text"
                : step.status === "active"
                ? "text-text"
                : "text-text-dim"
            }
          >
            {step.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
