// ============================================================
// OpenAI Provider — implements the AIProvider interface.
// Uses gpt-4o-mini with JSON mode for reliable structured output.
// Drop-in replaceable by gemini.ts / claude.ts via AIProvider interface.
// ============================================================

import OpenAI from "openai"
import { SummarizationError } from "@/types/summarization"

/** Contract that every AI provider must satisfy */
export interface AIProvider {
  generateSummary(
    systemMessage: string,
    userPrompt: string
  ): Promise<string>
}

// Singleton OpenAI client — reused across requests in the same process
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw {
        success: false,
        code: "AI_ERROR",
        message:
          "OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment.",
      } satisfies SummarizationError
    }
    openaiClient = new OpenAI({ apiKey })
  }
  return openaiClient
}

export class OpenAIProvider implements AIProvider {
  private readonly model: string
  private readonly timeoutMs: number

  constructor(
    model = process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    timeoutMs = 15_000
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
      const client = getOpenAIClient()

      const response = await client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: userPrompt },
          ],
          // Forces the model to return valid JSON — massively reduces retry rate
          response_format: { type: "json_object" },
          temperature: 0.4, // Low temp = consistent, structured output
          max_tokens: 1500,
        },
        { signal: controller.signal }
      )

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw {
          success: false,
          code: "AI_ERROR",
          message: "The AI returned an empty response. Please try again.",
        } satisfies SummarizationError
      }

      return content
    } catch (error: unknown) {
      clearTimeout(timer)

      // Re-throw our own typed errors
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
          message:
            "The AI request timed out after 15 seconds. Please try again.",
        } satisfies SummarizationError
      }

      // OpenAI API errors
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw {
            success: false,
            code: "RATE_LIMITED",
            message: "OpenAI rate limit reached. Please wait a moment and try again.",
          } satisfies SummarizationError
        }
        if (error.status === 401) {
          throw {
            success: false,
            code: "AI_ERROR",
            message: "OpenAI API key is invalid or has expired.",
          } satisfies SummarizationError
        }
        throw {
          success: false,
          code: "AI_ERROR",
          message: `OpenAI error: ${error.message}`,
        } satisfies SummarizationError
      }

      throw {
        success: false,
        code: "AI_ERROR",
        message: "An unexpected error occurred while contacting the AI service.",
      } satisfies SummarizationError
    } finally {
      clearTimeout(timer)
    }
  }
}

// Singleton provider instance
export const openAIProvider = new OpenAIProvider()
