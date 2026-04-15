"use client";

interface Props {
  guardrails?: {
    allowed: boolean;
    reason?: string;
    warnings: string[];
    configActive: boolean;
  };
}

export default function GuardrailBanner({ guardrails }: Props) {
  if (!guardrails) return null;

  if (!guardrails.allowed) {
    return (
      <div className="card p-4 border-diff-remove/50 bg-diff-removeBg">
        <div className="flex items-start gap-3">
          <span className="text-diff-remove text-lg leading-none">⛔</span>
          <div className="text-sm">
            <div className="font-semibold text-diff-remove mb-1">Blocked by brand guardrails</div>
            <p className="text-text">{guardrails.reason}</p>
            <p className="text-text-dim text-xs mt-2">
              Edit your repo&apos;s <code className="text-gold">markin.config.json</code> to change what&apos;s allowed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (guardrails.warnings.length > 0) {
    return (
      <div className="card p-4 border-gold/40 bg-gold/5">
        <div className="flex items-start gap-3">
          <span className="text-gold text-lg leading-none">⚠</span>
          <div className="text-sm">
            <div className="font-semibold text-gold mb-1">Guardrail warnings</div>
            <ul className="text-text-muted list-disc pl-4 space-y-1">
              {guardrails.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (guardrails.configActive) {
    return (
      <div className="text-xs text-text-dim flex items-center gap-2">
        <span className="text-gold">✓</span>
        Brand guardrails active — edit passed all rules.
      </div>
    );
  }

  return null;
}
