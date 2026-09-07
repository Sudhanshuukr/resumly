import { groqProvider } from "@/lib/ai/providers/groq"
import {
  buildProfileExtractionPrompt,
  PROFILE_EXTRACTION_SYSTEM_MESSAGE,
} from "./prompts"
import { CandidateProfile, SkillsStructure } from "./types"

/**
 * Strips markdown code fences from the JSON string if present.
 */
function cleanJSONString(rawContent: string): string {
  let cleanJson = rawContent.trim()
  if (cleanJson.startsWith("```")) {
    const startIdx = cleanJson.indexOf("\n")
    const endIdx = cleanJson.lastIndexOf("```")
    if (startIdx !== -1 && endIdx !== -1) {
      cleanJson = cleanJson.substring(startIdx + 1, endIdx).trim()
    }
  }
  if (cleanJson.startsWith("json\n")) {
    cleanJson = cleanJson.substring(5).trim()
  }
  return cleanJson
}

/**
 * Extracts a candidate's structured profile facts from cleaned resume text.
 * Runs in JSON mode with configured Groq AI model.
 */
export async function extractCandidateProfile(
  cleanedResumeText: string
): Promise<CandidateProfile> {
  const prompt = buildProfileExtractionPrompt(cleanedResumeText)

  try {
    const rawContent = await groqProvider.generateSummary(
      PROFILE_EXTRACTION_SYSTEM_MESSAGE,
      prompt
    )

    const cleanedJson = cleanJSONString(rawContent)
    const parsed = JSON.parse(cleanedJson)

    // Helper to safe-map experience/internship objects
    const mapExperience = (list: unknown) => {
      if (!Array.isArray(list)) return [];
      return (list as Record<string, unknown>[]).map((exp) => {
        const companyName = exp?.company ? String(exp.company).trim() : undefined;
        const jobRole = exp?.role ? String(exp.role).trim() : undefined;
        
        // Ensure bullets is string[]
        let expBullets: string[] = [];
        if (Array.isArray(exp?.bullets)) {
          expBullets = exp.bullets.map((b: unknown) => String(b).trim());
        } else if (typeof exp?.description === "string") {
          // Fallback if description string is returned instead of array
          expBullets = exp.description.split("\n").map(l => l.trim()).filter(Boolean);
        }

        return {
          company: companyName,
          role: jobRole,
          title: jobRole, // compatibility
          startDate: exp?.startDate ? String(exp.startDate).trim() : undefined,
          endDate: exp?.endDate ? String(exp.endDate).trim() : undefined,
          currentlyWorking: typeof exp?.currentlyWorking === "boolean" ? exp.currentlyWorking : false,
          bullets: expBullets,
          description: expBullets.join("\n"), // compatibility
        };
      });
    };

    // Extract structured skills detail
    const rawSkills = parsed.skillsDetail || {};
    const skillsDetail: SkillsStructure = {
      technical: Array.isArray(rawSkills.technical) ? rawSkills.technical.map((s: unknown) => String(s).trim()) : [],
      frameworks: Array.isArray(rawSkills.frameworks) ? rawSkills.frameworks.map((s: unknown) => String(s).trim()) : [],
      languages: Array.isArray(rawSkills.languages) ? rawSkills.languages.map((s: unknown) => String(s).trim()) : [],
      databases: Array.isArray(rawSkills.databases) ? rawSkills.databases.map((s: unknown) => String(s).trim()) : [],
      tools: Array.isArray(rawSkills.tools) ? rawSkills.tools.map((s: unknown) => String(s).trim()) : [],
      cloud: Array.isArray(rawSkills.cloud) ? rawSkills.cloud.map((s: unknown) => String(s).trim()) : [],
      other: Array.isArray(rawSkills.other) ? rawSkills.other.map((s: unknown) => String(s).trim()) : [],
    };

    // Combine all skills detail into a flat list
    const allFlatSkills = Array.from(new Set([
      ...skillsDetail.technical,
      ...skillsDetail.frameworks,
      ...skillsDetail.languages,
      ...skillsDetail.databases,
      ...skillsDetail.tools,
      ...skillsDetail.cloud,
      ...skillsDetail.other,
    ]));

    // Construct profile separating extracted facts from derived fields
    const profile: CandidateProfile = {
      name: parsed.name ? String(parsed.name).trim() : undefined,
      location: parsed.location ? String(parsed.location).trim() : undefined,
      email: parsed.email ? String(parsed.email).trim() : undefined, // to be populated / verified
      phone: parsed.phone ? String(parsed.phone).trim() : undefined, // to be populated / verified
      links: Array.isArray(parsed.links) ? parsed.links.map((l: unknown) => String(l).trim()) : [],

      professionalSummary: parsed.professionalSummary ? String(parsed.professionalSummary).trim() : undefined,

      experience: mapExperience(parsed.experience),
      internships: mapExperience(parsed.internships),
      education: Array.isArray(parsed.education)
        ? (parsed.education as Record<string, unknown>[]).map((edu) => ({
            degree: edu?.degree ? String(edu.degree).trim() : undefined,
            fieldOfStudy: edu?.fieldOfStudy ? String(edu.fieldOfStudy).trim() : undefined,
            institution: edu?.institution ? String(edu.institution).trim() : undefined,
            graduationYear: edu?.graduationYear ? String(edu.graduationYear).match(/\d{4}/)?.[0] : undefined,
          }))
        : [],
      certifications: Array.isArray(parsed.certifications)
        ? parsed.certifications.map((c: unknown) => String(c).trim())
        : [],
      projects: Array.isArray(parsed.projects)
        ? (parsed.projects as Record<string, unknown>[]).map((proj) => {
            let projBullets: string[] = [];
            if (Array.isArray(proj?.bullets)) {
              projBullets = proj.bullets.map((b: unknown) => String(b).trim());
            } else if (typeof proj?.description === "string") {
              projBullets = [proj.description.trim()];
            }

            return {
              name: proj?.name ? String(proj.name).trim() : undefined,
              description: proj?.description ? String(proj.description).trim() : undefined,
              technologies: Array.isArray(proj?.technologies)
                ? (proj.technologies as unknown[]).map((t) => String(t).trim())
                : [],
              bullets: projBullets,
            };
          })
        : [],
      achievements: Array.isArray(parsed.achievements)
        ? (parsed.achievements as Record<string, unknown>[]).map((ach) => ({
            description: ach?.description ? String(ach.description).trim() : undefined,
            associatedMetric: ach?.associatedMetric ? String(ach.associatedMetric).trim() : undefined,
          }))
        : [],
      
      skillsDetail,
      skills: allFlatSkills, // flat list compatibility

      verifiedMetrics: Array.isArray(parsed.verifiedMetrics)
        ? parsed.verifiedMetrics.map((m: unknown) => String(m).trim())
        : [],
      industries: Array.isArray(parsed.industries)
        ? parsed.industries.map((i: unknown) => String(i).trim())
        : [],

      // Derived fields or signals from extraction
      analysisStatus: "COMPLETE",
      confidence: {
        overall: typeof parsed.confidence?.overall === "number" ? parsed.confidence.overall : 0.8,
        role: typeof parsed.confidence?.role === "number" ? parsed.confidence.role : 0.8,
        skills: typeof parsed.confidence?.skills === "number" ? parsed.confidence.skills : 0.8,
        experience: typeof parsed.confidence?.experience === "number" ? parsed.confidence.experience : 0.8,
        sections: typeof parsed.confidence?.sections === "number" ? parsed.confidence.sections : 0.8,
      },
      warnings: [],

      // Standard lists derived from experience and internships
      jobTitles: [],
      companies: [],
      experienceLevel: "unknown",
    }

    // Populate job titles and companies lists
    profile.jobTitles = Array.from(new Set([
      ...profile.experience.map(e => e.role).filter((t): t is string => !!t),
      ...profile.internships.map(i => i.role).filter((t): t is string => !!t)
    ]));
    
    profile.companies = Array.from(new Set([
      ...profile.experience.map(e => e.company).filter((c): c is string => !!c),
      ...profile.internships.map(i => i.company).filter((c): c is string => !!c)
    ]));

    profile.currentOrMostRecentTitle = profile.jobTitles[0] || undefined;

    return profile
  } catch (err: unknown) {
    console.error("[extractCandidateProfile] Extraction call failed:", err)
    if (err && typeof err === "object" && "code" in err && "success" in err) {
      throw err
    }
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Candidate profile extraction failed: ${message}`)
  }
}
