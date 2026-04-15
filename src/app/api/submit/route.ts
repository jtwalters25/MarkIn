import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DEMO_CHANGES, isDemoMode } from "@/lib/demo";
import { submitEdits, type SubmitEdit } from "@/lib/submitter";

export async function POST(req: Request) {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({
      prUrl: "https://github.com/demo-org/marketing-site/pull/99",
      prNumber: 99,
      branch: `markin/edit-${Date.now()}`,
      filesChanged: 1,
      demo: true,
    });
  }

  const session = await getServerSession(authOptions);
  // @ts-expect-error attached in callbacks
  const accessToken = session?.accessToken as string | undefined;
  // @ts-expect-error attached in callbacks
  const userId = session?.user?.id as string | undefined;
  if (!accessToken || !userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const edits: SubmitEdit[] = body.edits ?? (body.file ? [{
    file: body.file,
    originalText: body.originalText,
    newText: body.newText,
    explanation: body.explanation,
  }] : []);

  if (!body.repoOwner || !body.repoName || !body.baseBranch || edits.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const result = await submitEdits({
      accessToken, userId,
      repoOwner: body.repoOwner,
      repoName: body.repoName,
      baseBranch: body.baseBranch,
      request: body.request ?? "",
      edits,
    });
    return NextResponse.json(result);
  } catch (e) {
    const msg = (e as Error).message;
    const status = msg.startsWith("Blocked by brand guardrails") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function GET() {
  if (isDemoMode()) return NextResponse.json({ changes: DEMO_CHANGES });

  const session = await getServerSession(authOptions);
  // @ts-expect-error attached in callbacks
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ changes: [] });

  const changes = await prisma.change.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ changes });
}
