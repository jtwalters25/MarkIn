"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import RepoSelector from "@/components/RepoSelector";
import ChangeInput from "@/components/ChangeInput";
import DiffPreview from "@/components/DiffPreview";
import ThinkingSteps, { DEFAULT_STEPS } from "@/components/ThinkingSteps";
import type { AnalyzeResponse, Repo, ThinkingStep } from "@/types";

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [repo, setRepo] = useState<Repo | null>(null);
  const [request, setRequest] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [steps, setSteps] = useState<ThinkingStep[]>(DEFAULT_STEPS);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);

  if (!DEMO && status === "loading") {
    return <div className="p-12 text-text-muted">Loading…</div>;
  }
  if (!DEMO && status === "unauthenticated") {
    return (
      <div className="p-12 text-center">
        <p className="text-text-muted mb-4">Sign in with GitHub to start editing.</p>
        <a href="/" className="btn-gold">Back to home</a>
      </div>
    );
  }

  async function runAnalyze(req: string) {
    if (!repo) return;
    setRequest(req);
    setAnalyzing(true);
    setResult(null);
    setError(null);
    setSavedDraft(false);

    const advance = (idx: number) =>
      setSteps(DEFAULT_STEPS.map((s, i) => ({
        ...s,
        status: i < idx ? "done" : i === idx ? "active" : "pending",
      })));

    advance(0);
    const ticker = setInterval(() => {
      setSteps((cur) => {
        const activeIdx = cur.findIndex((s) => s.status === "active");
        if (activeIdx === -1 || activeIdx >= cur.length - 1) return cur;
        return cur.map((s, i) => ({
          ...s,
          status: i < activeIdx + 1 ? "done" : i === activeIdx + 1 ? "active" : "pending",
        }));
      });
    }, 900);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoOwner: repo.owner,
          repoName: repo.name,
          branch: repo.defaultBranch,
          request: req,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analyze failed");
      setSteps(DEFAULT_STEPS.map((s) => ({ ...s, status: "done" })));
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      clearInterval(ticker);
      setAnalyzing(false);
    }
  }

  async function submitPR() {
    if (!repo || !result) return;
    setSubmitting(true);
    setError(null);
    try {
      if (DEMO) {
        await new Promise((r) => setTimeout(r, 800));
        alert("Demo mode: would open PR https://github.com/demo-org/marketing-site/pull/99");
        setSubmitting(false);
        return;
      }
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoOwner: repo.owner,
          repoName: repo.name,
          baseBranch: repo.defaultBranch,
          file: result.edit.file,
          originalText: result.edit.originalText,
          newText: result.edit.newText,
          explanation: result.edit.explanation,
          request: result.request,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submit failed");
      window.location.href = data.prUrl;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function saveDraft() {
    if (!repo || !result) return;
    const res = await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoOwner: repo.owner,
        repoName: repo.name,
        request: result.request,
        file: result.edit.file,
        oldText: result.edit.originalText,
        newText: result.edit.newText,
        explanation: result.edit.explanation,
      }),
    });
    if (res.ok) setSavedDraft(true);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeRepo={repo?.fullName} />

      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-10 max-w-4xl mx-auto w-full space-y-6">
        {DEMO && (
          <div className="card p-3 px-4 border-gold/40 text-sm flex flex-wrap items-center justify-between gap-2">
            <span className="text-text-muted">
              <span className="text-gold font-mono mr-2">DEMO MODE</span>
              Canned data — no GitHub connection needed. Set{" "}
              <code className="text-gold">NEXT_PUBLIC_DEMO_MODE=false</code> to go live.
            </span>
          </div>
        )}
        <header>
          <h1 className="text-xl sm:text-2xl font-semibold">
            Hi {session?.user?.name?.split(" ")[0] ?? (DEMO ? "there (demo)" : "there")} — what should we change?
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Pick a repo, describe the change, preview the diff, ship a PR.
          </p>
        </header>

        <div className="card p-6 space-y-6">
          <RepoSelector value={repo} onChange={setRepo} />
          <ChangeInput onSubmit={runAnalyze} disabled={!repo || analyzing} />
        </div>

        {analyzing && (
          <div className="card p-6">
            <ThinkingSteps steps={steps} />
          </div>
        )}

        {error && (
          <div className="card p-4 border-diff-remove/40 text-diff-remove text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <DiffPreview edit={result.edit} fileContent={result.fileContent} />

            <div className="flex flex-wrap gap-2">
              <button onClick={submitPR} disabled={submitting} className="btn-gold">
                {submitting ? "Opening PR…" : "Ship it — open PR"}
              </button>
              <button onClick={saveDraft} disabled={savedDraft} className="btn-ghost">
                {savedDraft ? "Saved" : "Save for later"}
              </button>
              <button
                onClick={() => runAnalyze(request)}
                disabled={analyzing}
                className="btn-ghost"
              >
                Regenerate
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
