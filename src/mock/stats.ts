export interface StatItem {
  id: string;
  value: string;
  label: string;
  description: string;
}

export const statsData: StatItem[] = [
  {
    id: "speed",
    value: "10s",
    label: "Generation Speed",
    description: "Upload, parse, and review multiple summaries in under ten seconds flat."
  },
  {
    id: "ats-ready",
    value: "95%",
    label: "ATS Read Rate",
    description: "Optimized summaries bypass automated tracking filters and reach human eyes."
  },
  {
    id: "industries",
    value: "50+",
    label: "Supported Industries",
    description: "Tailored vocabulary settings mapped to tech, marketing, healthcare, and finance."
  },
  {
    id: "generated",
    value: "100k+",
    label: "Summaries Synthesized",
    description: "Helping candidates worldwide present their absolute best self to recruiters."
  }
];
