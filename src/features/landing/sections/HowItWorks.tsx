"use client"

import React from "react"
import { motion } from "framer-motion"
import { Upload, Cpu, Award, FileText, CheckCircle } from "lucide-react"
import { Container, LightCard, SectionLabel } from "@/components/common/primitives"
import { fadeUp, staggerChildren } from "@/lib/animations"

interface Step {
  num: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

export const HowItWorks = () => {
  const steps: Step[] = [
    {
      num: "01",
      title: "Upload Resume",
      description: "Drop your PDF or DOCX file. Our engine parses structural elements immediately.",
      icon: Upload,
      iconBg: "bg-brand-orange/5 dark:bg-brand-orange/10",
      iconColor: "text-brand-orange",
    },
    {
      num: "02",
      title: "AI Analysis",
      description: "Deep NLP reads experience blocks and matches them to active vacancy criteria.",
      icon: Cpu,
      iconBg: "bg-brand-orange/5 dark:bg-brand-orange/10",
      iconColor: "text-brand-orange",
    },
    {
      num: "03",
      title: "Extract Skills",
      description: "Tags core technical keywords and key leadership attributes automatically.",
      icon: Award,
      iconBg: "bg-brand-orange/5 dark:bg-brand-orange/10",
      iconColor: "text-brand-orange",
    },
    {
      num: "04",
      title: "Generate Summary",
      description: "Writes multiple summaries based on professional, ATS, and executive criteria.",
      icon: FileText,
      iconBg: "bg-brand-orange/5 dark:bg-brand-orange/10",
      iconColor: "text-brand-orange",
    },
    {
      num: "05",
      title: "Copy & Use",
      description: "Copy your chosen summary or generate customized LinkedIn bios in one click.",
      icon: CheckCircle,
      iconBg: "bg-brand-orange/5 dark:bg-brand-orange/10",
      iconColor: "text-brand-orange",
    },
  ]

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-background">
      <Container>
        
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <SectionLabel className="mx-auto">
            The AI Pipeline
          </SectionLabel>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            How ResumeSummary AI Works
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed font-sans">
            Experience the automated pipeline transforming basic text descriptions into compelling professional pitches.
          </p>
        </div>

        {/* Desktop horizontal pipeline */}
        <div className="hidden lg:block relative font-sans font-medium">
          {/* Connector line */}
          <div className="absolute top-[52px] left-[10%] right-[10%] h-px bg-brand-orange/20 z-0" />

          <motion.div
            variants={staggerChildren(0.1, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-5 gap-4 relative z-10"
          >
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <motion.div key={step.num} variants={fadeUp(16)} className="flex flex-col items-center text-center group">
                  {/* Step circle */}
                  <div className={`w-[52px] h-[52px] rounded-2xl ${step.iconBg} border border-border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <Icon className={`w-6 h-6 ${step.iconColor}`} />
                  </div>
                  {/* Step number */}
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{step.num}</span>
                  <LightCard className="w-full p-5 group-hover:card-shadow-md transition-all duration-300 hover:border-brand-orange/30">
                    <h3 className="text-sm font-bold text-foreground mb-2 group-hover:text-brand-orange transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                  </LightCard>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Mobile vertical stepper */}
        <div className="lg:hidden flex flex-col gap-5 relative font-sans font-medium">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={idx} className="relative flex gap-4 items-stretch group">
                {/* Step indicator column */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl ${step.iconBg} border border-border flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon className={`w-5 h-5 ${step.iconColor}`} />
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-px bg-border flex-1 my-2" />
                  )}
                </div>

                <LightCard className="flex-1 p-5 mb-1 hover:border-brand-orange/30">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{step.num}</span>
                  <h3 className="text-sm font-bold text-foreground mt-1 mb-1.5">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </LightCard>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
