import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFileContent, getFileTree } from "@/lib/github";
import { generateEdit, identifyFiles } from "@/lib/claude";
import { demoAnalyze, isDemoMode } from "@/lib/demo";
import { checkEdit, DEFAULT_CONFIG, filterFileTree, loadConfig } from "@/lib/guardrails";
import { scanImpact } from "@/lib/impact";

const MAX_BATCH = 5;

function detectBatchIntent(request: string): boolean {
  return /\b(everywhere|all instances|across the (site|app)|every page|every file|globally|all of them)\b/i.test(
    request
  );
}

export async function POST(req: Request) {
  if (isDemoMode()) {
    const { request } = await req.json();
    await new Promise((r) => setTimeout(r, 1500));
    return NextResponse.json(demoAnalyze(request ?? "demo change"));
  }

  const session = await getServerSession(authOptions);
  // @ts-expect-error attached in callbacks
  const accessToken = session?.accessToken as string | undefined;
  if (!accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { repoOwner, repoName, branch, request } = await req.json();
  if (!repoOwner || !repoName || !branch || !request) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const config = await loadConfig(accessToken, repoOwner, repoName, branch);
    const configActive = config !== DEFAULT_CONFIG;

    const tree = await getFileTree(accessToken, repoOwner, repoName, branch);
    const filtered = filterFileTree(tree, config).slice(0, 800);
    if (filtered.length === 0) {
      return NextResponse.json(
        { error: "No editable files after applying brand guardrails." },
        { status: 422 }
      );
    }

    const targets = await identifyFiles(filtered, request);
    if (!targets.length) {
      return NextResponse.json({ error: "Could not identify a file to change" }, { status: 422 });
    }

    const limit = detectBatchIntent(request) ? MAX_BATCH : 1;
    const selected = targets.slice(0, limit);

    const edits = await Promise.all(
      selected.map(async (target) => {
        const { content } = await getFileContent(accessToken, repoOwner, repoName, target.file, branch);
        const edit = await generateEdit(content, request, target.file);
        const decision = checkEdit(edit, config);
        const impact = await scanImpact(accessToken, repoOwner, repoName, edit.file, edit.originalText);
        return {
          edit,
          fileContent: content,
          guardrails: { ...decision, configActive },
          impact,
        };
      })
    );

    return NextResponse.json({ request, targets, edits });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
