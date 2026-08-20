export type SectionStatus = "detected" | "uncertain" | "missing";

export interface SectionMatchResult {
  detected: string[];
  missing: string[];
  uncertain: string[];
  statuses: Record<string, SectionStatus>;
}

const SECTION_PATTERNS: Record<string, RegExp> = {
  experience: /(?:^|\n)\s*(?:professional\s+|work\s+|employment\s+|career\s+)?(?:experience|history|background)s?\s*(?:\n|$)/i,
  skills: /(?:^|\n)\s*(?:technical\s+|key\s+|core\s+)?(?:skills|competencies|technologies|proficiencies|expertise|tech\s+stack)s?\s*(?:\n|$)/i,
  education: /(?:^|\n)\s*(?:education|academic\s+background|academic\s+history|credentials|degrees?)\s*(?:\n|$)/i,
  projects: /(?:^|\n)\s*(?:personal\s+|academic\s+|key\s+|selected\s+)?projects\s*(?:\n|$)/i,
  certifications: /(?:^|\n)\s*(?:certifications|certificates|licenses|credentials)\s*(?:\n|$)/i,
  achievements: /(?:^|\n)\s*(?:achievements|awards|honors|key\s+milestones)\s*(?:\n|$)/i,
  summary: /(?:^|\n)\s*(?:professional\s+|executive\s+|career\s+)?(?:summary|objective|profile|about\s+me)\s*(?:\n|$)/i,
};

/**
 * Deterministically scans the raw resume text for the presence of standard section headings.
 */
export function detectSections(cleanedText: string): Record<string, boolean> {
  const matches: Record<string, boolean> = {};
  
  for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
    matches[section] = pattern.test(cleanedText);
  }

  return matches;
}

/**
 * Reconciles deterministic heading matches with the semantically extracted profile.
 * - Detected: Heading found.
 * - Uncertain: Heading missing, but content was successfully extracted semantically.
 * - Missing: Heading missing and no content extracted.
 */
export function reconcileSections(
  headingMatches: Record<string, boolean>,
  profile: {
    experience: any[];
    internships: any[];
    education: any[];
    projects: any[];
    skills: any[];
    certifications: any[];
    achievements: any[];
    professionalSummary?: string;
  }
): SectionMatchResult {
  const statuses: Record<string, SectionStatus> = {};
  const detected: string[] = [];
  const missing: string[] = [];
  const uncertain: string[] = [];

  const checkSection = (sectionKey: string, hasContent: boolean) => {
    const hasHeading = headingMatches[sectionKey];
    if (hasHeading) {
      statuses[sectionKey] = "detected";
      detected.push(sectionKey);
    } else if (hasContent) {
      statuses[sectionKey] = "uncertain";
      uncertain.push(sectionKey);
    } else {
      statuses[sectionKey] = "missing";
      missing.push(sectionKey);
    }
  };

  // Reconcile each key section
  checkSection("experience", profile.experience.length > 0 || profile.internships.length > 0);
  checkSection("skills", profile.skills.length > 0);
  checkSection("education", profile.education.length > 0);
  checkSection("projects", profile.projects.length > 0);
  checkSection("certifications", profile.certifications.length > 0);
  checkSection("achievements", profile.achievements.length > 0);
  checkSection("summary", !!profile.professionalSummary && profile.professionalSummary.length > 0);

  return {
    detected,
    missing,
    uncertain,
    statuses,
  };
}
