import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DEMO_CHANGES, isDemoMode } from "@/lib/demo";

function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: Array<Record<string, unknown>>, columns: string[]): string {
  const header = columns.join(",");
  const body = rows.map((r) => columns.map((c) => csvEscape(r[c])).join(",")).join("\n");
  return header + "\n" + body + (body ? "\n" : "");
}

export async function GET() {
  const columns = [
    "createdAt", "request", "file", "oldText", "newText",
    "explanation", "status", "prNumber", "prUrl",
  ];

  let rows: Array<Record<string, unknown>> = [];
  if (isDemoMode()) {
    rows = DEMO_CHANGES as unknown as Array<Record<string, unknown>>;
  } else {
    const session = await getServerSession(authOptions);
    // @ts-expect-error attached in callbacks
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      return new Response("Not authenticated", { status: 401 });
    }
    const changes = await prisma.change.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    rows = changes.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  const csv = toCsv(rows, columns);
  const filename = `markin-history-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
