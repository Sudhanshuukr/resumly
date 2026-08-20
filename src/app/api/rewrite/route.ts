import { NextRequest, NextResponse } from "next/server"
import { supabase, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"
import { groqProvider } from "@/lib/ai/providers/groq"
import { checkQuota } from "@/lib/quota"
import { FREE_LIMIT_ERROR_CODE, FREE_ANONYMOUS_SUMMARY_LIMIT } from "@/lib/constants"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, text, variant, tone } = body

    if (!text || !variant || !tone) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters: text, variant, and tone." },
        { status: 400 }
      )
    }

    // 1. Check authentication and anonymous quota status
    const quota = await checkQuota(req)
    const userId = quota.userId

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

    // 2. Build Groq rewrite prompt requesting a JSON response
    const prompt = `You are a world-class professional resume writer and career editor.
Please rewrite the following resume summary (style category: ${variant}) to sound more ${tone}.

Core Rules:
- DO NOT invent, fabricate, or add new achievements, tools, or metrics. Keep all actual data points, technologies, and achievements from the original text intact.
- Adjust the voice, vocabulary, and phrasing to fit the requested tone:
  - "confident": Authoritative, highly self-assured, asserting leadership and strong impact.
  - "technical": Tech-dense, precise, emphasizing frameworks, engineering best practices, and methodologies.
  - "action-oriented": Outcome-driven, starting sentences with strong, active verbs (e.g. spearheaded, slashed, engineered).
  - "creative": Dynamic, expressive, highlighting innovation and modern problem solving.
- Maintain a similar length (2-3 sentences) as the original summary.

Original summary:
"${text}"

You must return a valid JSON object with the following schema:
{
  "rewrittenText": "The rewritten summary string goes here"
}`

    // 3. Call Groq
    let rewrittenText = ""
    try {
      const rawResponse = await groqProvider.generateSummary(
        "You are an expert resume writer. You output ONLY a valid JSON object.",
        prompt
      )
      const parsed = JSON.parse(rawResponse.trim())
      rewrittenText = parsed.rewrittenText || ""
    } catch (aiErr: any) {
      console.error("[rewrite API] Groq AI error:", aiErr)
      return NextResponse.json(
        { success: false, message: `AI Error: ${aiErr.message || "Failed to contact Groq."}` },
        { status: 502 }
      )
    }

    // 4. Persist update in database if record id is provided
    if (isSupabaseConfigured() && id) {
      try {
        const adminClient = getSupabaseAdmin()
        const updateData: Record<string, string> = {}
        updateData[variant] = rewrittenText

        let query = adminClient.from("summaries").update(updateData).eq("id", id)
        
        // If user is authenticated, ensure they own the summary they are updating
        if (userId) {
          query = query.eq("user_id", userId)
        }

        const { error: dbError } = await query
        if (dbError) {
          console.error("[rewrite API] Supabase update error:", dbError)
          throw new Error("Failed to save rewritten summary to database.")
        } else {
          console.log(`[rewrite API] Successfully updated summary ${id} (variant: ${variant}) in Supabase.`)
        }

        // If guest user, insert a tracker row to count this rewrite usage
        if (!quota.authenticated && quota.anonymousId) {
          const { error: trackerError } = await adminClient
            .from("summaries")
            .insert({
              file_name: "Tone Rewrite",
              job_title: "tone_rewrite_tracker",
              score: 0,
              word_count: 0,
              reading_time: 0,
              detected_experience: "",
              detected_industry: "",
              skills: [],
              professional: rewrittenText,
              ats: "",
              executive: "",
              tips: [],
              session_id: quota.anonymousId,
              user_id: null,
            })
          if (trackerError) {
            console.error("[rewrite API] Error inserting rewrite tracker:", trackerError)
            throw new Error("Failed to save rewrite tracker to database.")
          }
        }
      } catch (dbErr: any) {
        console.error("[rewrite API] Database connection error:", dbErr)
        return NextResponse.json(
          { success: false, code: "DATABASE_ERROR", message: dbErr.message || "Failed to update summary in database." },
          { status: 500 }
        )
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

    return NextResponse.json({
      success: true,
      rewrittenText,
      usage: usageResponse,
    })
  } catch (error: any) {
    console.error("[rewrite API] Unexpected error:", error)
    return NextResponse.json(
      { success: false, code: "UNKNOWN", message: error.message || "An unexpected error occurred." },
      { status: 500 }
    )
  }
}
