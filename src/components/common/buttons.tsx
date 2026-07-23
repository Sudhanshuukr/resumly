"use client"

import React from "react"
import { cn } from "@/lib/utils"

// Primary CTA — pill-shaped terracotta orange (matches CVPilot reference)
export const GradientButton = ({
  className,
  children,
  onClick,
  disabled,
  type = "button",
}: {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(226,114,44,0.25)] hover:bg-[#EA6C10] dark:hover:bg-[#F47F38] hover:shadow-[0_4px_16px_rgba(226,114,44,0.35)] active:scale-[0.97] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
      className
    )}
  >
    {children}
  </button>
)

// Secondary outline — orange border + text
export const OutlineButton = ({
  className,
  children,
  onClick,
  disabled,
}: {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-full border border-brand-orange bg-transparent px-6 py-3 text-sm font-semibold text-brand-orange hover:bg-brand-orange/5 active:scale-[0.97] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
  >
    {children}
  </button>
)

// Ghost/subtle — used for secondary actions with no prominent border
export const GhostButton = ({
  className,
  children,
  onClick,
}: {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted hover:border-border active:scale-[0.97] transition-all duration-200 cursor-pointer",
      className
    )}
  >
    {children}
  </button>
)

