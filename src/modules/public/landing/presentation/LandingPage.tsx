import { useEffect } from "react"

import { EarlyAccessSection } from "@/modules/public/landing/presentation/components/EarlyAccessSection"
import { FeatureSection } from "@/modules/public/landing/presentation/components/FeatureSection"
import { FinalCtaSection } from "@/modules/public/landing/presentation/components/FinalCtaSection"
import { HeroSection } from "@/modules/public/landing/presentation/components/HeroSection"
import { LandingFooter } from "@/modules/public/landing/presentation/components/LandingFooter"
import { LandingHeader } from "@/modules/public/landing/presentation/components/LandingHeader"
import { PricingSection } from "@/modules/public/landing/presentation/components/PricingSection"
import { ProblemSection } from "@/modules/public/landing/presentation/components/ProblemSection"
import { TestimonialSection } from "@/modules/public/landing/presentation/components/TestimonialSection"
import { TrustBar } from "@/modules/public/landing/presentation/components/TrustBar"
import { TESTIMONIALS } from "@/modules/public/landing/presentation/landing.content"

// Public homepage ("/"). Always the landing page, logged in or not — the
// owner console lives at /app, reached via "Masuk Portal"/login.
export function LandingPage() {
  // Smooth in-page anchor scrolling (header nav → #fitur, #harga, ...), set
  // on <html> only while this page is mounted so the owner console keeps
  // the browser default. In an effect, not during render — see the SSR note
  // in this module's README.
  useEffect(() => {
    const root = document.documentElement
    root.classList.add("scroll-smooth")
    return () => root.classList.remove("scroll-smooth")
  }, [])

  return (
    <div id="top" className="min-h-screen bg-neela-surface font-neela text-neela-body-md text-neela-on-surface antialiased">
      <LandingHeader />
      <main className="w-full pt-20">
        <HeroSection />
        <TrustBar />
        <ProblemSection />
        <FeatureSection />
        <PricingSection />
        {/* Early-access perks until there are real customer quotes. */}
        {TESTIMONIALS.length > 0 ? <TestimonialSection /> : <EarlyAccessSection />}
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
