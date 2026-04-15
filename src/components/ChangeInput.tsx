"use client";

import { useState } from "react";

interface Props {
  onSubmit: (request: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const EXAMPLES = [
  "Change the homepage pricing from $29/mo to $49/mo",
  "Update the hero headline to \"Ship faster, without the merge\"",
  "Add a new FAQ entry about refunds",
];

export default function ChangeInput({ onSubmit, disabled, placeholder }: Props) {
  const [value, setValue] = useState("");

  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-text-dim mb-2">
        Describe the change
      </label>
      <textarea
        className="input min-h-[120px] resize-none font-sans"
        placeholder={placeholder ?? "e.g. Change the homepage pricing from $29/mo to $49/mo"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          className="btn-gold"
          disabled={disabled || !value.trim()}
          onClick={() => onSubmit(value.trim())}
        >
          Preview change
        </button>
        <span className="text-text-dim text-xs ml-2">Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            className="text-xs text-text-muted hover:text-gold underline-offset-4 hover:underline"
            onClick={() => setValue(ex)}
            disabled={disabled}
          >
            {ex.length > 38 ? ex.slice(0, 38) + "…" : ex}
          </button>
        ))}
      </div>
    </div>
  );
}
