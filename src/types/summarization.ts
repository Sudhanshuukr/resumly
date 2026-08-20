// ============================================================
// Shared TypeScript interfaces for the summarization feature.
// These types are used by both client (store, UI) and server
// (API route, services).
// ============================================================

export interface SummarizationResult {
  /** 2-4 sentence professional summary */
  professional: string;
  /** ATS-optimised keyword-rich summary */
  ats: string;
  /** Executive-level concise summary */
  executive: string;
  /** Top skills extracted from the resume (max 8) */
  skills: string[];
  /** Inferred current or target job title */
  jobTitle: string;
  /** Resume quality score 0–100 */
  score: number;
  /** Actionable improvement tips */
  tips: string[];
  /** Total word count of the resume */
  wordCount: number;
  /** Human-readable estimated reading time, e.g. "2 min read" */
  readingTime: string;
  /** Inferred experience level, e.g. "5–7 years" */
  detectedExperience: string;
  /** Inferred industry, e.g. "Software Engineering" */
  detectedIndustry: string;
  /** Analysis status for pipeline checks */
  analysisStatus?: string;
  /** Detailed score breakdown */
  scoreBreakdown?: {
    content: { score: number; max: number };
    experienceQuality: { score: number; max: number };
    skills: { score: number; max: number };
    atsStructure: { score: number; max: number };
    writing: { score: number; max: number };
    impact: { score: number; max: number };
  };
  /** List of score deductions */
  deductions?: Array<{
    rule: string;
    deduction: number;
    evidence: string[];
  }>;
}

export enum UploadStatus {
  Idle = "IDLE",
  Dragging = "DRAGGING",
  Uploading = "UPLOADING",
  Parsing = "PARSING",
  Generating = "GENERATING",
  Completed = "COMPLETED",
  Error = "ERROR",
}

export type SummarizationErrorCode =
  | "INVALID_FILE"
  | "FILE_TOO_LARGE"
  | "PARSE_ERROR"
  | "INVALID_RESUME"
  | "AI_ERROR"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "FREE_LIMIT_REACHED"
  | "UNKNOWN"
  | "INSUFFICIENT_EXTRACTION";

export interface SummarizationError {
  success: false;
  code: SummarizationErrorCode;
  message: string;
  usage?: { used: number; limit: number; remaining: number } | null;
}

export interface SummarizationSuccess {
  success: true;
  data: SummarizationResult;
  id?: string;
  resumeText?: string;
  usage?: { used: number; limit: number; remaining: number } | null;
}

export type SummarizationResponse = SummarizationSuccess | SummarizationError;

/** Provider identifiers — configurable via AI_PROVIDER env var */
export type AIProviderName = "openai" | "gemini" | "claude" | "deepseek";
