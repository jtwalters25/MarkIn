import { octokitFor } from "@/lib/github";

export interface ImpactHit {
  path: string;
  url: string;
  snippet?: string;
}

export interface ImpactReport {
  query: string;
  totalCount: number;
  hits: ImpactHit[];
  searched: boolean;
  reason?: string;
}

// Pick the most distinctive line of the edit's original text to search for.
// Skip blank lines and trivial tokens (single chars, common keywords).
function pickQuery(originalText: string): string | null {
  const TRIVIAL = /^(import|export|return|const|let|var|function|class|if|else|true|false|null|undefined)\b/;
  const lines = originalText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length >= 5 && l.length <= 120)
    .filter((l) => !TRIVIAL.test(l));

  if (!lines.length) return null;
  // Prefer the longest line — usually the most distinctive.
  return lines.sort((a, b) => b.length - a.length)[0];
}

export async function scanImpact(
  accessToken: string,
  owner: string,
  repo: string,
  sourceFile: string,
  originalText: string
): Promise<ImpactReport> {
  const query = pickQuery(originalText);
  if (!query) {
    return {
      query: "",
      totalCount: 0,
      hits: [],
      searched: false,
      reason: "Edit text is too short or generic to scan.",
    };
  }

  const octokit = octokitFor(accessToken);

  try {
    // GitHub code search: exact-phrase via quotes, scoped to the repo.
    const q = `"${query.replace(/"/g, '\\"')}" repo:${owner}/${repo}`;
    const res = await octokit.rest.search.code({ q, per_page: 20 });

    const hits: ImpactHit[] = res.data.items
      .filter((item) => item.path !== sourceFile)
      .slice(0, 10)
      .map((item) => ({
        path: item.path,
        url: item.html_url,
      }));

    return {
      query,
      totalCount: Math.max(0, res.data.total_count - 1), // exclude the source file
      hits,
      searched: true,
    };
  } catch (e) {
    return {
      query,
      totalCount: 0,
      hits: [],
      searched: false,
      reason: (e as Error).message,
    };
  }
}
