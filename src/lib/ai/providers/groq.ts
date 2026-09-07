// ============================================================
// Groq Provider — implements the AIProvider interface.
// Uses Groq's ultra-fast inference with configurable models (default: openai/gpt-oss-120b).
// Drop-in replacement for openai.ts — same interface, zero other changes.
// ============================================================

import Groq from "groq-sdk"
import { SummarizationError } from "@/types/summarization"
import { AIProvider } from "./openai" // Re-use the interface definition

// Default model to use when GROQ_MODEL environment variable is not explicitly provided
export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b"

// Singleton Groq client — reused across requests in the same process
let groqClient: Groq | null = null

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw {
        success: false,
        code: "AI_ERROR",
        message:
          "Groq API key is not configured. Please add GROQ_API_KEY to your .env file. Get a free key at https://console.groq.com",
      } satisfies SummarizationError
    }
    groqClient = new Groq({ apiKey })
  }
  return groqClient
}

/**
 * Extracts a human-friendly error message from a Groq / OpenAI error string or object.
 */
function extractCleanErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred while contacting the AI service."

  if (typeof error === "string") {
    try {
      const match = error.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        if (parsed?.error?.message) return parsed.error.message
      }
    } catch {
      // ignore parse failure
    }
    return error
  }

  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>
    if (typeof errObj.error === "object" && errObj.error !== null) {
      const inner = errObj.error as Record<string, unknown>
      if (typeof inner.message === "string") return inner.message
    }
    if (typeof errObj.message === "string") {
      try {
        const match = errObj.message.match(/\{[\s\S]*\}/)
        if (match) {
          const parsed = JSON.parse(match[0])
          if (parsed?.error?.message) return parsed.error.message
        }
      } catch {
        // ignore parse failure
      }
      return errObj.message
    }
  }

  return "An unexpected error occurred while contacting the AI service."
}

export class GroqProvider implements AIProvider {
  private readonly defaultModel: string
  private readonly timeoutMs: number

  constructor(
    model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
    timeoutMs = 45_000
  ) {
    this.defaultModel = model
    this.timeoutMs = timeoutMs
  }

  private getModel(): string {
    return process.env.GROQ_MODEL || this.defaultModel || DEFAULT_GROQ_MODEL
  }

  async generateSummary(
    systemMessage: string,
    userPrompt: string
  ): Promise<string> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)
    const currentModel = this.getModel()

    try {
      const client = getGroqClient()

      const response = await client.chat.completions.create(
        {
          model: currentModel,
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: userPrompt },
          ],
          // Forces valid JSON output — Groq supports the same OpenAI-compatible flag
          response_format: { type: "json_object" },
          temperature: 0.4,  // Low temp = consistent, structured output
          max_tokens: 4096,
        },
        { signal: controller.signal }
      )

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw {
          success: false,
          code: "AI_ERROR",
          message: "Groq returned an empty response. Please try again.",
        } satisfies SummarizationError
      }

      return content
    } catch (error: unknown) {
      clearTimeout(timer)

      // Re-throw our own typed errors as-is
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        "success" in error
      ) {
        throw error
      }

      // AbortController timeout
      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.message.includes("abort"))
      ) {
        throw {
          success: false,
          code: "TIMEOUT",
          message: "The Groq request timed out. Please try again.",
        } satisfies SummarizationError
      }

      // Groq uses the same error structure as OpenAI SDK
      if (error instanceof Groq.APIError) {
        if (error.status === 429) {
          throw {
            success: false,
            code: "RATE_LIMITED",
            message: "Groq rate limit reached. Please wait a moment and try again.",
          } satisfies SummarizationError
        }
        if (error.status === 401) {
          throw {
            success: false,
            code: "AI_ERROR",
            message: "Groq API key is invalid or has expired.",
          } satisfies SummarizationError
        }
        if (error.status === 404) {
          throw {
            success: false,
            code: "AI_ERROR",
            message: `The configured Groq AI model (${currentModel}) was not found or is unavailable. Please check your GROQ_MODEL setting.`,
          } satisfies SummarizationError
        }
        if (error.status >= 500) {
          throw {
            success: false,
            code: "AI_ERROR",
            message: "Groq AI service is temporarily unavailable. Please try again in a moment.",
          } satisfies SummarizationError
        }

        const cleanMsg = extractCleanErrorMessage(error)
        throw {
          success: false,
          code: "AI_ERROR",
          message: `AI Error: ${cleanMsg}`,
        } satisfies SummarizationError
      }

      const cleanMsg = extractCleanErrorMessage(error)
      throw {
        success: false,
        code: "AI_ERROR",
        message: cleanMsg,
      } satisfies SummarizationError
    } finally {
      clearTimeout(timer)
    }
  }
}

// Singleton provider instance
export const groqProvider = new GroqProvider()
