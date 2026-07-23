"use client"

import React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Plus } from "lucide-react"
import { Container } from "@/components/common/primitives"
import { GradientButton } from "@/components/common/buttons"
import { useSummarizationStore } from "@/store/summarization"
import { UploadStatus } from "@/types/summarization"

const Daisy = ({ className, size = 60 }: { className?: string; size?: number }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Yellow/Orange Center */}
    <circle cx="50" cy="50" r="14" fill="#F59E0B" />
    <circle cx="50" cy="50" r="10" fill="#D97706" />
    
    {/* 12 Petals */}
    {[...Array(12)].map((_, i) => {
      const angle = (i * 360) / 12
      return (
        <path
          key={i}
          d="M50 34C50 34 46 12 50 12C54 12 50 34 50 34Z"
          fill="#FAF8F5"
          stroke="#EBE6E0"
          strokeWidth="1"
          transform={`rotate(${angle} 50 50)`}
        />
      )
    })}
  </svg>
)

export const Hero = () => {
  const { result, status } = useSummarizationStore()
  const hasRealResult = status === UploadStatus.Completed && result !== null

  const displayScore = hasRealResult && result ? result.score : 92
  const displaySkills = hasRealResult && result
    ? result.skills.slice(0, 3)
    : ["Management Skills", "Analytical thinking", "Leadership"]

  const handleScrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <section className="relative min-h-screen pt-36 pb-20 flex flex-col items-center overflow-hidden hero-gradient">
      
      {/* Background Daisy Decorations */}
      <Daisy className="absolute top-24 left-8 md:left-20 opacity-30 animate-pulse pointer-events-none" size={70} />
      <Daisy className="absolute top-48 right-12 md:right-32 opacity-25 pointer-events-none" size={50} />
      <Daisy className="absolute bottom-24 left-1/4 opacity-15 pointer-events-none" size={60} />
      <Daisy className="absolute bottom-40 right-1/4 opacity-20 pointer-events-none" size={80} />

      <Container className="w-full text-center flex flex-col items-center gap-8 z-10">
        
        {/* Top Badging */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-brand-orange-light dark:bg-brand-orange/10 border border-brand-orange/20 px-4 py-1.5 text-xs font-semibold text-brand-orange"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Next-Generation Career AI
        </motion.div>

        {/* Serif Editorial Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-5xl sm:text-6xl lg:text-[4.2rem] font-extrabold text-foreground tracking-tight leading-[1.05] max-w-4xl"
        >
          Build a Job-Winning <br />
          <span className="text-brand-orange relative">
            Resume in Minutes
          </span>{" "}
          with AI
        </motion.h1>

        {/* Sans-serif Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed font-sans"
        >
          AI analyzes your experience, skills, and career goals to craft a highly detailed, ATS-friendly resume tailored to your job role.
        </motion.p>

        {/* Primary CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center"
        >
          <GradientButton onClick={() => handleScrollTo("#upload")} className="px-8 py-4 text-base font-bold shadow-lg">
            Build My Resume
            <ArrowRight className="w-5 h-5 ml-1" />
          </GradientButton>
        </motion.div>

        {/* Large Sage Green Mockup Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-4xl mt-12 relative"
        >
          {/* Framed daisies around mockup */}
          <Daisy className="absolute -top-10 -left-6 md:-top-16 md:-left-12 z-20" size={100} />
          <Daisy className="absolute -bottom-8 -right-6 md:-bottom-12 md:-right-12 z-20" size={110} />
          
          {/* Sage-Green mockup container */}
          <div className="w-full aspect-[16/9] rounded-[2rem] bg-[#A9BCA3] dark:bg-[#495846] border border-border shadow-2xl relative overflow-hidden flex items-center justify-center p-8 md:p-12">
            {/* Center Resume Mockup Document */}
            <div className="relative w-[85%] h-[90%] rounded-2xl bg-card border border-border/80 shadow-xl p-5 overflow-hidden flex flex-col gap-5 text-left select-none">
              {/* AI Scanner Line */}
              <div 
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-orange to-transparent shadow-[0_0_15px_rgba(226,114,44,0.8)] z-10 pointer-events-none"
                style={{
                  animation: "scan 4s ease-in-out infinite",
                }}
              />
              <style>{`
                @keyframes scan {
                  0% { top: 4%; }
                  50% { top: 96%; }
                  100% { top: 4%; }
                }
              `}</style>

              {/* Mock Resume Header */}
              <div className="border-b border-border pb-3 flex flex-col gap-1.5">
                <div className="h-5 w-32 bg-foreground/15 rounded-md" />
                <div className="h-3.5 w-48 bg-muted-foreground/20 rounded-md" />
                <div className="flex gap-4 mt-2">
                  <div className="h-2.5 w-24 bg-muted-foreground/10 rounded-sm" />
                  <div className="h-2.5 w-20 bg-muted-foreground/10 rounded-sm" />
                </div>
              </div>

              {/* Mock Resume Body (Skeleton Experience) */}
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <div className="h-3.5 w-28 bg-muted-foreground/20 rounded-sm" />
                  <div className="space-y-1.5 pl-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                      <div className="h-2.5 w-11/12 bg-muted-foreground/10 rounded-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                      <div className="h-2.5 w-5/6 bg-muted-foreground/10 rounded-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-3.5 w-36 bg-muted-foreground/20 rounded-sm" />
                  <div className="space-y-1.5 pl-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                      <div className="h-2.5 w-11/12 bg-muted-foreground/10 rounded-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                      <div className="h-2.5 w-3/4 bg-muted-foreground/10 rounded-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Widget 1: Resume Score — live from Zustand store */}
            <div className="absolute top-[8%] left-[6%] bg-card rounded-2xl p-3 md:p-4 shadow-xl border border-border flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="w-8 h-8 rounded-lg bg-brand-orange-light dark:bg-brand-orange/10 flex items-center justify-center">
                <motion.span
                  key={displayScore}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="font-extrabold text-sm text-brand-orange"
                >
                  {displayScore}%
                </motion.span>
              </div>
              <div className="text-left font-sans">
                <p className="text-[10px] text-muted-foreground font-semibold leading-none">Resume Score</p>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  {displayScore >= 80 ? "Highly Competitive" : displayScore >= 60 ? "Good — Improvable" : "Needs Work"}
                </p>
              </div>
            </div>

            {/* Floating Widget 2: Ask AI Coach Anything */}
            <div className="absolute bottom-[10%] left-[8%] bg-card rounded-xl py-2 px-4 shadow-xl border border-border flex items-center gap-2.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
              <p className="text-xs font-semibold text-muted-foreground">Ask AI Coach Anything...</p>
            </div>

            {/* Floating Widget 3: Skills Card */}
            <div className="absolute top-[35%] right-[5%] bg-card rounded-2xl p-4 shadow-xl border border-border w-44 md:w-52 text-left font-sans">
              <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Skills</span>
                <button className="flex items-center gap-1 text-[10px] font-bold text-white bg-brand-orange hover:bg-orange-600 px-2 py-1 rounded-md transition-colors cursor-pointer">
                  <Plus className="w-3 h-3" />
                  Add Skill
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {displaySkills.map((skill) => (
                  <div key={skill} className="text-xs font-semibold text-foreground bg-muted border border-border rounded-lg px-2.5 py-1.5">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </Container>
    </section>
  )
}
