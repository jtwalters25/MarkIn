// Utilities for turning code edits into marketer-friendly plain text.

export function extractReadableText(text: string): string {
  if (!text) return "";
  let s = text;

  // Strip HTML/JSX tags.
  s = s.replace(/<\/?[a-zA-Z][^>]*>/g, "");

  // Strip JSX attributes that slipped through (className="...", etc.).
  s = s.replace(/\b\w+\s*=\s*(?:"[^"]*"|'[^']*'|\{[^}]*\})/g, "");

  // Strip markdown heading/bold/italic/code markers.
  s = s.replace(/^#{1,6}\s+/gm, "");
  s = s.replace(/\*\*(.+?)\*\*/g, "$1");
  s = s.replace(/__(.+?)__/g, "$1");
  s = s.replace(/(?<![*_])\*(?!\*)(.+?)\*/g, "$1");
  s = s.replace(/(?<![*_])_(?!_)(.+?)_/g, "$1");
  s = s.replace(/`([^`]+)`/g, "$1");

  // If it looks like a JSON key/value line, humanize it: "price": 29 → Price: 29
  const jsonKV = s.match(/^\s*"([^"]+)"\s*:\s*"?([^",}]+)"?/);
  if (jsonKV) {
    const key = jsonKV[1].replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ");
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    return `${label}: ${jsonKV[2].trim()}`;
  }

  // Strip surrounding string quotes and common JS punctuation.
  s = s.replace(/^[\s{(\["'`]+|[\s})\]"'`,;]+$/g, "");

  // Collapse whitespace.
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

const LOCATION_RULES: { test: (p: string) => boolean; label: string }[] = [
  { test: (p) => /(^|\/)(src\/)?(app\/page\.|pages\/index\.)/i.test(p), label: "Homepage" },
  { test: (p) => /(^|\/)(src\/)?(app|pages)\/about\//i.test(p) || /\/about\.(tsx?|jsx?|md)$/i.test(p), label: "About Page" },
  { test: (p) => /(^|\/)(src\/)?(app|pages)\/pricing/i.test(p), label: "Pricing Page" },
  { test: (p) => /pricing/i.test(p) && /\.json$/i.test(p), label: "Pricing Config" },
  { test: (p) => /(^|\/)content\/blog\//i.test(p), label: "Blog Post" },
  { test: (p) => /(^|\/)(content\/)?docs\//i.test(p), label: "Documentation" },
  { test: (p) => /(^|\/)src\/components\//i.test(p), label: "" }, // handled below
];

export function getLocationLabel(filePath: string): string {
  for (const rule of LOCATION_RULES) {
    if (rule.test(filePath)) {
      if (rule.label) return rule.label;
      const base = filePath.split("/").pop()?.replace(/\.[^.]+$/, "") ?? filePath;
      return `Component: ${base}`;
    }
  }
  // Fallback: prettify the filename.
  const base = filePath.split("/").pop()?.replace(/\.[^.]+$/, "") ?? filePath;
  const words = base.replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// Produce a sub-location ("Hero Section", "Pricing Card") by inspecting the
// surrounding code. Best-effort — returns null if nothing recognizable.
export function guessSection(fileContent: string, originalText: string): string | null {
  const idx = fileContent.indexOf(originalText);
  if (idx === -1) return null;
  const before = fileContent.slice(Math.max(0, idx - 400), idx);

  const hints: [RegExp, string][] = [
    [/hero/i, "Hero Section"],
    [/pricing/i, "Pricing"],
    [/footer/i, "Footer"],
    [/header/i, "Header"],
    [/nav\b/i, "Navigation"],
    [/testimonial/i, "Testimonials"],
    [/faq/i, "FAQ"],
    [/cta/i, "Call to Action"],
    [/feature/i, "Features"],
  ];

  for (const [re, label] of hints) {
    if (re.test(before)) return label;
  }
  return null;
}

// Split old/new text into a sequence of "same" | "changed" segments so the
// UI can highlight what actually changed inside each paragraph.
export interface DiffSegment {
  text: string;
  changed: boolean;
}

export function wordDiff(oldText: string, newText: string): { before: DiffSegment[]; after: DiffSegment[] } {
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);

  // Classic LCS DP — fine at this size (single paragraphs).
  const m = oldWords.length;
  const n = newWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = oldWords[i - 1] === newWords[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const before: DiffSegment[] = [];
  const after: DiffSegment[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      before.unshift({ text: oldWords[i - 1], changed: false });
      after.unshift({ text: newWords[j - 1], changed: false });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      after.unshift({ text: newWords[j - 1], changed: true });
      j--;
    } else {
      before.unshift({ text: oldWords[i - 1], changed: true });
      i--;
    }
  }

  return { before, after };
}
