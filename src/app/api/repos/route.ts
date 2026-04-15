import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listRepos } from "@/lib/github";
import { DEMO_REPOS, isDemoMode } from "@/lib/demo";

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({ repos: DEMO_REPOS });
  }

  const session = await getServerSession(authOptions);
  // @ts-expect-error accessToken added in callback
  const accessToken = session?.accessToken as string | undefined;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const repos = await listRepos(accessToken);
    return NextResponse.json({ repos });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
