import { parseDateToMonthIndex, calculateMergedMonths, calculateExperience } from "./calculateExperience"
import { extractContacts } from "./contactExtractor"
import { detectSections, reconcileSections } from "./sectionDetector"
import { matchSkillBoundaries, normalizeSkill, validateCandidateProfile } from "./validateCandidateProfile"
import { calculateATSReadinessScore } from "./calculateATSReadinessScore"
import { studentResumeText } from "./__tests__/fixtures/student"
import { fresherResumeText } from "./__tests__/fixtures/fresher"
import { experiencedResumeText } from "./__tests__/fixtures/experienced"
import { internshipOnlyResumeText } from "./__tests__/fixtures/internship-only"
import { malformedResumeText } from "./__tests__/fixtures/malformed"
import { keywordStuffedResumeText } from "./__tests__/fixtures/keyword-stuffed"
import { CandidateProfile } from "./types"

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    // Do not throw immediately so we can see all failures
  }
}

function runTests() {
  console.log("==================================================");
  console.log("RUNNING PIPELINE UNIT TESTS");
  console.log("==================================================");

  // ────────────────────────────────────────────────────────
  // Test 1: Date parsing & month conversion
  // ────────────────────────────────────────────────────────
  console.log("\n--- Testing Date Calculations ---");
  assert(parseDateToMonthIndex("June 2021") === 2021 * 12 + 5, "June 2021 parsing");
  assert(parseDateToMonthIndex("06/2021") === 2021 * 12 + 5, "06/2021 parsing");
  assert(parseDateToMonthIndex("2021-06") === 2021 * 12 + 5, "2021-06 parsing");
  assert(parseDateToMonthIndex("Present") === 2026 * 12 + 6, "Present parsing (July 2026)");
  assert(parseDateToMonthIndex("Current") === 2026 * 12 + 6, "Current parsing (July 2026)");
  assert(parseDateToMonthIndex("2021") === 2021 * 12 + 0, "2021 year-only default month");

  // ────────────────────────────────────────────────────────
  // Test 2: Overlapping Date Intervals (Union)
  // ────────────────────────────────────────────────────────
  console.log("\n--- Testing Overlapping Date Unions ---");
  // Company A: Jan 2023 - Dec 2023 (12 months)
  // Company B: Jun 2023 - Jun 2024 (13 months, overlap 7 months)
  // Union is Jan 2023 - Jun 2024 -> 18 months
  const intervals: [number, number][] = [
    [2023 * 12 + 0, 2023 * 12 + 11],
    [2023 * 12 + 5, 2024 * 12 + 5]
  ];
  const mergedMonths = calculateMergedMonths(intervals);
  assert(mergedMonths === 18, `Date overlap union (expected 18 months, got ${mergedMonths})`);

  // Multiple overlaps and gaps
  const multiIntervals: [number, number][] = [
    [2020 * 12 + 0, 2020 * 12 + 5], // Jan - Jun 2020 (6 mos)
    [2020 * 12 + 3, 2020 * 12 + 9], // Apr - Oct 2020 (overlapping, extends to 10 mos: Jan - Oct)
    [2021 * 12 + 0, 2021 * 12 + 11] // Jan - Dec 2021 (gap, 12 mos)
  ];
  assert(calculateMergedMonths(multiIntervals) === 22, `Multiple intervals with gaps (expected 22, got ${calculateMergedMonths(multiIntervals)})`);

  // ────────────────────────────────────────────────────────
  // Test 3: Deterministic Contact Extraction
  // ────────────────────────────────────────────────────────
  console.log("\n--- Testing Contact Extraction ---");
  const studentContacts = extractContacts(studentResumeText);
  assert(studentContacts.email === "alex.mercer@gmail.com", "Email extraction");
  assert(studentContacts.phone === "(555) 019-2834", "Phone extraction");
  assert(studentContacts.linkedin === "https://linkedin.com/in/alexmercer", "LinkedIn URL extraction");
  assert(studentContacts.github === "https://github.com/alexmercer", "GitHub URL extraction");

  // ────────────────────────────────────────────────────────
  // Test 4: Section Detection & Reconciliation
  // ────────────────────────────────────────────────────────
  console.log("\n--- Testing Section Detection ---");
  const studentHeadings = detectSections(studentResumeText);
  assert(studentHeadings.education === true, "Education section header detected");
  assert(studentHeadings.skills === true, "Skills section header detected");
  assert(studentHeadings.experience === false, "Experience section header not found directly (labeled INTERNSHIP EXPERIENCE)");
  
  // Reconcile
  const mockReconcileProfile = {
    experience: [],
    internships: [{ role: "Intern" }],
    education: [{ institution: "University" }],
    projects: [],
    skills: ["React"],
    certifications: [],
    achievements: [],
    professionalSummary: ""
  };
  const customHeadings = { ...studentHeadings, projects: false };
  const reconciled = reconcileSections(customHeadings, mockReconcileProfile);
  assert(reconciled.statuses.experience === "uncertain", "Reconciliation: Labeled 'uncertain' when internship exists but 'experience' header is missing");
  assert(reconciled.statuses.skills === "detected", "Reconciliation: Labeled 'detected' when skill heading matches");
  assert(reconciled.statuses.projects === "missing", "Reconciliation: Labeled 'missing' when projects are absent and heading is absent");

  // ────────────────────────────────────────────────────────
  // Test 5: Punctuation-Safe Skill Boundary Verification
  // ────────────────────────────────────────────────────────
  console.log("\n--- Testing Punctuation-Safe Skill Boundaries ---");
  assert(matchSkillBoundaries("C++", "Skills: C++, C#, .NET"), "C++ boundary check");
  assert(matchSkillBoundaries("C#", "Skills: C++, C#, .NET"), "C# boundary check");
  assert(matchSkillBoundaries(".NET", "Skills: C++, C#, .NET"), ".NET boundary check");
  assert(matchSkillBoundaries("Node.js", "We use Node.js and Next.js"), "Node.js boundary check");
  assert(!matchSkillBoundaries("Go", "We are ongoing with our work."), "Ambiguous 'go' inside word boundary rejection");
  assert(matchSkillBoundaries("Go", "Languages: Go, Python, Java"), "Tech context 'Go' boundary approval");

  // ────────────────────────────────────────────────────────
  // Test 6: Skill Normalization & Ambiguous Skill Rejection
  // ────────────────────────────────────────────────────────
  console.log("\n--- Testing Skill Normalization ---");
  assert(normalizeSkill("ReactJS", "ReactJS and Next.js") === "React", "ReactJS -> React");
  assert(normalizeSkill("React.js", "React.js and TypeScript") === "React", "React.js -> React");
  assert(normalizeSkill("NodeJS", "NodeJS on backend") === "Node.js", "NodeJS -> Node.js");
  assert(normalizeSkill("Express", "Express framework") === "Express.js", "Express -> Express.js");
  assert(normalizeSkill("Postgres", "Postgres database") === "PostgreSQL", "Postgres -> PostgreSQL");
  
  // Ambiguous/Context checks
  assert(normalizeSkill("Go", "Ready to go beyond limits") === null, "Rejects Go as ordinary English word");
  assert(normalizeSkill("Go", "I use Go and Python") === "Go", "Accepts Go when tech context exists");
  assert(normalizeSkill("Excel", "Familiar with Excel formulas") === null, "Rejects Excel without MS prefix or office context");
  assert(normalizeSkill("Excel", "Proficient in Microsoft Excel spreadsheets") === "Excel", "Accepts Excel with Microsoft prefix");

  // ────────────────────────────────────────────────────────
  // Test 7: Career Stage Calculation & Adaptive Scoring
  // ────────────────────────────────────────────────────────
  console.log("\n--- Testing Career Stage & ATS Scoring ---");
  
  // Base Profile Setup for Student
  const studentProfile: CandidateProfile = {
    name: "Alex Mercer",
    email: "alex@example.com",
    phone: "555-555-5555",
    location: "San Francisco, CA",
    professionalSummary: "Computer Science student with project and internship experience.",
    links: ["github.com/alexmercer"],
    experience: [],
    internships: [
      { role: "Intern", company: "A", startDate: "Jun 2025", endDate: "Aug 2025" }
    ],
    education: [
      { degree: "B.S.", institution: "Uni", graduationYear: "2026" }
    ],
    projects: [
      { name: "P1", description: "Desc", technologies: ["React", "Node.js"] }
    ],
    skillsDetail: {
      technical: ["Agile"],
      frameworks: ["React"],
      languages: ["TypeScript"],
      databases: ["PostgreSQL"],
      tools: ["Git"],
      cloud: ["AWS"],
      other: []
    },
    skills: ["React", "TypeScript", "PostgreSQL", "Git", "AWS"],
    certifications: [],
    achievements: [],
    verifiedMetrics: ["45% latency reduction"],
    industries: ["Software Engineering"],
    analysisStatus: "COMPLETE",
    confidence: { overall: 0.9, role: 0.9, skills: 0.9, experience: 0.9, sections: 0.9 },
    warnings: [],
    jobTitles: ["Intern"],
    companies: ["A"],
    experienceLevel: "student"
  };

  const processedStudent = calculateExperience(studentProfile);
  assert(processedStudent.experienceLevel === "student", "Correctly classifies as student (0 prof months + internships)");

  const studentScore = calculateATSReadinessScore(processedStudent, studentResumeText, {
    experience: "detected",
    skills: "detected",
    education: "detected",
    projects: "detected"
  });

  // Verify Student is not penalized for missing full-time work experience
  assert(studentScore.score >= 70, `Student score is not unfairly capped (Score: ${studentScore.score})`);
  assert(studentScore.breakdown.content.score === 25, "Student gets full Content Completeness points via projects/internships");

  // Experienced Profile Setup
  const expProfile: CandidateProfile = {
    name: "Diana Prince",
    email: "diana@example.com",
    phone: "555-555-5555",
    links: [],
    experience: [
      { role: "Engineer", company: "TechCorp", startDate: "Jan 2023", endDate: "Present" } // Jan 2023 - Jul 2026 = 42 mos
    ],
    internships: [],
    education: [
      { degree: "B.S.", institution: "Uni", graduationYear: "2021" }
    ],
    projects: [],
    skillsDetail: {
      technical: ["Agile"],
      frameworks: ["React"],
      languages: ["TypeScript"],
      databases: ["PostgreSQL"],
      tools: ["Git"],
      cloud: ["AWS"],
      other: []
    },
    skills: ["React", "TypeScript", "PostgreSQL", "Git", "AWS"],
    certifications: [],
    achievements: [],
    verifiedMetrics: ["32% hosting overhead"],
    industries: ["Software Engineering"],
    analysisStatus: "COMPLETE",
    confidence: { overall: 0.9, role: 0.9, skills: 0.9, experience: 0.9, sections: 0.9 },
    warnings: [],
    jobTitles: ["Engineer"],
    companies: ["TechCorp"],
    experienceLevel: "mid"
  };

  const processedExp = calculateExperience(expProfile);
  assert(processedExp.experienceLevel === "mid", `Classifies as mid level (calculated ${processedExp.professionalExperienceMonths} months)`);

  const expScore = calculateATSReadinessScore(processedExp, experiencedResumeText, {
    experience: "detected",
    skills: "detected",
    education: "detected",
    projects: "missing"
  });
  assert(expScore.score >= 70, `Experienced score is strong (Score: ${expScore.score})`);

  // Malformed text detection
  const emptyProfile: CandidateProfile = {
    name: "",
    email: "",
    phone: "",
    links: [],
    experience: [],
    internships: [],
    education: [],
    projects: [],
    skillsDetail: { technical: [], frameworks: [], languages: [], databases: [], tools: [], cloud: [], other: [] },
    skills: [],
    certifications: [],
    achievements: [],
    verifiedMetrics: [],
    industries: [],
    analysisStatus: "INSUFFICIENT_EXTRACTION",
    confidence: { overall: 0, role: 0, skills: 0, experience: 0, sections: 0 },
    warnings: [],
    jobTitles: [],
    companies: [],
    experienceLevel: "unknown"
  };
  const malformedScore = calculateATSReadinessScore(emptyProfile, malformedResumeText, {
    experience: "missing",
    skills: "missing",
    education: "missing",
    projects: "missing"
  });
  assert(malformedScore.score < 40, `Malformed resume receives low score (Score: ${malformedScore.score})`);

  // ────────────────────────────────────────────────────────
  // Summary
  // ────────────────────────────────────────────────────────
  console.log("\n==================================================");
  console.log(`TEST SUMMARY: Passed ${passedTests}/${totalTests} tests`);
  console.log("==================================================");

  if (passedTests < totalTests) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
