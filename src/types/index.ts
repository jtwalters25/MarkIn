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

export interface GuardrailPayload {
  allowed: boolean;
  reason?: string;
  warnings: string[];
  configActive: boolean;
}

export interface BatchEdit {
  edit: FileEdit;
  fileContent: string;
  guardrails: GuardrailPayload;
  impact?: ImpactReport;
}

export interface AnalyzeResponse {
  request: string;
  targets: FileTarget[];
  edits: BatchEdit[];
}

export interface ImpactHit {
  path: string;
  url: string;
  snippet?: string;
}

export interface ImpactReport {
  query: string;
  totalCount: number;
  hits: ImpactHit[];
  searched: boolean;
  reason?: string;
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

export interface ScheduledPR {
  id: string;
  request: string;
  edits: { file: string; originalText: string; newText: string; explanation?: string }[];
  baseBranch: string;
  scheduledFor: string;
  status: "pending" | "submitted" | "failed" | "cancelled";
  prUrl?: string | null;
  prNumber?: number | null;
  failureReason?: string | null;
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
