"use client";

import { useState } from "react";

interface Props {
  onSchedule: (iso: string) => Promise<void> | void;
  disabled?: boolean;
}

function defaultValue() {
  // 1 hour from now, formatted for datetime-local input.
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SchedulePicker({ onSchedule, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue());
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} disabled={disabled} className="btn-ghost">
        Schedule for later
      </button>
    );
  }

  if (done) {
    return <span className="text-diff-add text-sm self-center">✓ Scheduled</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input py-2 w-auto"
        disabled={busy}
      />
      <button
        onClick={async () => {
          setBusy(true);
          try {
            await onSchedule(new Date(value).toISOString());
            setDone(true);
          } finally {
            setBusy(false);
          }
        }}
        disabled={busy || disabled}
        className="btn-gold py-2"
      >
        {busy ? "Scheduling…" : "Confirm"}
      </button>
      <button onClick={() => setOpen(false)} className="text-text-dim hover:text-text text-sm">
        Cancel
      </button>
    </div>
  );
}
