import { NextResponse } from "next/server"

// The newsletter feature is currently disabled.
// Preserving the route with a 404 Not Found response so it cannot falsely accept submissions.
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "Newsletter subscription is currently disabled.",
    },
    { status: 404 }
  )
}
