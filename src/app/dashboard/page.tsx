"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import RepoSelector from "@/components/RepoSelector";
import ChangeInput from "@/components/ChangeInput";
import DiffPreview from "@/components/DiffPreview";
import GuardrailBanner from "@/components/GuardrailBanner";
import ImpactBanner from "@/components/ImpactBanner";
import SchedulePicker from "@/components/SchedulePicker";
import ThinkingSteps, { DEFAULT_STEPS } from "@/components/ThinkingSteps";
import type { AnalyzeResponse, Repo, ThinkingStep } from "@/types";

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!DEMO && status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const [repo, setRepo] = useState<Repo | null>(null);
  const [request, setRequest] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [steps, setSteps] = useState<ThinkingStep[]>(DEFAULT_STEPS);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);

  if (!DEMO && (status === "loading" || status === "unauthenticated")) {
    return <div className="p-12 text-text-muted">Loading…</div>;
  }

  const anyBlocked = result?.edits.some((e) => e.guardrails.allowed === false) ?? false;

  async function runAnalyze(req: string) {
    if (!repo) return;
    setRequest(req);
    setAnalyzing(true);
    setResult(null);
    setError(null);
    setSavedDraft(false);

    setSteps(DEFAULT_STEPS.map((s, i) => ({ ...s, status: i === 0 ? "active" : "pending" })));
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
        alert(`Demo mode: would open PR with ${result.edits.length} file change(s) → https://github.com/demo-org/marketing-site/pull/99`);
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
          request: result.request,
          edits: result.edits.map((b) => ({
            file: b.edit.file,
            originalText: b.edit.originalText,
            newText: b.edit.newText,
            explanation: b.edit.explanation,
          })),
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
    // Drafts currently support a single edit — save the first one.
    // TODO: multi-file drafts
    const first = result.edits[0];
    const res = await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoOwner: repo.owner,
        repoName: repo.name,
        request: result.request,
        file: first.edit.file,
        oldText: first.edit.originalText,
        newText: first.edit.newText,
        explanation: first.edit.explanation,
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
            {result.edits.length > 1 && (
              <div className="text-sm text-text-muted">
                <span className="text-gold font-mono mr-2">BATCH</span>
                {result.edits.length} coordinated edits across {result.edits.length} files. All ship in one PR.
              </div>
            )}

            {result.edits.map((b, i) => (
              <div key={`${b.edit.file}-${i}`} className="space-y-3">
                {result.edits.length > 1 && (
                  <div className="text-xs uppercase tracking-widest text-text-dim">
                    Edit {i + 1} of {result.edits.length}
                  </div>
                )}
                <GuardrailBanner guardrails={b.guardrails} />
                <ImpactBanner impact={b.impact} />
                <DiffPreview edit={b.edit} fileContent={b.fileContent} />
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={submitPR}
                disabled={submitting || anyBlocked}
                className="btn-gold"
                title={anyBlocked ? "One or more edits are blocked by brand guardrails" : undefined}
              >
                {submitting
                  ? "Opening PR…"
                  : anyBlocked
                  ? "Blocked"
                  : result.edits.length > 1
                  ? `Ship all ${result.edits.length} — open PR`
                  : "Ship it — open PR"}
              </button>
              <button onClick={saveDraft} disabled={savedDraft} className="btn-ghost">
                {savedDraft ? "Saved" : "Save for later"}
              </button>
              <SchedulePicker
                disabled={anyBlocked}
                onSchedule={async (iso) => {
                  if (!repo || !result) return;
                  if (DEMO) {
                    alert(`Demo mode: would schedule PR for ${new Date(iso).toLocaleString()}`);
                    return;
                  }
                  const res = await fetch("/api/schedule", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      repoOwner: repo.owner,
                      repoName: repo.name,
                      baseBranch: repo.defaultBranch,
                      request: result.request,
                      scheduledFor: iso,
                      edits: result.edits.map((b) => ({
                        file: b.edit.file,
                        originalText: b.edit.originalText,
                        newText: b.edit.newText,
                        explanation: b.edit.explanation,
                      })),
                    }),
                  });
                  if (!res.ok) throw new Error((await res.json()).error ?? "Schedule failed");
                }}
              />
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
