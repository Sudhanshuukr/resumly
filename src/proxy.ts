// ============================================================
// Rate limiting proxy (Next.js 16 — replaces middleware.ts).
// Currently allows all requests through (unlimited).
// To activate: set RATE_LIMIT_MAX and RATE_LIMIT_WINDOW_MS.
// ============================================================

import { NextRequest, NextResponse } from "next/server"

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX ?? "0", 10) // 0 = disabled
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000", 10)

// In-memory store: ip → { count, windowStart }
// Note: in a multi-instance deployment, use Redis instead.
const rateLimitMap = new Map<string, { count: number; windowStart: number }>()

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

export function checkRateLimit(req: NextRequest): NextResponse | null {
  // Rate limiting is disabled when MAX_REQUESTS is 0
  if (MAX_REQUESTS === 0) return null

  const ip = getClientIP(req)
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return null
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000)
    return NextResponse.json(
      {
        success: false,
        code: "RATE_LIMITED",
        message: `Too many requests. Please wait ${retryAfterSec} seconds and try again.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(MAX_REQUESTS),
          "X-RateLimit-Remaining": "0",
        },
      }
    )
  }

  entry.count++
  return null
}

// Next.js 16 proxy entry point — only applied to /api/summarize
export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/summarize")) {
    const limited = checkRateLimit(req)
    if (limited) return limited
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/summarize"],
}
