import { NextRequest, NextResponse } from "next/server"
import { supabase, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, data: [] })
    }

    const adminClient = getSupabaseAdmin()

    // 1. Verify authentication token if sent
    const authHeader = req.headers.get("Authorization")
    let userId: string | null = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (!authError && user) {
          userId = user.id
        }
      } catch (err) {
        console.warn("[history API] Error verifying user JWT:", err)
      }
    }

    let query = adminClient.from("summaries").select("*").neq("job_title", "tone_rewrite_tracker")

    if (userId) {
      // Authenticated user: fetch only by user_id
      query = query.eq("user_id", userId)
    } else {
      // Guest user: fetch by session_id but only where user_id is null (unclaimed)
      const { searchParams } = new URL(req.url)
      const sessionId = searchParams.get("session_id")

      if (!sessionId) {
        return NextResponse.json(
          { success: false, message: "Missing session_id query parameter." },
          { status: 400 }
        )
      }

      query = query.eq("session_id", sessionId).is("user_id", null)
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(15)

    if (error) {
      console.error("[history API] Supabase error:", error)
      return NextResponse.json(
        { 
          success: false, 
          message: `Database error: ${error.message}.`,
          data: []
        },
        { status: 200 }
      )
    }

    // Format fields appropriately for the client
    const formattedData = (data || []).map((row: any) => ({
      id: row.id,
      createdAt: row.created_at,
      fileName: row.file_name,
      result: {
        professional: row.professional,
        ats: row.ats,
        executive: row.executive,
        skills: row.skills,
        jobTitle: row.job_title,
        score: row.score,
        tips: row.tips,
        wordCount: row.word_count,
        readingTime: row.reading_time,
        detectedExperience: row.detected_experience,
        detectedIndustry: row.detected_industry,
      }
    }))

    return NextResponse.json({ success: true, data: formattedData })
  } catch (error) {
    console.error("[history API] Unexpected error:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    )
  }
}
