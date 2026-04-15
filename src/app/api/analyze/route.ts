import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFileContent, getFileTree } from "@/lib/github";
import { generateEdit, identifyFiles } from "@/lib/claude";
import { demoAnalyze, isDemoMode } from "@/lib/demo";

export async function POST(req: Request) {
  if (isDemoMode()) {
    const { request } = await req.json();
    // Brief artificial delay so the ThinkingSteps animation feels real.
    await new Promise((r) => setTimeout(r, 1500));
    return NextResponse.json(demoAnalyze(request ?? "demo change"));
  }

  const session = await getServerSession(authOptions);
  // @ts-expect-error accessToken added in callback
  const accessToken = session?.accessToken as string | undefined;
  if (!accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { repoOwner, repoName, branch, request } = await req.json();
  if (!repoOwner || !repoName || !branch || !request) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const tree = await getFileTree(accessToken, repoOwner, repoName, branch);
    // Cap the tree to keep prompt size sane.
    const trimmed = tree.slice(0, 800);

    const targets = await identifyFiles(trimmed, request);
    if (!targets.length) {
      return NextResponse.json({ error: "Could not identify a file to change" }, { status: 422 });
    }

    const top = targets[0];
    const { content } = await getFileContent(accessToken, repoOwner, repoName, top.file, branch);
    const edit = await generateEdit(content, request, top.file);

    // TODO: change impact scan ("this edit affects 3 pages")
    // TODO: brand guardrails (file-level + component-level permissions config)
    // TODO: batch changes (multi-file edits from one request)

    return NextResponse.json({
      request,
      targets,
      edit,
      fileContent: content,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
