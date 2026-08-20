// ============================================================
// POST /api/summarize
// Thin coordinator — delegates all logic to dedicated services.
// ============================================================

import { NextRequest, NextResponse } from "next/server"
import { validateUploadedFile } from "@/lib/ai/validator"
import { resumeParser } from "@/lib/ai/parser"
import { cleanResumeText } from "@/lib/ai/cleaner"
import { SummarizationError } from "@/types/summarization"
import { SummarizationResult } from "@/types/summarization"
import { isSupabaseConfigured, getSupabaseAdmin } from "@/lib/supabase"
import { validateResumeContent } from "@/lib/ai/resume-validator"
import { checkQuota } from "@/lib/quota"
import { FREE_ANONYMOUS_SUMMARY_LIMIT, FREE_LIMIT_ERROR_CODE } from "@/lib/constants"
import { createHash } from "crypto"

import { extractContacts } from "@/lib/summarization/contactExtractor"
import { detectSections, reconcileSections } from "@/lib/summarization/sectionDetector"
import { extractCandidateProfile } from "@/lib/summarization/extractCandidateProfile"
import { validateCandidateProfile } from "@/lib/summarization/validateCandidateProfile"
import { calculateExperience } from "@/lib/summarization/calculateExperience"
import { calculateATSReadinessScore } from "@/lib/summarization/calculateATSReadinessScore"
import { generateSummary } from "@/lib/summarization/generateSummary"
import { validateSummary } from "@/lib/summarization/validateSummary"
import { generateFallbackSummary } from "@/lib/summarization/generateFallbackSummary"
import { generateAIInsights, AIInsight } from "@/lib/summarization/generateAIInsights"
import { CandidateProfile } from "@/lib/summarization/types"

// Pipeline versions for caching
const ANALYZER_VERSION = "v2"
const SCORING_VERSION = "v2"
const PROMPT_VERSION = "v2"

// Global in-memory cache to persist verified CandidateProfiles across regenerations/sessions
const profileCache = new Map<string, CandidateProfile>()

function getResumeHash(text: string): string {
  return createHash("sha256").update(text.trim()).digest("hex")
}

function getCacheKey(hash: string): string {
  return `${hash}:${ANALYZER_VERSION}:${SCORING_VERSION}:${PROMPT_VERSION}`
}

function sanitizeContactInfo(text: string): string {
  let sanitized = text
  // 1. Email addresses
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL_REDACTED]")
  // 2. Phone numbers (standard formats)
  sanitized = sanitized.replace(/\b\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/g, "[PHONE_REDACTED]")
  // 3. Simple address / street indicator matches
  sanitized = sanitized.replace(/\b\d+\s+([a-zA-Z]+|[a-zA-Z]+\s+[a-zA-Z]+)\s+(st|ave|rd|blvd|way|court|ct|drive|dr|street|avenue|road|highway)\b/gi, "[ADDRESS_REDACTED]")
  
  return sanitized
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // ── 0. Check authentication and anonymous quota status ───
    const quota = await checkQuota(req)
    const userId = quota.userId
    const anonymousId = quota.anonymousId
    
    let sessionId = req.headers.get("x-session-id") || ""
    if (!quota.authenticated && anonymousId) {
      sessionId = anonymousId
    }

    if (quota.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          code: FREE_LIMIT_ERROR_CODE,
          message: "You've used your 3 free summaries. Create a free account or log in to continue.",
          usage: {
            used: quota.used,
            limit: quota.limit,
            remaining: 0,
          },
        },
        { status: 429 }
      )
    }

    let cleanText = ""
    let fileName = "Regenerated"
    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      const body = await req.json()
      cleanText = body.resumeText || ""
      fileName = body.fileName || "Regenerated"
    } else {
      // ── 1. Parse multipart form data ─────────────────────────
      const formData = await req.formData()
      const file = formData.get("resume")

      if (!file || typeof file === "string") {
        return NextResponse.json(
          {
            success: false,
            code: "INVALID_FILE",
            message: "No file was uploaded. Please select a PDF or DOCX file.",
          } satisfies SummarizationError,
          { status: 400 }
        )
      }

      // ── 2. Validate file (mime, size, magic bytes) ────────────
      const { buffer, extension } = await validateUploadedFile(file as File)
      fileName = file.name

      // ── 3. Parse text from file ───────────────────────────────
      const rawText = await resumeParser.parse(buffer, extension)

      // ── 4. Clean & sanitise the extracted text ────────────────
      cleanText = cleanResumeText(rawText)
    }

    console.log(`[summarize] Processing file: ${fileName}, cleaned length: ${cleanText.length}`)

    // ── 5. Check if the document is actually a resume ────────
    const validation = validateResumeContent(cleanText)
    if (!validation.isValid) {
      console.warn(`[summarize] Document failed resume validation. Score: ${validation.score}`)
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_RESUME",
          message: "The uploaded document does not appear to be a resume or CV. Please upload a valid resume in PDF or DOCX format.",
        } satisfies SummarizationError,
        { status: 422 }
      )
    }

    // Quality gate: scanned or corrupt text
    if (cleanText.length < 100) {
      console.warn(`[summarize] Parsing failed: Extracted content too short. Cleaned text length: ${cleanText.length}`)
      return NextResponse.json(
        {
          success: false,
          code: "INSUFFICIENT_EXTRACTION",
          message: "We couldn't reliably extract enough text from this resume. Please ensure it contains readable text (not a scanned image or empty file).",
        } satisfies SummarizationError,
        { status: 422 }
      )
    }

    const resumeHash = getResumeHash(cleanText)
    const cacheKey = getCacheKey(resumeHash)
    let profile = profileCache.get(cacheKey)
    const isMockBypass = quota.userId === "mock-bypass-user-id" && process.env.NODE_ENV === "development"

    if (!profile) {
      console.info(`[summarize] Cache miss. Extracting profile facts for key: ${cacheKey}`)
      let rawProfile: CandidateProfile

      if (isMockBypass) {
        // Return mocked raw profile to test validation logic
        rawProfile = {
          name: "Mock Engineer",
          email: "mock@example.com",
          phone: "555-555-5555",
          location: "San Francisco, CA",
          links: ["github.com/mock"],
          experience: [
            {
              role: "Senior Engineer",
              company: "CloudTech",
              startDate: "2022",
              endDate: "Present",
              currentlyWorking: true,
              bullets: ["Led development of microservices scaling to 5M+ DAU.", "Managed team of 6 engineers.", "Replaced legacy systems, reducing hosting overhead by 32%."],
            }
          ],
          internships: [],
          education: [
            {
              degree: "B.S. in Computer Science",
              fieldOfStudy: "Computer Science",
              institution: "Borcelle University",
              graduationYear: "2019"
            }
          ],
          projects: [],
          skillsDetail: {
            technical: ["Microservices", "CI/CD"],
            frameworks: ["React", "Next.js"],
            languages: ["Go", "TypeScript"],
            databases: ["SQL"],
            tools: ["Docker", "Kubernetes"],
            cloud: ["AWS"],
            other: [],
          },
          skills: ["React", "Node.js", "Next.js", "Go", "AWS", "Docker", "Kubernetes", "TypeScript", "SQL"],
          certifications: [],
          achievements: [],
          verifiedMetrics: ["5M+ DAU", "6 engineers", "32% hosting overhead"],
          industries: ["Technology"],
          analysisStatus: "COMPLETE",
          confidence: { overall: 0.9, role: 0.9, skills: 0.9, experience: 0.9, sections: 0.9 },
          warnings: [],
          jobTitles: ["Senior Engineer"],
          companies: ["CloudTech"],
          experienceLevel: "senior"
        }
      } else {
        // ── 6. Deterministic Contact Extraction ──
        const extractedContacts = extractContacts(cleanText)

        // ── 7. Sanitise contacts before sending to Groq (Privacy) ──
        const sanitizedText = sanitizeContactInfo(cleanText)

        // ── 8. Extract structured profile facts via Groq ──
        rawProfile = await extractCandidateProfile(sanitizedText)

        // Merge deterministic contacts back in
        rawProfile.email = extractedContacts.email || rawProfile.email
        rawProfile.phone = extractedContacts.phone || rawProfile.phone
        rawProfile.name = rawProfile.name // trust parsed name or LLM
        rawProfile.location = rawProfile.location
        rawProfile.links = Array.from(new Set([...extractedContacts.links, ...rawProfile.links]))
      }

      // ── 9. Double-grounding verification ──
      const verifiedProfile = validateCandidateProfile(rawProfile, cleanText)

      // ── 10. Experience & Seniority bands calculation ──
      profile = calculateExperience(verifiedProfile)

      // Save to cache
      profileCache.set(cacheKey, profile)
    } else {
      console.info(`[summarize] Cache hit. Reusing profile facts for key: ${cacheKey}`)
    }

    // ── 11. Deterministic Section Detection & Reconciler ──
    const headingMatches = detectSections(cleanText)
    const sectionsReconciliation = reconcileSections(headingMatches, profile)

    // ── 12. ATS Readiness Score & Deductions calculation ──
    const atsScoreResult = calculateATSReadinessScore(profile, cleanText, sectionsReconciliation.statuses)

    // ── 13. AI Summaries Generation with retries ──
    let result = null
    let attempts = 0
    let retryFeedback = ""

    if (isMockBypass) {
      result = {
        professional: "Senior Engineer with experience in React and Node.js at CloudTech. Managed a team of 6 engineers.",
        ats: "Experienced Senior Engineer specializing in React, Next.js, and TypeScript.",
        executive: "Strategic Senior Engineer with experience leading teams and scaling microservices.",
        skills: ["React", "Node.js", "Next.js", "Go", "AWS", "Docker", "Kubernetes", "TypeScript"],
        jobTitle: "Senior Engineer",
        tips: ["Quantify achievements", "Add skills"],
        score: 85,
        wordCount: 0,
        readingTime: "",
        detectedExperience: "Senior Level",
        detectedIndustry: "Technology"
      }
    } else {
      while (attempts < 2 && !result) {
        attempts++
        try {
          console.info(`[summarize] Summary generation attempt ${attempts}...`)
          const generated = await generateSummary(profile, retryFeedback)
          const validation = validateSummary(generated, profile)

          if (validation.valid) {
            result = generated
          } else {
            const entityIssues = validation.unsupportedEntities.length > 0
              ? `\n- Fabricated skills/entities: ${validation.unsupportedEntities.join(", ")}`
              : ""
            const numberIssues = validation.unsupportedNumbers.length > 0
              ? `\n- Fabricated metrics/numbers: ${validation.unsupportedNumbers.join(", ")}`
              : ""
            const verbIssues = validation.suspiciousClaims.length > 0
              ? `\n- Unsupported leadership/impact claims: ${validation.suspiciousClaims.join(", ")}`
              : ""
            
            retryFeedback = `The summaries failed grounding validation due to:${entityIssues}${numberIssues}${verbIssues}\nRewrite using ONLY the verified candidate facts.`
            console.warn(`[summarize] Summary validation failed: ${retryFeedback}`)
          }
        } catch (err) {
          console.warn(`[summarize] Generation error on attempt ${attempts}:`, err)
        }
      }
    }

    if (!result) {
      console.warn("[summarize] AI summary failed validation, using deterministic fallback")
      result = generateFallbackSummary(profile)
    }

    // ── 14. AI Insights generation (using structured problems) ──
    let validatedInsights: AIInsight[] = []
    if (!isMockBypass) {
      validatedInsights = await generateAIInsights(profile, atsScoreResult.deductions)
    }

    // ── 15. Format final response ──
    result.score = atsScoreResult.score
    
    // Map validated insights into tip cards (concise descriptions)
    result.tips = validatedInsights.length > 0
      ? validatedInsights.map(i => `${i.title}: ${i.message} (Action: ${i.suggestedAction})`)
      : atsScoreResult.tips

    // Programmatic wordCount & reading time
    const wordsCount = cleanText.split(/\s+/).filter(Boolean).length
    result.wordCount = wordsCount
    result.readingTime = `${Math.max(1, Math.ceil(wordsCount / 200))} min read`
    result.detectedExperience = profile.experienceLevel === "student" 
      ? "Student / Entry Level" 
      : `${profile.estimatedExperienceYears || '0'} years`

    // Attach optional breakdown and deductions
    result.scoreBreakdown = atsScoreResult.breakdown
    result.deductions = atsScoreResult.deductions.map(d => ({
      rule: d.rule,
      deduction: d.deduction,
      evidence: d.evidence
    }))

    // ── 16. Persist to Supabase if configured ──
    let databaseId: string | undefined = undefined

    if (isSupabaseConfigured() && sessionId) {
      try {
        const adminClient = getSupabaseAdmin()
        const { data: inserted, error: dbError } = await adminClient
          .from("summaries")
          .insert({
            file_name: fileName,
            job_title: result.jobTitle,
            score: result.score,
            word_count: result.wordCount,
            reading_time: result.readingTime,
            detected_experience: result.detectedExperience,
            detected_industry: result.detectedIndustry,
            skills: result.skills,
            professional: result.professional,
            ats: result.ats,
            executive: result.executive,
            tips: result.tips,
            session_id: sessionId,
            user_id: userId || null,
          })
          .select("id")
          .single()

        if (dbError) {
          console.error("[summarize] Error saving to Supabase:", dbError)
        } else if (inserted) {
          databaseId = inserted.id
          console.log(`[summarize] Saved summary to DB: ${databaseId}`)
        }
      } catch (err) {
        console.error("[summarize] Database save failed:", err)
      }
    }

    let usageResponse = null
    if (!quota.authenticated && quota.anonymousId) {
      const newCount = quota.used + 1
      usageResponse = {
        used: newCount,
        limit: FREE_ANONYMOUS_SUMMARY_LIMIT,
        remaining: Math.max(0, FREE_ANONYMOUS_SUMMARY_LIMIT - newCount),
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
        id: databaseId,
        resumeText: cleanText,
        usage: usageResponse,
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error("[summarize] Error in route handler:", error)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "success" in error
    ) {
      const typedError = error as SummarizationError
      const statusMap: Record<string, number> = {
        INVALID_FILE: 400,
        FILE_TOO_LARGE: 413,
        PARSE_ERROR: 422,
        INVALID_RESUME: 422,
        AI_ERROR: 502,
        TIMEOUT: 504,
        RATE_LIMITED: 429,
        DATABASE_ERROR: 500,
        UNKNOWN: 500,
        INSUFFICIENT_EXTRACTION: 422,
      }
      return NextResponse.json(typedError, {
        status: statusMap[typedError.code] ?? 500,
      })
    }

    return NextResponse.json(
      {
        success: false,
        code: "UNKNOWN",
        message: "An unexpected error occurred. Please try again.",
      } satisfies SummarizationError,
      { status: 500 }
    )
  }
}
