"use client"

import React, { useState } from "react"
import { Leaf, Send, Github, Twitter, Linkedin } from "lucide-react"
import { Container } from "@/components/common/primitives"

export const Footer = () => {
  const [email, setEmail] = useState("")

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      alert(`Subscribed! Verification email sent to: ${email}`)
      setEmail("")
    }
  }

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <footer className="relative bg-background border-t border-border pt-20 pb-10 overflow-hidden z-10">
      
      <Container className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 font-sans">
        {/* Brand Column */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <a href="#" className="flex items-center gap-2 group w-fit select-none">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-orange shadow-[0_2px_8px_rgba(226,114,44,0.3)]">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-extrabold text-base text-foreground tracking-tight">
              Resume<span className="text-brand-orange font-sans font-medium">Summary</span>
            </span>
          </a>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm font-medium">
            Generate recruiter-ready professional resume summaries in seconds using advanced AI analysis. Elevate your first impression.
          </p>
          {/* Socials */}
          <div className="flex items-center gap-4">
            <a href="#" className="w-9 h-9 rounded-full bg-card border border-border hover:border-brand-orange/40 hover:bg-muted hover:text-brand-orange flex items-center justify-center text-muted-foreground transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-card border border-border hover:border-brand-orange/40 hover:bg-muted hover:text-brand-orange flex items-center justify-center text-muted-foreground transition-all">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-card border border-border hover:border-brand-orange/40 hover:bg-muted hover:text-brand-orange flex items-center justify-center text-muted-foreground transition-all">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links Columns */}
        <div className="md:col-span-4 grid grid-cols-2 gap-8 font-medium">
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-foreground tracking-widest uppercase">Product</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#features" onClick={(e) => handleScrollTo(e, "#features")} className="text-sm text-muted-foreground hover:text-brand-orange transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" onClick={(e) => handleScrollTo(e, "#how-it-works")} className="text-sm text-muted-foreground hover:text-brand-orange transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-foreground tracking-widest uppercase">Resources</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-brand-orange transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-brand-orange transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Column */}
        <div className="md:col-span-4 flex flex-col gap-4 font-medium">
          <h4 className="text-xs font-bold text-foreground tracking-widest uppercase">Stay Updated</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Subscribe to our newsletter for career advice and resume optimization tips.
          </p>
          <form onSubmit={handleSubscribe} className="relative flex items-center">
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-brand-orange focus:outline-none text-sm text-foreground placeholder-muted-foreground pr-12 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 p-2 bg-brand-orange hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Subscribe"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </Container>

      {/* Bottom Bar */}
      <Container className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans font-medium text-muted-foreground">
        <p className="text-xs">
          &copy; {new Date().getFullYear()} ResumeSummary AI. All rights reserved.
        </p>
        <p className="text-xs">
          Designed with ❤️ for modern candidates.
        </p>
      </Container>
    </footer>
  )
}
