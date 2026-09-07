"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Cpu, Check, Copy, Zap, Star, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export const AnimatedWorkflow = () => {
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState(1) // 1: upload, 2: scan, 3: result

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev === 3 ? 1 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleCopy = () => {
    setCopied(true)
    navigator.clipboard.writeText("Experienced Senior Full Stack Engineer specializing in scaling high-performance microservices and cloud systems.")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative w-full min-h-[520px] flex items-center justify-center">
      {/* Warm background blob */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-brand-amber/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-brand-orange/8 blur-[60px] rounded-full pointer-events-none" />

      {/* Main product card */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full max-w-[360px] z-10"
      >
        <div className="bg-white rounded-3xl card-shadow-lg border border-[#E5E7EB] overflow-hidden">
          {/* Card header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F3F4F6]">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
            <div className="ml-2 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-brand-orange fill-brand-orange/20" />
              <span className="text-xs font-semibold text-[#374151]">AI Summary Generator</span>
            </div>
          </div>

          {/* Input document row */}
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-3 bg-[#F9FAFB] rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-brand-orange-light border border-brand-orange/20 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-brand-orange" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#111827] truncate">jenkins_resume.pdf</p>
                <p className="text-[10px] text-[#9CA3AF]">128 KB • PDF Document</p>
              </div>
              <div className={cn(
                "ml-auto w-2 h-2 rounded-full shrink-0 transition-colors duration-500",
                step === 1 ? "bg-[#D1D5DB]" : step === 2 ? "bg-brand-amber animate-pulse" : "bg-brand-green"
              )} />
            </div>
          </div>

          {/* AI Processing row */}
          <div className={cn(
            "px-5 py-4 border-b border-[#F3F4F6] transition-all duration-500",
            step === 2 && "bg-brand-orange-light/40"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500",
                step === 2 ? "bg-brand-orange text-white shadow-[0_2px_8px_rgba(249,115,22,0.4)]" : "bg-[#F3F4F6] text-[#9CA3AF]"
              )}>
                <Cpu className={cn("w-4 h-4", step === 2 && "animate-spin")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#111827]">AI Analysis</p>
                <p className="text-[10px] text-[#9CA3AF] truncate">
                  {step === 1 && "Awaiting document..."}
                  {step === 2 && "Extracting key competencies..."}
                  {step === 3 && "Optimization complete ✓"}
                </p>
              </div>
            </div>
            {step === 2 && (
              <div className="mt-3 w-full bg-[#E5E7EB] h-1 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4.5, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-brand-amber to-brand-orange rounded-full"
                />
              </div>
            )}
          </div>

          {/* Output summary */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">AI Output</span>
              <button
                onClick={handleCopy}
                className={cn(
                  "p-1.5 rounded-lg transition-all cursor-pointer",
                  copied ? "bg-brand-green/10 text-brand-green" : "bg-[#F3F4F6] text-[#9CA3AF] hover:bg-[#E5E7EB] hover:text-[#374151]"
                )}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="text-[11px] text-[#374151] leading-relaxed font-medium min-h-[56px]">
              <AnimatePresence mode="wait">
                {step !== 3 ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 py-4"
                  >
                    <div className="w-1.5 h-1.5 bg-[#D1D5DB] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-[#D1D5DB] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-[#D1D5DB] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="text-[10px] text-[#9CA3AF] ml-1">Generating summary...</span>
                  </motion.div>
                ) : (
                  <motion.p
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    Experienced Senior Full Stack Engineer specializing in scaling high-performance microservices and cloud architecture. Reduced hosting costs by 32%.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating chips — positioned around the card */}

      {/* Top-left: Resume Score */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-8 left-0 z-20"
      >
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 card-shadow-md border border-[#E5E7EB]">
          <div className="w-7 h-7 rounded-lg bg-brand-orange flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <div>
            <p className="text-[10px] text-[#9CA3AF] font-medium leading-none mb-0.5">Resume Score</p>
            <p className="text-sm font-black text-[#111827]">92%</p>
          </div>
        </div>
      </motion.div>

      {/* Bottom-left: Build time chip */}
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute bottom-10 left-0 z-20"
      >
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 card-shadow-md border border-[#E5E7EB]">
          <div className="w-7 h-7 rounded-lg bg-brand-green/15 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-brand-green" />
          </div>
          <div>
            <p className="text-[10px] text-[#9CA3AF] font-medium leading-none mb-0.5">Build Time</p>
            <p className="text-xs font-bold text-brand-green">Under 5 mins</p>
          </div>
        </div>
      </motion.div>

      {/* Top-right: Skills chip group */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute top-6 right-0 z-20"
      >
        <div className="bg-white rounded-xl px-3 py-2.5 card-shadow-md border border-[#E5E7EB] min-w-[130px]">
          <p className="text-[10px] text-[#9CA3AF] font-medium mb-2">Skills Detected</p>
          <div className="flex flex-wrap gap-1">
            {["React", "Node.js", "AWS"].map((skill) => (
              <span key={skill} className="text-[9px] font-semibold bg-brand-orange-light text-brand-orange px-2 py-0.5 rounded-full border border-brand-orange/15">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom-right: Match score */}
      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
        className="absolute bottom-8 right-0 z-20"
      >
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 card-shadow-md border border-[#E5E7EB]">
          <div className="w-2 h-2 rounded-full bg-brand-green" />
          <p className="text-[10px] font-semibold text-[#374151]">ATS Optimized</p>
        </div>
      </motion.div>
    </div>
  )
}
