import React from "react"
import { Navbar } from "@/components/layout/navbar"
import { Hero } from "@/features/landing/sections/Hero"
import { UploadSection } from "@/features/landing/sections/UploadSection"
import { HowItWorks } from "@/features/landing/sections/HowItWorks"
import { Features } from "@/features/landing/sections/Features"
import { LivePreview } from "@/features/landing/sections/LivePreview"
import { Footer } from "@/components/layout/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navbar />
      <main>
        <Hero />
        <UploadSection />
        <HowItWorks />
        <Features />
        <LivePreview />
      </main>
      <Footer />
    </div>
  )
}

