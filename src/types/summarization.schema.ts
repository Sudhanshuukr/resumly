// ============================================================
// Zod schema for validating AI-generated summarization output.
// Never trust raw model output — validate every field.
// ============================================================

import { z } from "zod"

export const SummarizationResultSchema = z.object({
  professional: z.string().min(20, "Professional summary is too short"),
  ats: z.string().min(20, "ATS summary is too short"),
  executive: z.string().min(20, "Executive summary is too short"),
  skills: z
    .array(z.string().min(1))
    .min(1, "At least one skill is required")
    .max(30, "Too many skills"), // increased max skills limit slightly for detailed profiles
  jobTitle: z.string().min(1, "Job title is required"),
  score: z.number().int().min(0).max(100),
  tips: z
    .array(z.string().min(5))
    .min(0, "Tips can be empty")
    .max(10, "Too many tips"),
  wordCount: z.number().int().min(0),
  readingTime: z.string().min(1),
  detectedExperience: z.string().min(1),
  detectedIndustry: z.string().min(1),
  analysisStatus: z.string().optional(),
  scoreBreakdown: z
    .object({
      content: z.object({ score: z.number(), max: z.number() }),
      experienceQuality: z.object({ score: z.number(), max: z.number() }),
      skills: z.object({ score: z.number(), max: z.number() }),
      atsStructure: z.object({ score: z.number(), max: z.number() }),
      writing: z.object({ score: z.number(), max: z.number() }),
      impact: z.object({ score: z.number(), max: z.number() }),
    })
    .optional(),
  deductions: z
    .array(
      z.object({
        rule: z.string(),
        deduction: z.number(),
        evidence: z.array(z.string()),
      })
    )
    .optional(),
})

export type ValidatedSummarizationResult = z.infer<typeof SummarizationResultSchema>
