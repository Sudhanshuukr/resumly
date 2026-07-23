export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const faqData: FAQItem[] = [
  {
    id: "how-it-works",
    question: "How does the AI Resume Summary Generator work?",
    answer: "ResumeSummary AI reads the text within your uploaded resume (PDF/DOCX), maps it against modern occupational structures using semantic NLP, identifies key metrics and skills, and then generates high-impact, custom-styled summaries designed for hiring managers and ATS filters."
  },
  {
    id: "security",
    question: "Is my personal data and resume secure?",
    answer: "Absolutely. We prioritize your privacy above all else. Your uploaded documents are processed securely in transit and are never used to train public LLM models. Files are automatically cleared from our servers after analysis."
  },
  {
    id: "ats",
    question: "What does ATS-Optimized mean?",
    answer: "Applicant Tracking Systems (ATS) scan resumes for specific contextual keywords matching the job description. Our generator reverse-engineers these criteria to weave in highly relevant semantic keywords naturally, maximizing your chances of getting past the automated screening."
  },
  {
    id: "formats",
    question: "Which document formats are supported?",
    answer: "Currently, we fully support PDF (.pdf) and Microsoft Word (.docx) files up to 10MB in size. We recommend uploading files that contain selectable text for the highest parsing accuracy."
  },
  {
    id: "payment",
    question: "Can I cancel my plan at any time?",
    answer: "Yes, you can cancel your subscription at any time directly through your billing portal settings. You will retain access to your Pro features until the end of your current billing cycle."
  }
];
