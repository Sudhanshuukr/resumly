import { NextRequest } from "next/server"
import { supabase, isSupabaseConfigured, getSupabaseAdmin } from "@/lib/supabase"
import { getOrCreateAnonymousId } from "@/lib/anonymousSession"
import { FREE_ANONYMOUS_SUMMARY_LIMIT } from "@/lib/constants"

export interface QuotaStatus {
  authenticated: boolean
  userId: string | null
  anonymousId: string | null
  used: number
  limit: number
  remaining: number
  isBlocked: boolean
}

/**
 * Checks user authentication and anonymous quota status.
 * If authenticated: returns bypass status (isBlocked: false).
 * If anonymous: reads/creates anonymous ID cookie, counts database summaries matching the ID (where user_id is null),
 * and checks if the limit has been reached.
 */
export async function checkQuota(req: NextRequest): Promise<QuotaStatus> {
  // 1. Check user authentication
  const authHeader = req.headers.get("Authorization")
  let userId: string | null = null

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7)
    if (token === "mock-admin-bypass-token" && process.env.NODE_ENV === "development") {
      userId = "mock-bypass-user-id"
    } else {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (!authError && user) {
          userId = user.id
        }
      } catch (err) {
        console.warn("[quota check] Error verifying user JWT:", err)
      }
    }
  }

  if (userId) {
    return {
      authenticated: true,
      userId,
      anonymousId: null,
      used: 0,
      limit: FREE_ANONYMOUS_SUMMARY_LIMIT,
      remaining: 9999, // Arbitrary high value for authenticated users
      isBlocked: false,
    }
  }

  // 2. Anonymous guest quota check
  const anonymousId = await getOrCreateAnonymousId()
  let count = 0

  if (isSupabaseConfigured()) {
    const adminClient = getSupabaseAdmin()
    const { count: dbCount, error: countError } = await adminClient
      .from("summaries")
      .select("*", { count: "exact", head: true })
      .eq("session_id", anonymousId)
      .is("user_id", null)

    if (countError) {
      console.error("[quota check] Error counting guest summaries:", countError)
    } else if (dbCount !== null) {
      count = dbCount
    }
  }

  const remaining = Math.max(0, FREE_ANONYMOUS_SUMMARY_LIMIT - count)

  return {
    authenticated: false,
    userId: null,
    anonymousId,
    used: count,
    limit: FREE_ANONYMOUS_SUMMARY_LIMIT,
    remaining,
    isBlocked: count >= FREE_ANONYMOUS_SUMMARY_LIMIT,
  }
}
