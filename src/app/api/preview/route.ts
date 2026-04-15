import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFileContent } from "@/lib/github";

// POST accepts one of two shapes:
//
// 1. { repoOwner, repoName, branch, file }
//    → returns the current file content so the client can re-render a diff
//      against fresh source (e.g. when resuming a draft).
//
// 2. { siteUrl, originalText, newText }
//    → fetches the deployed site, applies the text replacement in the HTML,
//      returns the rewritten HTML so the client can render a live visual
//      preview of the change in a sandboxed iframe.
export async function POST(req: Request) {
  const body = await req.json();

  if (body.siteUrl && body.originalText != null && body.newText != null) {
    return visualPreview(body.siteUrl, body.originalText, body.newText);
  }

  const session = await getServerSession(authOptions);
  // @ts-expect-error accessToken added in callback
  const accessToken = session?.accessToken as string | undefined;
  if (!accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { repoOwner, repoName, branch, file } = body;
  if (!repoOwner || !repoName || !branch || !file) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const { content } = await getFileContent(accessToken, repoOwner, repoName, file, branch);
    return NextResponse.json({ file, content });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

async function visualPreview(siteUrl: string, originalText: string, newText: string) {
  let parsed: URL;
  try {
    parsed = new URL(siteUrl);
  } catch {
    return NextResponse.json({ error: "Invalid site URL" }, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Only http(s) URLs are supported" }, { status: 400 });
  }

  let html: string;
  try {
    const res = await fetch(siteUrl, {
      headers: { "User-Agent": "MarkIn-Preview/1.0" },
      redirect: "follow",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Site responded with ${res.status}` },
        { status: 502 }
      );
    }
    html = await res.text();
  } catch (e) {
    return NextResponse.json({ error: `Could not fetch site: ${(e as Error).message}` }, { status: 502 });
  }

  // Inject a <base> so relative assets still resolve against the origin.
  const base = `<base href="${parsed.origin}${parsed.pathname.replace(/[^/]*$/, "")}">`;
  html = html.replace(/<head([^>]*)>/i, (m) => `${m}\n${base}`);

  // Apply the text swap. Highlight the replacement so reviewers can see it.
  const marker = `<mark style="background:#d4af3733;outline:2px solid #d4af37;padding:1px 2px">$&</mark>`;
  const replaced = html.split(originalText).length - 1;
  const highlightedNew = newText.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
  const patched = html.replaceAll(originalText, `__MARKIN_REPLACEMENT__${highlightedNew}__MARKIN_END__`);
  const finalHtml = patched
    .replaceAll(
      /__MARKIN_REPLACEMENT__([\s\S]*?)__MARKIN_END__/g,
      marker.replace("$&", "$1")
    );

  return NextResponse.json({
    html: finalHtml,
    matches: replaced,
    siteUrl,
  });
}
