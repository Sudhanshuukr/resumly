"use client"

import React, { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, FileText, Calendar, ChevronRight, RefreshCw, Star, ArrowLeft } from "lucide-react"
import { useSummarizationStore, HistoryItem } from "@/store/summarization"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export const HistorySidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const {
    history,
    isHistoryOpen,
    isLoadingHistory,
    sessionId,
    setIsHistoryOpen,
    fetchHistory,
    selectHistoryItem,
    initSession,
  } = useSummarizationStore()

  // Initialize session and load history
  useEffect(() => {
    initSession()
  }, [initSession])

  useEffect(() => {
    if (sessionId) {
      fetchHistory()
    }
  }, [sessionId, fetchHistory])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Recently parsed"
    }
  }

  const handleSelect = (item: HistoryItem) => {
    selectHistoryItem(item)
    setIsHistoryOpen(false)
    if (pathname !== "/") {
      router.push("/#summaries")
    } else {
      setTimeout(() => {
        document.querySelector("#summaries")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    }
  }

  return (
    <AnimatePresence>
      {isHistoryOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsHistoryOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Sidebar Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background border-l border-border shadow-2xl z-50 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="sm:hidden p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-foreground">Recent Analyses</h2>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Resume History</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchHistory()}
                  disabled={isLoadingHistory}
                  className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  title="Refresh history"
                  aria-label="Refresh history"
                >
                  <RefreshCw className={cn("w-4 h-4", isLoadingHistory && "animate-spin")} />
                </button>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="hidden sm:inline-flex p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                  aria-label="Close history"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingHistory && history.length === 0 ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3 animate-pulse"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-muted" />
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-28 bg-muted rounded-md" />
                            <div className="h-2.5 w-16 bg-muted/60 rounded-md" />
                          </div>
                        </div>
                        <div className="h-5 w-12 bg-muted rounded-full" />
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <div className="h-2.5 w-full bg-muted/70 rounded-md" />
                        <div className="h-2.5 w-4/5 bg-muted/50 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-2xl bg-muted/20">
                  <div className="w-12 h-12 rounded-full bg-brand-orange/5 flex items-center justify-center text-brand-orange mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">No Resumes Found</h3>
                  <p className="text-xs text-muted-foreground mt-2 max-w-[200px] mx-auto leading-relaxed">
                    Resumes parsed on this browser will appear here. Try uploading a file!
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSelect(item)}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 hover:border-brand-orange/40 hover:shadow-md transition-all cursor-pointer select-none"
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-brand-orange/5 text-brand-orange shrink-0 group-hover:scale-105 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate group-hover:text-brand-orange transition-colors">
                            {item.fileName}
                          </h4>
                          <p className="text-[11px] font-semibold text-muted-foreground mt-0.5 truncate">
                            {item.result.jobTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-brand-orange/5 border border-brand-orange/20 text-brand-orange rounded-full px-2 py-0.5">
                          <Star className="w-2.5 h-2.5 fill-brand-orange/20" />
                          {item.result.score}/100
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-card/30 backdrop-blur-md">
              <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                History is automatically synchronized using your local session identifier. Clearing browser cookies/cache may remove access to past reports.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
