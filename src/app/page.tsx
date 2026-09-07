import React from "react"
import { Navbar } from "@/components/layout/navbar"
import { Hero } from "@/features/landing/sections/Hero"
import { UploadSection } from "@/features/landing/sections/UploadSection"
import { LivePreview } from "@/features/landing/sections/LivePreview"
import { HowItWorks } from "@/features/landing/sections/HowItWorks"
import { Footer } from "@/components/layout/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navbar />
      <main>
        <Hero />
        <UploadSection />
        <LivePreview />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}

