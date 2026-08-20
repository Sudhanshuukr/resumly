export interface ExtractedContact {
  email?: string;
  phone?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  links: string[];
}

/**
 * Deterministically extracts email, phone, and professional links from raw text.
 */
export function extractContacts(rawText: string): ExtractedContact {
  const links: string[] = [];
  let email: string | undefined;
  let phone: string | undefined;
  let github: string | undefined;
  let linkedin: string | undefined;
  let portfolio: string | undefined;

  // 1. Extract Email
  const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi;
  const emailMatches = rawText.match(emailRegex);
  if (emailMatches && emailMatches.length > 0) {
    email = emailMatches[0].trim();
  }

  // 2. Extract Phone
  // Matches formats like +1-555-555-5555, (555) 555-5555, 555.555.5555, etc.
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  const phoneMatches = rawText.match(phoneRegex);
  if (phoneMatches && phoneMatches.length > 0) {
    phone = phoneMatches[0].trim();
  }

  // 3. Extract Links / URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,8}(?:\/[^\s]*)?)/gi;
  const urlMatches = rawText.match(urlRegex) || [];

  for (const rawUrl of urlMatches) {
    let cleanUrl = rawUrl.trim();
    // Remove trailing punctuation like dots or commas that get caught by regex
    cleanUrl = cleanUrl.replace(/[.,;:)\]]+$/, "");

    // Skip emails matching as URLs
    if (cleanUrl.includes("@")) continue;

    // Standardize URL protocol if missing
    let fullUrl = cleanUrl;
    if (!/^https?:\/\//i.test(cleanUrl)) {
      fullUrl = `https://${cleanUrl}`;
    }

    if (!links.includes(fullUrl)) {
      links.push(fullUrl);
    }

    // Check specific domains
    if (/github\.com/i.test(fullUrl) && !github) {
      github = fullUrl;
    } else if (/linkedin\.com/i.test(fullUrl) && !linkedin) {
      linkedin = fullUrl;
    } else if (!portfolio && !/github\.com|linkedin\.com/i.test(fullUrl)) {
      // Check if it looks like a personal site / portfolio
      portfolio = fullUrl;
    }
  }

  return {
    email,
    phone,
    github,
    linkedin,
    portfolio,
    links,
  };
}
