import { Octokit } from "octokit";
import type { Repo } from "@/types";

export function octokitFor(accessToken: string) {
  return new Octokit({
    auth: accessToken,
    request: {
      // Next.js patches global fetch and caches GET responses in its Data Cache
      // by default. Octokit uses that fetch, so without this the GitHub repo list
      // (and file contents) get served stale — e.g. showing repos you've deleted.
      fetch: (url: string | URL | Request, options?: RequestInit) =>
        fetch(url, { ...options, cache: "no-store" }),
    },
  });
}

export async function listRepos(accessToken: string): Promise<Repo[]> {
  const octokit = octokitFor(accessToken);
  const repos = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
    per_page: 100,
    sort: "updated",
    affiliation: "owner,collaborator,organization_member",
  });

  // Filter for likely Next.js / React projects.
  // We can't peek at package.json for every repo cheaply, so we rely on language hints
  // and let the user pick. Filter excludes archived/disabled repos.
  return repos
    .filter((r) => !r.archived && !r.disabled)
    .filter((r) => {
      const lang = (r.language || "").toLowerCase();
      return ["typescript", "javascript", "tsx", "jsx", "html", ""].includes(lang);
    })
    .map((r) => ({
      id: String(r.id),
      owner: r.owner.login,
      name: r.name,
      fullName: r.full_name,
      defaultBranch: r.default_branch || "main",
      private: r.private,
      description: r.description,
      updatedAt: r.updated_at ?? undefined,
    }));
}

export async function getFileTree(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string
): Promise<string[]> {
  const octokit = octokitFor(accessToken);

  const branchData = await octokit.rest.repos.getBranch({ owner, repo, branch });
  const treeSha = branchData.data.commit.commit.tree.sha;

  const tree = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: treeSha,
    recursive: "1",
  });

  return tree.data.tree
    .filter((node) => node.type === "blob" && node.path)
    .map((node) => node.path as string);
}

export async function getFileContent(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<{ content: string; sha: string }> {
  const octokit = octokitFor(accessToken);
  const res = await octokit.rest.repos.getContent({ owner, repo, path, ref: branch });

  if (Array.isArray(res.data) || res.data.type !== "file") {
    throw new Error(`Path ${path} is not a file`);
  }

  const content = Buffer.from(res.data.content, "base64").toString("utf-8");
  return { content, sha: res.data.sha };
}

export interface PRResult {
  prUrl: string;
  prNumber: number;
  branch: string;
}

export async function createBranchAndPR(
  accessToken: string,
  owner: string,
  repo: string,
  baseBranch: string,
  filePath: string,
  newContent: string,
  title: string,
  description: string
): Promise<PRResult> {
  const octokit = octokitFor(accessToken);

  const branchData = await octokit.rest.repos.getBranch({ owner, repo, branch: baseBranch });
  const baseSha = branchData.data.commit.sha;

  const newBranchName = `markin/edit-${Date.now()}`;
  await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${newBranchName}`,
    sha: baseSha,
  });

  const existing = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: filePath,
    ref: newBranchName,
  });
  if (Array.isArray(existing.data) || existing.data.type !== "file") {
    throw new Error(`Path ${filePath} is not a file`);
  }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    branch: newBranchName,
    message: `[MarkIn] ${title}`,
    content: Buffer.from(newContent, "utf-8").toString("base64"),
    sha: existing.data.sha,
  });

  const pr = await octokit.rest.pulls.create({
    owner,
    repo,
    head: newBranchName,
    base: baseBranch,
    title: `[MarkIn] ${title}`,
    body: description,
  });

  return {
    prUrl: pr.data.html_url,
    prNumber: pr.data.number,
    branch: newBranchName,
  };
}
