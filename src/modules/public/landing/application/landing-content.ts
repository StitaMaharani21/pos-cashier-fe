import type { LucideIcon } from "lucide-react"

import orderScreen from "@/assets/landing/order-screen.webp"
import {
  EARLY_ACCESS,
  EARLY_ACCESS_PERKS,
  FAQ_ITEMS,
  FINAL_CTA_LEAD,
  FINAL_CTA_TITLE,
  FOOTER_COLUMNS,
  FOOTER_TAGLINE,
  HERO_BADGE,
  HERO_HEADLINE,
  HERO_SUBHEAD,
  NAV_LINKS,
  OFFLINE_NEEDS_INTERNET,
  OFFLINE_NOTE,
  OFFLINE_WORKS,
  PLANS,
  PLATFORM_FACTS,
  PRICING_TERMS,
  PRIMARY_CTA,
  PRO_FEATURES,
  PROBLEMS,
  QUICK_FACTS,
  SELF_ORDER,
  STARTER_FEATURES,
  TESTIMONIALS,
  TOUR_CASHIER,
  TOUR_OTHER,
  TOUR_PAYMENT,
  TOUR_SHIFT,
  WHATSAPP_CTA_LABEL,
  type FaqItem,
  type FeatureItem,
  type Plan,
  type ProblemSolution,
  type QuickFact,
  type Testimonial,
} from "@/modules/public/landing/presentation/landing.content"
import { resolveIcon } from "@/modules/public/shared/cms/cms.icons"
import { resolveMediaSrc } from "@/modules/public/shared/cms/cms.assets"
import {
  DEFAULT_BADGE_CLASS,
  TONE_BADGE_CLASS,
  fillTemplate,
  formatRupiah,
  makeReader,
  type CmsReader,
} from "@/modules/public/shared/cms/cms.reader"
import type { CmsItem, CmsMedia, CmsPlan, CmsSnapshot } from "@/modules/public/shared/cms/cms.types"
import { COPYRIGHT_HOLDER, REGISTER_PATH, SUPPORT_HOURS } from "@/modules/public/shared/contact"
import { EXTRA_PRICING, STARTER_SOFT_DAILY_LIMIT } from "@/modules/public/shared/pricing"

// What the landing page renders. Every field has a static default (the existing
// landing.content.ts values plus the copy that used to be hardcoded in the
// components), so buildLandingContent(null) is the page as it was before the
// CMS, and a CMS that fills only some fields changes only those.

export interface LandingImage {
  src: string
  alt: string
  width: number
  height: number
}

export interface LandingTourStep {
  title: string
  body: string
  images: LandingImage[]
}

export interface LandingTourOther {
  title: string
  body: string
  badge?: string
}

export interface LandingPlan extends Omit<Plan, "id"> {
  id: string
  highlighted: boolean
}

export interface LandingFooterColumn {
  title: string
  links: { label: string; href: string }[]
}

export interface SectionHeadingContent {
  eyebrow: string
  title: string
  description: string
}

export interface LandingContent {
  settings: {
    supportHours: string
    copyrightHolder: string
    starterSoftDailyLimit: number
    annualBillingEnabled: boolean
    // CMS-managed WhatsApp number; undefined = use VITE_SALES_WA (contact.ts).
    salesWa: string | undefined
  }
  global: {
    primaryCta: { visitor: { label: string; to: string }; owner: { label: string; to: string } }
    loginLabel: string
    waCtaLabel: string
    wa: { consult: string; interest: string; help: string; plan: string; ownerPlan: string }
  }
  visible: { testimonials: boolean; earlyAccess: boolean }
  navLinks: { href: string; label: string }[]
  hero: { badge: string; headline: string; subhead: string; image: LandingImage }
  quickFacts: QuickFact[]
  problems: SectionHeadingContent & { items: ProblemSolution[] }
  tour: SectionHeadingContent & {
    cashier: LandingTourStep
    payment: LandingTourStep
    shift: LandingTourStep
    other: LandingTourOther[]
  }
  offline: {
    eyebrow: string
    title: string
    worksTitle: string
    worksChip: string
    needsTitle: string
    note: string
    works: { icon: LucideIcon; label: string }[]
    needs: { icon: LucideIcon; label: string }[]
  }
  features: SectionHeadingContent & {
    proChip: string
    starterTitle: string
    proTitle: string
    starter: FeatureItem[]
    pro: FeatureItem[]
    platforms: { icon: LucideIcon; title: string; body: string }[]
  }
  selfOrder: { eyebrow: string; title: string; body: string; bullets: string[] }
  pricing: SectionHeadingContent & {
    terms: string
    highlightBadge: string
    perMonth: string
    extraNote: string
    plans: LandingPlan[]
  }
  testimonials: SectionHeadingContent & { items: Testimonial[] }
  earlyAccess: SectionHeadingContent & { perks: { icon: LucideIcon; title: string; body: string }[] }
  faq: SectionHeadingContent & { items: FaqItem[] }
  finalCta: { title: string; leadVisitor: string; leadOwner: string }
  footer: {
    tagline: string
    columns: LandingFooterColumn[]
    contactTitle: string
    contactWaLabel: string
    privacyLabel: string
    termsLabel: string
  }
}

// Text that used to be hardcoded in the section components.
const DEFAULT_TEXT = {
  loginLabel: "Masuk",
  waConsult: "Halo Neela POS, saya ingin konsultasi soal aplikasi kasir",
  waInterest: "Halo Neela POS, saya tertarik tanya soal aplikasi kasir",
  waHelp: "Halo Neela POS, saya butuh bantuan",
  waPlan: "Halo Neela POS, saya ingin konsultasi paket {plan_name}",
  waOwnerPlan: "Halo Neela POS, saya pemilik toko dan ingin tanya soal paket {plan_name}",
  problems: {
    eyebrow: "Masalah yang Sering Terjadi",
    title: "Kendala operasional kasir yang sering bikin repot",
    description: "Tiga masalah yang sering dialami pemilik kafe dan resto, dan bagaimana Neela POS menjawabnya.",
  },
  tour: {
    eyebrow: "Cara Kerja",
    title: "Dari pesanan sampai tutup kasir",
    description: "Layar yang benar-benar dipakai kasir setiap hari — bukan rekaan.",
  },
  offline: {
    eyebrow: "Mode Offline, Dijelaskan Apa Adanya",
    title: "Apa yang tetap jalan, apa yang butuh internet",
    worksTitle: "Tetap jalan tanpa internet",
    worksChip: "Offline",
    needsTitle: "Butuh internet",
  },
  features: {
    eyebrow: "Fitur",
    title: "Fitur yang tersedia di setiap paket",
    description:
      "Starter mencakup kebutuhan kasir sehari-hari. Pro menambahkan laporan, stok, dan pesan sendiri dari meja (QR).",
    proChip: "Semua fitur Starter, plus",
  },
  pricing: {
    eyebrow: "Paket Harga",
    title: "Harga transparan, per toko per bulan",
    description: "Pilih sesuai jumlah kasir dan kebutuhan fitur tokomu.",
    highlightBadge: "Paling Banyak Dipilih",
    perMonth: "/bulan",
    extraNote: "Perangkat tambahan {price}{unit} — berlaku untuk Starter dan Pro.",
  },
  testimonials: {
    eyebrow: "Testimoni Merchant",
    title: "Cerita nyata dari pemilik kafe & resto",
    description: "Langsung dari toko yang sudah memakai Neela POS.",
  },
  faq: {
    eyebrow: "Tanya Jawab",
    title: "Pertanyaan yang sering ditanyakan",
    description: "Belum ketemu jawabannya? Hubungi kami lewat WhatsApp.",
  },
  footer: {
    contactTitle: "Kontak",
    contactWaLabel: "WhatsApp {{support_hours}}",
    privacyLabel: "Kebijakan Privasi",
    termsLabel: "Syarat & Ketentuan",
  },
} as const

const HERO_IMAGE_ALT = "Layar Buat Pesanan aplikasi kasir Neela: katalog menu dan panel order"

function imagesFrom(
  media: CmsMedia[] | undefined,
  fallback: LandingImage[],
  size: { width: number; height: number }
): LandingImage[] {
  const resolved: LandingImage[] = []
  for (const m of media ?? []) {
    const src = resolveMediaSrc(m)
    if (src) resolved.push({ src, alt: m.alt, width: m.width ?? size.width, height: m.height ?? size.height })
  }
  return resolved.length > 0 ? resolved : fallback
}

function tourStep(
  item: CmsItem | undefined,
  fallback: { title: string; body: string; images: LandingImage[] },
  size: { width: number; height: number }
): LandingTourStep {
  return {
    title: item?.title || fallback.title,
    body: item?.body || fallback.body,
    images: imagesFrom(item?.media, fallback.images, size),
  }
}

function toPlan(p: CmsPlan): LandingPlan {
  return {
    id: p.code,
    name: p.name,
    description: p.description ?? "",
    pricePrefix: p.price_prefix || undefined,
    price: formatRupiah(p.price),
    cashiers: p.cashiers_label ?? "",
    devices: p.devices_label ?? "",
    includesPrevious: p.includes_previous || undefined,
    features: p.features.map((f) => f.label),
    note: p.note || undefined,
    cta: p.cta_label ?? "",
    ctaAction: p.cta_action,
    ownerCta: p.owner_cta_label || undefined,
    highlighted: p.highlighted,
  }
}

function featureItems(p: CmsPlan | undefined, fallback: FeatureItem[]): FeatureItem[] {
  if (!p || p.features.length === 0) return fallback
  return p.features.map((f) => ({ icon: resolveIcon(f.icon), label: f.label }))
}

function headingFrom(r: CmsReader, section: string, d: SectionHeadingContent): SectionHeadingContent {
  return {
    eyebrow: r.text(section, "eyebrow", d.eyebrow),
    title: r.text(section, "title", d.title),
    description: r.text(section, "description", d.description),
  }
}

function footerColumns(r: CmsReader): LandingFooterColumn[] {
  const groups: { key: string; titleField: string; fallback: LandingFooterColumn }[] = [
    { key: "footer_produk", titleField: "group_produk_title", fallback: FOOTER_COLUMNS[0] },
    { key: "footer_bantuan", titleField: "group_bantuan_title", fallback: FOOTER_COLUMNS[1] },
  ]
  return groups.map(({ key, titleField, fallback }) => ({
    title: r.text("footer", titleField, fallback.title),
    links: r.links(key)?.map((l) => ({ label: l.label, href: l.href })) ?? fallback.links,
  }))
}

function staticPlans(): LandingPlan[] {
  return PLANS.map((p) => ({ ...p, highlighted: p.id === "pro" }))
}

// null (no CMS data yet / unavailable) yields the static page.
export function buildLandingContent(snapshot: CmsSnapshot | null | undefined): LandingContent {
  const r = makeReader(snapshot)

  const supportHours = r.setting("support_hours", SUPPORT_HOURS)
  const softLimit = r.setting("starter_soft_daily_limit", STARTER_SOFT_DAILY_LIMIT)

  const heroMedia = r.media("hero", "image")
  const heroSrc = heroMedia ? resolveMediaSrc(heroMedia) : undefined
  const hero = {
    badge: r.text("hero", "badge", HERO_BADGE),
    headline: r.text("hero", "headline", HERO_HEADLINE),
    subhead: r.text("hero", "subhead", HERO_SUBHEAD),
    image:
      heroMedia && heroSrc
        ? { src: heroSrc, alt: heroMedia.alt, width: heroMedia.width ?? 2000, height: heroMedia.height ?? 1794 }
        : { src: orderScreen, alt: HERO_IMAGE_ALT, width: 2000, height: 1794 },
  }

  const tourItems = r.list("tour_steps")
  const tourByKey = (key: string) => tourItems?.find((i) => i.key === key)
  const cashierImg = { src: TOUR_CASHIER.image, alt: TOUR_CASHIER.imageAlt, width: 1200, height: 1077 }
  const shiftImg = { src: TOUR_SHIFT.image, alt: TOUR_SHIFT.imageAlt, width: 1200, height: 749 }
  const paymentImgs = TOUR_PAYMENT.images.map((i) => ({ src: i.src, alt: i.alt, width: 900, height: 657 }))

  const starterPlan = r.plan("starter")
  const proPlan = r.plan("pro")

  const plans: LandingPlan[] = r.snapshot && r.snapshot.plans.length > 0 ? r.snapshot.plans.map(toPlan) : staticPlans()

  // The note is a template ("{price}" / "{unit}" are filled here); the static
  // default reproduces the old EXTRA_DEVICE_NOTE exactly.
  const device = r.extra("EXTRA_DEVICE")
  const extraNote = fillTemplate(r.text("pricing", "extra_note", DEFAULT_TEXT.pricing.extraNote), {
    price: device ? formatRupiah(device.price) : EXTRA_PRICING.extraDevice.price,
    unit: device ? (device.unit ?? "") : EXTRA_PRICING.extraDevice.unit,
  })

  const testimonialItems: Testimonial[] =
    r.snapshot !== null
      ? r.snapshot.testimonials.map((t) => ({
          quote: t.quote,
          metric: t.metric ?? "",
          metricIcon: resolveIcon(t.metric_icon, resolveIcon("TrendingUp")),
          metricClassName: TONE_BADGE_CLASS[t.tone ?? ""] ?? DEFAULT_BADGE_CLASS,
          name: t.author_name,
          role: t.role ?? "",
          initials: t.initials,
          avatarClassName: TONE_BADGE_CLASS[t.tone ?? ""] ?? DEFAULT_BADGE_CLASS,
        }))
      : TESTIMONIALS

  const testimonialsVisible = r.visible("testimonials", TESTIMONIALS.length > 0) && testimonialItems.length > 0

  const iconList = (key: string, fallback: { icon: LucideIcon; label: string }[]) =>
    r.list(key)?.map((i) => ({ icon: resolveIcon(i.icon), label: i.title })) ?? fallback

  return {
    settings: {
      supportHours,
      copyrightHolder: r.setting("copyright_holder", COPYRIGHT_HOLDER),
      starterSoftDailyLimit: softLimit,
      annualBillingEnabled: r.setting("annual_billing_enabled", false),
      salesWa: r.setting("sales_wa", "") || undefined,
    },
    global: {
      primaryCta: {
        visitor: { label: r.text("global", "primary_cta_visitor_label", PRIMARY_CTA.visitor.label), to: REGISTER_PATH },
        owner: { label: r.text("global", "primary_cta_owner_label", PRIMARY_CTA.owner.label), to: PRIMARY_CTA.owner.to },
      },
      loginLabel: r.text("global", "login_label", DEFAULT_TEXT.loginLabel),
      waCtaLabel: r.text("global", "wa_cta_label", WHATSAPP_CTA_LABEL),
      wa: {
        consult: r.text("global", "wa_msg_consult", DEFAULT_TEXT.waConsult),
        interest: r.text("global", "wa_msg_interest", DEFAULT_TEXT.waInterest),
        help: r.text("global", "wa_msg_help", DEFAULT_TEXT.waHelp),
        plan: r.text("global", "wa_msg_plan", DEFAULT_TEXT.waPlan),
        ownerPlan: r.text("global", "wa_msg_owner_plan", DEFAULT_TEXT.waOwnerPlan),
      },
    },
    visible: {
      testimonials: testimonialsVisible,
      earlyAccess: r.visible("early_access", true),
    },
    navLinks: r.links("header_nav")?.map((l) => ({ href: l.href, label: l.label })) ?? NAV_LINKS,
    hero,
    quickFacts:
      r.list("quick_facts")?.map((i) => ({ icon: resolveIcon(i.icon), label: i.title, body: i.body ?? "" })) ?? QUICK_FACTS,
    problems: {
      ...headingFrom(r, "problems", DEFAULT_TEXT.problems),
      items:
        r.list("problems")?.map((i) => ({ problem: i.title, solution: i.subtitle ?? "", explanation: i.body ?? "" })) ??
        PROBLEMS,
    },
    tour: {
      ...headingFrom(r, "tour", DEFAULT_TEXT.tour),
      cashier: tourStep(tourByKey("cashier"), { title: TOUR_CASHIER.title, body: TOUR_CASHIER.body, images: [cashierImg] }, cashierImg),
      payment: tourStep(tourByKey("payment"), { title: TOUR_PAYMENT.title, body: TOUR_PAYMENT.body, images: paymentImgs }, paymentImgs[0]),
      shift: tourStep(tourByKey("shift"), { title: TOUR_SHIFT.title, body: TOUR_SHIFT.body, images: [shiftImg] }, shiftImg),
      other:
        r.list("tour_other")?.map((i) => ({
          title: i.title,
          body: i.body ?? "",
          badge: i.badge ? i.badge.charAt(0).toUpperCase() + i.badge.slice(1) : undefined,
        })) ?? TOUR_OTHER,
    },
    offline: {
      eyebrow: r.text("offline", "eyebrow", DEFAULT_TEXT.offline.eyebrow),
      title: r.text("offline", "title", DEFAULT_TEXT.offline.title),
      worksTitle: r.text("offline", "works_title", DEFAULT_TEXT.offline.worksTitle),
      worksChip: r.text("offline", "works_chip", DEFAULT_TEXT.offline.worksChip),
      needsTitle: r.text("offline", "needs_title", DEFAULT_TEXT.offline.needsTitle),
      note: r.text("offline", "note", OFFLINE_NOTE),
      works: iconList("offline_works", OFFLINE_WORKS),
      needs: iconList("offline_needs", OFFLINE_NEEDS_INTERNET),
    },
    features: {
      ...headingFrom(r, "features", DEFAULT_TEXT.features),
      proChip: r.text("features", "pro_chip", DEFAULT_TEXT.features.proChip),
      starterTitle: starterPlan?.name ?? "Starter",
      proTitle: proPlan?.name ?? "Pro",
      starter: featureItems(starterPlan, STARTER_FEATURES),
      pro: featureItems(proPlan, PRO_FEATURES),
      platforms:
        r.list("platform_facts")?.map((i) => ({ icon: resolveIcon(i.icon), title: i.title, body: i.body ?? "" })) ??
        PLATFORM_FACTS,
    },
    selfOrder: {
      eyebrow: r.text("self_order", "eyebrow", SELF_ORDER.eyebrow),
      title: r.text("self_order", "title", SELF_ORDER.title),
      body: r.text("self_order", "body", SELF_ORDER.body),
      bullets: r.list("self_order_bullets")?.map((i) => i.title) ?? [...SELF_ORDER.bullets],
    },
    pricing: {
      ...headingFrom(r, "pricing", DEFAULT_TEXT.pricing),
      terms: r.text("pricing", "terms", PRICING_TERMS),
      highlightBadge: r.text("pricing", "highlight_badge", DEFAULT_TEXT.pricing.highlightBadge),
      perMonth: r.text("pricing", "per_month", DEFAULT_TEXT.pricing.perMonth),
      extraNote,
      plans,
    },
    testimonials: { ...headingFrom(r, "testimonials", DEFAULT_TEXT.testimonials), items: testimonialItems },
    earlyAccess: {
      eyebrow: r.text("early_access", "eyebrow", EARLY_ACCESS.eyebrow),
      title: r.text("early_access", "title", EARLY_ACCESS.title),
      description: r.text("early_access", "description", EARLY_ACCESS.description),
      perks:
        r.list("early_access_perks")?.map((i) => ({ icon: resolveIcon(i.icon), title: i.title, body: i.body ?? "" })) ??
        EARLY_ACCESS_PERKS,
    },
    faq: {
      ...headingFrom(r, "faq", DEFAULT_TEXT.faq),
      items: r.snapshot && r.snapshot.faqs.length > 0 ? r.snapshot.faqs : FAQ_ITEMS,
    },
    finalCta: {
      title: r.text("final_cta", "title", FINAL_CTA_TITLE),
      leadVisitor: r.text("final_cta", "lead_visitor", FINAL_CTA_LEAD.visitor),
      leadOwner: r.text("final_cta", "lead_owner", FINAL_CTA_LEAD.owner),
    },
    footer: {
      tagline: r.text("footer", "tagline", FOOTER_TAGLINE),
      columns: footerColumns(r),
      contactTitle: r.text("footer", "group_kontak_title", DEFAULT_TEXT.footer.contactTitle),
      // "{{support_hours}}" is resolved by the server in a CMS value; the static
      // default carries the same placeholder, filled here.
      contactWaLabel: r
        .text("footer", "contact_wa_label", DEFAULT_TEXT.footer.contactWaLabel)
        .replace("{{support_hours}}", supportHours),
      privacyLabel: r.text("footer", "privacy_label", DEFAULT_TEXT.footer.privacyLabel),
      termsLabel: r.text("footer", "terms_label", DEFAULT_TEXT.footer.termsLabel),
    },
  }
}
