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

  const { repoOwner, repoName, request, file, oldText, newText, explanation } = await req.json();
  if (!repoOwner || !repoName || !file || !oldText || !newText) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const repo = await prisma.repo.upsert({
    where: { owner_name_userId: { owner: repoOwner, name: repoName, userId } },
    update: {},
    create: { owner: repoOwner, name: repoName, userId },
  });

  const draft = await prisma.draft.create({
    data: {
      request: request ?? "",
      file,
      oldText,
      newText,
      explanation: explanation ?? "",
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
