"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Leaf, Menu, X, ArrowRight, Sun, Moon, History } from "lucide-react"
import { Container } from "@/components/common/primitives"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useSummarizationStore } from "@/store/summarization"
import { HistorySidebar } from "./HistorySidebar"
import { AuthModal } from "./AuthModal"
import { AuthInitializer } from "./AuthInitializer"
import { supabase } from "@/lib/supabase"

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { setIsHistoryOpen, user, setIsAuthModalOpen } = useSummarizationStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
  ]

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleCtaClick = () => {
    setMobileMenuOpen(false)
    document.querySelector("#upload")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/90 backdrop-blur-md border-b border-border shadow-[0_1px_8px_rgba(0,0,0,0.02)] py-3"
            : "bg-transparent py-5"
        )}
      >
        <Container className="flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group select-none">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-orange shadow-[0_2px_8px_rgba(226,114,44,0.3)] group-hover:shadow-[0_4px_12px_rgba(226,114,44,0.4)] transition-all">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif font-extrabold text-lg text-foreground tracking-tight">
            Resume<span className="text-brand-orange font-sans font-medium">Summary</span>
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="text-sm font-semibold text-muted-foreground hover:text-brand-orange transition-colors relative group py-1"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-orange group-hover:w-full transition-all duration-300 rounded-full" />
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* History Button */}
          {mounted && (
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="View history"
              title="View history"
            >
              <History className="w-4 h-4" />
            </button>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full bg-brand-orange text-white font-bold flex items-center justify-center text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
              >
                {user.email?.charAt(0).toUpperCase() ?? "U"}
              </button>
              
              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2.5 w-56 bg-background border border-border rounded-2xl shadow-xl z-20 overflow-hidden font-sans"
                    >
                      <div className="p-4 border-b border-border bg-card/30">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-bold text-foreground truncate mt-0.5" title={user.email}>{user.email}</p>
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        <button
                          onClick={() => { setDropdownOpen(false); setIsHistoryOpen(true) }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                          View History
                        </button>
                        <button
                          onClick={async () => {
                            setDropdownOpen(false)
                            await supabase.auth.signOut()
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-brand-rose hover:bg-brand-rose/5 transition-colors cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-1"
              >
                Log In
              </button>
              
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1C1917] text-white hover:bg-stone-800 dark:bg-[#FAF8F5] dark:text-[#1C1917] dark:hover:bg-stone-200 py-2.5 px-5 text-sm font-semibold transition-all active:scale-[0.97] cursor-pointer"
              >
                Sign Up
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button + Theme Toggle + History */}
        <div className="flex items-center gap-2 md:hidden">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          {mounted && (
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="View history"
              title="View history"
            >
              <History className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-background border-b border-border shadow-md overflow-hidden absolute top-full left-0 right-0"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="text-base font-semibold text-foreground hover:text-brand-orange transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-border my-1" />
              <div className="flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="p-3 bg-muted rounded-2xl text-left">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-bold text-foreground truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { setMobileMenuOpen(false); setIsHistoryOpen(true) }}
                      className="w-full text-center py-3 text-sm font-semibold text-foreground hover:text-brand-orange transition-colors cursor-pointer border border-border rounded-full bg-card"
                    >
                      View History
                    </button>
                    <button
                      onClick={async () => {
                        setMobileMenuOpen(false)
                        await supabase.auth.signOut()
                      }}
                      className="w-full text-center py-3 text-sm font-semibold text-brand-rose hover:bg-brand-rose/5 transition-colors cursor-pointer border border-brand-rose/20 rounded-full bg-card"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setMobileMenuOpen(false); setIsAuthModalOpen(true) }}
                      className="w-full text-center py-3 text-sm font-semibold text-foreground hover:text-brand-orange transition-colors cursor-pointer border border-border rounded-full bg-card"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); setIsAuthModalOpen(true) }}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1C1917] text-white hover:bg-[#2E2B2A] dark:bg-[#FAF8F5] dark:text-[#1C1917] dark:hover:bg-stone-200 py-3 text-sm font-semibold transition-all active:scale-[0.97] cursor-pointer"
                    >
                      Sign Up
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    <HistorySidebar />
    <AuthModal />
    <AuthInitializer />
    </>
  )
}

