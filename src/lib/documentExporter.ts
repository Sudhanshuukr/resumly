import { SummarizationResult } from "@/types/summarization"
import { SummaryVariant } from "@/store/summarization"

/**
 * Sanitizes a string to make it safe to use as a filename.
 * - Replaces spaces and underscores with a single underscore.
 * - Removes characters that are not allowed in filenames on Windows/macOS/Linux.
 */
function getSanitizedFilename(jobTitle: string | undefined, variant: SummaryVariant, extension: string): string {
  const base = jobTitle ? jobTitle.trim() : "Resume"
  const cleanBase = base
    .replace(/[\s_]+/g, "_") // Replace spaces/underscores with single underscore
    .replace(/[<>:"/\\|?*]/g, "") // Remove unsupported filename characters
    .trim()

  let formattedVariant = "Professional"
  if (variant === "ats") {
    formattedVariant = "ATS_Optimized"
  } else if (variant === "executive") {
    formattedVariant = "Executive"
  }

  return `${cleanBase || "Resume"}_${formattedVariant}_Summary.${extension}`
}

/**
 * Formats a given date to a readable local date string.
 */
function getFormattedDate(): string {
  return new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Generates and downloads a polished PDF Candidate Summary Sheet.
 * Runs strictly client-side and uses dynamic imports to keep the main bundle size small.
 */
export async function exportToPDF(
  result: SummarizationResult,
  variant: SummaryVariant
): Promise<void> {
  if (typeof window === "undefined") return

  // Dynamically load jsPDF to prevent bundling it on initial page load
  const { jsPDF } = await import("jspdf")

  // Create a new document: A4 size, portrait orientation, measured in millimeters
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const jobTitle = result.jobTitle || "Resume Summary Profile"
  const industry = result.detectedIndustry && result.detectedIndustry !== "N/A" ? result.detectedIndustry : null
  const experience = result.detectedExperience && result.detectedExperience !== "N/A" ? result.detectedExperience : null
  const score = result.score !== undefined && result.score !== null ? result.score : null

  let yPos = 25
  const pageHeight = 297
  const marginBottom = 20
  const usableWidth = 170 // 210mm - 40mm margins

  // Helper to print standard paragraphs with automatic page wrapping
  const addParagraph = (
    text: string,
    fontSize: number,
    isBold: boolean,
    textColor: [number, number, number] = [30, 30, 30],
    fontName: string = "helvetica",
    lineSpacing: number = 6
  ) => {
    doc.setFont(fontName, isBold ? "bold" : "normal")
    doc.setFontSize(fontSize)
    doc.setTextColor(textColor[0], textColor[1], textColor[2])

    const lines = doc.splitTextToSize(text, usableWidth)
    for (const line of lines) {
      if (yPos + lineSpacing > pageHeight - marginBottom) {
        doc.addPage()
        yPos = 20
      }
      doc.text(line, 20, yPos)
      yPos += lineSpacing
    }
  }

  // 1. Brand Title (Subtle, uppercase)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text("RESUME AI SUMMARIZER & OPTIMIZER", 20, yPos)
  yPos += 8

  // 2. Candidate Job Title (Times bold, matching Playfair serif editorial aesthetic)
  doc.setFont("times", "bold")
  doc.setFontSize(22)
  doc.setTextColor(14, 13, 12) // #0E0D0C
  const titleLines = doc.splitTextToSize(jobTitle, usableWidth)
  for (const line of titleLines) {
    if (yPos + 9 > pageHeight - marginBottom) {
      doc.addPage()
      yPos = 20
    }
    doc.text(line, 20, yPos)
    yPos += 9
  }
  yPos += 2

  // 3. Accent Divider Line (Terracotta #E2722C)
  doc.setDrawColor(226, 114, 44)
  doc.setLineWidth(0.8)
  doc.line(20, yPos, 190, yPos)
  yPos += 8

  // 4. Metadata Details Block
  const metaParts: string[] = []
  if (industry) metaParts.push(`Industry: ${industry}`)
  if (experience) metaParts.push(`Experience: ${experience}`)
  if (score) metaParts.push(`Profile Score: ${score}/100`)
  const metaString = metaParts.join("   |   ")

  if (metaString) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(115, 115, 115)
    doc.text(metaString, 20, yPos)
    yPos += 12
  }

  // 5. Selected Summary Variant Content
  let variantName = "Professional Summary"
  if (variant === "ats") {
    variantName = "ATS-Optimized Summary"
  } else if (variant === "executive") {
    variantName = "Executive Summary"
  }

  // Summary Title
  doc.setFont("times", "bold")
  doc.setFontSize(13)
  doc.setTextColor(14, 13, 12)
  doc.text(variantName.toUpperCase(), 20, yPos)
  yPos += 6

  // Summary Text
  const summaryText = result[variant] || ""
  addParagraph(summaryText, 10.5, false, [40, 40, 40], "helvetica", 6.5)
  yPos += 8

  // 6. Extracted Skills Section
  if (result.skills && result.skills.length > 0) {
    if (yPos + 15 > pageHeight - marginBottom) {
      doc.addPage()
      yPos = 20
    }
    doc.setFont("times", "bold")
    doc.setFontSize(12)
    doc.setTextColor(14, 13, 12)
    doc.text("CORE COMPETENCIES & KEY SKILLS", 20, yPos)
    yPos += 6

    const skillsString = result.skills.join(", ")
    addParagraph(skillsString, 10, true, [14, 13, 12], "helvetica", 6)
    yPos += 8
  }

  // 7. Improvement Suggestions Section
  if (result.tips && result.tips.length > 0) {
    if (yPos + 15 > pageHeight - marginBottom) {
      doc.addPage()
      yPos = 20
    }
    doc.setFont("times", "bold")
    doc.setFontSize(12)
    doc.setTextColor(14, 13, 12)
    doc.text("RECOMMENDED OPTIMIZATIONS", 20, yPos)
    yPos += 6

    for (const tip of result.tips) {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(50, 50, 50)
      const wrappedTip = doc.splitTextToSize(tip, usableWidth - 5) // 5mm offset for bullets

      if (yPos + wrappedTip.length * 5.5 > pageHeight - marginBottom) {
        doc.addPage()
        yPos = 20
      }

      // Draw Bullet Symbol
      doc.text("•", 20, yPos)

      // Draw Wrapped Tip Paragraph
      for (const line of wrappedTip) {
        doc.text(line, 25, yPos)
        yPos += 5.5
      }
      yPos += 1.5 // Space between bullets
    }
  }

  // 8. Global Header / Footer overlay
  const totalPages = doc.getNumberOfPages()
  const formattedDate = getFormattedDate()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(160, 160, 160)
    
    // Page count alignment right
    doc.text(`Page ${i} of ${totalPages}`, 190, 287, { align: "right" })
    // Source footer branding
    doc.text(`Generated by Resume AI Summarizer on ${formattedDate} • Confidential Summary Sheet`, 20, 287)
  }

  // Trigger browser download
  const filename = getSanitizedFilename(result.jobTitle, variant, "pdf")
  doc.save(filename)
}

/**
 * Generates and downloads a valid OpenXML Word Document (.docx).
 * Runs strictly client-side and uses dynamic imports to keep initial bundle size small.
 */
export async function exportToDocx(
  result: SummarizationResult,
  variant: SummaryVariant
): Promise<void> {
  if (typeof window === "undefined") return

  // Dynamically load the docx package
  const docx = await import("docx")
  const { Document, Packer, Paragraph, TextRun, BorderStyle } = docx

  const jobTitle = result.jobTitle || "Resume Summary Profile"
  const industry = result.detectedIndustry && result.detectedIndustry !== "N/A" ? result.detectedIndustry : null
  const experience = result.detectedExperience && result.detectedExperience !== "N/A" ? result.detectedExperience : null
  const score = result.score !== undefined && result.score !== null ? result.score : null

  // Format Metadata Details Line
  const metaParts: string[] = []
  if (industry) metaParts.push(`Industry: ${industry}`)
  if (experience) metaParts.push(`Experience: ${experience}`)
  if (score) metaParts.push(`Profile Score: ${score}/100`)
  const metaString = metaParts.join("   |   ")

  let variantName = "Professional Summary"
  if (variant === "ats") {
    variantName = "ATS-Optimized Summary"
  } else if (variant === "executive") {
    variantName = "Executive Summary"
  }

  const summaryText = result[variant] || ""

  // Construct Word Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Branding Header
          new Paragraph({
            children: [
              new TextRun({
                text: "RESUME AI SUMMARIZER & OPTIMIZER",
                size: 16, // 8pt
                color: "999999",
                italics: true,
              }),
            ],
            spacing: { after: 120 },
          }),

          // Candidate Job Title
          new Paragraph({
            children: [
              new TextRun({
                text: jobTitle,
                size: 40, // 20pt
                bold: true,
                color: "0E0D0C", // #0E0D0C
              }),
            ],
            spacing: { after: 80 },
          }),

          // Metadata String
          ...(metaString
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: metaString,
                      size: 18, // 9pt
                      color: "737373",
                      bold: true,
                    }),
                  ],
                  spacing: { after: 200 },
                }),
              ]
            : []),

          // Accent Divider Line (Terracotta #E2722C)
          new Paragraph({
            border: {
              bottom: {
                color: "E2722C",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 12, // 1.5pt
              },
            },
            spacing: { after: 280 },
          }),

          // Summary Variant Heading
          new Paragraph({
            children: [
              new TextRun({
                text: variantName.toUpperCase(),
                size: 26, // 13pt
                bold: true,
                color: "0E0D0C",
              }),
            ],
            spacing: { after: 120 },
          }),

          // Summary Content
          new Paragraph({
            children: [
              new TextRun({
                text: summaryText,
                size: 21, // 10.5pt
                color: "282828",
              }),
            ],
            spacing: { after: 280, line: 312 },
          }),

          // Skills Heading & Content
          ...(result.skills && result.skills.length > 0
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "CORE COMPETENCIES & KEY SKILLS",
                      size: 24, // 12pt
                      bold: true,
                      color: "0E0D0C",
                    }),
                  ],
                  spacing: { before: 160, after: 120 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: result.skills.join(", "),
                      size: 20, // 10pt
                      color: "141312",
                      bold: true,
                    }),
                  ],
                  spacing: { after: 280 },
                }),
              ]
            : []),

          // Tips / Optimizations
          ...(result.tips && result.tips.length > 0
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "RECOMMENDED OPTIMIZATIONS",
                      size: 24, // 12pt
                      bold: true,
                      color: "0E0D0C",
                    }),
                  ],
                  spacing: { before: 160, after: 120 },
                }),
                ...result.tips.map(
                  (tip) =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: tip,
                          size: 20, // 10pt
                          color: "323232",
                        }),
                      ],
                      bullet: {
                        level: 0,
                      },
                      spacing: { after: 80 },
                    })
                ),
              ]
            : []),
        ],
      },
    ],
  })

  // Package into Blob
  const blob = await Packer.toBlob(doc)

  // Generate File Name
  const filename = getSanitizedFilename(result.jobTitle, variant, "docx")

  // Download Trigger
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()

  // Clean up Object URL
  URL.revokeObjectURL(url)
}
