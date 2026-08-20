import { groqProvider } from "@/lib/ai/providers/groq"
import {
  buildSummaryGenerationPrompt,
  SUMMARY_GENERATION_SYSTEM_MESSAGE,
} from "./prompts"
import { CandidateProfile } from "./types"
import { SummarizationResult } from "@/types/summarization"

/**
 * Strips markdown code blocks from LLM JSON responses.
 */
function cleanJSONString(rawContent: string): string {
  let cleanJson = rawContent.trim()
  if (cleanJson.startsWith("```")) {
    const startIdx = cleanJson.indexOf("\n")
    const endIdx = cleanJson.lastIndexOf("```")
    if (startIdx !== -1 && endIdx !== -1) {
      cleanJson = cleanJson.substring(startIdx + 1, endIdx).trim()
    }
  }
  if (cleanJson.startsWith("json\n")) {
    cleanJson = cleanJson.substring(5).trim()
  }
  return cleanJson
}

/**
 * Generates summaries (Professional, ATS, Executive) and tips from the CandidateProfile.
 * Optionally accepts validation feedback for controlled retries.
 */
export async function generateSummary(
  profile: CandidateProfile,
  retryFeedback?: string
): Promise<SummarizationResult> {
  const prompt = buildSummaryGenerationPrompt(profile, retryFeedback)

  try {
    const rawContent = await groqProvider.generateSummary(
      SUMMARY_GENERATION_SYSTEM_MESSAGE,
      prompt
    )

    const cleanedJson = cleanJSONString(rawContent)
    const parsed = JSON.parse(cleanedJson)

    // Construct the result ensuring structure consistency
    const result: SummarizationResult = {
      professional: String(parsed.professional || "").trim(),
      ats: String(parsed.ats || "").trim(),
      executive: String(parsed.executive || "").trim(),
      skills: Array.isArray(parsed.skills) ? parsed.skills.map((s: unknown) => String(s).trim()) : [],
      jobTitle: String(parsed.jobTitle || profile.currentOrMostRecentTitle || "Candidate").trim(),
      tips: Array.isArray(parsed.tips) ? parsed.tips.map((t: unknown) => String(t).trim()) : [],
      score: typeof parsed.score === "number" ? parsed.score : 70, // will be overwritten deterministically in coordinator
      wordCount: 0, // will be computed on server in API coordinator
      readingTime: "", // will be computed on server in API coordinator
      detectedExperience: String(parsed.detectedExperience || `${profile.estimatedExperienceYears || 'unknown'} years`).trim(),
      detectedIndustry: String(parsed.detectedIndustry || profile.industries[0] || "General").trim(),
    }

    return result
  } catch (err: unknown) {
    console.error("[generateSummary] API call failed:", err)
    if (err && typeof err === "object" && "code" in err && "success" in err) {
      throw err
    }
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Summary generation failed: ${message}`)
  }
}
