import { CandidateProfile } from "./types"

/**
 * Parses a date string into an absolute integer month index (year * 12 + month).
 * 0-indexed month (0 = Jan, 11 = Dec).
 * Handles "Present", month names, year-only, and ISO formats.
 */
export function parseDateToMonthIndex(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const clean = dateStr.toLowerCase().trim();

  // Current date is July 2026. July is 6 (0-indexed)
  if (clean === "present" || clean === "current" || clean === "now" || clean === "presently") {
    return 2026 * 12 + 6;
  }

  // Find 4-digit year
  const yearMatch = clean.match(/\b(19|20)\d{2}\b/);
  if (!yearMatch) return null;
  const year = parseInt(yearMatch[0], 10);

  // Month matching
  const months = [
    { names: ["jan", "january", "01/"], val: 0 },
    { names: ["feb", "february", "02/"], val: 1 },
    { names: ["mar", "march", "03/"], val: 2 },
    { names: ["apr", "april", "04/"], val: 3 },
    { names: ["may", "05/"], val: 4 },
    { names: ["jun", "june", "06/"], val: 5 },
    { names: ["jul", "july", "07/"], val: 6 },
    { names: ["aug", "august", "08/"], val: 7 },
    { names: ["sep", "september", "09/"], val: 8 },
    { names: ["oct", "october", "10/"], val: 9 },
    { names: ["nov", "november", "11/"], val: 10 },
    { names: ["dec", "december", "12/"], val: 11 }
  ];

  let monthVal = 0; // Default to Jan (0) if month isn't specified
  for (const m of months) {
    if (m.names.some(name => clean.includes(name))) {
      monthVal = m.val;
      break;
    }
  }

  // Handle ISO style formats (e.g. 2021-06)
  const isoMatch = clean.match(/\b\d{4}-(\d{2})\b/);
  if (isoMatch) {
    const isoMonth = parseInt(isoMatch[1], 10);
    if (isoMonth >= 1 && isoMonth <= 12) {
      monthVal = isoMonth - 1;
    }
  }

  return year * 12 + monthVal;
}

/**
 * Merges overlapping intervals and calculates total duration in months.
 */
export function calculateMergedMonths(intervals: [number, number][]): number {
  if (intervals.length === 0) return 0;

  // Sort intervals by start month index
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];

  let current = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    if (next[0] <= current[1]) {
      // Overlap: extend end month
      current[1] = Math.max(current[1], next[1]);
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);

  // Sum up month differences. If start and end month are the same, count as 1 month.
  return merged.reduce((acc, interval) => acc + (interval[1] - interval[0] + 1), 0);
}

/**
 * Computes deterministic derived experience calculations (years and level)
 * using a multi-signal rules engine based on the profile facts.
 */
export function calculateExperience(profile: CandidateProfile): CandidateProfile {
  const updatedProfile = { ...profile };

  // Helper to extract intervals
  const getIntervals = (list: any[]) => {
    const intervals: [number, number][] = [];
    for (const exp of list) {
      const start = parseDateToMonthIndex(exp.startDate);
      const end = parseDateToMonthIndex(exp.endDate);
      if (start !== null && end !== null && start <= end) {
        intervals.push([start, end]);
      }
    }
    return intervals;
  };

  // 1. Calculate professional experience
  const profIntervals = getIntervals(profile.experience);
  const profMonths = calculateMergedMonths(profIntervals);
  updatedProfile.professionalExperienceMonths = profMonths;

  // 2. Calculate internship experience
  const internIntervals = getIntervals(profile.internships);
  const internMonths = calculateMergedMonths(internIntervals);
  updatedProfile.internshipExperienceMonths = internMonths;

  // Total non-overlapping experience
  const allIntervals = [...profIntervals, ...internIntervals];
  const totalMonths = calculateMergedMonths(allIntervals);
  const totalYears = totalMonths > 0 ? parseFloat((totalMonths / 12).toFixed(1)) : 0;
  updatedProfile.estimatedExperienceYears = totalYears > 0 ? totalYears : undefined;

  // 3. Classify Experience Level using non-overlapping boundaries and career stage
  // Gather titles
  const jobTitlesLower = [
    ...profile.jobTitles,
    ...profile.experience.map(e => e.role || ""),
    ...profile.internships.map(i => i.role || "")
  ].map(t => t.toLowerCase());

  // Executive signals
  const hasExecutiveTitle = jobTitlesLower.some((title) =>
    /\b(ceo|cto|cfo|coo|cio|cmo|vp|vice president|president|managing director|founder|chief|executive director)\b/i.test(title)
  );

  // Senior signals
  const hasSeniorTitle = jobTitlesLower.some((title) =>
    /\b(senior|lead|principal|architect|manager|mgr|director|head of)\b/i.test(title)
  );

  // Junior/Entry signals
  const hasEntryTitle = jobTitlesLower.some((title) =>
    /\b(junior|jr|entry|associate|fresher|assistant)\b/i.test(title)
  );

  // Check education current status (graduation >= 2025)
  const isEducationCurrent = profile.education.some((edu) => {
    if (!edu.graduationYear) return false;
    const gradYear = parseInt(edu.graduationYear.match(/\d{4}/)?.[0] || "0", 10);
    return gradYear >= 2025;
  });

  const hasInternTitle = jobTitlesLower.some((title) =>
    /\b(intern|internship|student|trainee|apprentice|co-op)\b/i.test(title)
  );

  // Calculate experience maturity
  const hasStrongProjects = profile.projects.length >= 3 || (profile.projects.length > 0 && profile.projects.some(p => !!p.technologies && p.technologies.length >= 3));
  const hasInternships = internMonths > 0 || hasInternTitle;

  if (profMonths === 0) {
    if (isEducationCurrent || hasInternships || hasStrongProjects) {
      updatedProfile.experienceLevel = "student";
    } else {
      updatedProfile.experienceLevel = "entry"; // Fresher/Entry
    }
  } else if (hasExecutiveTitle && profMonths >= 60) {
    updatedProfile.experienceLevel = "executive";
  } else if (profMonths >= 1 && profMonths <= 23) {
    // 1-23 months
    updatedProfile.experienceLevel = "entry";
  } else if (profMonths >= 24 && profMonths <= 59) {
    // 24-59 months
    updatedProfile.experienceLevel = "mid"; // Early/Mid
  } else if (profMonths >= 60 && profMonths <= 95) {
    // 60-95 months
    updatedProfile.experienceLevel = "senior"; // Mid/Senior
  } else if (profMonths >= 96) {
    // 96+ months
    updatedProfile.experienceLevel = "senior"; // Senior
  } else {
    updatedProfile.experienceLevel = "unknown";
  }

  return updatedProfile;
}
