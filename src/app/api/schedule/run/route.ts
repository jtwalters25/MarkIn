import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStoredGithubToken, submitEdits } from "@/lib/submitter";

// Worker: opens any pending scheduled PRs whose time has come.
// Protected by CRON_SECRET — set the same value on your cron caller
// (Vercel Cron, GitHub Actions, etc.) and pass it as a Bearer token or
// `?secret=` query param.
//
// Run manually for local testing:
//   curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
//        http://localhost:3000/api/schedule/run

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const url = new URL(req.url);
  if (url.searchParams.get("secret") === secret) return true;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await prisma.scheduledPR.findMany({
    where: { status: "pending", scheduledFor: { lte: new Date() } },
    orderBy: { scheduledFor: "asc" },
    take: 25,
    include: { repo: true },
  });

  const results = await Promise.allSettled(
    due.map(async (row) => {
      const accessToken = await getStoredGithubToken(row.userId);
      if (!accessToken) {
        await prisma.scheduledPR.update({
          where: { id: row.id },
          data: { status: "failed", failureReason: "No GitHub access token on file for user" },
        });
        return { id: row.id, error: "no token" };
      }
      try {
        const result = await submitEdits({
          accessToken,
          userId: row.userId,
          repoOwner: row.repo.owner,
          repoName: row.repo.name,
          baseBranch: row.baseBranch,
          request: row.request,
          edits: JSON.parse(row.edits),
        });
        await prisma.scheduledPR.update({
          where: { id: row.id },
          data: {
            status: "submitted",
            prUrl: result.prUrl,
            prNumber: result.prNumber,
            submittedAt: new Date(),
          },
        });
        return { id: row.id, prUrl: result.prUrl };
      } catch (e) {
        await prisma.scheduledPR.update({
          where: { id: row.id },
          data: { status: "failed", failureReason: (e as Error).message },
        });
        return { id: row.id, error: (e as Error).message };
      }
    })
  );

  return NextResponse.json({
    processed: results.length,
    results: results.map((r) => (r.status === "fulfilled" ? r.value : { error: String(r.reason) })),
  });
}

export async function GET(req: Request) {
  return POST(req);
}
