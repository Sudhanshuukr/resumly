import { cookies } from "next/headers"
import { ANONYMOUS_COOKIE_NAME } from "./constants"

// Standard UUID format validator regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Retrieves the anonymous ID from the secure HTTP-Only cookie.
 * If the cookie is missing or contains an invalid UUID, a new UUID is generated,
 * saved in the browser cookie, and returned.
 */
export async function getOrCreateAnonymousId(): Promise<string> {
  const cookieStore = await cookies()
  const existingId = cookieStore.get(ANONYMOUS_COOKIE_NAME)?.value

  if (existingId && UUID_REGEX.test(existingId)) {
    return existingId
  }

  // Generate new secure UUID
  const newId = crypto.randomUUID()
  
  cookieStore.set(ANONYMOUS_COOKIE_NAME, newId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year expiration
  })

  return newId
}

/**
 * Retrieves the anonymous ID from the secure HTTP-Only cookie, returning undefined if it doesn't exist or is invalid.
 * Does not create or set a new cookie.
 */
export async function getAnonymousId(): Promise<string | undefined> {
  const cookieStore = await cookies()
  const existingId = cookieStore.get(ANONYMOUS_COOKIE_NAME)?.value

  if (existingId && UUID_REGEX.test(existingId)) {
    return existingId
  }

  return undefined
}
