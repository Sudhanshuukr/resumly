import type { Metadata } from "next";
import { Outfit, DM_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/common/theme-provider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Resumly - AI Resume Analyzer",
  description: "Resumly is an AI resume analyzer that helps you understand and improve your resume. Get instant ATS analysis, recruiter-ready summaries, and actionable career insights.",
  keywords: [
    "resume analyzer",
    "AI resume analysis",
    "ATS analysis",
    "resume improvement",
    "AI resume summarizer",
    "ATS resume score",
    "career insights"
  ],
  openGraph: {
    title: "Resumly - AI Resume Analyzer",
    description: "Understand and improve your resume with AI. Upload your resume for instant ATS analysis, skills evaluation, and recruiter-ready summaries.",
    siteName: "Resumly",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resumly - AI Resume Analyzer",
    description: "Understand and improve your resume with AI. Upload your resume for instant ATS analysis and recruiter-ready summaries.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${outfit.variable} ${jetbrainsMono.variable} min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

