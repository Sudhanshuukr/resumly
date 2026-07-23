import React from "react"
import { cn } from "@/lib/utils"

export const Container = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative", className)} {...props}>
    {children}
  </div>
)

export const LightCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card text-foreground card-shadow transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
LightCard.displayName = "LightCard"

// Keep GlassCard as alias to LightCard for backwards compat
export const GlassCard = LightCard

export const Badge = ({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border border-brand-orange/20 bg-brand-orange-light dark:bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange tracking-wide",
      className
    )}
    {...props}
  >
    {children}
  </span>
)

// Warm section divider
export const SectionLabel = ({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full bg-brand-orange-light dark:bg-brand-orange/10 border border-brand-orange/10 px-4 py-1.5 text-xs font-semibold text-brand-orange uppercase tracking-widest",
      className
    )}
    {...props}
  >
    {children}
  </span>
)

// Floating chip — small pill for hero overlay badges
export const FloatingChip = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center gap-2 bg-card rounded-xl px-3 py-2.5 card-shadow border border-border text-xs font-semibold text-foreground",
      className
    )}
    {...props}
  >
    {children}
  </div>
)


// Deprecated — kept as no-op for any remaining imports
export const MeshBackground = () => null
export const GridBackground = () => null
