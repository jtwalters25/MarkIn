import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBranchAndPR, getFileContent } from "@/lib/github";
import { prisma } from "@/lib/db";
import { DEMO_CHANGES, isDemoMode } from "@/lib/demo";

async function ensureUser(session: any) {
  const githubId = session.githubId as string;
  const email = session.user?.email as string | undefined;
  if (!githubId || !email) throw new Error("Missing GitHub identity");

  return prisma.user.upsert({
    where: { githubId },
    update: { email, name: session.user?.name, avatarUrl: session.user?.image },
    create: {
      githubId,
      email,
      name: session.user?.name,
      avatarUrl: session.user?.image,
    },
  });
}

async function ensureRepo(userId: string, owner: string, name: string, branch: string) {
  return prisma.repo.upsert({
    where: { owner_name_userId: { owner, name, userId } },
    update: { branch },
    create: { owner, name, branch, userId },
  });
}

export async function POST(req: Request) {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({
      prUrl: "https://github.com/demo-org/marketing-site/pull/99",
      prNumber: 99,
      branch: `markin/edit-${Date.now()}`,
      demo: true,
    });
  }

  const session = await getServerSession(authOptions);
  // @ts-expect-error accessToken added in callback
  const accessToken = session?.accessToken as string | undefined;
  if (!accessToken || !session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const {
    repoOwner, repoName, baseBranch,
    file, originalText, newText, explanation, request,
  } = body;

  if (!repoOwner || !repoName || !baseBranch || !file || !originalText || !newText) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const { content } = await getFileContent(accessToken, repoOwner, repoName, file, baseBranch);
    if (!content.includes(originalText)) {
      return NextResponse.json(
        { error: "Original text no longer matches the file. Re-analyze and try again." },
        { status: 409 }
      );
    }

    const newContent = content.replace(originalText, newText);
    const title = explanation || `Update ${file}`;
    const description = [
      `**Original request from MarkIn:**`,
      `> ${request}`,
      ``,
      explanation ? `**What changed:** ${explanation}` : "",
      ``,
      `_Submitted via MarkIn — GitOut._`,
    ].filter(Boolean).join("\n");

    const pr = await createBranchAndPR(
      accessToken, repoOwner, repoName, baseBranch,
      file, newContent, title, description
    );

    const user = await ensureUser(session);
    const repo = await ensureRepo(user.id, repoOwner, repoName, baseBranch);
    await prisma.change.create({
      data: {
        request: request ?? "",
        file,
        oldText: originalText,
        newText,
        explanation: explanation ?? "",
        prUrl: pr.prUrl,
        prNumber: pr.prNumber,
        status: "submitted",
        repoId: repo.id,
        userId: user.id,
      },
    });

    return NextResponse.json(pr);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({ changes: DEMO_CHANGES });
  }

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // @ts-expect-error githubId added in callback
  const githubId = session.githubId as string | undefined;
  if (!githubId) return NextResponse.json({ changes: [] });

  const user = await prisma.user.findUnique({ where: { githubId } });
  if (!user) return NextResponse.json({ changes: [] });

  const changes = await prisma.change.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ changes });
}
