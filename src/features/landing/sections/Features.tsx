"use client"

import React from "react"
import { motion } from "framer-motion"
import { Check, Chrome, Compass, Link as LinkIcon, Sparkles } from "lucide-react"
import { Container, LightCard, SectionLabel } from "@/components/common/primitives"
import { fadeUp, staggerChildren } from "@/lib/animations"

export const Features = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-background">
      <Container>
        
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <SectionLabel className="mx-auto">
            Product Capability
          </SectionLabel>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            Features That Make <br />
            ResumeSummary AI Stand Out
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed font-sans">
            From AI-powered writing to ATS optimization — everything you need for a job-winning resume.
          </p>
        </div>

        {/* 2x2 Features Grid */}
        <motion.div
          variants={staggerChildren(0.1, 0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans"
        >
          
          {/* Card 1: AI Writes It for You */}
          <motion.div variants={fadeUp(20)} className="group">
            <LightCard className="p-8 flex flex-col justify-between h-full hover:border-brand-orange/30 hover:card-shadow-md transition-all duration-300">
              <div className="space-y-3 mb-8">
                <span className="text-xs uppercase font-extrabold tracking-widest text-brand-orange">AI Assistant</span>
                <h3 className="text-xl font-bold text-foreground">AI Writes It for You</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI helps you write professional summaries and bullet points. Improve tone, fix mistakes, and sound confident instantly.
                </p>
              </div>

              {/* Mockup */}
              <div className="bg-[#FAF8F5] dark:bg-[#1E1C1B] rounded-2xl p-5 border border-border">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <span className="text-xs font-bold text-foreground">Professional Summary</span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-brand-orange bg-brand-orange/5 px-2 py-0.5 rounded-full border border-brand-orange/15">
                    <Sparkles className="w-3 h-3" />
                    AI Ready
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-2">Editor Template</p>
                <div className="space-y-2.5 text-xs text-foreground/80 leading-relaxed font-medium">
                  <p className="bg-card p-3 rounded-lg border border-border">
                    Write 2-4 short sentences to interest the reader. Mention your role, experience & most importantly, your biggest achievements and skills.
                  </p>
                  <p className="bg-brand-orange/5 p-3 rounded-lg border border-brand-orange/20 text-[#C25A1E] dark:text-[#F48F53] italic">
                    &ldquo;Experienced and effective Business Development manager bringing forth significant value and a genuine passion for management. With a proven track record of driving growth and fostering client relationships...&rdquo;
                  </p>
                </div>
              </div>
            </LightCard>
          </motion.div>

          {/* Card 2: Guided Resume Flow */}
          <motion.div variants={fadeUp(20)} className="group">
            <LightCard className="p-8 flex flex-col justify-between h-full hover:border-brand-orange/30 hover:card-shadow-md transition-all duration-300">
              <div className="space-y-3 mb-8">
                <span className="text-xs uppercase font-extrabold tracking-widest text-brand-orange">Workflow</span>
                <h3 className="text-xl font-bold text-foreground">Guided Resume Flow</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Build your resume step by step with clear instructions. No confusion, no guesswork, just follow and finish.
                </p>
              </div>

              {/* Mockup */}
              <div className="bg-[#FAF8F5] dark:bg-[#1E1C1B] rounded-2xl p-5 border border-border space-y-3">
                {/* Step 1 */}
                <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-brand-green flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Step 1 &bull; Personal Details</span>
                </div>
                
                {/* Step 2 */}
                <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-brand-green flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Step 2 &bull; Personal Summary</span>
                </div>

                {/* Step 3 */}
                <div className="bg-card p-4 rounded-xl border border-brand-orange shadow-md relative">
                  <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-brand-orange" />
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-5 h-5 rounded-full bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center shrink-0 text-brand-orange text-[10px] font-black">
                      3
                    </div>
                    <span className="text-xs font-black text-foreground">Step 3 &bull; Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["Management Skills", "Leadership", "Decision Making"].map((skill) => (
                      <span key={skill} className="text-[10px] font-semibold bg-brand-orange-light text-brand-orange px-2.5 py-1 rounded-full border border-brand-orange/15">
                        {skill} +
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </LightCard>
          </motion.div>

          {/* Card 3: Resume Quality Score */}
          <motion.div variants={fadeUp(20)} className="group">
            <LightCard className="p-8 flex flex-col justify-between h-full hover:border-brand-orange/30 hover:card-shadow-md transition-all duration-300">
              <div className="space-y-3 mb-8">
                <span className="text-xs uppercase font-extrabold tracking-widest text-brand-orange">Analytics</span>
                <h3 className="text-xl font-bold text-foreground">Resume Quality Score</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  See how strong your resume really is. Get instant insights and clear improvement suggestions.
                </p>
              </div>

              {/* Mockup */}
              <div className="bg-[#FAF8F5] dark:bg-[#1E1C1B] rounded-2xl p-5 border border-border flex flex-col items-center">
                <div className="w-full flex items-center justify-between border-b border-border pb-3 mb-4">
                  <span className="text-xs font-bold text-foreground">Resume Score</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">my_first_resume.docx</span>
                </div>
                
                {/* Circular Gauge SVG */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-[#EBE6E0] dark:stroke-[#3C3A39]"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset="62.8" // semi-circle / arch
                      strokeLinecap="round"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-brand-orange"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset="150" // 48% filled arch
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Gauge Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-sans mt-3">
                    <span className="text-2xl font-black text-foreground">48%</span>
                    <span className="text-[9px] text-brand-orange font-bold uppercase tracking-wider mt-0.5">Needs Work</span>
                  </div>
                </div>
              </div>
            </LightCard>
          </motion.div>

          {/* Card 4: Match Any Job Instantly */}
          <motion.div variants={fadeUp(20)} className="group">
            <LightCard className="p-8 flex flex-col justify-between h-full hover:border-brand-orange/30 hover:card-shadow-md transition-all duration-300">
              <div className="space-y-3 mb-8">
                <span className="text-xs uppercase font-extrabold tracking-widest text-brand-orange">ATS Match</span>
                <h3 className="text-xl font-bold text-foreground">Match Any Job Instantly</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Drop a job post link and let AI understand what recruiters want. Your resume gets tailored automatically for that role.
                </p>
              </div>

              {/* Mockup */}
              <div className="bg-[#FAF8F5] dark:bg-[#1E1C1B] rounded-2xl p-5 border border-border space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <div className="w-6 h-6 rounded bg-[#EBE6E0] dark:bg-stone-800 flex items-center justify-center">
                    <Chrome className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold font-mono">https://www.linkedin.com/jobs/view/...</span>
                </div>
                
                {/* Paste Area Mock */}
                <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm text-left relative">
                  <p className="text-[9px] text-muted-foreground font-semibold">Paste a link to the job you want</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-foreground truncate max-w-[80%]">https://dribbble.com/jobs/detail/149842</span>
                    <Check className="w-4 h-4 text-brand-green shrink-0" />
                  </div>
                </div>

                {/* Job Boards Icons */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-[10px] font-bold text-muted-foreground select-none">
                    <Compass className="w-3.5 h-3.5 text-blue-500" />
                    LinkedIn
                  </div>
                  <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-[10px] font-bold text-muted-foreground select-none">
                    <LinkIcon className="w-3.5 h-3.5 text-pink-500" />
                    Indeed
                  </div>
                </div>
              </div>
            </LightCard>
          </motion.div>

        </motion.div>
      </Container>
    </section>
  )
}
