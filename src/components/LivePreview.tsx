"use client";

import { useState } from "react";

interface Props {
  originalText: string;
  newText: string;
}

export default function LivePreview({ originalText, newText }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [matches, setMatches] = useState(0);

  async function run() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setHtml(null);
    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl: url.trim(), originalText, newText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Preview failed");
      setHtml(data.html);
      setMatches(data.matches ?? 0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest text-text-dim">Live visual preview</div>
          <div className="text-text-muted text-sm mt-1">
            Paste your deployed site URL to see the change applied on the real page.
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <input
          className="input flex-1 min-w-[240px]"
          placeholder="https://your-site.com/pricing"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={run} disabled={loading || !url.trim()} className="btn-ghost">
          {loading ? "Rendering…" : "Render preview"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg p-3 text-sm border"
          style={{
            backgroundColor: "rgba(200, 80, 60, 0.1)",
            borderColor: "#c8503c",
            color: "#c8503c",
          }}
        >
          {error}
        </div>
      )}

      {html && (
        <div>
          <div className="text-xs text-text-dim mb-2">
            {matches > 0
              ? `${matches} match${matches === 1 ? "" : "es"} replaced and highlighted.`
              : "No matches found on that page. The change may live on a different URL."}
          </div>
          <iframe
            title="Live preview"
            srcDoc={html}
            sandbox="allow-same-origin"
            className="w-full h-[520px] rounded-md border border-border-subtle bg-white"
          />
        </div>
      )}
    </div>
  );
}
