export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
}

export const featuresData: FeatureItem[] = [
  {
    id: "parsing",
    title: "Resume Parsing",
    description: "Instantly extract work history, education, and credentials from PDF or Word documents with absolute precision.",
    iconName: "FileText",
  },
  {
    id: "analysis",
    title: "AI Semantic Analysis",
    description: "Deep-scans your experience map to detect hidden strengths, skill gaps, and quantify career achievements.",
    iconName: "BrainCircuit",
    badge: "AI Powered",
  },
  {
    id: "ats",
    title: "ATS Optimization",
    description: "Infuses contextually relevant keywords and semantic tags to pass algorithmic applicant tracking systems with flying colors.",
    iconName: "Cpu",
  },
  {
    id: "styles",
    title: "Multiple Summary Styles",
    description: "Toggle between Executive, Technical, Creative, and ATS-Optimized styles designed to match different industry vibes.",
    iconName: "Sparkles",
  },
  {
    id: "grammar",
    title: "Grammar & Tone Refinement",
    description: "Elevates conversational phrasing into active, impact-oriented language using professional action verbs.",
    iconName: "CheckCheck",
  },
  {
    id: "length",
    title: "Length Auto-Adjustment",
    description: "Optimize summaries to fit strict paragraph constraints or expand them for longer LinkedIn profile highlights.",
    iconName: "Sliders",
  },
  {
    id: "industry",
    title: "Industry Specific Tuning",
    description: "Tailors summaries specifically for Tech, Finance, Health, Creative, Consulting, and 45+ other distinct verticals.",
    iconName: "Briefcase",
  },
  {
    id: "copy",
    title: "Copy to Clipboard",
    description: "Copy your freshly synthesized summary in a single click, perfectly formatted without styling artifacts.",
    iconName: "Copy",
  },
  {
    id: "linkedin",
    title: "LinkedIn About Generator",
    description: "Synthesize expansive first-person bio descriptions built specifically for the LinkedIn 'About' section layout.",
    iconName: "Linkedin",
    badge: "Hot",
  },
  {
    id: "interview",
    title: "Interview Elevator Pitch",
    description: "Converts your summary into a spoken introduction script ('Tell me about yourself') to ace the initial screening.",
    iconName: "UserCheck",
  },
  {
    id: "history",
    title: "Version History",
    description: "Track previous variations and download or copy previous resume summaries from your locally saved sessions.",
    iconName: "History",
  }
];
