"use client";

import { useEffect, useState } from "react";
import type { Repo } from "@/types";

interface Props {
  value?: Repo | null;
  onChange: (repo: Repo) => void;
}

export default function RepoSelector({ value, onChange }: Props) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/repos")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "Failed to load repos");
        return r.json();
      })
      .then((data: { repos: Repo[] }) => {
        if (cancelled) return;
        setRepos(data.repos);
        if (!value && data.repos.length) onChange(data.repos[0]);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="text-text-dim text-sm">Loading repos…</div>;
  if (error) return <div className="text-diff-remove text-sm">{error}</div>;
  if (!repos.length) return <div className="text-text-dim text-sm">No repos found.</div>;

  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-text-dim mb-2">
        Repository
      </label>
      <select
        className="input"
        value={value?.fullName ?? ""}
        onChange={(e) => {
          const repo = repos.find((r) => r.fullName === e.target.value);
          if (repo) onChange(repo);
        }}
      >
        {repos.map((r) => (
          <option key={r.id} value={r.fullName}>
            {r.fullName} {r.private ? "🔒" : ""} · {r.defaultBranch}
          </option>
        ))}
      </select>
    </div>
  );
}
