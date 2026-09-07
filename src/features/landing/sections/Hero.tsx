"use client"

import React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Zap, Plus } from "lucide-react"
import { Container } from "@/components/common/primitives"
import { GradientButton } from "@/components/common/buttons"
import { useSummarizationStore } from "@/store/summarization"
import { UploadStatus } from "@/types/summarization"

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
    <section className="relative pt-32 pb-16 flex flex-col items-center overflow-hidden hero-gradient">
      <Container className="w-full text-center flex flex-col items-center gap-7 z-10">
        
        {/* Top Badging */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-brand-orange-light dark:bg-brand-orange/10 border border-brand-orange/20 px-4 py-1.5 text-xs font-semibold text-brand-orange"
        >
          <Zap className="w-3.5 h-3.5 fill-brand-orange/20" />
          AI-Powered Resume Optimizer
        </motion.div>

        {/* Serif Editorial Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-4xl sm:text-5xl lg:text-[4rem] font-extrabold text-foreground tracking-tight leading-[1.1] max-w-3xl"
        >
          Understand &amp; Improve Your <br />
          <span className="text-brand-orange">
            Resume with AI
          </span>
        </motion.h1>

        {/* Sans-serif Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed font-sans"
        >
          Resumly analyzes your experience, extracts key skills, and generates recruiter-ready professional summaries and ATS scores in seconds.
        </motion.p>

        {/* Primary CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center"
        >
          <GradientButton onClick={() => handleScrollTo("#upload")} className="px-8 py-3.5 text-base font-bold shadow-lg">
            Analyze My Resume
            <ArrowRight className="w-5 h-5 ml-1.5" />
          </GradientButton>
        </motion.div>

        {/* Sage Green Mockup Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="w-full max-w-3xl mt-8 relative"
        >
          {/* Sage-Green mockup container */}
          <div className="w-full aspect-[16/9] rounded-[2rem] bg-[#A9BCA3] dark:bg-[#495846] border border-border shadow-2xl relative overflow-hidden flex items-center justify-center p-6 md:p-10">
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
