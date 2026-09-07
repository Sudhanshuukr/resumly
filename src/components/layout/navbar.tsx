"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ArrowRight, Sun, Moon, History } from "lucide-react"
import { Container } from "@/components/common/primitives"
import { useTheme } from "next-themes"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSummarizationStore } from "@/store/summarization"
import { HistorySidebar } from "./HistorySidebar"
import { AuthModal } from "./AuthModal"
import { AuthInitializer } from "./AuthInitializer"
import { supabase } from "@/lib/supabase"

interface NavLink {
  id: string
  label: string
  href: string
}

const NAV_LINKS: NavLink[] = [
  { id: "upload", label: "Upload", href: "/#upload" },
  { id: "summaries", label: "Summaries", href: "/#summaries" },
  { id: "how-it-works", label: "How It Works", href: "/#how-it-works" },
]

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { setIsHistoryOpen, user, setIsAuthModalOpen } = useSummarizationStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const isClickScrolling = useRef(false)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const pathname = usePathname()
  const router = useRouter()
  const isHomePage = pathname === "/"

  useEffect(() => {
    setMounted(true)

    const handleScrollState = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScrollState, { passive: true })
    handleScrollState()

    return () => window.removeEventListener("scroll", handleScrollState)
  }, [])

  // Helper to scroll smoothly to a given section ID on homepage
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      isClickScrolling.current = true
      setActiveSection(id)
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = setTimeout(() => {
        isClickScrolling.current = false
      }, 850)
    }
  }, [])

  // Scroll to hash target on homepage initial mount or cross-page navigation
  useEffect(() => {
    if (!isHomePage || typeof window === "undefined") {
      setActiveSection("")
      return
    }

    const checkHash = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash && ["upload", "summaries", "how-it-works"].includes(hash)) {
        scrollToSection(hash)
      }
    }

    // Attempt immediately and with slight fallback to accommodate hydration
    const timer1 = setTimeout(checkHash, 50)
    const timer2 = setTimeout(checkHash, 250)

    window.addEventListener("hashchange", checkHash)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      window.removeEventListener("hashchange", checkHash)
    }
  }, [isHomePage, pathname, scrollToSection])

  // Robust Scroll-Spy implementation using IntersectionObserver + position fallback (Home only)
  useEffect(() => {
    if (!isHomePage) {
      setActiveSection("")
      return
    }

    const sectionIds = ["upload", "summaries", "how-it-works"]
    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (sectionElements.length === 0) return

    // IntersectionObserver for standard smooth tracking
    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return

        // Find the visible section with highest intersection ratio
        const visibleEntries = entries.filter((entry) => entry.isIntersecting)
        if (visibleEntries.length > 0) {
          const bestEntry = visibleEntries.reduce((prev, current) =>
            current.intersectionRatio > prev.intersectionRatio ? current : prev
          )
          setActiveSection(bestEntry.target.id)
        } else if (window.scrollY < 200) {
          setActiveSection("")
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -45% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    )

    sectionElements.forEach((el) => observer.observe(el))

    // Position-based fallback for fast scroll or edge cases
    const handleScrollSpyFallback = () => {
      if (isClickScrolling.current) return

      const scrollPos = window.scrollY + 160

      if (window.scrollY < 180) {
        setActiveSection("")
        return
      }

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i]
        const top = el.offsetTop
        const height = el.offsetHeight

        if (scrollPos >= top && scrollPos < top + height) {
          setActiveSection(el.id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScrollSpyFallback, { passive: true })
    handleScrollSpyFallback()

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", handleScrollSpyFallback)
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)
    }
  }, [isHomePage])

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)

    if (isHomePage) {
      scrollToSection(id)
      window.history.pushState(null, "", `/#${id}`)
    } else {
      setActiveSection("")
      router.push(`/#${id}`)
    }
  }

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    if (isHomePage) {
      setActiveSection("")
      window.scrollTo({ top: 0, behavior: "smooth" })
      if (window.location.hash) {
        window.history.pushState(null, "", "/")
      }
    } else {
      router.push("/")
    }
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
          scrolled
            ? "bg-background/95 backdrop-blur-sm border-b border-border/80 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
            : "bg-background/70 backdrop-blur-xs border-b border-border/40 py-4.5"
        )}
      >
        <Container className="flex items-center justify-between">
          {/* Left: Resumly Wordmark */}
          <div className="flex items-center gap-8">
            <a
              href="/"
              onClick={handleLogoClick}
              className="flex items-center group select-none py-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-orange rounded-sm cursor-pointer"
              aria-label="Resumly home"
            >
              <span className="font-heading font-extrabold text-2xl text-foreground tracking-tight group-hover:opacity-90 transition-opacity">
                Resum<span className="text-brand-orange">ly</span>
              </span>
            </a>
          </div>

          {/* Center: Clean Nav Links with Smooth Horizontal Active Line */}
          <nav
            className="hidden md:flex items-center gap-8 relative"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link) => {
              const isActive = isHomePage && activeSection === link.id
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavigate(e, link.href, link.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative py-1.5 px-0.5 text-xs font-semibold tracking-wide transition-colors duration-150 cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-orange rounded-sm",
                    isActive
                      ? "text-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{link.label}</span>

                  {/* Clean, minimal horizontal underline with two-phase crossfade */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        key={`nav-line-${link.id}`}
                        initial={{ opacity: 0, scaleX: 0.85 }}
                        animate={{
                          opacity: 1,
                          scaleX: 1,
                          transition: {
                            duration: 0.18,
                            delay: 0.05,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }}
                        exit={{
                          opacity: 0,
                          scaleX: 0.85,
                          transition: {
                            duration: 0.12,
                            ease: [0.7, 0, 0.84, 0],
                          },
                        }}
                        className="absolute -bottom-1 left-[-4px] right-[-4px] h-[2px] bg-brand-orange rounded-full origin-center pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </a>
              )
            })}
          </nav>

          {/* Right: Actions (Theme, History, Auth) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer border border-transparent hover:border-border/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-orange"
                aria-label="Toggle theme"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* History Button */}
            {mounted && (
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer border border-transparent hover:border-border/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-orange"
                aria-label="View history"
                title="View history"
              >
                <History className="w-4 h-4" />
              </button>
            )}

            <div className="h-4 w-px bg-border/60 mx-0.5" />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-8.5 h-8.5 rounded-full bg-brand-orange text-white font-bold flex items-center justify-center text-xs shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer select-none"
                  aria-label="Account menu"
                >
                  {user.email?.charAt(0).toUpperCase() ?? "U"}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />

                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2.5 w-56 bg-background border border-border rounded-xl shadow-lg z-20 overflow-hidden font-sans"
                      >
                        <div className="p-3.5 border-b border-border bg-muted/20">
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                            Signed in as
                          </p>
                          <p className="text-xs font-bold text-foreground truncate mt-0.5" title={user.email}>
                            {user.email}
                          </p>
                        </div>
                        <div className="p-1 space-y-0.5">
                          <button
                            onClick={() => {
                              setDropdownOpen(false)
                              setIsHistoryOpen(true)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5 text-muted-foreground" />
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
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-2 py-1.5 rounded-lg hover:bg-muted/40"
                >
                  Log In
                </button>

                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-foreground text-background hover:opacity-90 py-1.5 px-3.5 text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                >
                  Sign Up
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Bar: Theme + History + Menu */}
          <div className="flex items-center gap-1 md:hidden">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {mounted && (
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="View history"
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

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden bg-background/98 backdrop-blur-md border-b border-border shadow-md overflow-hidden absolute top-full left-0 right-0"
            >
              <div className="px-6 py-5 flex flex-col gap-4">
                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => {
                    const isActive = isHomePage && activeSection === link.id
                    return (
                      <a
                        key={link.id}
                        href={link.href}
                        onClick={(e) => handleNavigate(e, link.href, link.id)}
                        className={cn(
                          "relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer",
                          isActive
                            ? "text-foreground font-bold bg-muted/40"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                        )}
                      >
                        <span>{link.label}</span>
                        <AnimatePresence>
                          {isActive && (
                            <motion.span
                              key={`mobile-line-${link.id}`}
                              initial={{ opacity: 0, scaleX: 0.8 }}
                              animate={{
                                opacity: 1,
                                scaleX: 1,
                                transition: {
                                  duration: 0.18,
                                  delay: 0.05,
                                  ease: [0.16, 1, 0.3, 1],
                                },
                              }}
                              exit={{
                                opacity: 0,
                                scaleX: 0.8,
                                transition: {
                                  duration: 0.12,
                                  ease: [0.7, 0, 0.84, 0],
                                },
                              }}
                              className="w-5 h-[2px] bg-brand-orange rounded-full origin-right"
                            />
                          )}
                        </AnimatePresence>
                      </a>
                    )
                  })}
                </nav>

                <div className="h-px bg-border/60 my-0.5" />

                <div className="flex flex-col gap-2.5">
                  {user ? (
                    <>
                      <div className="p-3 bg-muted/50 rounded-xl text-left">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                          Signed in as
                        </p>
                        <p className="text-xs font-bold text-foreground truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false)
                          setIsHistoryOpen(true)
                        }}
                        className="w-full text-center py-2.5 text-xs font-semibold text-foreground hover:text-brand-orange transition-colors cursor-pointer border border-border rounded-lg bg-card"
                      >
                        View History
                      </button>
                      <button
                        onClick={async () => {
                          setMobileMenuOpen(false)
                          await supabase.auth.signOut()
                        }}
                        className="w-full text-center py-2.5 text-xs font-semibold text-brand-rose hover:bg-brand-rose/5 transition-colors cursor-pointer border border-brand-rose/20 rounded-lg bg-card"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false)
                          setIsAuthModalOpen(true)
                        }}
                        className="w-full text-center py-2.5 text-xs font-semibold text-foreground hover:text-brand-orange transition-colors cursor-pointer border border-border rounded-lg bg-card"
                      >
                        Log In
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false)
                          setIsAuthModalOpen(true)
                        }}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-foreground text-background py-2.5 text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                      >
                        Sign Up
                        <ArrowRight className="w-3.5 h-3.5" />
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
