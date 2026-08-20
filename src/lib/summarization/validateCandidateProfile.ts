import { CandidateProfile, SkillsStructure } from "./types"

/**
 * Escapes regex special characters in a string.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Symbol-safe boundary check that validates if a skill matches in text.
 * Succeeds only if the skill is flanked by start/end of string, whitespace, or non-alphanumeric characters (excluding #, +, .).
 */
export function matchSkillBoundaries(skill: string, rawText: string): boolean {
  if (!skill) return false;
  const escaped = escapeRegex(skill);
  
  // Flanking characters cannot be letters, numbers, or symbol extensions used in technologies like C#, C++, .NET
  const pattern = new RegExp(`(?:^|[^a-zA-Z0-9#+.])${escaped}(?:$|[^a-zA-Z0-9#+.])`, "i");
  return pattern.test(rawText);
}

/**
 * Verifies if there is a tech/programming context around short or ambiguous skill occurrences.
 */
function verifyShortSkillContext(skill: string, rawText: string): boolean {
  const lower = rawText.toLowerCase();
  const skillLower = skill.toLowerCase().trim();

  // Helper to search surrounding context (80 chars) for technical keywords
  const hasTechContextAroundWord = (wordRegex: RegExp): boolean => {
    let match;
    const regexGlobal = new RegExp(wordRegex.source, "ig");
    while ((match = regexGlobal.exec(rawText)) !== null) {
      const start = Math.max(0, match.index - 100);
      const end = Math.min(rawText.length, match.index + 100);
      const context = lower.substring(start, end);
      
      const techKeywords = [
        "programming", "language", "developer", "software", "engineer", "framework",
        "coding", "development", "stack", "git", "database", "backend", "frontend",
        "react", "python", "java", "javascript", "typescript", "c++", "c#", "sql",
        "technology", "applications", "repositories", "projects", "systems", "architect"
      ];
      if (techKeywords.some(kw => context.includes(kw))) {
        return true;
      }
    }
    return false;
  };

  if (skillLower === "go") {
    if (lower.includes("golang")) return true;
    const regex = /(?:go\s+(?:programming|language|developer|code)|experience\s+with\s+go|using\s+go|go\s+backend)/i;
    if (regex.test(lower)) return true;
    return hasTechContextAroundWord(/\bgo\b/);
  }

  if (skillLower === "r") {
    if (lower.includes("r programming") || lower.includes("r language")) return true;
    return hasTechContextAroundWord(/\br\b/);
  }

  if (skillLower === "c") {
    if (lower.includes("c programming") || lower.includes("c language") || lower.includes("written in c")) return true;
    return hasTechContextAroundWord(/\bc\b/);
  }

  if (skillLower === "ai" || skillLower === "ml") {
    if (lower.includes("artificial intelligence") || lower.includes("machine learning")) return true;
    return hasTechContextAroundWord(new RegExp(`\\b${skillLower}\\b`));
  }

  if (skillLower === "excel") {
    // Only accept Excel if there's context like MS Excel, Microsoft Excel, spreadsheets, office
    if (lower.includes("microsoft excel") || lower.includes("ms excel")) return true;
    return hasTechContextAroundWord(/\bexcel\b/);
  }

  if (skillLower === "spring") {
    // Only accept Spring if Spring Boot, Spring MVC, Java Spring, or Java environment is mentioned
    if (lower.includes("spring boot") || lower.includes("spring framework") || lower.includes("java")) return true;
    return false;
  }

  return true;
}

/**
 * Normalizes common skill aliases.
 */
export function normalizeSkill(skill: string, rawText: string): string | null {
  const clean = skill.trim();
  const lower = clean.toLowerCase();

  // 1. Check exact normalizations
  if (lower === "reactjs" || lower === "react.js") return "React";
  if (lower === "nodejs" || lower === "node.js") return "Node.js";
  if (lower === "expressjs" || lower === "express.js" || lower === "express") return "Express.js";
  if (lower === "mongodb" || lower === "mongo db") return "MongoDB";
  if (lower === "postgresql" || lower === "postgres") return "PostgreSQL";
  
  if (lower === "js") {
    if (verifyShortSkillContext("js", rawText)) return "JavaScript";
    return null;
  }
  
  if (lower === "ts") {
    if (verifyShortSkillContext("ts", rawText)) return "TypeScript";
    return null;
  }

  if (lower === "node") {
    // Check if Node is used as Node.js
    if (rawText.toLowerCase().includes("node.js") || verifyShortSkillContext("node", rawText)) {
      return "Node.js";
    }
    return null;
  }

  // 2. Reject short ambiguous keywords if context validation fails
  const shortSkills = ["go", "r", "c", "ai", "ml", "excel", "spring"];
  if (shortSkills.includes(lower)) {
    if (!verifyShortSkillContext(clean, rawText)) {
      console.warn(`[normalizeSkill] Rejected ambiguous skill: "${clean}" due to lack of tech context.`);
      return null;
    }
  }

  return clean;
}

/**
 * Helper to perform case-insensitive substring search for general facts.
 */
export function isFactPresentInText(value: string, sourceText: string): boolean {
  if (!value) return true;
  const lowerValue = value.toLowerCase().trim();
  const lowerText = sourceText.toLowerCase();

  if (lowerText.includes(lowerValue)) {
    return true;
  }

  // Fuzzy check by stripping non-alphanumeric characters
  const cleanString = (s: string) => s.replace(/[^a-z0-9]/g, "");
  const cleanedVal = cleanString(lowerValue);
  if (!cleanedVal) return false;
  
  return cleanString(lowerText).includes(cleanedVal);
}

/**
 * Assigns confidence level and filters out ungrounded/ambiguous skills.
 */
export function validateCandidateProfile(
  profile: CandidateProfile,
  sourceResumeText: string
): CandidateProfile {
  const verifiedProfile = { ...profile };
  const warnings: string[] = [];

  // Re-map and validate skillsDetail
  const validatedSkillsDetail: SkillsStructure = {
    technical: [],
    frameworks: [],
    languages: [],
    databases: [],
    tools: [],
    cloud: [],
    other: [],
  };

  const processSkillsList = (list: string[], target: string[]) => {
    for (const skill of list) {
      if (!matchSkillBoundaries(skill, sourceResumeText)) {
        console.warn(`[validateCandidateProfile] Skill "${skill}" not found in resume.`);
        continue;
      }
      
      const normalized = normalizeSkill(skill, sourceResumeText);
      if (normalized && !target.includes(normalized)) {
        target.push(normalized);
      }
    }
  };

  processSkillsList(profile.skillsDetail.technical, validatedSkillsDetail.technical);
  processSkillsList(profile.skillsDetail.frameworks, validatedSkillsDetail.frameworks);
  processSkillsList(profile.skillsDetail.languages, validatedSkillsDetail.languages);
  processSkillsList(profile.skillsDetail.databases, validatedSkillsDetail.databases);
  processSkillsList(profile.skillsDetail.tools, validatedSkillsDetail.tools);
  processSkillsList(profile.skillsDetail.cloud, validatedSkillsDetail.cloud);
  processSkillsList(profile.skillsDetail.other, validatedSkillsDetail.other);

  verifiedProfile.skillsDetail = validatedSkillsDetail;

  // Flatten verified skills
  verifiedProfile.skills = Array.from(new Set([
    ...validatedSkillsDetail.technical,
    ...validatedSkillsDetail.frameworks,
    ...validatedSkillsDetail.languages,
    ...validatedSkillsDetail.databases,
    ...validatedSkillsDetail.tools,
    ...validatedSkillsDetail.cloud,
    ...validatedSkillsDetail.other,
  ]));

  // Validate job titles
  verifiedProfile.jobTitles = profile.jobTitles.filter((title) => {
    const isPresent = isFactPresentInText(title, sourceResumeText);
    if (!isPresent) {
      warnings.push(`Filtered out hallucinated job title: ${title}`);
    }
    return isPresent;
  });

  // Validate companies
  verifiedProfile.companies = profile.companies.filter((company) => {
    const isPresent = isFactPresentInText(company, sourceResumeText);
    if (!isPresent) {
      warnings.push(`Filtered out hallucinated company: ${company}`);
    }
    return isPresent;
  });

  // Validate certifications
  verifiedProfile.certifications = profile.certifications.filter((cert) => {
    const isPresent = isFactPresentInText(cert, sourceResumeText);
    if (!isPresent) {
      warnings.push(`Filtered out hallucinated certification: ${cert}`);
    }
    return isPresent;
  });

  // Validate metrics
  verifiedProfile.verifiedMetrics = profile.verifiedMetrics.filter((metric) => {
    const isPresent = isFactPresentInText(metric, sourceResumeText);
    if (!isPresent) {
      warnings.push(`Filtered out hallucinated metric: ${metric}`);
    }
    return isPresent;
  });

  // Validate education entries
  verifiedProfile.education = profile.education.filter((edu) => {
    const isInstPresent = !edu.institution || isFactPresentInText(edu.institution, sourceResumeText);
    const isDegPresent = !edu.degree || isFactPresentInText(edu.degree, sourceResumeText);
    if (!isInstPresent || !isDegPresent) {
      warnings.push(`Filtered out suspicious education entry: ${edu.degree || ""} at ${edu.institution || ""}`);
      return false;
    }
    return true;
  });

  // Validate experience list entries
  const validateRoles = (list: any[]) => {
    return list.map((exp) => {
      const isCompanyPresent = !exp.company || isFactPresentInText(exp.company, sourceResumeText);
      const isTitlePresent = !exp.role || isFactPresentInText(exp.role, sourceResumeText);
      
      return {
        ...exp,
        role: isTitlePresent ? exp.role : undefined,
        title: isTitlePresent ? exp.role : undefined,
        company: isCompanyPresent ? exp.company : undefined,
      };
    });
  };

  verifiedProfile.experience = validateRoles(profile.experience);
  verifiedProfile.internships = validateRoles(profile.internships);

  // Save validation warnings into the profile
  verifiedProfile.warnings = [...profile.warnings, ...warnings];

  return verifiedProfile;
}
