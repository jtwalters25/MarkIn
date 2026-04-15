import type { AnalyzeResponse, Change, Draft, Repo } from "@/types";

export const isDemoMode = () =>
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.DEMO_MODE === "true";

export const DEMO_REPOS: Repo[] = [
  {
    id: "demo-1",
    owner: "demo-org",
    name: "marketing-site",
    fullName: "demo-org/marketing-site",
    defaultBranch: "main",
    private: false,
    description: "Demo Next.js marketing site",
  },
  {
    id: "demo-2",
    owner: "demo-org",
    name: "docs",
    fullName: "demo-org/docs",
    defaultBranch: "main",
    private: true,
    description: "Demo docs site",
  },
];

export const DEMO_FILE_CONTENT = `import Link from "next/link";

export default function HomePage() {
  return (
    <main className="px-8 py-24 max-w-4xl mx-auto">
      <h1 className="text-5xl font-bold">Ship faster.</h1>
      <p className="mt-4 text-xl text-gray-500">
        The marketing platform engineers actually like.
      </p>
      <div className="mt-8 grid grid-cols-3 gap-4">
        <PricingCard plan="Starter" price="$29/mo" />
        <PricingCard plan="Growth" price="$99/mo" />
        <PricingCard plan="Enterprise" price="Contact us" />
      </div>
      <Link href="/signup" className="mt-8 inline-block">
        Get started →
      </Link>
    </main>
  );
}
`;

export function demoAnalyze(request: string): AnalyzeResponse {
  // Tiny heuristic: if the request mentions a price, swap the Starter price.
  const priceMatch = request.match(/\$\d+(?:\/mo)?/g);
  let original = "$29/mo";
  let next = priceMatch && priceMatch.length > 1 ? priceMatch[1] : "$49/mo";

  if (!/price|pricing|\$/i.test(request)) {
    original = "Ship faster.";
    next = "Ship faster, without the merge.";
  }

  return {
    request,
    targets: [
      {
        file: "src/app/page.tsx",
        confidence: 0.94,
        reason: "Homepage component containing the targeted text",
      },
    ],
    edit: {
      file: "src/app/page.tsx",
      originalText: original,
      newText: next,
      lineNumber: 12,
      explanation: `Updated "${original}" → "${next}" on the homepage (demo mode).`,
    },
    fileContent: DEMO_FILE_CONTENT,
  };
}

export const DEMO_DRAFTS: Draft[] = [
  {
    id: "demo-draft-1",
    request: "Add a 'New' badge next to the Enterprise plan",
    file: "src/app/pricing/page.tsx",
    oldText: "Enterprise",
    newText: "Enterprise New",
    explanation: "Added New badge to Enterprise plan title",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

export const DEMO_CHANGES: Change[] = [
  {
    id: "demo-change-1",
    request: "Change the homepage pricing from $29/mo to $49/mo",
    file: "src/app/page.tsx",
    oldText: "$29/mo",
    newText: "$49/mo",
    explanation: "Updated homepage pricing display",
    prUrl: "https://github.com/demo-org/marketing-site/pull/42",
    prNumber: 42,
    status: "merged",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "demo-change-2",
    request: "Update hero subhead to mention engineers",
    file: "src/app/page.tsx",
    oldText: "Built for marketing.",
    newText: "Built for marketing. Loved by engineers.",
    explanation: "Tightened hero subhead",
    prUrl: "https://github.com/demo-org/marketing-site/pull/41",
    prNumber: 41,
    status: "submitted",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
];
