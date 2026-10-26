import { MessageCircle } from "lucide-react"

import { HeroShowcase } from "@/modules/public/landing/presentation/components/HeroShowcase"
import { LandingHeader } from "@/modules/public/landing/presentation/components/LandingHeader"
import { PrimaryCta } from "@/modules/public/landing/presentation/components/PrimaryCta"
import { HERO_BADGE, HERO_HEADLINE, HERO_SUBHEAD, WHATSAPP_CTA_LABEL } from "@/modules/public/landing/presentation/landing.content"
import { waLink } from "@/modules/public/shared/contact"

export function HeroSection() {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-neela-blue-400 via-neela-brand to-neela-dark-surface">
        <LandingHeader />

        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-5 pt-10 text-center sm:pt-14">
          <span className="inline-flex items-center rounded-full bg-white/15 px-3.5 py-1 text-neela-label-sm text-white">{HERO_BADGE}</span>
          <h1 className="text-neela-display-hero-mobile tracking-tight text-balance text-white lg:text-neela-display-hero">{HERO_HEADLINE}</h1>
          <p className="max-w-2xl text-neela-body-lg text-white/85">{HERO_SUBHEAD}</p>
          <div className="flex w-full flex-col items-stretch gap-3 pt-1 sm:w-auto sm:flex-row sm:items-center">
            <PrimaryCta
              withArrow
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-7 text-neela-label-lg text-neela-brand outline-none transition-colors hover:bg-neela-surface-subtle focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neela-brand"
            />
            <a
              href={waLink("Halo Neela POS, saya ingin konsultasi soal aplikasi kasir")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/70 px-6 text-neela-label-lg text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neela-brand"
            >
              <MessageCircle className="size-5" aria-hidden />
              <span>{WHATSAPP_CTA_LABEL}</span>
            </a>
          </div>
        </div>

        <div className="mt-10 sm:mt-12">
          <HeroShowcase />
        </div>
      </div>
    </section>
  )
}
