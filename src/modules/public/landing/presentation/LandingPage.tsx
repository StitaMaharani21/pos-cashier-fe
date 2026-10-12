import { useEffect } from "react"

import { EarlyAccessSection } from "@/modules/public/landing/presentation/components/EarlyAccessSection"
import { FAQSection } from "@/modules/public/landing/presentation/components/FAQSection"
import { FeatureSection } from "@/modules/public/landing/presentation/components/FeatureSection"
import { FinalCtaSection } from "@/modules/public/landing/presentation/components/FinalCtaSection"
import { HeroSection } from "@/modules/public/landing/presentation/components/HeroSection"
import { LandingFooter } from "@/modules/public/landing/presentation/components/LandingFooter"
import { LandingHeader } from "@/modules/public/landing/presentation/components/LandingHeader"
import { OfflineSection } from "@/modules/public/landing/presentation/components/OfflineSection"
import { PricingSection } from "@/modules/public/landing/presentation/components/PricingSection"
import { ProblemSection } from "@/modules/public/landing/presentation/components/ProblemSection"
import { ProductTourSection } from "@/modules/public/landing/presentation/components/ProductTourSection"
import { QuickFactsSection } from "@/modules/public/landing/presentation/components/QuickFactsSection"
import { SelfOrderSection } from "@/modules/public/landing/presentation/components/SelfOrderSection"
import { TestimonialSection } from "@/modules/public/landing/presentation/components/TestimonialSection"
import { TESTIMONIALS } from "@/modules/public/landing/presentation/landing.content"

// Public homepage ("/"). Always the landing page, logged in or not — the
// owner console lives at /app, reached via "Masuk"/login.
//
// Section order follows the landing brief: Hero → Quick facts → Problem/
// solution → Product tour → Offline honesty → Features+devices → Self-order
// (Pro) → Pricing → Early access → FAQ → Closing CTA → Footer.
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
    <div id="top" className="min-h-screen bg-white font-neela text-neela-body-md text-neela-text antialiased">
      <LandingHeader />
      <main className="w-full pt-18">
        <HeroSection />
        <QuickFactsSection />
        <ProblemSection />
        <ProductTourSection />
        <OfflineSection />
        <FeatureSection />
        <SelfOrderSection />
        <PricingSection />
        {/* Early-access perks until there are real customer quotes. */}
        {TESTIMONIALS.length > 0 ? <TestimonialSection /> : <EarlyAccessSection />}
        <FAQSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
