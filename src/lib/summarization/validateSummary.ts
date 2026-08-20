import { CandidateProfile, SummaryValidationResult } from "./types"
import { SummarizationResult } from "@/types/summarization"
import { escapeRegex } from "./validateCandidateProfile"

/**
 * Normalizes text for comparison.
 */
function cleanForCompare(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Checks if a word is in a list of stop words.
 */
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", 
  "of", "from", "as", "is", "are", "was", "were", "be", "been", "have", "has", "had"
]);

/**
 * Grounding / Hallucination auditor for generated summaries.
 * Evaluates claims across the 10 prohibited categories.
 */
export function validateSummary(
  result: SummarizationResult,
  profile: CandidateProfile
): SummaryValidationResult {
  const unsupportedEntities: string[] = [];
  const unsupportedNumbers: string[] = [];
  const suspiciousClaims: string[] = [];
  const warnings: string[] = [];

  const combinedSummaryText = `${result.professional} ${result.ats} ${result.executive}`.toLowerCase();
  const rawTextLower = combinedSummaryText;

  // 1. YEARS_OF_EXPERIENCE claim check
  // Matches e.g., "5+ years", "3 years of experience", "6 years' experience"
  const yearsRegex = /(\d+)\+?\s*years?(?:\s+of)?(?:\s+experience)?/g;
  let yearMatch;
  const estimatedYears = profile.estimatedExperienceYears || 0;
  while ((yearMatch = yearsRegex.exec(rawTextLower)) !== null) {
    const claimedYears = parseInt(yearMatch[1], 10);
    // Allow small rounding (up to 1.5 years overhead)
    if (claimedYears > Math.ceil(estimatedYears + 1.5)) {
      suspiciousClaims.push(`YEARS_OF_EXPERIENCE: Claimed ${claimedYears} years, but calculated is ${estimatedYears.toFixed(1)}`);
      warnings.push(`Deducted for ungrounded experience duration: claimed ${claimedYears} years.`);
    }
  }

  // 2. TECHNOLOGY claim check
  const profileSkillsClean = profile.skills.map(s => s.toLowerCase().trim());
  // List of common technologies to scan for in summary
  const commonTech = [
    "react", "angular", "vue", "next.js", "nextjs", "typescript", "javascript", "python", 
    "node.js", "nodejs", "aws", "docker", "kubernetes", "gcp", "azure", "java", "sql", 
    "c++", "go", "rust", "git", "linux", "html", "css", "redux", "graphql", "mongodb", 
    "postgresql", "mysql", "php", "django", "laravel", "flask", "ruby", "rails"
  ];
  for (const tech of commonTech) {
    const escaped = escapeRegex(tech);
    const techRegex = new RegExp(`(?:^|[^a-zA-Z0-9#+.])${escaped}(?:$|[^a-zA-Z0-9#+.])`, "i");
    if (techRegex.test(rawTextLower)) {
      const isTechInProfile = profileSkillsClean.some(s => s.includes(tech) || tech.includes(s));
      if (!isTechInProfile) {
        unsupportedEntities.push(`TECHNOLOGY: ${tech}`);
        warnings.push(`Filtered out summary reference to unsupported technology: "${tech}".`);
      }
    }
  }

  // 3. EMPLOYER claim check
  // Checks if summaries contain proper names that might represent employers not in profile.
  const profileCompaniesClean = profile.companies.map(c => c.toLowerCase().trim());
  if (profileCompaniesClean.length > 0) {
    // Look for capitalized words that could represent companies
    const sentences = `${result.professional} ${result.ats} ${result.executive}`.split(/[.!?]+/);
    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      for (let i = 0; i < words.length; i++) {
        const word = words[i].replace(/[^a-zA-Z]/g, "");
        if (word && word[0] === word[0].toUpperCase() && !STOP_WORDS.has(word.toLowerCase())) {
          // If a proper noun isn't in companies/education/skills, check if it's an ungrounded company
          const wordLower = word.toLowerCase();
          const isGenericOrCommon = ["developer", "engineer", "senior", "lead", "ats", "executive", "professional", "track", "proven", "record", "experience"].includes(wordLower);
          if (!isGenericOrCommon) {
            const matchesCompany = profileCompaniesClean.some(c => c.includes(wordLower) || wordLower.includes(c));
            const matchesEdu = profile.education.some(e => (e.institution || "").toLowerCase().includes(wordLower));
            const matchesSkill = profileSkillsClean.some(s => s.includes(wordLower));
            if (!matchesCompany && !matchesEdu && !matchesSkill && word.length > 3) {
              // Could be an ungrounded proper noun / employer
              // We'll log it as warning rather than rejection unless highly confident
              warnings.push(`Proper noun "${word}" in summary is not verified in company/school lists.`);
            }
          }
        }
      }
    }
  }

  // 4. JOB_TITLE claim check
  const profileTitlesClean = profile.jobTitles.map(t => t.toLowerCase().trim());
  const jobTitleRegex = /\b(?:software\s+)?(?:engineer|developer|analyst|manager|consultant|architect|lead|specialist)\b/gi;
  const titleMatches = rawTextLower.match(jobTitleRegex) || [];
  if (profileTitlesClean.length > 0 && titleMatches.length > 0) {
    const hasMatchingTitle = titleMatches.some(match =>
      profileTitlesClean.some(t => t.includes(match) || match.includes(t)) ||
      (result.jobTitle && result.jobTitle.toLowerCase().includes(match))
    );
    if (!hasMatchingTitle) {
      suspiciousClaims.push(`JOB_TITLE: Summaries mention target role that doesn't align with verified job history.`);
    }
  }

  // 5. CERTIFICATION claim check
  const profileCertsClean = profile.certifications.map(c => c.toLowerCase().trim());
  const certKeywords = ["aws certified", "pmp", "scrum master", "csm", "oracle certified", "comptia", "cissp"];
  for (const cert of certKeywords) {
    if (rawTextLower.includes(cert)) {
      if (!profileCertsClean.some(c => c.includes(cert) || cert.includes(c))) {
        unsupportedEntities.push(`CERTIFICATION: ${cert}`);
        warnings.push(`Summary mentions certification "${cert}" but none was found in candidate profile.`);
      }
    }
  }

  // 6. EDUCATION claim check
  const profileEduClean = profile.education.map(e => (e.degree || "").toLowerCase() + " " + (e.institution || "").toLowerCase());
  const eduKeywords = ["bachelor", "master", "phd", "degree", "bs ", "ms "];
  for (const edu of eduKeywords) {
    if (rawTextLower.includes(edu)) {
      if (profile.education.length === 0) {
        unsupportedEntities.push(`EDUCATION: ${edu} reference`);
        warnings.push(`Summary mentions academic degrees, but education section is missing.`);
      }
    }
  }

  // 7. METRIC claim check
  const numberRegex = /\b\d+(?:\.\d+)?%\b|\$\d+(?:\.\d+)?\s*(?:m|k|b|million|billion)?\b|\b\d{2,}\b/gi;
  const matches = rawTextLower.match(numberRegex) || [];

  const verifiedMetricsClean = profile.verifiedMetrics.map(cleanForCompare);
  const experienceTextClean = profile.experience.map(e => cleanForCompare(e.bullets?.join(" ") || e.description || "")).join("");
  const achievementsClean = profile.achievements.map(a => cleanForCompare(a.description || "")).join("");
  const projectsClean = profile.projects.map(p => cleanForCompare(p.bullets?.join(" ") || p.description || "")).join("");
  
  const allVerifiedContextClean = verifiedMetricsClean.join("") + experienceTextClean + achievementsClean + projectsClean;

  for (const match of matches) {
    const cleanMatch = cleanForCompare(match);
    if (!cleanMatch || ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"].includes(cleanMatch)) continue; // ignore calendar years

    const isNumberSupported = allVerifiedContextClean.includes(cleanMatch);
    if (!isNumberSupported) {
      unsupportedNumbers.push(match);
      warnings.push(`Filtered out unsupported metric: "${match}".`);
    }
  }

  // 8. LEADERSHIP claim check
  const strongVerbs = ["led", "managed", "spearheaded", "directed", "supervised", "slashed", "architected"];
  const allTitles = [...profile.jobTitles, ...profile.experience.map(e => e.role || "")].map(t => t.toLowerCase());
  const hasLeadershipEvidence = allTitles.some(t => 
    /\b(senior|lead|principal|architect|manager|mgr|director|head|vp|president|ceo|cto|founder)\b/.test(t)
  ) || profile.estimatedExperienceYears! >= 4.0;

  for (const verb of strongVerbs) {
    const verbRegex = new RegExp(`\\b${verb}\\b`, "i");
    if (verbRegex.test(rawTextLower) && !hasLeadershipEvidence && profile.experienceLevel === "student") {
      suspiciousClaims.push(`LEADERSHIP: Uses verb "${verb}" without leadership titles or senior experience.`);
      warnings.push(`Leadership verb "${verb}" flagged as suspicious for student/junior profile.`);
    }
  }

  // 9. ACHIEVEMENT claim check
  if (rawTextLower.includes("award") || rawTextLower.includes("won ") || rawTextLower.includes("scholarship")) {
    if (profile.achievements.length === 0) {
      suspiciousClaims.push("ACHIEVEMENT: Claims awards or competition achievements, but achievements list is empty.");
    }
  }

  // 10. DOMAIN_EXPERTISE claim check
  const profileIndustriesClean = profile.industries.map(i => i.toLowerCase().trim());
  const domainKeywords = ["fintech", "finance", "healthcare", "e-commerce", "retail", "cryptocurrency", "blockchain", "telecom"];
  for (const domain of domainKeywords) {
    if (rawTextLower.includes(domain)) {
      if (!profileIndustriesClean.some(i => i.includes(domain) || domain.includes(i))) {
        warnings.push(`Summary references domain expertise in "${domain}" which is not explicitly listed in profile.`);
      }
    }
  }

  const valid = unsupportedEntities.length === 0 && 
                unsupportedNumbers.length === 0 && 
                suspiciousClaims.length === 0;

  return {
    valid,
    unsupportedEntities,
    unsupportedNumbers,
    suspiciousClaims,
    warnings,
  };
}
