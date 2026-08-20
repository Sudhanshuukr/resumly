import { CandidateProfile, ATSReadinessScoreResult, DeductionLog } from "./types"

/**
 * Calculates a transparent, career-stage aware ATS Readiness Score (0-100)
 * based on completeness, experience/project depth, skill distribution, parsability,
 * writing quality, and measurable impact.
 */
export function calculateATSReadinessScore(
  profile: CandidateProfile,
  rawResumeText: string,
  sectionStatuses: Record<string, "detected" | "uncertain" | "missing">
): ATSReadinessScoreResult {
  const deductions: DeductionLog[] = [];
  const tips: string[] = [];

  // Initialize breakdown
  const breakdown = {
    content: { score: 0, max: 25 },
    experienceQuality: { score: 0, max: 25 },
    skills: { score: 0, max: 15 },
    atsStructure: { score: 0, max: 15 },
    writing: { score: 0, max: 10 },
    impact: { score: 0, max: 10 },
  };

  const isStudent = profile.experienceLevel === "student";
  const isExperienced = ["mid", "senior", "executive"].includes(profile.experienceLevel);
  const wordCount = rawResumeText.split(/\s+/).filter(Boolean).length;

  // ────────────────────────────────────────────────────────
  // 1. CONTENT COMPLETENESS (Max: 25 pts)
  // ────────────────────────────────────────────────────────
  let contentScore = 25;

  // Contact Info completeness (5 pts)
  const hasEmail = !!profile.email || /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/i.test(rawResumeText);
  const hasPhone = !!profile.phone || /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g.test(rawResumeText);
  const hasLinks = profile.links.length > 0;

  if (!hasEmail) {
    contentScore -= 2;
    deductions.push({
      rule: "MISSING_EMAIL",
      deduction: 2,
      evidence: ["No email address detected in the resume text."]
    });
    tips.push("Add a professional email address to the header of your resume.");
  }
  if (!hasPhone) {
    contentScore -= 2;
    deductions.push({
      rule: "MISSING_PHONE",
      deduction: 2,
      evidence: ["No phone number detected in the resume text."]
    });
    tips.push("Include a phone number so recruiters can easily contact you.");
  }
  if (!hasLinks && !profile.location) {
    contentScore -= 1;
    deductions.push({
      rule: "MISSING_LOCATION_LINKS",
      deduction: 1,
      evidence: ["Neither links (LinkedIn/GitHub) nor physical location were found."]
    });
    tips.push("Add your location (City, State) or professional links (LinkedIn, GitHub) to increase credibility.");
  }

  // Summary (5 pts)
  const hasSummary = !!profile.professionalSummary && profile.professionalSummary.length > 10;
  if (!hasSummary) {
    contentScore -= 5;
    deductions.push({
      rule: "MISSING_SUMMARY",
      deduction: 5,
      evidence: ["No professional summary or career objective section found."]
    });
    tips.push("Write a concise professional summary (2-3 sentences) at the top of your resume.");
  }

  // Education (5 pts)
  const hasEducation = profile.education.length > 0;
  if (!hasEducation) {
    contentScore -= 5;
    deductions.push({
      rule: "MISSING_EDUCATION",
      deduction: 5,
      evidence: ["No education entries or credentials detected."]
    });
    tips.push("Detail your academic background, degree, and institution.");
  }

  // Skills section presence (5 pts)
  const hasSkillsList = profile.skills.length > 0;
  if (!hasSkillsList) {
    contentScore -= 5;
    deductions.push({
      rule: "MISSING_SKILLS_LIST",
      deduction: 5,
      evidence: ["No skills section or technical competencies found."]
    });
    tips.push("Add a dedicated 'Skills' section listing your technical tools and frameworks.");
  } else if (profile.skills.length < 5) {
    contentScore -= 2;
    deductions.push({
      rule: "LOW_SKILLS_DENSITY",
      deduction: 2,
      evidence: [`Only ${profile.skills.length} skills detected, which is lower than industry standards.`]
    });
    tips.push("Expand your skills section to include at least 5-10 technical competencies.");
  }

  // Experience / Projects staging (5 pts)
  if (isStudent) {
    const hasProjectsOrInternships = profile.projects.length > 0 || profile.internships.length > 0;
    if (!hasProjectsOrInternships) {
      contentScore -= 5;
      deductions.push({
        rule: "MISSING_STUDENT_WORK",
        deduction: 5,
        evidence: ["Student profile with zero internships and zero projects listed."]
      });
      tips.push("As a student, you must add personal projects, academic work, or internships to demonstrate your skills.");
    }
  } else {
    const hasExperience = profile.experience.length > 0;
    if (!hasExperience) {
      contentScore -= 5;
      deductions.push({
        rule: "MISSING_EXPERIENCE",
        deduction: 5,
        evidence: ["Experienced/mid-career profile with no work experience listed."]
      });
      tips.push("Add a detailed professional work experience section detailing your job history.");
    }
  }

  breakdown.content.score = Math.max(0, contentScore);

  // ────────────────────────────────────────────────────────
  // 2. EXPERIENCE / PROJECT QUALITY (Max: 25 pts)
  // ────────────────────────────────────────────────────────
  let expQualityScore = 25;
  const signals = profile.confidence ? (profile as any).semanticSignals : null;

  if (signals) {
    // Action verbs (10 pts)
    const hasAction = signals.bulletQuality?.hasActionVerbs;
    if (!hasAction) {
      expQualityScore -= 5;
      deductions.push({
        rule: "WEAK_ACTION_VERBS",
        deduction: 5,
        evidence: ["Experience/project bullets lack strong action verbs (e.g. spearheaded, engineered)."]
      });
      tips.push("Begin your experience bullets with strong action verbs rather than passive statements like 'responsible for'.");
    }

    // Depth & Outcomes (15 pts)
    const averageImpact = signals.bulletQuality?.averageImpact ?? 0.5;
    if (averageImpact < 0.4) {
      expQualityScore -= 8;
      deductions.push({
        rule: "LOW_BULLET_IMPACT",
        deduction: 8,
        evidence: ["Project/Experience descriptions focus heavily on tasks instead of outcomes or business value."]
      });
      tips.push("Rephrase descriptions to focus on outcomes and contributions instead of just daily tasks.");
    } else if (averageImpact < 0.7) {
      expQualityScore -= 4;
      deductions.push({
        rule: "MEDIUM_BULLET_IMPACT",
        deduction: 4,
        evidence: ["Experience description quality is moderate, but could emphasize results more clearly."]
      });
    }

    // Project depth validation for students
    if (isStudent && !signals.projectQuality?.hasProjectDepth && profile.projects.length > 0) {
      expQualityScore -= 2;
      deductions.push({
        rule: "WEAK_PROJECT_DETAILS",
        deduction: 2,
        evidence: ["Projects list technologies but lack detailed descriptions of complexity or architecture."]
      });
      tips.push("Add details to your projects explaining the architectural decisions and difficulties resolved.");
    }
  } else {
    // Heuristic fallbacks if no semantic signals
    const totalItems = profile.experience.length + profile.internships.length + profile.projects.length;
    if (totalItems === 0) {
      expQualityScore = 0;
      deductions.push({
        rule: "NO_EXPERIENCE_OR_PROJECTS",
        deduction: 25,
        evidence: ["No project or work items found to assess quality."]
      });
    } else {
      const bulletsCount = [
        ...profile.experience.flatMap(e => e.bullets || []),
        ...profile.internships.flatMap(i => i.bullets || []),
        ...profile.projects.flatMap(p => p.bullets || [])
      ].length;
      if (bulletsCount < totalItems * 2) {
        expQualityScore -= 10;
        deductions.push({
          rule: "INSUFFICIENT_BULLET_DETAIL",
          deduction: 10,
          evidence: ["Past roles have fewer than 2 description bullets, providing minimal detail."]
        });
      }
    }
  }

  breakdown.experienceQuality.score = Math.max(0, expQualityScore);

  // ────────────────────────────────────────────────────────
  // 3. SKILLS QUALITY (Max: 15 pts)
  // ────────────────────────────────────────────────────────
  let skillsScore = 15;

  // Category Distribution (10 pts)
  const skillDetails = profile.skillsDetail;
  const activeCategories = [
    skillDetails.technical.length > 0,
    skillDetails.frameworks.length > 0,
    skillDetails.languages.length > 0,
    skillDetails.databases.length > 0,
    skillDetails.tools.length > 0,
    skillDetails.cloud.length > 0,
  ].filter(Boolean).length;

  if (activeCategories < 2 && profile.skills.length > 0) {
    skillsScore -= 5;
    deductions.push({
      rule: "UNBALANCED_SKILLS_ORGANIZATION",
      deduction: 5,
      evidence: ["Skills are concentrated in a single category, indicating lack of division."]
    });
    tips.push("Organize your skills section into clear sub-categories (e.g. Languages, Frameworks, Cloud, Databases).");
  }

  // Tech stack matching (5 pts)
  // Check if flat skills match words in project/experience descriptions
  const descriptionText = [
    ...profile.experience.flatMap(e => [e.role || "", e.company || "", ...e.bullets || []]),
    ...profile.internships.flatMap(i => [i.role || "", i.company || "", ...i.bullets || []]),
    ...profile.projects.flatMap(p => [p.name || "", p.description || "", ...p.bullets || [], ...p.technologies || []])
  ].join(" ").toLowerCase();

  const supportedSkills = profile.skills.filter(skill => 
    descriptionText.includes(skill.toLowerCase())
  ).length;

  if (profile.skills.length > 0 && supportedSkills / profile.skills.length < 0.4) {
    skillsScore -= 3;
    deductions.push({
      rule: "UNSUPPORTED_SKILLS_IN_EXPERIENCE",
      deduction: 3,
      evidence: ["More than 60% of listed skills are not mentioned anywhere in your work experience or projects."]
    });
    tips.push("Ensure your listed skills are backed up by descriptions of how you applied them in past roles.");
  }

  breakdown.skills.score = Math.max(0, skillsScore);

  // ────────────────────────────────────────────────────────
  // 4. ATS PARSABILITY / STRUCTURE (Max: 15 pts)
  // ────────────────────────────────────────────────────────
  let structureScore = 15;

  // Section heading presence (8 pts)
  let missingOrUncertainHeadings = 0;
  for (const [section, status] of Object.entries(sectionStatuses)) {
    // Certifications and Achievements are optional, do not penalize heavily
    if (["certifications", "achievements"].includes(section)) continue;
    if (status === "missing") {
      missingOrUncertainHeadings += 2;
    } else if (status === "uncertain") {
      missingOrUncertainHeadings += 1;
    }
  }

  if (missingOrUncertainHeadings > 0) {
    structureScore -= Math.min(8, missingOrUncertainHeadings);
    deductions.push({
      rule: "NON_STANDARD_SECTIONS",
      deduction: Math.min(8, missingOrUncertainHeadings),
      evidence: ["Some essential sections do not use standard headers, which may confuse older ATS parsers."]
    });
  }

  // Extreme characters or corruption (7 pts)
  const excessiveSpecialChars = (rawResumeText.match(/[^a-zA-Z0-9\s,.-@/+#()']/g) || []).length / rawResumeText.length > 0.08;
  if (excessiveSpecialChars) {
    structureScore -= 4;
    deductions.push({
      rule: "EXCESSIVE_SPECIAL_CHARACTERS",
      deduction: 4,
      evidence: ["High percentage of special symbols detected. This could indicate file format corruption."]
    });
    tips.push("Clean up unnecessary icons or unusual formatting characters that might corrupt ATS text extraction.");
  }

  // Margin, Font size & columns are UNKNOWN from plain text (no deduction)
  // Flagged explicitly as UNKNOWN internally
  const layoutCheckStatus = "UNKNOWN";

  breakdown.atsStructure.score = Math.max(0, structureScore);

  // ────────────────────────────────────────────────────────
  // 5. WRITING QUALITY (Max: 10 pts)
  // ────────────────────────────────────────────────────────
  let writingScore = 10;

  // Word count check (4 pts)
  if (wordCount < 150) {
    writingScore -= 3;
    deductions.push({
      rule: "RESUME_TOO_SHORT",
      deduction: 3,
      evidence: [`Resume contains only ${wordCount} words, which is extremely brief.`]
    });
    tips.push("Your resume is very short. Expand on your projects, key achievements, and role details.");
  } else if (wordCount > 1000) {
    writingScore -= 2;
    deductions.push({
      rule: "RESUME_TOO_LONG",
      deduction: 2,
      evidence: [`Resume contains ${wordCount} words. Multi-page word stuffing should be avoided.`]
    });
    tips.push("Your resume is quite long. Consider condensing descriptions to fit onto 1-2 pages.");
  }

  // Verb repetition and filler words (6 pts)
  if (signals?.writingQuality) {
    const fillerCount = signals.writingQuality.vagueFillerCount ?? 0;
    if (fillerCount >= 4) {
      writingScore -= 2;
      deductions.push({
        rule: "VAGUE_FILLER_WORDS",
        deduction: 2,
        evidence: [`Detected ${fillerCount} instances of weak passive verbs (e.g. helped, responsible for).`]
      });
      tips.push("Replace weak phrases like 'responsible for' with assertive results-driven verbs (e.g. compiled, streamlined).");
    }
  }

  breakdown.writing.score = Math.max(0, writingScore);

  // ────────────────────────────────────────────────────────
  // 6. PROFESSIONAL IMPACT (Max: 10 pts)
  // ────────────────────────────────────────────────────────
  let impactScore = 10;

  const hasMetrics = profile.verifiedMetrics.length > 0 || profile.achievements.some(a => !!a.associatedMetric);
  if (!hasMetrics) {
    impactScore -= 7;
    deductions.push({
      rule: "LOW_MEASURABLE_IMPACT",
      deduction: 7,
      evidence: ["No explicit metrics, percentages, dollar amounts, or time savings were found in experience descriptions."]
    });
    tips.push("Quantify your past impact (e.g., 'saved 10 hours weekly', 'served 100+ customers') where applicable.");
  } else if (profile.verifiedMetrics.length < 2 && isExperienced) {
    impactScore -= 3;
    deductions.push({
      rule: "FEW_METRICS_EXPERIENCED",
      deduction: 3,
      evidence: ["Only one verified metric detected for a mid/senior candidate."]
    });
    tips.push("As a professional, try to add metrics to your top 1-2 work accomplishments.");
  }

  breakdown.impact.score = Math.max(0, impactScore);

  // ────────────────────────────────────────────────────────
  // FINAL SCORE & SAFEGUARDS
  // ────────────────────────────────────────────────────────
  let finalScore =
    breakdown.content.score +
    breakdown.experienceQuality.score +
    breakdown.skills.score +
    breakdown.atsStructure.score +
    breakdown.writing.score +
    breakdown.impact.score;

  // Safeguard: Cap score at 40 if resume contains almost no content
  if (profile.experience.length === 0 && profile.projects.length === 0 && profile.internships.length === 0) {
    finalScore = Math.min(30, finalScore);
    deductions.push({
      rule: "CRITICAL_MISSING_CONTENT",
      deduction: 30,
      evidence: ["The resume contains neither professional work experience nor academic/personal projects."]
    });
  }

  // Safeguard: Cap score at 70 if contact info is completely absent (no email AND no phone)
  if (!hasEmail && !hasPhone) {
    finalScore = Math.min(65, finalScore);
    deductions.push({
      rule: "CRITICAL_MISSING_CONTACT_INFO",
      deduction: 15,
      evidence: ["Both email and phone number are missing from contact details. Recruiters cannot reach the candidate."]
    });
  }

  finalScore = Math.min(100, Math.max(0, Math.round(finalScore)));

  // Populate fallback tips if there are fewer than 3
  const defaultTips = [
    "Verify formatting alignment and margins to present a clean, visually balanced layout.",
    "Tailor your resume by adding keywords from your target job description.",
    "Include links to your professional portfolio or GitHub repositories."
  ];
  while (tips.length < 3) {
    const nextTip = defaultTips.find(t => !tips.includes(t)) ?? defaultTips[0];
    tips.push(nextTip);
  }

  return {
    score: finalScore,
    breakdown,
    deductions,
    tips: tips.slice(0, 5), // return up to 5 tips
  };
}
