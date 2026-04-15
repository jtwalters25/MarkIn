import { getFileContent } from "@/lib/github";
import type { FileEdit } from "@/types";

export interface GuardrailConfig {
  allowedFiles?: string[];
  lockedFiles?: string[];
  lockedComponents?: string[];
  bannedPhrases?: string[];
  maxLinesChanged?: number;
  requirePR?: boolean;
}

export interface GuardrailDecision {
  allowed: boolean;
  reason?: string;
  warnings: string[];
}

export const DEFAULT_CONFIG: GuardrailConfig = {
  allowedFiles: [],            // empty = no restriction
  lockedFiles: ["**/api/**", "**/auth/**", "**/.env*", "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml"],
  lockedComponents: [],
  bannedPhrases: [],
  maxLinesChanged: 50,
  requirePR: true,
};

const CONFIG_PATHS = ["markin.config.json", ".markinrc.json", ".markin/config.json"];

export async function loadConfig(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string
): Promise<GuardrailConfig> {
  for (const path of CONFIG_PATHS) {
    try {
      const { content } = await getFileContent(accessToken, owner, repo, path, branch);
      const parsed = JSON.parse(content);
      return { ...DEFAULT_CONFIG, ...parsed };
    } catch {
      // Keep trying other paths.
    }
  }
  return DEFAULT_CONFIG;
}

// Tiny glob → RegExp. Supports **, *, ?, and literal segments. Good enough
// for filepath matching; not a full minimatch.
export function globToRegex(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*\//g, "(?:.*/)?")
    .replace(/\*\*/g, ".*")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, "[^/]");
  return new RegExp(`^${escaped}$`);
}

export function matchesAny(path: string, patterns: string[] = []): boolean {
  return patterns.some((p) => globToRegex(p).test(path));
}

export function filterFileTree(tree: string[], config: GuardrailConfig): string[] {
  return tree.filter((path) => {
    if (matchesAny(path, config.lockedFiles)) return false;
    if (config.allowedFiles && config.allowedFiles.length > 0) {
      return matchesAny(path, config.allowedFiles);
    }
    return true;
  });
}

export function checkEdit(
  edit: FileEdit,
  config: GuardrailConfig
): GuardrailDecision {
  const warnings: string[] = [];

  if (matchesAny(edit.file, config.lockedFiles)) {
    return {
      allowed: false,
      reason: `${edit.file} is locked by markin.config.json (lockedFiles).`,
      warnings,
    };
  }

  if (config.allowedFiles && config.allowedFiles.length > 0) {
    if (!matchesAny(edit.file, config.allowedFiles)) {
      return {
        allowed: false,
        reason: `${edit.file} is not in the allowedFiles list in markin.config.json.`,
        warnings,
      };
    }
  }

  for (const component of config.lockedComponents ?? []) {
    const re = new RegExp(`<${component}\\b|function\\s+${component}\\b|const\\s+${component}\\s*=`, "i");
    if (re.test(edit.originalText) || re.test(edit.newText)) {
      return {
        allowed: false,
        reason: `Edit touches locked component "${component}".`,
        warnings,
      };
    }
  }

  for (const phrase of config.bannedPhrases ?? []) {
    if (edit.newText.toLowerCase().includes(phrase.toLowerCase())) {
      return {
        allowed: false,
        reason: `Banned phrase "${phrase}" appears in the new text.`,
        warnings,
      };
    }
  }

  const linesChanged =
    edit.originalText.split("\n").length + edit.newText.split("\n").length;
  if (config.maxLinesChanged && linesChanged > config.maxLinesChanged) {
    warnings.push(
      `Edit changes ${linesChanged} lines, above the soft cap of ${config.maxLinesChanged}.`
    );
  }

  return { allowed: true, warnings };
}
