// ============================================================
// File validation layer — runs before any parsing or AI calls.
// Validates: MIME type, extension, file size, empty files.
// Returns a typed SummarizationError on failure.
// ============================================================

import { SummarizationError } from "@/types/summarization"

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  // DOCX
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Legacy DOC (not supported for parsing but shows a friendlier error)
  "application/msword",
])

const ALLOWED_EXTENSIONS = new Set(["pdf", "docx"])

const MAX_SIZE = parseInt(
  process.env.MAX_UPLOAD_SIZE ?? String(10 * 1024 * 1024),
  10
)

export interface ValidatedFile {
  buffer: Buffer
  mimeType: string
  extension: string
  sizeBytes: number
}

/**
 * Validates the uploaded file and returns the raw buffer + metadata.
 * Throws a SummarizationError object on any validation failure.
 */
export async function validateUploadedFile(
  file: File
): Promise<ValidatedFile> {
  // 1. Empty file
  if (file.size === 0) {
    throw {
      success: false,
      code: "INVALID_FILE",
      message: "The uploaded file is empty.",
    } satisfies SummarizationError
  }

  // 2. File size limit
  if (file.size > MAX_SIZE) {
    const limitMB = Math.round(MAX_SIZE / 1024 / 1024)
    throw {
      success: false,
      code: "FILE_TOO_LARGE",
      message: `File exceeds the ${limitMB} MB size limit. Please upload a smaller file.`,
    } satisfies SummarizationError
  }

  // 3. MIME type check
  const mimeType = file.type
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw {
      success: false,
      code: "INVALID_FILE",
      message: "Only PDF and DOCX files are supported.",
    } satisfies SummarizationError
  }

  // 4. Legacy DOC — not parseable
  if (mimeType === "application/msword") {
    throw {
      success: false,
      code: "INVALID_FILE",
      message:
        "Legacy .doc files are not supported. Please save your resume as a .docx or .pdf and try again.",
    } satisfies SummarizationError
  }

  // 5. Extension whitelist (double-check alongside MIME)
  const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw {
      success: false,
      code: "INVALID_FILE",
      message: "Only .pdf and .docx file extensions are supported.",
    } satisfies SummarizationError
  }

  // 6. Read into buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // 7. Basic PDF corruption check (PDF magic bytes: %PDF-)
  if (extension === "pdf") {
    const header = buffer.slice(0, 5).toString("ascii")
    if (!header.startsWith("%PDF-")) {
      throw {
        success: false,
        code: "PARSE_ERROR",
        message:
          "The PDF file appears to be corrupted or encrypted. Please try a different file.",
      } satisfies SummarizationError
    }
  }

  return { buffer, mimeType, extension, sizeBytes: file.size }
}
