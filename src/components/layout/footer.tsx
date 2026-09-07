"use client"

import React from "react"
import { Github, Linkedin } from "lucide-react"
import { Container } from "@/components/common/primitives"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

// Crisp custom X (Twitter) SVG icon
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

export const Footer = () => {
  const router = useRouter()
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, hashId: string) => {
    e.preventDefault()
    if (isHomePage) {
      const element = document.getElementById(hashId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
        window.history.pushState(null, "", `/#${hashId}`)
      }
    } else {
      router.push(`/#${hashId}`)
    }
  }

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      if (window.location.hash) {
        window.history.pushState(null, "", "/")
      }
    } else {
      router.push("/")
    }
  }

  return (
    <footer className="relative bg-background border-t border-border pt-16 pb-10 overflow-hidden z-10">
      <Container className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 font-sans">
        
        {/* Brand & Social Column */}
        <div className="md:col-span-6 flex flex-col gap-5">
          <a
            href="/"
            onClick={handleLogoClick}
            className="flex items-center group w-fit select-none py-1 cursor-pointer"
          >
            <span className="font-heading font-extrabold text-2xl text-foreground tracking-tight group-hover:opacity-90 transition-opacity">
              Resum<span className="text-brand-orange">ly</span>
            </span>
          </a>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md font-normal">
            Resumly helps you understand and improve your resume with AI. Generate recruiter-ready professional summaries, ATS optimization, and actionable career insights in seconds.
          </p>

          {/* Social Profiles */}
          <div className="flex items-center gap-3 pt-1">
            <a
              href="https://www.linkedin.com/in/sudhanshuukr/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-card border border-border hover:border-brand-orange/40 hover:bg-muted hover:text-brand-orange flex items-center justify-center text-muted-foreground transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-orange"
              aria-label="LinkedIn: @sudhanshuukr"
              title="LinkedIn: @sudhanshuukr"
            >
              <Linkedin className="w-4 h-4" />
            </a>

            <a
              href="https://github.com/sudhanshuukr"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-card border border-border hover:border-brand-orange/40 hover:bg-muted hover:text-brand-orange flex items-center justify-center text-muted-foreground transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-orange"
              aria-label="GitHub: @sudhanshuukr"
              title="GitHub: @sudhanshuukr"
            >
              <Github className="w-4 h-4" />
            </a>

            <a
              href="https://x.com/sudhanshuworks"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-card border border-border hover:border-brand-orange/40 hover:bg-muted hover:text-brand-orange flex items-center justify-center text-muted-foreground transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-orange"
              aria-label="X: @sudhanshuworks"
              title="X: @sudhanshuworks"
            >
              <XIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Links Columns */}
        <div className="md:col-span-6 grid grid-cols-2 gap-8 font-medium">
          {/* Product Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-foreground tracking-widest uppercase">Product</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="/#upload"
                  onClick={(e) => handleScrollTo(e, "upload")}
                  className="text-sm text-muted-foreground hover:text-brand-orange transition-colors cursor-pointer"
                >
                  Upload Resume
                </a>
              </li>
              <li>
                <a
                  href="/#summaries"
                  onClick={(e) => handleScrollTo(e, "summaries")}
                  className="text-sm text-muted-foreground hover:text-brand-orange transition-colors cursor-pointer"
                >
                  Summaries &amp; Insights
                </a>
              </li>
              <li>
                <a
                  href="/#how-it-works"
                  onClick={(e) => handleScrollTo(e, "how-it-works")}
                  className="text-sm text-muted-foreground hover:text-brand-orange transition-colors cursor-pointer"
                >
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-foreground tracking-widest uppercase">Legal</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-brand-orange transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-brand-orange transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <Container className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans font-medium text-muted-foreground">
        <p className="text-xs">
          &copy; {new Date().getFullYear()} Resumly. All rights reserved.
        </p>
        <p className="text-xs flex items-center gap-1">
          Built for modern career excellence.
        </p>
      </Container>
    </footer>
  )
}
