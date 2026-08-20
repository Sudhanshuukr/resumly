import { NextRequest, NextResponse } from "next/server"
import { supabase, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, message: "Supabase not configured." })
    }

    // 1. Verify User Session via JWT token
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Missing authorization token." },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let userId: string | null = null

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      if (authError || !user) {
        return NextResponse.json(
          { success: false, message: "Invalid or expired authorization token." },
          { status: 401 }
        )
      }
      userId = user.id
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Failed to authenticate session token." },
        { status: 401 }
      )
    }

    // 2. Extract session_id from cookie (secure) or body (fallback)
    let sessionId: string | undefined = undefined
    try {
      const { getAnonymousId } = await import("@/lib/anonymousSession")
      sessionId = await getAnonymousId()
    } catch (err) {
      console.warn("[claim history API] Error reading anonymous cookie:", err)
    }

    if (!sessionId) {
      try {
        const body = await req.json()
        sessionId = body.session_id
      } catch (err) {
        // Body reading failed or empty
      }
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Missing anonymous session identifier." },
        { status: 400 }
      )
    }

    // 3. Migrate guest summaries matching session_id where user_id is null (unclaimed)
    const adminClient = getSupabaseAdmin()
    const { data, error } = await adminClient
      .from("summaries")
      .update({ user_id: userId })
      .eq("session_id", sessionId)
      .is("user_id", null)
      .select("id")

    if (error) {
      console.error("[claim history API] Error migrating summaries:", error)
      return NextResponse.json(
        { success: false, message: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    console.log(`[claim history API] Successfully claimed ${data?.length || 0} guest summaries for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: `Successfully claimed ${data?.length || 0} summaries.`,
      claimedCount: data?.length || 0,
    })
  } catch (error) {
    console.error("[claim history API] Unexpected error:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    )
  }
}
