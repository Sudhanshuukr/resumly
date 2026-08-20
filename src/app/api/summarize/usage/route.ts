import { NextRequest, NextResponse } from "next/server"
import { checkQuota } from "@/lib/quota"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest): Promise<NextResponse> {
  const headers = new Headers({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  })

  try {
    const quota = await checkQuota(req)

    return NextResponse.json(
      {
        authenticated: quota.authenticated,
        usage: quota.authenticated
          ? null
          : {
              used: quota.used,
              limit: quota.limit,
              remaining: quota.remaining,
            },
      },
      { headers }
    )
  } catch (error) {
    console.error("[usage API] Unexpected error:", error)
    return NextResponse.json(
      {
        authenticated: false,
        usage: {
          used: 0,
          limit: 3,
          remaining: 3,
        },
      },
      { headers }
    )
  }
}
