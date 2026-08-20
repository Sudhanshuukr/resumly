// ============================================================
// Zustand store — single source of truth for the summarization
// feature. No React Context, no prop drilling, no rerenders
// outside of components that actually consume this state.
// ============================================================

import { create } from "zustand"
import {
  SummarizationResult,
  SummarizationError,
  UploadStatus,
} from "@/types/summarization"

export type SummaryVariant = "professional" | "ats" | "executive"

export interface HistoryItem {
  id: string
  createdAt: string
  fileName: string
  result: SummarizationResult
}

interface SummarizationState {
  // ── State ──────────────────────────────────────────────────
  status: UploadStatus
  result: SummarizationResult | null
  error: SummarizationError | null
  fileName: string
  progress: number
  selectedVariant: SummaryVariant
  usage: { used: number; limit: number; remaining: number } | null
  authModalReason: "default" | "limit_reached"
  
  // ── Database History State ────────────────────────────────
  sessionId: string
  history: HistoryItem[]
  isHistoryOpen: boolean
  isLoadingHistory: boolean

  // ── Authentication State ──────────────────────────────────
  user: any | null
  sessionToken: string | null
  isAuthModalOpen: boolean

  // ── AI Regeneration & Tone State ──────────────────────────
  resumeText: string
  activeDatabaseId: string | null

  // ── Actions ────────────────────────────────────────────────
  setStatus: (status: UploadStatus) => void
  setResult: (result: SummarizationResult, activeDatabaseId?: string, resumeText?: string) => void
  setError: (error: SummarizationError) => void
  setProgress: (progress: number) => void
  setFileName: (name: string) => void
  setSelectedVariant: (variant: SummaryVariant) => void
  setUsage: (usage: { used: number; limit: number; remaining: number } | null) => void
  setAuthModalReason: (reason: "default" | "limit_reached") => void
  fetchUsage: () => Promise<void>
  handleFreeLimitReached: (usage: { used: number; limit: number; remaining: number } | null) => void
  
  // ── Database History Actions ──────────────────────────────
  setSessionId: (id: string) => void
  setIsHistoryOpen: (isOpen: boolean) => void
  initSession: () => void
  fetchHistory: () => Promise<void>
  selectHistoryItem: (item: HistoryItem) => void
  
  // ── Authentication Actions ────────────────────────────────
  setUser: (user: any, token: string | null) => void
  setIsAuthModalOpen: (isOpen: boolean) => void
  claimGuestHistory: () => Promise<void>
  
  // ── AI Live Tweak Actions ─────────────────────────────────
  regenerateSummaries: () => Promise<void>
  rewriteActiveSummary: (tone: string) => Promise<void>
  updateActiveSummaryText: (text: string) => Promise<void>
  
  reset: () => void
}

const initialState = {
  status: UploadStatus.Idle,
  result: null,
  error: null,
  fileName: "",
  progress: 0,
  selectedVariant: "professional" as SummaryVariant,
  history: [] as HistoryItem[],
  isHistoryOpen: false,
  isLoadingHistory: false,
  
  user: null,
  sessionToken: null,
  isAuthModalOpen: false,
  
  resumeText: "",
  activeDatabaseId: null,

  usage: null,
  authModalReason: "default" as "default" | "limit_reached",
}

export const useSummarizationStore = create<SummarizationState>((set, get) => ({
  ...initialState,
  sessionId: "",

  setStatus: (status) => set({ status }),
  setResult: (result, activeDatabaseId, resumeText) =>
    set((state) => ({
      result,
      status: UploadStatus.Completed,
      error: null,
      progress: 100,
      activeDatabaseId: activeDatabaseId || state.activeDatabaseId,
      resumeText: resumeText || state.resumeText,
    })),
  setError: (error) =>
    set({ error, status: UploadStatus.Error, progress: 0 }),
  setProgress: (progress) => set({ progress }),
  setFileName: (fileName) => set({ fileName }),
  setSelectedVariant: (selectedVariant) => set({ selectedVariant }),
  setUsage: (usage) => set({ usage }),
  setAuthModalReason: (authModalReason) => set({ authModalReason }),
  
  fetchUsage: async () => {
    const { sessionToken } = get()
    try {
      const headers: Record<string, string> = {}
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`
      }
      const res = await fetch("/api/summarize/usage", { headers })
      if (res.ok) {
        const json = await res.json()
        set({ usage: json.usage })
      }
    } catch (err) {
      console.error("[store] Error fetching usage status:", err)
    }
  },
  
  handleFreeLimitReached: (usage) => {
    set({
      authModalReason: "limit_reached",
      isAuthModalOpen: true,
    })
    if (usage) {
      set({ usage })
    }
  },
  
  setSessionId: (sessionId) => set({ sessionId }),
  setIsHistoryOpen: (isHistoryOpen) => set({ isHistoryOpen }),
  
  setUser: (user, sessionToken) => {
    set({ user, sessionToken })
    if (user) {
      set({ usage: null, authModalReason: "default" })
      get().claimGuestHistory()
    } else {
      get().fetchUsage()
    }
  },
  setIsAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
  
  initSession: () => {
    if (typeof window === "undefined") return
    let id = localStorage.getItem("resume_ai_session_id")
    if (!id) {
      id = typeof crypto !== "undefined" && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36)
      localStorage.setItem("resume_ai_session_id", id!)
    }
    set({ sessionId: id })
    get().fetchUsage()
  },
  
  fetchHistory: async () => {
    const { sessionId, sessionToken } = get()
    if (!sessionId) return
    set({ isLoadingHistory: true })
    try {
      const headers: Record<string, string> = {}
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`
      }
      
      const res = await fetch(`/api/history?session_id=${sessionId}`, { headers })
      const json = await res.json()
      if (json.success) {
        set({ history: json.data })
      } else {
        set({ history: [] })
      }
    } catch (err) {
      console.error("[store] Error fetching history:", err)
      set({ history: [] })
    } finally {
      set({ isLoadingHistory: false })
    }
  },
  
  claimGuestHistory: async () => {
    const { sessionId, sessionToken } = get()
    if (!sessionId || !sessionToken) return
    try {
      const res = await fetch("/api/history/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ session_id: sessionId }),
      })
      const json = await res.json()
      if (json.success) {
        console.log("[store] Claimed history successfully:", json.claimedCount)
      }
    } catch (err) {
      console.error("[store] Error claiming guest history:", err)
    }
  },
  
  selectHistoryItem: (item) => {
    set({
      result: item.result,
      fileName: item.fileName,
      activeDatabaseId: item.id,
      status: UploadStatus.Completed,
      progress: 100,
      isHistoryOpen: false, // Auto-close sidebar
      // We set resumeText to empty on history select since we don't store raw text in history rows,
      // but they can still do Tone Rewrites because they send the existing summary text to the backend!
      resumeText: "", 
    })
  },

  regenerateSummaries: async () => {
    const { resumeText, fileName, sessionId, sessionToken, fetchHistory, usage, user } = get()
    if (!resumeText) return

    // Local client-side block optimization
    if (!user && usage && usage.remaining === 0) {
      get().handleFreeLimitReached(usage)
      return
    }
    
    set({ status: UploadStatus.Uploading, progress: 20, error: null })
    
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (sessionId) {
        headers["x-session-id"] = sessionId
      }
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`
      }
      
      set({ progress: 50 })
      
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers,
        body: JSON.stringify({ resumeText, fileName }),
      })
      
      const json = await res.json()
      if (json.success) {
        set({
          result: json.data,
          activeDatabaseId: json.id,
          status: UploadStatus.Completed,
          progress: 100,
          error: null,
        })
        if (json.usage) {
          set({ usage: json.usage })
        }
        fetchHistory()
      } else {
        const isLimit = json.code === "FREE_LIMIT_REACHED"
        if (isLimit) {
          get().handleFreeLimitReached(json.usage)
        }
        set({
          status: UploadStatus.Error,
          error: {
            success: false,
            code: json.code || "UNKNOWN",
            message: json.message || "Failed to regenerate summaries.",
          },
          progress: 0,
        })
        if (json.usage && !isLimit) {
          set({ usage: json.usage })
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during regeneration."
      set({
        status: UploadStatus.Error,
        error: {
          success: false,
          code: "UNKNOWN",
          message,
        },
        progress: 0,
      })
    }
  },

  rewriteActiveSummary: async (tone) => {
    const { result, selectedVariant, activeDatabaseId, sessionToken, fetchHistory, usage, user } = get()
    if (!result) return

    // Local client-side block optimization
    if (!user && usage && usage.remaining === 0) {
      get().handleFreeLimitReached(usage)
      return
    }
    
    const originalText = result[selectedVariant]
    const originalResult = { ...result }
    
    // Temporarily show loading placeholder
    set({
      result: {
        ...originalResult,
        [selectedVariant]: "Rewriting summary tone using AI...",
      }
    })
    
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`
      }
      
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers,
        body: JSON.stringify({
          id: activeDatabaseId,
          text: originalText,
          variant: selectedVariant,
          tone,
        }),
      })
      
      const json = await res.json()
      if (json.success && json.rewrittenText) {
        set({
          result: {
            ...originalResult,
            [selectedVariant]: json.rewrittenText,
          }
        })
        if (json.usage) {
          set({ usage: json.usage })
        }
        fetchHistory() // Refresh the history panel
      } else {
        const isLimit = json.code === "FREE_LIMIT_REACHED"
        if (isLimit) {
          get().handleFreeLimitReached(json.usage)
        }
        set({ result: originalResult })
        if (json.usage && !isLimit) {
          set({ usage: json.usage })
        }
        console.error("[store] Rewrite failed:", json.message)
      }
    } catch (err) {
      set({ result: originalResult })
      console.error("[store] Rewrite failed:", err)
    }
  },

  updateActiveSummaryText: async (text) => {
    const { result, selectedVariant, activeDatabaseId, sessionToken, fetchHistory } = get()
    
    // Get the current result or a mock-like starting object
    const originalResult = result ? { ...result } : {
      professional: "",
      ats: "",
      executive: "",
      skills: ["React", "TypeScript", "Node.js", "AWS", "Docker"],
      score: 85,
      tips: [
        "Add quantified achievements to your work experience.",
        "Include a dedicated skills section with industry keywords.",
        "Ensure your contact information is complete and up to date.",
      ],
      jobTitle: "Senior Software Engineer",
      detectedIndustry: "Software Engineering",
      detectedExperience: "5–7 years",
      wordCount: 420,
      readingTime: "2 min read",
    }
    
    const updatedResult = {
      ...originalResult,
      [selectedVariant]: text,
    }
    
    // Optimistically update the UI text
    set({ result: updatedResult })
    
    if (activeDatabaseId) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        }
        if (sessionToken) {
          headers["Authorization"] = `Bearer ${sessionToken}`
        }
        
        const res = await fetch("/api/summary/edit", {
          method: "POST",
          headers,
          body: JSON.stringify({
            id: activeDatabaseId,
            text,
            variant: selectedVariant,
          }),
        })
        
        const json = await res.json()
        if (json.success) {
          console.log("[store] Summary updated successfully in DB")
          fetchHistory() // Refresh the history panel to reflect the latest text
        } else {
          console.error("[store] Summary update failed:", json.message)
        }
      } catch (err) {
        console.error("[store] Summary update failed:", err)
      }
    }
  },

  reset: () => set((state) => ({
    ...initialState,
    sessionId: state.sessionId, // Keep session ID intact on reset
    history: state.history,     // Keep history list intact on reset
    user: state.user,           // Keep user session
    sessionToken: state.sessionToken,
    resumeText: state.resumeText,
    activeDatabaseId: state.activeDatabaseId,
    usage: state.usage,         // Keep usage state
    authModalReason: state.authModalReason, // Keep auth modal reason
  })),
}))
