"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap, Copy, Check, RefreshCw, FileText, ArrowRight,
  Edit3, ChevronDown, ChevronUp, Lightbulb, Target, Star,
  Briefcase, Clock, BarChart3, Download
} from "lucide-react"
import { Container, GlassCard, Badge } from "@/components/common/primitives"
import { mockSummaryData } from "@/mock/summary"
import { cn } from "@/lib/utils"
import { useSummarizationStore, SummaryVariant } from "@/store/summarization"
import { UploadStatus, SummarizationResult } from "@/types/summarization"

export const LivePreview = () => {
  const {
    result,
    status,
    selectedVariant,
    setSelectedVariant,
    resumeText,
    regenerateSummaries,
    rewriteActiveSummary,
    updateActiveSummaryText,
    activeDatabaseId,
  } = useSummarizationStore()

  const hasRealResult = result !== null && activeDatabaseId !== null

  const [isTransforming, setIsTransforming] = useState(false)
  const [isRewriting, setIsRewriting] = useState(false)
  const [toneMenuOpen, setToneMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [rewriteCount, setRewriteCount] = useState(0)
  const [showInsights, setShowInsights] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [exportStatus, setExportStatus] = useState<"idle" | "pdf" | "docx">("idle")
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const isPending = status === UploadStatus.Uploading || 
                    status === UploadStatus.Parsing || 
                    status === UploadStatus.Generating

  const showSpinner = isTransforming || isRewriting || isPending || isSavingEdit

  // Auto-expand insights when a real result arrives
  useEffect(() => {
    if (hasRealResult) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowInsights(true)
    }
  }, [hasRealResult])

  const triggerTransformation = () => {
    setIsTransforming(true)
    setTimeout(() => setIsTransforming(false), 1000)
  }

  const handleTabChange = (variant: SummaryVariant) => {
    if (!isTransforming && !isEditing) {
      setSelectedVariant(variant)
      setRewriteCount(0)
      triggerTransformation()
    }
  }

  const handleStartEdit = () => {
    if (showSpinner) return
    setEditText(getActiveText())
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditText("")
  }

  const handleSaveEdit = async () => {
    if (!editText.trim()) return
    setIsSavingEdit(true)
    try {
      await updateActiveSummaryText(editText.trim())
      setIsEditing(false)
    } catch (err) {
      console.error("Failed to save edited summary:", err)
      alert("Failed to save changes. Please try again.")
    } finally {
      setIsSavingEdit(false)
    }
  }

  const getActiveText = (): string => {
    if (result) {
      return result[selectedVariant]
    }
    // Fall back to rich mock data
    const baseText = mockSummaryData[selectedVariant]
    if (rewriteCount > 0) {
      if (selectedVariant === "professional") {
        return `[Revised Version ${rewriteCount}] Lead Full Stack Engineer with 6+ years driving product architectures. Pioneered containerized deployments scaling to 5M+ active users, resulting in a 32% hosting expense reduction.`
      } else if (selectedVariant === "ats") {
        return `[ATS V${rewriteCount}] Senior Software Engineer specializing in AWS cloud architecture, Kubernetes containerization, and backend microservices. Delivered cost savings of 32% in server infrastructure.`
      } else {
        return `[Executive V${rewriteCount}] Senior Technology Leader who engineered cloud migrations and scalable backend frameworks supporting 5M+ active users. Direct manager of engineering squads, slashing operational costs by 32%.`
      }
    }
    return baseText
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRewriteTone = async (tone: string) => {
    if (!hasRealResult) {
      setRewriteCount((prev) => prev + 1)
      triggerTransformation()
      return
    }

    setIsRewriting(true)
    try {
      await rewriteActiveSummary(tone)
    } finally {
      setIsRewriting(false)
    }
  }

  const handleRegenerate = async () => {
    if (!hasRealResult) {
      triggerTransformation()
      return
    }

    if (resumeText) {
      await regenerateSummaries()
    } else {
      alert("No cached resume text found to regenerate. Re-generation is not supported for historical records loaded from the sidebar unless you upload the file again.")
    }
  }

  const displaySkills = hasRealResult && result
    ? result.skills
    : ["React", "TypeScript", "Node.js", "AWS", "Docker"]

  const displayScore = hasRealResult && result ? result.score : 85
  const displayTips = hasRealResult && result
    ? result.tips
    : [
        "Add quantified achievements to your work experience.",
        "Include a dedicated skills section with industry keywords.",
        "Ensure your contact information is complete and up to date.",
      ]
  const displayJobTitle = hasRealResult && result ? result.jobTitle : "Senior Software Engineer"
  const displayIndustry = hasRealResult && result ? result.detectedIndustry : "Software Engineering"
  const displayExperience = hasRealResult && result ? result.detectedExperience : "5–7 years"
  const displayWordCount = hasRealResult && result ? result.wordCount : 420
  const displayReadingTime = hasRealResult && result ? result.readingTime : "2 min read"

  const getActiveResultObject = (): SummarizationResult => {
    if (hasRealResult && result) {
      return result
    }
    return {
      professional: mockSummaryData.professional,
      ats: mockSummaryData.ats,
      executive: mockSummaryData.executive,
      [selectedVariant]: getActiveText(),
      skills: displaySkills,
      score: displayScore,
      tips: displayTips,
      jobTitle: displayJobTitle,
      detectedIndustry: displayIndustry,
      detectedExperience: displayExperience,
      wordCount: displayWordCount,
      readingTime: displayReadingTime,
    }
  }

  const handleExportPDF = async () => {
    const activeResult = getActiveResultObject()
    setExportStatus("pdf")
    setExportMenuOpen(false)
    try {
      const { exportToPDF } = await import("@/lib/documentExporter")
      await exportToPDF(activeResult, selectedVariant)
    } catch (err) {
      console.error("Failed to export PDF:", err)
      alert("An error occurred while generating the PDF document. Please try again.")
    } finally {
      setExportStatus("idle")
    }
  }

  const handleExportDocx = async () => {
    const activeResult = getActiveResultObject()
    setExportStatus("docx")
    setExportMenuOpen(false)
    try {
      const { exportToDocx } = await import("@/lib/documentExporter")
      await exportToDocx(activeResult, selectedVariant)
    } catch (err) {
      console.error("Failed to export Word document:", err)
      alert("An error occurred while generating the Word document. Please try again.")
    } finally {
      setExportStatus("idle")
    }
  }

  return (
    <section id="summaries" className="scroll-mt-20 py-24 relative overflow-hidden bg-background border-t border-b border-border">
      <Container>

        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge className="mx-auto">
            <Zap className="w-3.5 h-3.5 fill-brand-orange/20" />
            {hasRealResult ? "Your AI Results" : "Summary Output"}
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {hasRealResult ? "Your Resume, Transformed" : "AI Summaries & ATS Analysis"}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm font-sans">
            {hasRealResult
              ? "Three tailored summaries generated from your resume. Select a style, copy, and export."
              : "Review generated Professional, ATS, and Executive summaries tailored to your target role."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 items-stretch relative">

          {/* Left Side: Original Resume / Meta Info */}
          <div className="lg:col-span-5 flex flex-col font-sans">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 ml-2">
              {hasRealResult ? "Resume Details" : "Original Document Input"}
            </h3>
            <GlassCard className="p-6 flex-1 flex flex-col border-border bg-card min-h-[350px]">
              {hasRealResult && result ? (
                <>
                  {/* Meta overview cards */}
                  <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
                    <div className="p-2 bg-brand-orange/5 rounded-lg text-brand-orange">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{displayJobTitle}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono">{displayIndustry}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/50 rounded-xl p-3 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Experience</span>
                      </div>
                      <p className="text-sm font-bold text-foreground">{displayExperience}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Words</span>
                      </div>
                      <p className="text-sm font-bold text-foreground">{displayWordCount} · {displayReadingTime}</p>
                    </div>
                  </div>

                  {/* Skills chips */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Detected Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {displaySkills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs font-semibold bg-brand-orange/5 border border-brand-orange/20 text-brand-orange rounded-lg px-2.5 py-1"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Score gauge */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Resume Score</span>
                      <span className="text-sm font-extrabold text-brand-orange">{displayScore}/100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full border border-border overflow-hidden">
                      <motion.div
                        className="h-full bg-brand-orange rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${displayScore}%` }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                      />
                    </div>
                  </div>
                </>
              ) : status === UploadStatus.Uploading || status === UploadStatus.Parsing || status === UploadStatus.Generating ? (
                <div className="flex-1 flex flex-col space-y-4 animate-pulse">
                  {/* Profile Header Skeleton */}
                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="w-10 h-10 rounded-lg bg-muted" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-40 bg-muted rounded-md" />
                      <div className="h-3 w-24 bg-muted/60 rounded-md" />
                    </div>
                  </div>
                  {/* Metrics Skeleton */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/40 rounded-xl p-3 border border-border space-y-2">
                      <div className="h-2.5 w-16 bg-muted rounded" />
                      <div className="h-4 w-20 bg-muted/80 rounded" />
                    </div>
                    <div className="bg-muted/40 rounded-xl p-3 border border-border space-y-2">
                      <div className="h-2.5 w-14 bg-muted rounded" />
                      <div className="h-4 w-24 bg-muted/80 rounded" />
                    </div>
                  </div>
                  {/* Skills Skeleton */}
                  <div className="space-y-2 pt-1">
                    <div className="h-2.5 w-24 bg-muted rounded" />
                    <div className="flex flex-wrap gap-1.5">
                      <div className="h-6 w-20 bg-muted/60 rounded-lg" />
                      <div className="h-6 w-24 bg-muted/60 rounded-lg" />
                      <div className="h-6 w-16 bg-muted/60 rounded-lg" />
                    </div>
                  </div>
                  {/* Score Skeleton */}
                  <div className="mt-auto pt-4 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-2.5 w-20 bg-muted rounded" />
                      <div className="h-3 w-10 bg-muted rounded" />
                    </div>
                    <div className="h-2 bg-muted rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/50 rounded-xl bg-muted/5">
                  <FileText className="w-8 h-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-bold text-foreground mb-1">No document uploaded</p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[250px]">
                    Upload your resume in the section above to view the parsed details here.
                  </p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Middle: Connector */}
          <div className="lg:col-span-1 flex lg:flex-col items-center justify-center py-4 lg:py-0">
            <div className="hidden lg:flex flex-col items-center gap-2 h-full py-10 relative">
              <div className="w-[1.5px] bg-border flex-1 relative overflow-hidden">
                {isTransforming && (
                  <motion.div
                    initial={{ top: "-100%" }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 1.0, ease: "easeInOut" }}
                    className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-brand-orange to-transparent"
                  />
                )}
              </div>
              <div className={cn(
                "w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground transition-all shadow-sm",
                isTransforming && "border-brand-orange/30 text-brand-orange shadow-[0_0_15px_rgba(226,114,44,0.15)]"
              )}>
                <ArrowRight className={cn("w-4 h-4 transition-transform duration-500", isTransforming && "rotate-180 text-brand-orange")} />
              </div>
              <div className="w-[1.5px] bg-border flex-1" />
            </div>
            <div className="lg:hidden flex items-center gap-4 w-full justify-center">
              <div className="h-[1px] bg-border flex-1" />
              <div className={cn(
                "w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground transition-all shadow-sm",
                isTransforming && "border-brand-orange/30 text-brand-orange animate-pulse"
              )}>
                <Zap className="w-4 h-4 fill-brand-orange/20" />
              </div>
              <div className="h-[1px] bg-border flex-1" />
            </div>
          </div>

          {/* Right Side: AI Summary */}
          <div className="lg:col-span-5 flex flex-col font-sans">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 ml-2">
              AI Summary Output
            </h3>
            <GlassCard className="p-6 flex-1 flex flex-col border-border bg-card shadow-lg min-h-[350px]">
              {hasRealResult && result ? (
                <>
                  {/* Style Tabs */}
                  <div className="flex bg-muted p-1 rounded-xl gap-1 mb-6 border border-border/50">
                    {(["professional", "ats", "executive"] as SummaryVariant[]).map((variant) => (
                      <button
                        key={variant}
                        onClick={() => handleTabChange(variant)}
                        disabled={isEditing}
                        className={cn(
                          "flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer",
                          selectedVariant === variant
                            ? "bg-brand-orange text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                          isEditing && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {variant === "ats" ? "ATS Optimized" : variant}
                      </button>
                    ))}
                  </div>

                  {/* Generated text or Edit Area */}
                  <div className="flex-1 relative mb-6 bg-muted/20 p-4 rounded-xl border border-border/40 min-h-[160px] flex flex-col justify-between">
                    <AnimatePresence mode="wait">
                      {showSpinner ? (
                        <motion.div
                          key="loader"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex flex-col justify-between p-4"
                        >
                          <div className="space-y-2.5 animate-pulse pt-1">
                            <div className="h-3.5 w-11/12 bg-muted/60 rounded-md" />
                            <div className="h-3.5 w-full bg-muted/50 rounded-md" />
                            <div className="h-3.5 w-4/5 bg-muted/40 rounded-md" />
                          </div>
                          <div className="flex items-center justify-center gap-2 pt-3 border-t border-border/20">
                            <RefreshCw className="w-3.5 h-3.5 text-brand-orange animate-spin" />
                            <span className="text-xs text-muted-foreground font-semibold">
                              {isRewriting 
                                ? "Polishing tone with AI..." 
                                : isPending 
                                  ? "Regenerating summaries..." 
                                  : isSavingEdit
                                    ? "Saving changes..."
                                    : "Re-indexing credentials..."}
                            </span>
                          </div>
                        </motion.div>
                      ) : isEditing ? (
                        <motion.div
                          key="edit-container"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col flex-1 h-full gap-4"
                        >
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full flex-1 min-h-[120px] bg-transparent border border-border/30 focus:border-brand-orange/50 rounded-xl p-3 text-sm text-foreground/90 leading-relaxed font-semibold outline-none resize-none focus:ring-1 focus:ring-brand-orange/30 transition-all font-sans"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 pt-2 border-t border-border/20">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1.5 rounded-lg bg-brand-orange border border-brand-orange text-xs font-bold text-white hover:bg-orange-600 hover:shadow-[0_0_10px_rgba(226,114,44,0.2)] transition-all cursor-pointer"
                            >
                              Save Changes
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key={selectedVariant + rewriteCount + (hasRealResult ? "real" : "mock")}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-foreground/90 leading-relaxed font-semibold cursor-pointer group/text relative pr-8 flex-1"
                          onClick={handleStartEdit}
                          title="Click to edit summary"
                        >
                          <TypingText text={getActiveText()} />
                          <div className="absolute top-0 right-0 opacity-0 group-hover/text:opacity-100 transition-opacity duration-200 text-brand-orange p-1 rounded-lg bg-brand-orange/5 border border-brand-orange/20">
                            <Edit3 className="w-3.5 h-3.5" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 border-t border-border pt-4">
                    <div className="relative flex-1 flex">
                      <button
                        onClick={() => setToneMenuOpen(!toneMenuOpen)}
                        disabled={isTransforming || isRewriting || isEditing}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-muted text-xs font-bold text-foreground hover:bg-muted/80 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Rewrite Tone
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>

                      <AnimatePresence>
                        {toneMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setToneMenuOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-full left-0 mb-2 w-48 bg-background border border-border rounded-xl shadow-lg z-40 p-1.5 space-y-1 font-sans text-left"
                            >
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">Select Tone</p>
                              {[
                                { key: "confident", label: "Confident", desc: "Authoritative & assured" },
                                { key: "technical", label: "Technical", desc: "Methodology & stack dense" },
                                { key: "action-oriented", label: "Action-Oriented", desc: "Verbs & results first" },
                                { key: "creative", label: "Creative", desc: "Expressive & innovative" },
                              ].map((item) => (
                                <button
                                  key={item.key}
                                  onClick={() => {
                                    setToneMenuOpen(false)
                                    handleRewriteTone(item.key)
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors flex flex-col cursor-pointer"
                                >
                                  <span className="text-xs font-bold text-foreground">{item.label}</span>
                                  <span className="text-[9px] text-muted-foreground">{item.desc}</span>
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={handleRegenerate}
                      disabled={isTransforming || isRewriting || exportStatus !== "idle" || isEditing}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-muted text-xs font-bold text-foreground hover:bg-muted/80 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate
                    </button>
                    <button
                      onClick={handleCopy}
                      disabled={isTransforming || exportStatus !== "idle" || isEditing}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer disabled:opacity-50",
                        copied
                          ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                          : "bg-brand-orange text-white hover:bg-orange-600 border-brand-orange hover:shadow-[0_0_15px_rgba(226,114,44,0.2)]"
                      )}
                    >
                      {copied ? (
                        <><Check className="w-3.5 h-3.5" />Copied!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" />Copy</>
                      )}
                    </button>
                    <div className="relative flex-1 flex">
                      <button
                        onClick={() => setExportMenuOpen(!exportMenuOpen)}
                        disabled={isTransforming || isRewriting || exportStatus !== "idle" || isEditing}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-muted text-xs font-bold text-foreground hover:bg-muted/80 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {exportStatus === "idle" ? (
                          <Download className="w-3.5 h-3.5" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-orange" />
                        )}
                        {exportStatus === "idle" ? "Export" : "Generating..."}
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>

                      <AnimatePresence>
                        {exportMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setExportMenuOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-full right-0 mb-2 w-48 bg-background border border-border rounded-xl shadow-lg z-40 p-1.5 space-y-1 font-sans text-left"
                            >
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">Export Document</p>
                              <button
                                onClick={handleExportPDF}
                                disabled={exportStatus !== "idle"}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 border-none"
                              >
                                <FileText className="w-3.5 h-3.5 text-brand-orange" />
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-foreground">Download PDF</span>
                                  <span className="text-[9px] text-muted-foreground">Polished Candidate Sheet</span>
                                </div>
                              </button>
                              <button
                                onClick={handleExportDocx}
                                disabled={exportStatus !== "idle"}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 border-none"
                              >
                                <FileText className="w-3.5 h-3.5 text-blue-500" />
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-foreground">Download Word (.docx)</span>
                                  <span className="text-[9px] text-muted-foreground">Editable MS Word Doc</span>
                                </div>
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/50 rounded-xl bg-muted/5">
                  <Zap className="w-8 h-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-bold text-foreground mb-1">No summary generated</p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[250px]">
                    Upload your resume to see your generated professional, ATS, and executive summaries.
                  </p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        {/* AI Insights Panel — collapsible, appears after real upload */}
        <AnimatePresence>
          {hasRealResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10"
            >
              <button
                onClick={() => setShowInsights((v) => !v)}
                className="w-full flex items-center justify-between px-6 py-4 bg-card border border-border rounded-2xl hover:bg-muted/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-brand-orange/5 text-brand-orange">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    AI Insights {hasRealResult ? "" : "(Demo)"}
                  </span>
                  <Badge className="text-[10px] py-0.5 bg-brand-orange/5 border-brand-orange/20 text-brand-orange">
                    {displayScore}/100 score
                  </Badge>
                </div>
                <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {showInsights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              <AnimatePresence>
                {showInsights && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Tips cards */}
                      {displayTips.map((tip, i) => (
                        <div
                          key={i}
                          className="p-4 bg-card border border-border rounded-2xl hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-brand-orange/5">
                              {i === 0 ? <Target className="w-3.5 h-3.5 text-brand-orange" /> :
                               i === 1 ? <Star className="w-3.5 h-3.5 text-brand-orange" /> :
                                         <Zap className="w-3.5 h-3.5 text-brand-orange" />}
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              Tip {i + 1}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/90 leading-relaxed font-sans">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      </Container>
    </section>
  )
}

const TypingText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    let active = true
    let i = 0
    const words = text.split(" ")

    Promise.resolve().then(() => {
      if (active) setDisplayedText("")
    })

    const timer = setInterval(() => {
      if (!active) return
      if (i < words.length) {
        const currentWord = words[i]
        setDisplayedText((prev) => (prev ? prev + " " + currentWord : currentWord))
        i++
      } else {
        clearInterval(timer)
      }
    }, 28)

    return () => {
      active = false
      clearInterval(timer)
    }
  }, [text])

  return <span>{displayedText}</span>
}
