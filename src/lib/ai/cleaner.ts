// ============================================================
// Resume Cleaner — normalises raw extracted text before it
// is sent to the AI provider.
// Cleaner prompts = better, more consistent summaries.
// ============================================================

const MAX_CHARS = parseInt(
  process.env.MAX_RESUME_CHARACTERS ?? "25000",
  10
);

/**
 * Cleans and normalises raw resume text extracted from a PDF or DOCX.
 * - Removes page headers / footers (page numbers, repeated titles)
 * - Normalises Unicode bullet characters to hyphens
 * - Collapses runs of spaces (excluding newlines) to a single space
 * - Collapses excessive blank lines
 * - Normalises whitespace and line endings
 * - Enforces MAX_RESUME_CHARACTERS character limit
 * - Sanitises against potential prompt-injection sequences
 */
export function cleanResumeText(raw: string): string {
  let text = raw;

  // 1. Normalise Windows-style line endings
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 2. Remove common page number patterns ("Page 1 of 3", "1 | 3", etc.)
  text = text.replace(/\bpage\s+\d+\s+of\s+\d+\b/gi, "");
  text = text.replace(/\b\d+\s*[|\/]\s*\d+\b/g, "");
  text = text.replace(/^\s*\d+\s*$/gm, ""); // standalone digits on their own line

  // 3. Normalise Unicode bullets and arrow characters to standard hyphens
  text = text.replace(/[•◦▪▸▶▷➢➤→►❖✓✔]/g, "-");

  // 4. Remove control characters (except tabs/newlines)
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 5. Trim trailing whitespace from every line, and collapse consecutive non-newline spaces
  text = text
    .split("\n")
    .map((line) => line.trim().replace(/[^\S\r\n]+/g, " "))
    .join("\n");

  // 6. Collapse runs of 3+ blank lines to a single blank line
  text = text.replace(/(\n\s*){3,}/g, "\n\n");

  // 7. Sanitise against prompt-injection: strip lines that look like direct model instructions
  text = text
    .split("\n")
    .filter(
      (line) =>
        !/^(ignore\s+(previous|all)|you\s+are\s+now|act\s+as\s+a|system\s*:)/i.test(
          line.trim()
        )
    )
    .join("\n");

  // 8. Enforce character limit — truncate at a word boundary
  if (text.length > MAX_CHARS) {
    text = text.slice(0, MAX_CHARS);
    // Back up to the last whitespace to avoid cutting mid-word
    const lastSpace = text.lastIndexOf(" ");
    if (lastSpace > MAX_CHARS * 0.9) {
      text = text.slice(0, lastSpace);
    }
    text += "\n\n[Resume truncated for processing]";
  }

  return text.trim();
}
