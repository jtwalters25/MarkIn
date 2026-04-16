import { octokitFor } from "@/lib/github";
import { checkEdit, loadConfig } from "@/lib/guardrails";
import { prisma } from "@/lib/db";

export interface SubmitEdit {
  file: string;
  originalText: string;
  newText: string;
  explanation?: string;
}

export interface SubmitInput {
  accessToken: string;
  userId: string;
  repoOwner: string;
  repoName: string;
  baseBranch: string;
  request: string;
  edits: SubmitEdit[];
}

export interface SubmitResult {
  prUrl: string;
  prNumber: number;
  branch: string;
  filesChanged: number;
}

// Shared core: validates guardrails, creates a branch, commits each edit,
// opens one PR, persists Change rows. Used by both /api/submit and the
// scheduled-PR runner so the two stay in sync.
export async function submitEdits(input: SubmitInput): Promise<SubmitResult> {
  const { accessToken, userId, repoOwner, repoName, baseBranch, request, edits } = input;
  if (edits.length === 0) throw new Error("No edits provided");

  const config = await loadConfig(accessToken, repoOwner, repoName, baseBranch);
  for (const e of edits) {
    const decision = checkEdit(
      { file: e.file, originalText: e.originalText, newText: e.newText, lineNumber: 0, explanation: e.explanation ?? "" },
      config
    );
    if (!decision.allowed) {
      throw new Error(`Blocked by brand guardrails: ${decision.reason}`);
    }
  }

  const octokit = octokitFor(accessToken);

  const branchData = await octokit.rest.repos.getBranch({
    owner: repoOwner, repo: repoName, branch: baseBranch,
  });
  const baseSha = branchData.data.commit.sha;
  const newBranch = `markin/edit-${Date.now()}`;
  await octokit.rest.git.createRef({
    owner: repoOwner, repo: repoName,
    ref: `refs/heads/${newBranch}`,
    sha: baseSha,
  });

  for (const e of edits) {
    const existing = await octokit.rest.repos.getContent({
      owner: repoOwner, repo: repoName, path: e.file, ref: newBranch,
    });
    if (Array.isArray(existing.data) || existing.data.type !== "file") {
      throw new Error(`Path ${e.file} is not a file`);
    }
    const current = Buffer.from(existing.data.content, "base64").toString("utf-8");
    if (!current.includes(e.originalText)) {
      throw new Error(`Original text no longer matches in ${e.file}`);
    }
    const updated = current.replace(e.originalText, e.newText);

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: repoOwner, repo: repoName,
      path: e.file, branch: newBranch,
      message: `[MarkIn] ${shortExplanation(e.explanation, `Update ${e.file}`)}`,
      content: Buffer.from(updated, "utf-8").toString("base64"),
      sha: existing.data.sha,
    });
  }

  function shortExplanation(text: string | undefined, fallback: string): string {
    if (!text) return fallback;
    const first = text.split(/[.\n]/)[0].trim();
    if (first.length <= 72) return first;
    return first.slice(0, 69) + "...";
  }

  const title = edits.length === 1
    ? shortExplanation(edits[0].explanation, `Update ${edits[0].file}`)
    : `${edits.length} coordinated edits`;

  const description = [
    `**Original request:**`,
    `> ${request}`,
    ``,
    `**Files changed (${edits.length}):**`,
    ...edits.map((e) => `- \`${e.file}\`: ${shortExplanation(e.explanation, "updated")}`),
    ``,
    `_Submitted via MarkIn. GitOut._`,
  ].join("\n");

  const pr = await octokit.rest.pulls.create({
    owner: repoOwner, repo: repoName,
    head: newBranch, base: baseBranch,
    title: `[MarkIn] ${title}`,
    body: description,
  });

  const repoRow = await prisma.repo.upsert({
    where: { owner_name_userId: { owner: repoOwner, name: repoName, userId } },
    update: { branch: baseBranch },
    create: { owner: repoOwner, name: repoName, branch: baseBranch, userId },
  });

  await Promise.all(edits.map((e) =>
    prisma.change.create({
      data: {
        request,
        file: e.file,
        oldText: e.originalText,
        newText: e.newText,
        explanation: e.explanation ?? "",
        prUrl: pr.data.html_url,
        prNumber: pr.data.number,
        status: "submitted",
        repoId: repoRow.id,
        userId,
      },
    })
  ));

  return {
    prUrl: pr.data.html_url,
    prNumber: pr.data.number,
    branch: newBranch,
    filesChanged: edits.length,
  };
}

// Look up the GitHub access token for a user from the Account row that
// PrismaAdapter persisted on first sign-in. Used by the scheduled-PR
// runner since the user isn't online when the job fires.
export async function getStoredGithubToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
  });
  return account?.access_token ?? null;
}
