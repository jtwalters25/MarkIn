import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/demo";

async function getUserId() {
  const session = await getServerSession(authOptions);
  // @ts-expect-error attached in callbacks
  return (session?.user?.id as string | undefined) ?? null;
}

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({
      scheduled: [
        {
          id: "demo-sched-1",
          request: "Swap homepage hero for the spring launch",
          edits: [{ file: "src/app/page.tsx", originalText: "Ship faster.", newText: "Spring launch — 30% off.", explanation: "Hero swap" }],
          baseBranch: "main",
          scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }

  const userId = await getUserId();
  if (!userId) return NextResponse.json({ scheduled: [] });

  const rows = await prisma.scheduledPR.findMany({
    where: { userId },
    orderBy: { scheduledFor: "asc" },
  });
  return NextResponse.json({
    scheduled: rows.map((r) => ({ ...r, edits: JSON.parse(r.edits) })),
  });
}

export async function POST(req: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { repoOwner, repoName, baseBranch, request, edits, scheduledFor } = await req.json();
  if (!repoOwner || !repoName || !baseBranch || !edits?.length || !scheduledFor) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const when = new Date(scheduledFor);
  if (isNaN(when.getTime())) {
    return NextResponse.json({ error: "Invalid scheduledFor" }, { status: 400 });
  }
  if (when.getTime() < Date.now() - 60_000) {
    return NextResponse.json({ error: "Scheduled time is in the past" }, { status: 400 });
  }

  const repo = await prisma.repo.upsert({
    where: { owner_name_userId: { owner: repoOwner, name: repoName, userId } },
    update: { branch: baseBranch },
    create: { owner: repoOwner, name: repoName, branch: baseBranch, userId },
  });

  const row = await prisma.scheduledPR.create({
    data: {
      request: request ?? "",
      edits: JSON.stringify(edits),
      baseBranch,
      scheduledFor: when,
      status: "pending",
      repoId: repo.id,
      userId,
    },
  });

  return NextResponse.json({ scheduled: { ...row, edits: JSON.parse(row.edits) } });
}

export async function DELETE(req: Request) {
  if (isDemoMode()) return NextResponse.json({ ok: true });

  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.scheduledPR.updateMany({
    where: { id, userId, status: "pending" },
    data: { status: "cancelled" },
  });
  return NextResponse.json({ ok: true });
}
