import { CandidateProfile } from "./types"
import { SummarizationResult } from "@/types/summarization"

/**
 * Deterministically generates summaries directly from CandidateProfile facts.
 * Used as a fallback when AI generation fails validation twice.
 */
export function generateFallbackSummary(
  profile: CandidateProfile
): SummarizationResult {
  const title = profile.currentOrMostRecentTitle || profile.jobTitles[0] || "Professional"
  const skillsList = profile.skills.slice(0, 5).join(", ")
  const allSkillsList = profile.skills.join(", ")
  const company = profile.companies[0] ? ` at ${profile.companies[0]}` : ""
  
  const expYears = profile.estimatedExperienceYears 
    ? `${profile.estimatedExperienceYears} years of experience` 
    : "established experience"

  // 1. Professional Summary
  const professional = `${title}${company} with ${expYears}. Skilled in ${skillsList}. Proven track record of delivering high-quality results and collaborating on projects.`

  // 2. ATS Optimized Summary
  const ats = `Experienced ${title} possessing key competencies in ${allSkillsList}. Technical proficiencies align with industry standards and framework operations.`

  // 3. Executive Summary
  const executive = `Strategic ${title} with ${expYears} specializing in ${profile.skills.slice(0, 3).join(" and ")}.`

  // 4. Default Tips
  const tips: string[] = []
  if (profile.achievements.length === 0) {
    tips.push("Add quantified achievements (e.g., 'saved 15% time' or 'led a 4-person team') to improve ATS ranking.")
  }
  if (profile.skills.length < 5) {
    tips.push("Include a dedicated Skills section listing programming languages, tools, and methodologies.")
  }
  if (profile.education.length === 0) {
    tips.push("Ensure your education credentials, degrees, or diplomas are clearly detailed.")
  }

  // Backfill up to 3 tips
  const defaultTips = [
    "Verify formatting alignment and margins to present a clean, visually balanced layout.",
    "Tailor your resume by adding keywords from your target job description.",
    "Include links to your professional portfolio or GitHub repositories."
  ]
  while (tips.length < 3) {
    const nextTip = defaultTips.find(t => !tips.includes(t)) ?? defaultTips[0]
    tips.push(nextTip)
  }

  return {
    professional,
    ats,
    executive,
    skills: profile.skills.slice(0, 8),
    jobTitle: title,
    tips,
    score: 65, // Will be computed on server
    wordCount: 0, // Will be computed on server
    readingTime: "", // Will be computed on server
    detectedExperience: profile.estimatedExperienceYears 
      ? `${profile.estimatedExperienceYears} years` 
      : "Entry Level",
    detectedIndustry: profile.industries[0] || "Technology",
  }
}
