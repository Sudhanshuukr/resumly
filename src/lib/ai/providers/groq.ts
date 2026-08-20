// ============================================================
// Groq Provider — implements the AIProvider interface.
// Uses Groq's ultra-fast inference with llama-3.3-70b-versatile.
// Drop-in replacement for openai.ts — same interface, zero other changes.
// ============================================================

import Groq from "groq-sdk"
import { SummarizationError } from "@/types/summarization"
import { AIProvider } from "./openai" // Re-use the interface definition

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
          "Groq API key is not configured. Please add GROQ_API_KEY to your .env.local file. Get a free key at https://console.groq.com",
      } satisfies SummarizationError
    }
    groqClient = new Groq({ apiKey })
  }
  return groqClient
}

export class GroqProvider implements AIProvider {
  private readonly model: string
  private readonly timeoutMs: number

  constructor(
    model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
    timeoutMs = 30_000
  ) {
    this.model = model
    this.timeoutMs = timeoutMs
  }

  async generateSummary(
    systemMessage: string,
    userPrompt: string
  ): Promise<string> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const client = getGroqClient()

      const response = await client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: userPrompt },
          ],
          // Forces valid JSON output — Groq supports the same OpenAI-compatible flag
          response_format: { type: "json_object" },
          temperature: 0.4,  // Low temp = consistent, structured output
          max_tokens: 1500,
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
          message: "The Groq request timed out after 15 seconds. Please try again.",
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
        throw {
          success: false,
          code: "AI_ERROR",
          message: `Groq error: ${error.message}`,
        } satisfies SummarizationError
      }

      throw {
        success: false,
        code: "AI_ERROR",
        message: "An unexpected error occurred while contacting Groq.",
      } satisfies SummarizationError
    } finally {
      clearTimeout(timer)
    }
  }
}

// Singleton provider instance
export const groqProvider = new GroqProvider()
