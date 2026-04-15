import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFileContent } from "@/lib/github";

// Returns the current file content so the client can re-render a diff
// against fresh source (e.g. when resuming a draft).
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  // @ts-expect-error accessToken added in callback
  const accessToken = session?.accessToken as string | undefined;
  if (!accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { repoOwner, repoName, branch, file } = await req.json();
  if (!repoOwner || !repoName || !branch || !file) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const { content } = await getFileContent(accessToken, repoOwner, repoName, file, branch);
    // TODO: Live visual preview (screenshot of page with change applied)
    return NextResponse.json({ file, content });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
