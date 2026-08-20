export type AnalysisStatus =
  | "COMPLETE"
  | "PARTIAL"
  | "INSUFFICIENT_EXTRACTION"
  | "AI_ANALYSIS_FAILED"
  | "INVALID_AI_RESPONSE";

export interface AnalysisConfidence {
  overall: number;
  role: number;
  skills: number;
  experience: number;
  sections: number;
}

export interface SkillsStructure {
  technical: string[];
  frameworks: string[];
  languages: string[];
  databases: string[];
  tools: string[];
  cloud: string[];
  other: string[];
}

export interface EducationEntry {
  degree?: string;
  fieldOfStudy?: string;
  institution?: string;
  graduationYear?: string;
}

export interface ExperienceEntry {
  company?: string;
  role?: string;
  title?: string; // backward-compatibility alias for role
  startDate?: string;
  endDate?: string;
  currentlyWorking?: boolean;
  bullets?: string[];
  description?: string; // backward-compatibility alias for bullets string
}

export interface ProjectEntry {
  name?: string;
  description?: string;
  technologies?: string[];
  bullets?: string[];
}

export interface AchievementEntry {
  description?: string;
  associatedMetric?: string;
}

export interface CandidateProfile {
  // ── Contact and Basics (Parsed Deterministically) ──
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  links: string[]; // LinkedIn, GitHub, Portfolios, etc.

  professionalSummary?: string;

  // ── Structured Extracted Facts ──
  experience: ExperienceEntry[];
  internships: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  skillsDetail: SkillsStructure;
  skills: string[]; // Flat list for backward compatibility
  certifications: string[];
  achievements: AchievementEntry[];
  verifiedMetrics: string[];
  industries: string[];

  // ── Metadata / Confidence ──
  analysisStatus: AnalysisStatus;
  confidence: AnalysisConfidence;
  warnings: string[];

  // ── Deterministically Derived Facts ──
  currentOrMostRecentTitle?: string;
  jobTitles: string[];
  companies: string[];
  estimatedExperienceYears?: number;
  professionalExperienceMonths?: number;
  internshipExperienceMonths?: number;
  experienceLevel: "student" | "entry" | "mid" | "senior" | "executive" | "unknown";
}

export interface DeductionLog {
  rule: string;
  deduction: number;
  evidence: string[];
}

export interface ATSReadinessScoreResult {
  score: number;
  breakdown: {
    content: { score: number; max: number };
    experienceQuality: { score: number; max: number };
    skills: { score: number; max: number };
    atsStructure: { score: number; max: number };
    writing: { score: number; max: number };
    impact: { score: number; max: number };
  };
  deductions: DeductionLog[];
  tips: string[];
}

export interface SummaryValidationResult {
  valid: boolean;
  unsupportedEntities: string[];
  unsupportedNumbers: string[];
  suspiciousClaims: string[];
  warnings: string[];
}
