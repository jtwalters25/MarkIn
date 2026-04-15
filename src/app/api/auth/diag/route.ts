import { NextResponse } from "next/server";

// Diagnostics for OAuth setup. Reports whether each env var is present and
// what callback URL GitHub should be configured with. Never returns the
// actual secret values.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const expectedCallback = `${url.origin}/api/auth/callback/github`;

  const env = {
    GITHUB_CLIENT_ID: Boolean(process.env.GITHUB_CLIENT_ID),
    GITHUB_CLIENT_SECRET: Boolean(process.env.GITHUB_CLIENT_SECRET),
    NEXTAUTH_SECRET: Boolean(process.env.NEXTAUTH_SECRET),
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    ANTHROPIC_API_KEY: Boolean(process.env.ANTHROPIC_API_KEY),
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE ?? null,
    DEMO_MODE: process.env.DEMO_MODE ?? null,
  };

  const issues: string[] = [];
  if (!env.GITHUB_CLIENT_ID) issues.push("Missing GITHUB_CLIENT_ID in .env");
  if (!env.GITHUB_CLIENT_SECRET) issues.push("Missing GITHUB_CLIENT_SECRET in .env");
  if (!env.NEXTAUTH_SECRET) issues.push("Missing NEXTAUTH_SECRET — generate: openssl rand -base64 32");
  if (env.NEXTAUTH_URL && env.NEXTAUTH_URL !== url.origin) {
    issues.push(
      `NEXTAUTH_URL (${env.NEXTAUTH_URL}) does not match the origin you're hitting (${url.origin}). ` +
        `Update .env or restart the dev server on the right port.`
    );
  }
  if (env.DEMO_MODE === "true" || env.NEXT_PUBLIC_DEMO_MODE === "true") {
    issues.push(
      "Demo mode is ON — auth is bypassed. Set NEXT_PUBLIC_DEMO_MODE=false and DEMO_MODE=false to use real GitHub auth."
    );
  }

  return NextResponse.json({
    env,
    expectedCallback,
    note: "Set this exact URL as the 'Authorization callback URL' in your GitHub OAuth app.",
    issues,
    ok: issues.length === 0,
  });
}
