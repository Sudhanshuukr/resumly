import React from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Container } from "@/components/common/primitives"
import { Shield, FileText, Database, Lock, Eye, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Resumly",
  description: "Learn how Resumly processes your resume data, handles AI summarization, and protects your information.",
}

export default function PrivacyPage() {
  const lastUpdated = "March 8, 2026"

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24">
        <Container className="max-w-4xl font-sans">
          {/* Header */}
          <div className="mb-12">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-brand-orange transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange border border-brand-orange/20">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
                Privacy Policy
              </h1>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Policy Content */}
          <div className="space-y-10 text-sm leading-relaxed text-foreground/90 font-normal">
            
            {/* 1. Overview */}
            <section className="space-y-3 p-6 rounded-2xl bg-card border border-border">
              <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-orange" />
                1. Overview &amp; Commitment
              </h2>
              <p>
                Resumly (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is an AI-powered resume analyzer designed to help job seekers understand, summarize, and optimize their resumes. We believe your professional background and career data deserve respectful, transparent, and private handling.
              </p>
              <p>
                This Privacy Policy explains exactly what data we collect, how your uploaded documents are parsed and analyzed, which third-party infrastructure providers are involved, and your rights regarding your data.
              </p>
            </section>

            {/* 2. Data We Process */}
            <section className="space-y-4">
              <h2 className="font-heading font-bold text-xl text-foreground">
                2. Information We Collect &amp; Process
              </h2>
              
              <div className="space-y-3">
                <h3 className="font-bold text-foreground text-sm">A. Resume &amp; Document Data</h3>
                <p>
                  When you upload a resume (in PDF or DOCX format) or paste text into Resumly, our servers extract the textual content to perform analysis. This extracted text typically includes:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Contact details (name, email, phone number, location, LinkedIn/GitHub links as written in your resume)</li>
                  <li>Work experience, job titles, employers, employment dates, and bullet-point achievements</li>
                  <li>Educational history, degrees, certifications, and graduation dates</li>
                  <li>Skills, technical competencies, and project descriptions</li>
                </ul>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-foreground text-sm">B. Account &amp; Authentication Information</h3>
                <p>
                  If you create an optional Resumly account, we collect your email address and authentication credentials. Account management and authentication are handled securely via <strong>Supabase Auth</strong>.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-foreground text-sm">C. Technical &amp; Usage Logs</h3>
                <p>
                  To manage free usage tiers and protect against abusive requests, our servers log temporary session identifiers, anonymized rate-limiting IP hashes, request timestamps, and basic browser user-agent headers.
                </p>
              </div>
            </section>

            {/* 3. How AI Processing Works */}
            <section className="space-y-3 p-6 rounded-2xl bg-muted/30 border border-border">
              <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-orange" />
                3. How AI Analysis Works
              </h2>
              <p>
                To generate your Professional, ATS, and Executive summaries, evaluate skills, and calculate ATS readiness scores, your extracted resume text is sent via encrypted HTTPS to our AI inference provider, <strong>Groq Cloud API</strong> (executing models such as <code>openai/gpt-oss-120b</code>).
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Your resume content is processed transiently to fulfill your real-time analysis request and return structured outputs.</li>
                <li>We do not sell, rent, or trade your personal resume text to advertisers, data brokers, or third parties.</li>
                <li>Under our API integration with Groq Cloud, customer API inputs are processed for inference and are not used to train foundation AI models.</li>
              </ul>
            </section>

            {/* 4. Data Storage & Retention */}
            <section className="space-y-3">
              <h2 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-orange" />
                4. Data Storage &amp; Retention
              </h2>
              <p>
                <strong>Authenticated Users:</strong> Analysis results (generated summaries, scores, candidate job title, and timestamps) are saved in your personal history table in our managed PostgreSQL database hosted by <strong>Supabase</strong> so you can access them across sessions.
              </p>
              <p>
                <strong>Guest Users:</strong> Guest analysis results are linked temporarily to a random browser-generated session ID and stored in your local browser cache (localStorage).
              </p>
              <p>
                You can delete individual history entries at any time using the in-app history controls.
              </p>
            </section>

            {/* 5. Cookies & Local Storage */}
            <section className="space-y-3">
              <h2 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-orange" />
                5. Cookies &amp; Local Browser Storage
              </h2>
              <p>
                Resumly uses minimal browser storage strictly necessary for application functionality:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><strong>Authentication Tokens:</strong> Stored to maintain your signed-in session.</li>
                <li><strong>Theme Preference:</strong> Stored locally to remember your light/dark mode selection.</li>
                <li><strong>Analysis State:</strong> Stored locally in your browser to preserve active summary drafts.</li>
              </ul>
            </section>

            {/* 6. Email Communications */}
            <section className="space-y-3">
              <h2 className="font-heading font-bold text-xl text-foreground">
                6. Communications
              </h2>
              <p>
                We do not send unsolicited marketing emails. Newsletter subscription functionality is currently inactive on Resumly. If email communications are enabled in the future, subscriptions will remain strictly opt-in with immediate unsubscribe options.
              </p>
            </section>

            {/* 7. Contact Us */}
            <section className="space-y-3 p-6 rounded-2xl bg-card border border-border">
              <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-orange" />
                7. Questions &amp; Inquiries
              </h2>
              <p>
                If you have questions about this Privacy Policy, your personal data, or wish to request data deletion, please contact the maintainer through our official profiles:
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="https://github.com/sudhanshuukr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-brand-orange hover:underline"
                >
                  GitHub: @sudhanshuukr
                </a>
                <a
                  href="https://www.linkedin.com/in/sudhanshuukr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-brand-orange hover:underline"
                >
                  LinkedIn: @sudhanshuukr
                </a>
                <a
                  href="https://x.com/sudhanshuworks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-brand-orange hover:underline"
                >
                  X: @sudhanshuworks
                </a>
              </div>
            </section>

          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}
