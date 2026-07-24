// ============================================================
// Upload Service — client-side.
// The UI calls this; it knows nothing about endpoint details.
// Uses XMLHttpRequest for real progress events.
// ============================================================

import {
  SummarizationResult,
  SummarizationError,
  SummarizationResponse,
} from "@/types/summarization"

const ENDPOINT = "/api/summarize"

/**
 * Uploads a resume file to the summarization API with progress tracking.
 *
 * @param file - The resume File object
 * @param onProgress - Callback receiving upload progress percentage (0–90)
 *                     Note: 90–100 is reserved for server-side processing
 * @returns Resolved SummarizationResult on success
 * @throws SummarizationError on failure
 */
export function uploadResume(
  file: File,
  sessionId: string,
  token: string | null,
  onProgress: (percent: number) => void
): Promise<{ result: SummarizationResult; id?: string; resumeText?: string; usage?: { used: number; limit: number; remaining: number } | null }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append("resume", file)

    const xhr = new XMLHttpRequest()

    // ── Upload progress (0–90%) ───────────────────────────────
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        // Cap at 90% — the remaining 10% represents server processing
        const uploadPercent = Math.round((event.loaded / event.total) * 90)
        onProgress(uploadPercent)
      }
    })

    // ── Response received ─────────────────────────────────────
    xhr.addEventListener("load", () => {
      try {
        const response: SummarizationResponse = JSON.parse(xhr.responseText)

        if (response.success) {
          onProgress(100)
          resolve({
            result: response.data,
            id: response.id,
            resumeText: response.resumeText,
            usage: response.usage,
          })
        } else {
          reject(response as SummarizationError)
        }
      } catch {
        reject({
          success: false,
          code: "UNKNOWN",
          message: "Received an unreadable response from the server.",
        } satisfies SummarizationError)
      }
    })

    // ── Network error ─────────────────────────────────────────
    xhr.addEventListener("error", () => {
      reject({
        success: false,
        code: "UNKNOWN",
        message: "A network error occurred. Please check your connection and try again.",
      } satisfies SummarizationError)
    })

    // ── Request timeout ───────────────────────────────────────
    xhr.addEventListener("timeout", () => {
      reject({
        success: false,
        code: "TIMEOUT",
        message: "The upload timed out. Please try again.",
      } satisfies SummarizationError)
    })

    xhr.timeout = 60_000 // 60 seconds total (includes server processing)
    xhr.open("POST", ENDPOINT)
    
    if (sessionId) {
      xhr.setRequestHeader("x-session-id", sessionId)
    }
    
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    }
    
    xhr.send(formData)
  })
}
