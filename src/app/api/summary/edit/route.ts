import { NextRequest, NextResponse } from "next/server"
import { supabase, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"
import { checkQuota } from "@/lib/quota"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, text, variant } = body

    if (!id || !text || !variant) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters: id, text, and variant." },
        { status: 400 }
      )
    }

    if (variant !== "professional" && variant !== "ats" && variant !== "executive") {
      return NextResponse.json(
        { success: false, message: "Invalid variant type." },
        { status: 400 }
      )
    }

    // 1. Verify user (for security/auth checking)
    const quota = await checkQuota(req)
    const userId = quota.userId

    // 2. Persist update in database if record id is provided
    if (isSupabaseConfigured()) {
      try {
        const adminClient = getSupabaseAdmin()
        const updateData: Record<string, string> = {}
        updateData[variant] = text

        let query = adminClient.from("summaries").update(updateData).eq("id", id)
        
        // If user is authenticated, ensure they own the summary they are updating
        if (userId) {
          query = query.eq("user_id", userId)
        }

        const { error: dbError } = await query
        if (dbError) {
          console.error("[summary edit API] Supabase update error:", dbError)
          throw new Error("Failed to save edited summary to database.")
        } else {
          console.log(`[summary edit API] Successfully manual updated summary ${id} (variant: ${variant}) in Supabase.`)
        }
      } catch (dbErr: any) {
        console.error("[summary edit API] Database connection error:", dbErr)
        return NextResponse.json(
          { success: false, code: "DATABASE_ERROR", message: dbErr.message || "Failed to update summary in database." },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      text,
    })
  } catch (error: any) {
    console.error("[summary edit API] Unexpected error:", error)
    return NextResponse.json(
      { success: false, code: "UNKNOWN", message: error.message || "An unexpected error occurred." },
      { status: 500 }
    )
  }
}
