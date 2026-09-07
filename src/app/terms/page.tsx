import React from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Container } from "@/components/common/primitives"
import { Scale, AlertCircle, FileCheck, CheckSquare, HelpCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Resumly",
  description: "Terms and conditions governing the use of Resumly AI resume analysis and summarization tools.",
}

export default function TermsPage() {
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
                <Scale className="w-5 h-5" />
              </div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
                Terms of Service
              </h1>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Terms Content */}
          <div className="space-y-10 text-sm leading-relaxed text-foreground/90 font-normal">
            
            {/* 1. Acceptance */}
            <section className="space-y-3 p-6 rounded-2xl bg-card border border-border">
              <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-brand-orange" />
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the Resumly website and related services (&ldquo;Resumly&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree with any part of these Terms, you may not access or use our services.
              </p>
            </section>

            {/* 2. Description of Service */}
            <section className="space-y-3">
              <h2 className="font-heading font-bold text-xl text-foreground">
                2. Description of the Service
              </h2>
              <p>
                Resumly provides digital tools for parsing resumes, generating structured summaries (such as Professional, ATS, and Executive summaries), extracting skills, assessing ATS alignment, and refining resume content using automated artificial intelligence models.
              </p>
            </section>

            {/* 3. AI & ATS Analysis Disclaimers */}
            <section className="space-y-4 p-6 rounded-2xl bg-brand-orange/5 dark:bg-brand-orange/10 border border-brand-orange/20">
              <h2 className="font-heading font-bold text-lg text-brand-orange flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                3. AI Output &amp; Employment Disclaimers (Important)
              </h2>
              <p className="font-medium text-foreground">
                Resumly is an assistive advisory tool. All generated summaries, tone rewrites, skills assessments, and ATS scores are produced using statistical AI models for informational and drafting assistance only.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>
                  <strong className="text-foreground">No Guarantee of Employment:</strong> Resumly does <em>not</em> guarantee job interviews, hiring offers, recruiter responses, or that any prospective employer or ATS software will accept your resume.
                </li>
                <li>
                  <strong className="text-foreground">User Verification Required:</strong> AI models may occasionally misinterpret text, hallucinate facts, or suggest inaccurate descriptions. You are solely responsible for reviewing, verifying, and editing all generated summaries before including them in your job applications.
                </li>
                <li>
                  <strong className="text-foreground">ATS Match Scores:</strong> ATS scores provided on Resumly are simulated algorithmic estimates based on common formatting and keyword practices; they do not represent proprietary algorithms of specific employer hiring platforms.
                </li>
              </ul>
            </section>

            {/* 4. User Content & Responsibilities */}
            <section className="space-y-3">
              <h2 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-brand-orange" />
                4. User Content &amp; Intellectual Property
              </h2>
              <p>
                <strong>Ownership:</strong> You retain full ownership and intellectual property rights to the resume documents, work experience descriptions, and materials you submit to Resumly.
              </p>
              <p>
                <strong>License to Process:</strong> By uploading your resume, you grant Resumly a limited, non-exclusive license strictly to parse, process, analyze, and display your content to provide the requested services to you.
              </p>
              <p>
                <strong>Your Representations:</strong> You represent and warrant that you own or have the legal right to upload the documents you submit, and that your content does not violate any third-party rights or applicable laws.
              </p>
            </section>

            {/* 5. Prohibited Uses */}
            <section className="space-y-3">
              <h2 className="font-heading font-bold text-xl text-foreground">
                5. Prohibited Activities
              </h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Upload malicious files, viruses, or corrupt document payloads designed to damage or compromise our infrastructure.</li>
                <li>Attempt to reverse-engineer, decompile, scrape, or systematically extract data from Resumly APIs without authorization.</li>
                <li>Bypass rate limits, security controls, or user authentication mechanisms.</li>
                <li>Use the service to generate fraudulent, deceptive, or unlawful materials.</li>
              </ul>
            </section>

            {/* 6. Service Availability & Changes */}
            <section className="space-y-3">
              <h2 className="font-heading font-bold text-xl text-foreground">
                6. Service Availability &amp; Modifications
              </h2>
              <p>
                We strive to maintain continuous service availability but do not guarantee uninterrupted or error-free operation. We reserve the right to modify, suspend, or discontinue any feature of Resumly at any time without prior notice.
              </p>
            </section>

            {/* 7. Limitation of Liability */}
            <section className="space-y-3 p-6 rounded-2xl bg-card border border-border">
              <h2 className="font-heading font-bold text-lg text-foreground">
                7. Limitation of Liability
              </h2>
              <p className="text-muted-foreground">
                To the maximum extent permitted by applicable law, Resumly and its maintainers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of employment opportunities, profits, or data, arising out of or in connection with your use of the service.
              </p>
            </section>

            {/* 8. Contact Information */}
            <section className="space-y-3 p-6 rounded-2xl bg-muted/30 border border-border">
              <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-orange" />
                8. Contact &amp; Inquiries
              </h2>
              <p>
                If you have questions regarding these Terms of Service, please reach out via our official profiles:
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
