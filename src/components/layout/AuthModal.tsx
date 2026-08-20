"use client"

import React, { useState, FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useSummarizationStore } from "@/store/summarization"
import { cn } from "@/lib/utils"

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalReason, setAuthModalReason } = useSummarizationStore()
  const [mode, setMode] = useState<"login" | "signup">("login")
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Initialize mode based on the trigger reason
  React.useEffect(() => {
    if (isAuthModalOpen) {
      if (authModalReason === "limit_reached") {
        setMode("signup")
      } else {
        setMode("login")
      }
    }
  }, [isAuthModalOpen, authModalReason])

  if (!isAuthModalOpen) return null

  const handleClose = () => {
    setIsAuthModalOpen(false)
    setAuthModalReason("default")
    // Reset states
    setEmail("")
    setPassword("")
    setErrorMsg(null)
    setSuccessMsg(null)
    setMode("login")
  }

  const validate = () => {
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.")
      return false
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.")
      return false
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!validate()) return

    setLoading(true)

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setSuccessMsg("Logged in successfully!")
        setTimeout(() => handleClose(), 1000)
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        
        // Supabase behavior check: if email confirmation is required, inform user.
        if (data.session) {
          setSuccessMsg("Account created and logged in successfully!")
          setTimeout(() => handleClose(), 1000)
        } else {
          setSuccessMsg("Account created! Please check your email to confirm registration.")
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", duration: 0.35 }}
          className="relative w-full max-w-md bg-background border border-border rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col font-sans"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-base font-extrabold text-foreground">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h3>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Quota limit warning */}
            {authModalReason === "limit_reached" && (
              <div className="p-4 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange rounded-2xl flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <p className="font-extrabold">You&apos;ve used your 3 free summaries.</p>
                  <p className="leading-relaxed font-semibold">Create a free account or log in to continue generating resume summaries.</p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex bg-muted p-1 rounded-xl gap-1 border border-border/50">
              <button
                type="button"
                onClick={() => { setMode("login"); setErrorMsg(null); setSuccessMsg(null) }}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  mode === "login"
                    ? "bg-brand-orange text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setErrorMsg(null); setSuccessMsg(null) }}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  mode === "signup"
                    ? "bg-brand-orange text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Sign Up
              </button>
            </div>

            {/* Error Callout */}
            {errorMsg && (
              <div className="p-4 bg-brand-rose/10 border border-brand-rose/20 text-brand-rose rounded-2xl flex items-start gap-2.5 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-semibold">{errorMsg}</p>
              </div>
            )}

            {/* Success Callout */}
            {successMsg && (
              <div className="p-4 bg-brand-green/10 border border-brand-green/20 text-brand-green rounded-2xl flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-semibold">{successMsg}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="auth-email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || !!successMsg}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-[#FAF8F5]/30 dark:bg-[#1C1917]/20 border border-border focus:border-brand-orange/60 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="auth-password" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || !!successMsg}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-[#FAF8F5]/30 dark:bg-[#1C1917]/20 border border-border focus:border-brand-orange/60 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] text-muted-foreground ml-1">Must be at least 6 characters long</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange text-white hover:bg-orange-600 disabled:opacity-50 py-3 text-sm font-bold shadow-[0_4px_12px_rgba(226,114,44,0.2)] active:scale-[0.98] transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {mode === "login" ? "Log In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="p-6 bg-muted/40 border-t border-border text-center text-xs font-semibold text-muted-foreground">
            {mode === "login" ? (
              <p>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setErrorMsg(null); setSuccessMsg(null) }}
                  className="text-brand-orange hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setErrorMsg(null); setSuccessMsg(null) }}
                  className="text-brand-orange hover:underline cursor-pointer"
                >
                  Log in here
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
