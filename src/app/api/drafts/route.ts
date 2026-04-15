import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DEMO_DRAFTS, isDemoMode } from "@/lib/demo";

async function getUserId() {
  const session = await getServerSession(authOptions);
  // @ts-expect-error attached in callbacks
  return (session?.user?.id as string | undefined) ?? null;
}

export async function GET() {
  if (isDemoMode()) return NextResponse.json({ drafts: DEMO_DRAFTS });

  const userId = await getUserId();
  if (!userId) return NextResponse.json({ drafts: [] });

  const drafts = await prisma.draft.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ drafts });
}

export async function POST(req: Request) {
  if (isDemoMode()) {
    const body = await req.json();
    return NextResponse.json({
      draft: { id: `demo-${Date.now()}`, ...body, createdAt: new Date().toISOString() },
    });
  }

  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { repoOwner, repoName, request } = body;

  type IncomingEdit = {
    file: string;
    originalText?: string;
    oldText?: string;
    newText: string;
    explanation?: string;
  };
  const edits: IncomingEdit[] = Array.isArray(body.edits) && body.edits.length
    ? body.edits
    : body.file
    ? [{ file: body.file, originalText: body.oldText, newText: body.newText, explanation: body.explanation }]
    : [];

  if (!repoOwner || !repoName || edits.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  for (const e of edits) {
    const orig = e.originalText ?? e.oldText;
    if (!e.file || !orig || !e.newText) {
      return NextResponse.json({ error: "Each edit needs file, originalText, newText" }, { status: 400 });
    }
  }

  const repo = await prisma.repo.upsert({
    where: { owner_name_userId: { owner: repoOwner, name: repoName, userId } },
    update: {},
    create: { owner: repoOwner, name: repoName, userId },
  });

  const normalized = edits.map((e) => ({
    file: e.file,
    originalText: e.originalText ?? e.oldText!,
    newText: e.newText,
    explanation: e.explanation ?? "",
  }));
  const first = normalized[0];

  const draft = await prisma.draft.create({
    data: {
      request: request ?? "",
      file: first.file,
      oldText: first.originalText,
      newText: first.newText,
      explanation: first.explanation,
      editsJson: JSON.stringify(normalized),
      repoId: repo.id,
      userId,
    },
  });

  return NextResponse.json({ draft });
}

export async function DELETE(req: Request) {
  if (isDemoMode()) return NextResponse.json({ ok: true });

  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.draft.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
