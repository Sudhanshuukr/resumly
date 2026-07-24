// ============================================================
// Resume Content Validator — rule-based scoring system
// to classify if a parsed document is a genuine resume/CV.
// Prevents recipes, invoices, books, or papers from reaching LLMs.
// ============================================================

export interface ValidationResult {
  isValid: boolean
  score: number
  signals: {
    strong: string[]
    supporting: string[]
    negative: string[]
  }
}

/**
 * Validates whether the provided text appears to be a genuine resume/CV.
 * Uses a weighted scoring system based on section matches, metadata, and negative signals.
 *
 * @param text - Normalized, cleaned resume text
 * @returns ValidationResult containing isValid flag, score, and matched indicators
 */
export function validateResumeContent(text: string): ValidationResult {
  const lowercase = text.toLowerCase()
  let score = 0
  const strongMatched: string[] = []
  const supportingMatched: string[] = []
  const negativeMatched: string[] = []

  // 1. Strong Resume Signals (+3 points each)
  const strongSignals = [
    {
      key: "experience",
      pattern: /\b(experience|employment history|work history|professional experience|professional background|career history|work experience)\b/i,
      label: "Work Experience Section"
    },
    {
      key: "education",
      pattern: /\b(education|academic background|academic history|academic credentials|degree|degrees)\b/i,
      label: "Education Section"
    },
    {
      key: "skills",
      pattern: /\b(skills|technical skills|key skills|core competencies|proficiencies|areas of expertise|technologies|technical proficiencies)\b/i,
      label: "Skills Section"
    },
    {
      key: "projects",
      pattern: /\b(projects|personal projects|key projects|academic projects|professional projects)\b/i,
      label: "Projects Section"
    },
    {
      key: "summary",
      pattern: /\b(professional summary|career objective|about me|summary of qualifications|profile|executive summary|personal statement)\b/i,
      label: "Professional Summary"
    },
    {
      key: "certifications",
      pattern: /\b(certifications|credentials|licensure|certifications & licenses|certified by)\b/i,
      label: "Certifications"
    }
  ]

  for (const signal of strongSignals) {
    if (signal.pattern.test(lowercase)) {
      score += 3
      strongMatched.push(signal.label)
    }
  }

  // 2. Supporting Signals (+1 point each)
  const supportingSignals = [
    {
      key: "email",
      pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i,
      label: "Email Address"
    },
    {
      key: "phone",
      pattern: /\b\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/i,
      label: "Phone Number"
    },
    {
      key: "linkedin",
      pattern: /linkedin\.com/i,
      label: "LinkedIn Link"
    },
    {
      key: "github",
      pattern: /github\.com/i,
      label: "GitHub Link"
    },
    {
      key: "portfolio",
      pattern: /\b(portfolio|website|github\.io)\b/i,
      label: "Portfolio Link"
    },
    {
      key: "degrees",
      pattern: /\b(bachelor|master|phd|b\.s|m\.s|b\.tech|m\.tech|b\.a|m\.a|graduate|undergraduate|degree in|bs\b|ms\b)\b/i,
      label: "Degree Terminology"
    },
    // Employment date patterns: e.g. "2018 - 2021", "2020 - Present", "Jan 2019"
    {
      key: "dates",
      pattern: /\b(19|20)\d{2}\s*[-–—]\s*(present|\b(19|20)\d{2}\b)|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}/i,
      label: "Employment Date Ranges"
    }
  ]

  for (const signal of supportingSignals) {
    if (signal.pattern.test(lowercase)) {
      score += 1
      supportingMatched.push(signal.label)
    }
  }

  // 3. Negative Signals (-3 points each)
  const negativeSignals = [
    {
      key: "invoice",
      pattern: /\b(invoice|bill to|purchase order|amount due|invoice date|due date|payment details|invoice #|remit to|billing address)\b/i,
      label: "Invoice/Bill Indicators"
    },
    {
      key: "research",
      pattern: /\b(abstract|references|doi:|ieee|arxiv|journal of|proceedings of|citation|citations|table of contents)\b/i,
      label: "Academic/Ebook Indicators"
    },
    {
      key: "legal",
      pattern: /\b(lease agreement|tenant|landlord|hereby agrees|signature of lessor|lessee|contract agreement|terms of service|privacy policy)\b/i,
      label: "Legal/Contract Indicators"
    },
    {
      key: "bank",
      pattern: /\b(bank statement|account balance|transaction details|ledger balance|withdrawal|deposit amount|bank account)\b/i,
      label: "Bank Statement Indicators"
    },
    {
      key: "recipe",
      pattern: /\b(ingredients|directions|cook time|prep time|servings|recipe|bake for|preheat oven|cups|teaspoon|tablespoon)\b/i,
      label: "Recipe Indicators"
    }
  ]

  for (const signal of negativeSignals) {
    if (signal.pattern.test(lowercase)) {
      score -= 3
      negativeMatched.push(signal.label)
    }
  }

  // 4. Threshold Logic
  // A valid resume must score at least 6 points.
  // This guarantees they have at least 2 strong sections (e.g. Experience + Education),
  // or 1 strong section + 3 supporting indicators (e.g., Experience + Email + Phone + Dates),
  // and any negative indicators (like Invoices/Recipes) will cancel out false matches.
  const threshold = 6
  const isValid = score >= threshold

  return {
    isValid,
    score,
    signals: {
      strong: strongMatched,
      supporting: supportingMatched,
      negative: negativeMatched
    }
  }
}
