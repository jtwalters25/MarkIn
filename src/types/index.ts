export interface Repo {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  private: boolean;
  description?: string | null;
  updatedAt?: string;
}

export interface FileTarget {
  file: string;
  confidence: number;
  reason: string;
}

export interface FileEdit {
  file: string;
  originalText: string;
  newText: string;
  lineNumber: number;
  explanation: string;
}

export interface AnalyzeResponse {
  request: string;
  targets: FileTarget[];
  edit: FileEdit;
  fileContent: string;
}

export interface Change {
  id: string;
  request: string;
  file: string;
  oldText: string;
  newText: string;
  explanation: string;
  prUrl?: string | null;
  prNumber?: number | null;
  status: "submitted" | "merged" | "closed";
  createdAt: string;
}

export interface Draft {
  id: string;
  request: string;
  file: string;
  oldText: string;
  newText: string;
  explanation: string;
  createdAt: string;
}

export interface ThinkingStep {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
}
