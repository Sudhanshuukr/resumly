import { groqProvider } from "@/lib/ai/providers/groq"
import { buildAIInsightsPrompt, AI_INSIGHTS_SYSTEM_MESSAGE } from "./prompts"
import { CandidateProfile, DeductionLog } from "./types"

export interface AIInsight {
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: string;
  title: string;
  message: string;
  evidence: string[];
  suggestedAction: string;
}

/**
 * Strips markdown code fences from JSON.
 */
function cleanJSONString(rawContent: string): string {
  let cleanJson = rawContent.trim();
  if (cleanJson.startsWith("```")) {
    const startIdx = cleanJson.indexOf("\n");
    const endIdx = cleanJson.lastIndexOf("```");
    if (startIdx !== -1 && endIdx !== -1) {
      cleanJson = cleanJson.substring(startIdx + 1, endIdx).trim();
    }
  }
  if (cleanJson.startsWith("json\n")) {
    cleanJson = cleanJson.substring(5).trim();
  }
  return cleanJson;
}

/**
 * Generates personalized AI Insights based on score deductions and candidate profile facts.
 */
export async function generateAIInsights(
  profile: CandidateProfile,
  deductions: DeductionLog[]
): Promise<AIInsight[]> {
  // If there are no deductions, there are no weaknesses to address.
  if (deductions.length === 0) {
    return [];
  }

  // Construct context strings to keep Groq prompt light and avoid sending raw resume
  const profileSummary = {
    experienceCount: profile.experience.length,
    internshipCount: profile.internships.length,
    projectCount: profile.projects.length,
    educationCount: profile.education.length,
    skillsCount: profile.skills.length,
    hasSummary: !!profile.professionalSummary,
  };

  const profileString = JSON.stringify(profileSummary, null, 2);
  const deductionsString = JSON.stringify(
    deductions.map(d => ({ rule: d.rule, deduction: d.deduction, evidence: d.evidence })),
    null,
    2
  );

  try {
    const rawContent = await groqProvider.generateSummary(
      AI_INSIGHTS_SYSTEM_MESSAGE,
      buildAIInsightsPrompt(profileString, deductionsString, profile.experienceLevel)
    );

    const cleaned = cleanJSONString(rawContent);
    const parsed = JSON.parse(cleaned);
    const rawInsights = Array.isArray(parsed.insights) ? (parsed.insights as AIInsight[]) : [];

    // Factual validation and deduplication
    const validated: AIInsight[] = [];
    const categoriesSeen = new Set<string>();

    for (const insight of rawInsights) {
      const category = (insight.category || "").toUpperCase();
      
      // 1. Deduplicate by category (cluster recommendations)
      if (categoriesSeen.has(category)) continue;

      // 2. Factual validators
      let isValid = true;

      // Check contact details recommendation validity
      if (category === "CONTACT_INFO") {
        const hasEmail = !!profile.email;
        const hasPhone = !!profile.phone;
        if (hasEmail && hasPhone) {
          console.warn("[InsightValidator] Rejected CONTACT_INFO recommendation: contact details already present.");
          isValid = false;
        }
      }

      // Check education recommendation validity
      if (category.includes("EDUCATION")) {
        if (profile.education.length > 0) {
          console.warn("[InsightValidator] Rejected EDUCATION recommendation: education already present.");
          isValid = false;
        }
      }

      // Check projects recommendation validity
      if (category.includes("PROJECTS")) {
        if (profile.projects.length >= 3) {
          console.warn("[InsightValidator] Rejected PROJECTS recommendation: projects list already strong.");
          isValid = false;
        }
      }

      // Check visual layout/margin suggestions (which we cannot detect from plain text)
      const messageLower = (insight.message || "").toLowerCase() + (insight.title || "").toLowerCase();
      if (messageLower.includes("margin") || messageLower.includes("font") || messageLower.includes("alignment") || messageLower.includes("spacing")) {
        console.warn("[InsightValidator] Rejected visual suggestion: layout checks cannot be parsed from text.");
        isValid = false;
      }

      // Check experience recommendation validity
      if (category.includes("EXPERIENCE")) {
        if (profile.experienceLevel !== "student" && profile.experience.length > 0 && !deductions.some(d => d.rule === "MISSING_EXPERIENCE")) {
          // If experience is already present and not flagged as missing, reject generic "Add experience"
          if (messageLower.includes("add a work experience") || messageLower.includes("include work experience")) {
            console.warn("[InsightValidator] Rejected work experience presence recommendation.");
            isValid = false;
          }
        }
      }

      // 3. Prevent recommendation of fake metrics
      const suggestedAction = insight.suggestedAction || "";
      if (/\b\d+%\b|\$\d+/.test(suggestedAction) && !suggestedAction.toLowerCase().includes("if you measured")) {
        // Redraft fake metric instructions
        insight.suggestedAction = suggestedAction.replace(
          /add something like '(?:[^']*)'/gi,
          "Include a verified metric ONLY if you have a real measurement (e.g. response time, test coverage, deployment frequency)."
        );
      }

      if (isValid) {
        validated.push(insight);
        categoriesSeen.add(category);
      }
    }

    // Sort: CRITICAL -> HIGH -> MEDIUM -> LOW
    const priorityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return validated.sort((a, b) => {
      const wa = priorityWeight[a.priority] || 0;
      const wb = priorityWeight[b.priority] || 0;
      return wb - wa;
    });

  } catch (err) {
    console.error("[generateAIInsights] Error generating insights:", err);
    return [];
  }
}
