// ============================================================
// Prompt Builder v1 — Summarization
// Versioned prompt file. Never write prompts inside API routes.
// Future variants: v2.ts (LinkedIn), cover-letter/v1.ts, etc.
// ============================================================

/**
 * Builds the summarization prompt to send to the AI model.
 * Uses JSON-mode instructions for maximum output reliability.
 *
 * @param resumeText - Cleaned resume text (output of cleanResumeText())
 * @returns Full prompt string ready for the AI provider
 */
export function buildSummarizationPrompt(resumeText: string): string {
  return `You are a world-class professional resume writer, ATS specialist, and career coach with 15+ years of experience.

Analyze the resume provided below and return a single, valid JSON object — nothing else. No markdown code fences, no explanations, no extra text. Only the JSON object.

The JSON object must have EXACTLY these keys and follow these guidelines:

{
  "professional": "A compelling 2-4 sentence professional summary written in third person. NEVER use generic templates or generic filler phrases (like 'Results-driven professional with a proven track record'). Instead, start directly with the candidate's core identity/title, key technologies, and most impressive quantified accomplishments (e.g. 'Senior Full-Stack Developer specializing in React and Node.js, who led a team of 4 engineers to rebuild a legacy billing system, reducing page load speeds by 40%').",
  "ats": "An ATS-optimized summary densely packed with concrete technical skills, methodologies, and industry keywords found in the resume. 2-3 sentences. Avoid fluff; write sentences that read like: 'Proficient in Python, AWS (EC2, S3), and Docker, with experience in REST API design and CI/CD pipelines.'",
  "executive": "A concise, high-impact 1-2 sentence executive-level summary focusing on senior leadership, business strategy impact, and major quantified results.",
  "skills": ["skill1", "skill2", "...up to 8 of the most relevant concrete technical and soft skills directly extracted from the resume. Prioritize languages, frameworks, databases, and core professional methodologies over generic descriptors like 'Team player'"],
  "jobTitle": "The most accurate, specific current or target job title for this candidate derived from their experience",
  "score": 0,
  "tips": [
    "A highly specific, tailored suggestion for *this candidate* (e.g., 'Add metrics to your Full-Stack Developer role at TechCorp', 'Mention which specific database systems you used for scaling', 'Include a link to your LinkedIn profile')",
    "Another tailored suggestion based on gaps in this specific resume",
    "A third tailored suggestion based on gaps in this specific resume"
  ],
  "wordCount": 0,
  "readingTime": "X min read",
  "detectedExperience": "e.g. 3-5 years or Entry Level or 10+ years (accurately matched)",
  "detectedIndustry": "e.g. Software Engineering or Digital Marketing or Finance"
}

Scoring criteria for "score" (integer 0-100):
- Contact info completeness: up to 10 points (deduct if email, phone, or location is missing)
- Professional summary / objective presence: up to 10 points
- Work experience detail & quantified achievements (metrics): up to 30 points (deduct heavily if there are no percentages, dollar amounts, or time savings listed)
- Skills section relevance: up to 15 points
- Education section presence: up to 10 points
- Formatting and readability: up to 10 points
- Keywords and ATS-friendliness: up to 15 points

Calculate "wordCount" as the approximate number of words in the resume.
Calculate "readingTime" as "X min read" where X = ceil(wordCount / 200).

IMPORTANT:
- Return ONLY the JSON object. No markdown. No code blocks. No extra explanation.
- The output MUST be entirely derived from the provided resume text. Do not make up achievements or skills that do not exist in the resume text, but reframe existing ones to be more impact-driven.

Resume text:
---
${resumeText}
---`
}

/**
 * The system role message for the OpenAI chat completion.
 * Keeps the system message brief — all detail is in the user prompt.
 */
export const SUMMARIZATION_SYSTEM_MESSAGE =
  "You are an expert resume writer and ATS specialist. You always respond with valid JSON only, exactly matching the schema provided."
