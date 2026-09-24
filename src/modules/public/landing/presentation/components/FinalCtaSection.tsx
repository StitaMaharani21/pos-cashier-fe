import { MessageCircle } from "lucide-react"

import { PrimaryCta } from "@/modules/public/landing/presentation/components/PrimaryCta"
import { FINAL_CTA_LEAD } from "@/modules/public/landing/presentation/landing.content"
import { waLink } from "@/modules/public/shared/contact"
import { useIsOwnerSession } from "@/modules/public/shared/useIsOwnerSession"

export function FinalCtaSection() {
  const isOwner = useIsOwnerSession()

  return (
    <section
      id="kontak"
      className="relative w-full scroll-mt-20 overflow-hidden bg-neela-on-primary-fixed py-24 text-neela-primary-fixed"
    >
      <div className="pointer-events-none absolute -top-24 right-0 size-96 rounded-full bg-neela-primary-container/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 size-96 rounded-full bg-neela-secondary/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
          <span className="rounded-full bg-neela-inverse-surface px-4 py-1 text-neela-label-sm text-neela-tertiary-fixed">
            Setup Mudah • Dipandu Tim Sampai Jualan
          </span>

          <h2 className="text-neela-headline-xl-mobile font-bold tracking-tight text-neela-on-primary md:text-neela-headline-xl lg:text-neela-display-hero">
            Siap Tingkatkan Penjualan Kafe Anda Tanpa Drama Kasir Macet?
          </h2>

          <p className="max-w-2xl text-neela-body-lg text-neela-primary-fixed lg:text-neela-body-xl">
            {isOwner ? FINAL_CTA_LEAD.owner : FINAL_CTA_LEAD.visitor}
          </p>

          <div className="flex w-full flex-col items-stretch gap-4 pt-1 sm:w-auto sm:flex-row sm:items-center">
            <PrimaryCta
              withArrow
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-neela-primary-container px-8 py-4 text-neela-label-lg text-neela-on-primary shadow-xl shadow-neela-primary-container/40 transition-all hover:bg-neela-primary active:scale-[0.98]"
            />
            <a
              href={waLink("Halo Neela POS, saya tertarik tanya paket kasir")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-neela-inverse-surface px-8 py-4 text-neela-label-lg text-neela-on-primary transition-all hover:bg-neela-surface-container-highest/20"
            >
              <MessageCircle className="size-5 text-neela-tertiary-fixed" />
              <span>WhatsApp Tim Sales</span>
            </a>
          </div>

          <p className="pt-2 text-neela-body-sm text-neela-secondary-fixed">
            Tanpa komitmen jangka panjang • Batalkan kapan saja • Bantuan setup dipandu langsung
            tim teknisi Jabodetabek
          </p>
        </div>
      </div>
    </section>
  )
}
