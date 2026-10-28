// Shape of GET /public/cms/landing (pos-kasir-be internal/central/cms, dto.Snapshot).
// Hand-written: the endpoint sits outside the owner swagger the type generator reads.
// Bump SUPPORTED_SCHEMA_VERSION only together with a resolver change; a snapshot
// with a newer schema is ignored (the static fallback renders instead).

export const SUPPORTED_SCHEMA_VERSION = 1

export interface CmsMedia {
  id: number
  key?: string
  url: string
  width?: number
  height?: number
  alt: string
}

export interface CmsItem {
  key?: string
  icon?: string
  tone?: string
  badge?: string
  href?: string
  title: string
  subtitle?: string
  body?: string
  media?: CmsMedia[]
}

export interface CmsPlan {
  code: string
  name: string
  description?: string
  price: number
  annual_price?: number
  price_prefix?: string
  includes_previous?: string
  note?: string
  cashiers_label?: string
  devices_label?: string
  cta_action: "register" | "sales"
  cta_label?: string
  owner_cta_label?: string
  highlighted: boolean
  features: { icon?: string; label: string }[]
}

export interface CmsExtra {
  code: string
  title: string
  description?: string
  price: number
  unit?: string
}

export interface CmsTestimonial {
  author_name: string
  initials: string
  metric_icon?: string
  tone?: string
  quote: string
  metric?: string
  role?: string
}

export interface CmsLink {
  href: string
  label: string
  external?: boolean
}

export interface CmsSection {
  key: string
  anchor_id?: string
  visible: boolean
}

export interface CmsSnapshot {
  schema_version: number
  locale: string
  settings: Record<string, string | number | boolean>
  sections: CmsSection[]
  blocks: Record<string, Record<string, string | CmsMedia>>
  lists: Record<string, CmsItem[]>
  plans: CmsPlan[]
  extra_pricing: CmsExtra[]
  faqs: { question: string; answer: string }[]
  testimonials: CmsTestimonial[]
  links: Record<string, CmsLink[]>
}

export interface CmsLandingResponse {
  message: string
  version: number
  locale: string
  data: CmsSnapshot
}
