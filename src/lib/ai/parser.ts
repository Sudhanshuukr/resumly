// ============================================================
// Resume Parser — extracts raw text from PDF and DOCX buffers.
// Delegates to the appropriate sub-parser based on MIME type.
// Designed for future extension: TXT, Markdown, LinkedIn export.
// ============================================================

import { SummarizationError } from "@/types/summarization"

/**
 * Parses a resume buffer into plain text.
 * Supports PDF and DOCX formats.
 */
export class ResumeParser {
  async parse(buffer: Buffer, extension: string): Promise<string> {
    switch (extension) {
      case "pdf":
        return this.parsePdf(buffer)
      case "docx":
        return this.parseDocx(buffer)
      default:
        throw {
          success: false,
          code: "INVALID_FILE",
          message: `Unsupported file type: .${extension}`,
        } satisfies SummarizationError
    }
  }

  private async parsePdf(buffer: Buffer): Promise<string> {
    try {
      // Import directly from the lib path of pdf-parse v1.1.1 to avoid its main entry
      // loading test files at initialization time (which crashes under Next.js Turbopack).
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
        buf: Buffer,
        opts?: Record<string, unknown>
      ) => Promise<{ text: string }>

      const result = await pdfParse(buffer, {
        max: 50,
      })

      if (!result.text || result.text.trim().length === 0) {
        throw new Error("No text content found in PDF")
      }

      return result.text
    } catch (error: unknown) {
      console.error("[parser] PDF parsing error:", error)
      // Re-throw typed SummarizationErrors as-is
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error
      ) {
        throw error
      }

      const msg =
        error instanceof Error ? error.message : "Unknown parse error"

      // Encrypted/password-protected PDFs
      if (
        msg.includes("password") ||
        msg.includes("encrypted") ||
        msg.includes("Permission")
      ) {
        throw {
          success: false,
          code: "PARSE_ERROR",
          message:
            "This PDF is password-protected. Please remove the password and try again.",
        } satisfies SummarizationError
      }

      throw {
        success: false,
        code: "PARSE_ERROR",
        message:
          "Could not read the PDF. Please ensure it contains selectable text (not a scanned image).",
      } satisfies SummarizationError
    }
  }

  private async parseDocx(buffer: Buffer): Promise<string> {
    try {
      const mammoth = await import("mammoth")
      const result = await mammoth.extractRawText({ buffer })

      if (!result.value || result.value.trim().length === 0) {
        throw new Error("No text content found in DOCX")
      }

      return result.value
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error
      ) {
        throw error
      }

      throw {
        success: false,
        code: "PARSE_ERROR",
        message:
          "Could not read the DOCX file. Please ensure it is a valid Word document.",
      } satisfies SummarizationError
    }
  }
}

export const resumeParser = new ResumeParser()
