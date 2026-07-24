"use client"

import React, { useRef, DragEvent, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, FileText, CheckCircle, RefreshCw, AlertTriangle, Sparkles, FileUp } from "lucide-react"
import { Container, GlassCard, Badge } from "@/components/common/primitives"
import { GradientButton, OutlineButton } from "@/components/common/buttons"
import { uploadResume } from "@/services/summarization/uploadResume"
import { useSummarizationStore } from "@/store/summarization"
import { UploadStatus, SummarizationError } from "@/types/summarization"

const handleScrollTo = (id: string) => {
  const element = document.querySelector(id)
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

export const UploadSection = () => {
  const {
    status,
    progress,
    fileName,
    error,
    setStatus,
    setProgress,
    setFileName,
    setResult,
    setError,
    reset,
    sessionId,
    sessionToken,
    fetchHistory,
    initSession,
    usage,
    setUsage,
    handleFreeLimitReached,
    user,
  } = useSummarizationStore()

  const fileSize = useRef("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    initSession()
  }, [initSession])

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (status === UploadStatus.Idle) setStatus(UploadStatus.Dragging)
  }

  const handleDragLeave = () => {
    if (status === UploadStatus.Dragging) setStatus(UploadStatus.Idle)
  }

  const processFile = async (file: File) => {
    // Client-side block if anonymous user has exhausted free limit
    if (!user && usage && usage.remaining === 0) {
      handleFreeLimitReached(usage)
      return
    }

    // Client-side size guard before even sending
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setError({
        success: false,
        code: "FILE_TOO_LARGE",
        message: "File exceeds the 10 MB size limit. Please upload a smaller file.",
      })
      return
    }

    const ext = file.name.split(".").pop()?.toLowerCase()
    if (ext !== "pdf" && ext !== "docx") {
      setError({
        success: false,
        code: "INVALID_FILE",
        message: "Only PDF and DOCX files are supported.",
      })
      return
    }

    setFileName(file.name)
    fileSize.current = `${(file.size / 1024).toFixed(1)} KB`
    setStatus(UploadStatus.Uploading)
    setProgress(0)

    try {
      const { result, id, resumeText, usage: responseUsage } = await uploadResume(file, sessionId, sessionToken, (percent) => {
        setProgress(percent)

        // Transition state labels as progress advances
        if (percent >= 90 && status !== UploadStatus.Parsing) {
          setStatus(UploadStatus.Parsing)
        }
        if (percent >= 95 && status !== UploadStatus.Generating) {
          setStatus(UploadStatus.Generating)
        }
      })

      setResult(result, id, resumeText)
      if (responseUsage) {
        setUsage(responseUsage)
      }
      fetchHistory()

      // Auto-scroll to preview after a short delay
      setTimeout(() => {
        handleScrollTo("#preview")
      }, 800)
    } catch (err: unknown) {
      const typedError = err as SummarizationError
      if (typedError && typedError.code === "FREE_LIMIT_REACHED") {
        handleFreeLimitReached(typedError.usage ?? null)
      }
      setError({
        success: false,
        code: typedError?.code ?? "UNKNOWN",
        message: typedError?.message ?? "An unexpected error occurred. Please try again.",
      })
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!user && usage && usage.remaining === 0) {
      handleFreeLimitReached(usage)
      setStatus(UploadStatus.Idle)
      return
    }
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0])
    } else {
      setStatus(UploadStatus.Idle)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0])
    }
  }

  const triggerFileSelect = () => {
    if (!user && usage && usage.remaining === 0) {
      handleFreeLimitReached(usage)
      return
    }
    fileInputRef.current?.click()
  }

  const resetUpload = () => {
    reset()
    if (fileInputRef.current) fileInputRef.current.value = ""
    fileSize.current = ""
  }

  const isIdle = status === UploadStatus.Idle || status === UploadStatus.Dragging

  return (
    <section id="upload" className="py-24 relative overflow-hidden bg-background border-t border-b border-border">
      <Container className="max-w-4xl">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge className="mx-auto">
            <UploadCloud className="w-3.5 h-3.5" />
            Interactive Workspace
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Analyze Your Resume in Real-Time
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm font-sans">
            Drag and drop your resume below. Our AI engine parses it and generates three tailored summaries instantly.
          </p>
        </div>

        {/* Upload Container Card */}
        <GlassCard className="relative p-8 md:p-12 border-border shadow-xl">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx"
            className="hidden"
            aria-label="Upload resume file"
          />

          <AnimatePresence mode="wait">
            {/* Idle & Dragging State */}
            {isIdle && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                role="button"
                tabIndex={0}
                aria-label="Drop zone — click or drag a resume file here"
                onKeyDown={(e) => e.key === "Enter" && triggerFileSelect()}
                className={`border-2 border-dashed rounded-xl p-8 md:p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 ${
                  status === UploadStatus.Dragging
                    ? "border-brand-orange bg-brand-orange/5 shadow-md"
                    : "border-border bg-[#FAF8F5]/30 dark:bg-[#1C1917]/20 hover:bg-muted hover:border-brand-orange/40"
                }`}
              >
                <div className="p-4 rounded-full bg-brand-orange/5 text-brand-orange hover:scale-105 transition-transform">
                  <FileUp className="w-8 h-8" />
                </div>
                <div className="text-center font-sans">
                  <p className="text-sm font-bold text-foreground">
                    Drag &amp; drop your resume here or <span className="text-brand-orange hover:underline">browse files</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports PDF, DOCX (Max 10 MB)
                  </p>
                  
                  {/* Anonymous Quota Usage Indicator */}
                  {!user && usage && (
                    <p className={`text-[10px] font-bold mt-4 px-3 py-1 rounded-full border inline-block ${
                      usage.remaining === 0 
                        ? "bg-brand-rose/10 border-brand-rose/20 text-brand-rose" 
                        : "bg-brand-orange/5 border-brand-orange/20 text-brand-orange"
                    }`}>
                      {usage.remaining === 0 
                        ? "Free limit reached — Sign up to continue" 
                        : `${usage.remaining} free ${usage.remaining === 1 ? "summary" : "summaries"} remaining`}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Uploading State */}
            {status === UploadStatus.Uploading && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-8 text-center font-sans"
                aria-live="polite"
                aria-label={`Uploading ${progress}%`}
              >
                <RefreshCw className="w-10 h-10 text-brand-orange animate-spin mb-4" />
                <h3 className="text-base font-bold text-foreground mb-2">Uploading Document...</h3>
                {/* eslint-disable-next-line react-hooks/refs */}
                <p className="text-xs text-muted-foreground mb-6">{fileName} ({fileSize.current})</p>
                
                <div className="w-full max-w-md bg-muted h-2.5 rounded-full overflow-hidden mb-2 border border-border">
                  <motion.div
                    className="h-full bg-brand-orange rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeInOut" }}
                  />
                </div>
                <span className="text-xs text-brand-orange font-bold font-mono">{progress}%</span>
              </motion.div>
            )}

            {/* Parsing State */}
            {status === UploadStatus.Parsing && (
              <motion.div
                key="parsing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-8 text-center font-sans"
                aria-live="polite"
              >
                <RefreshCw className="w-10 h-10 text-brand-orange animate-spin mb-4" />
                <h3 className="text-base font-bold text-foreground mb-2">Parsing Document Structure</h3>
                <p className="text-xs text-muted-foreground mb-4 max-w-sm">
                  Extracting employment records, technical competencies, and project details...
                </p>
                <Badge className="bg-brand-orange/5 border-brand-orange/20 text-brand-orange animate-pulse">
                  Step 2 of 3
                </Badge>
              </motion.div>
            )}

            {/* Generating State */}
            {status === UploadStatus.Generating && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-8 text-center font-sans"
                aria-live="polite"
              >
                <Sparkles className="w-10 h-10 text-brand-green animate-pulse mb-4" />
                <h3 className="text-base font-bold text-foreground mb-2">Generating Summaries</h3>
                <p className="text-xs text-muted-foreground mb-4 max-w-sm">
                  Applying recruiter filters and rewriting accomplishments using actionable language...
                </p>
                <Badge className="bg-brand-green/10 border-brand-green/20 text-brand-green animate-pulse">
                  Finalizing output
                </Badge>
              </motion.div>
            )}

            {/* Completed State */}
            {status === UploadStatus.Completed && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-8 text-center font-sans"
              >
                <div className="w-12 h-12 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Analysis Complete!</h3>
                <p className="text-xs text-brand-green font-semibold mb-6">Your AI summaries are ready below</p>
                
                <div className="flex items-center gap-3 p-3 bg-muted border border-border rounded-xl max-w-md w-full mb-8 text-left">
                  <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{fileName}</p>
                    {/* eslint-disable-next-line react-hooks/refs */}
                    <p className="text-[10px] text-muted-foreground">{fileSize.current} • Uploaded successfully</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <GradientButton onClick={() => handleScrollTo("#preview")} className="px-6 py-2.5">
                    View Summaries
                  </GradientButton>
                  <OutlineButton onClick={resetUpload} className="px-5 py-2.5">
                    Upload Another
                  </OutlineButton>
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {status === UploadStatus.Error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-8 text-center font-sans"
                aria-live="assertive"
              >
                <div className="w-12 h-12 rounded-full bg-brand-rose/10 border border-brand-rose/20 flex items-center justify-center text-brand-rose mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">Upload Failed</h3>
                <p className="text-xs text-brand-rose max-w-sm mb-8 leading-relaxed">
                  {error?.message ?? "An error occurred while uploading. Please try again."}
                </p>
                <OutlineButton onClick={resetUpload} className="px-5 py-2.5">
                  Try Again
                </OutlineButton>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </Container>
    </section>
  )
}
