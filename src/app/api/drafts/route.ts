import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DEMO_DRAFTS, isDemoMode } from "@/lib/demo";

async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  // @ts-expect-error githubId added in callback
  const githubId = session.githubId as string | undefined;
  const email = session.user?.email;
  if (!githubId || !email) return null;
  return prisma.user.upsert({
    where: { githubId },
    update: { email, name: session.user?.name, avatarUrl: session.user?.image },
    create: { githubId, email, name: session.user?.name, avatarUrl: session.user?.image },
  });
}

export async function GET() {
  if (isDemoMode()) return NextResponse.json({ drafts: DEMO_DRAFTS });
  const user = await getUser();
  if (!user) return NextResponse.json({ drafts: [] });
  const drafts = await prisma.draft.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ drafts });
}

export async function POST(req: Request) {
  if (isDemoMode()) {
    const body = await req.json();
    return NextResponse.json({ draft: { id: `demo-${Date.now()}`, ...body, createdAt: new Date().toISOString() } });
  }
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { repoOwner, repoName, request, file, oldText, newText, explanation } = await req.json();
  if (!repoOwner || !repoName || !file || !oldText || !newText) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const repo = await prisma.repo.upsert({
    where: { owner_name_userId: { owner: repoOwner, name: repoName, userId: user.id } },
    update: {},
    create: { owner: repoOwner, name: repoName, userId: user.id },
  });

  const draft = await prisma.draft.create({
    data: {
      request: request ?? "",
      file,
      oldText,
      newText,
      explanation: explanation ?? "",
      repoId: repo.id,
      userId: user.id,
    },
  });

  return NextResponse.json({ draft });
}

export async function DELETE(req: Request) {
  if (isDemoMode()) return NextResponse.json({ ok: true });
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.draft.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
