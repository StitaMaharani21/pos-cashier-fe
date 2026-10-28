import type {
  CmsExtra,
  CmsItem,
  CmsLink,
  CmsMedia,
  CmsPlan,
  CmsSnapshot,
} from "@/modules/public/shared/cms/cms.types"

// "Rp99.000" — the style the static content already uses (no space).
export function formatRupiah(amount: number): string {
  return `Rp${amount.toLocaleString("id-ID")}`
}

// The CMS stores a tone name instead of Tailwind classes. Only classes that
// already exist in landing.css are used, so no new tokens are needed.
export const TONE_BADGE_CLASS: Record<string, string> = {
  primary: "bg-neela-primary-selected text-neela-primary-strong",
  success: "bg-neela-success-bg text-neela-success-text",
  warning: "bg-neela-warning-bg text-neela-warning-text",
  danger: "bg-neela-danger/10 text-neela-danger",
  neutral: "bg-neela-surface-alt text-neela-text-secondary",
}
export const DEFAULT_BADGE_CLASS = TONE_BADGE_CLASS.primary

export const TONE_ICON_CLASS: Record<string, string> = {
  primary: "text-neela-primary",
  secondary: "text-neela-secondary",
  tertiary: "text-neela-tertiary",
}

// Fills "{price}"-style placeholders the server leaves for the client
// ({{setting}} placeholders are already resolved at publish time).
export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match)
}

// Reads one field at a time, always with the static value to fall back on, so a
// half-filled CMS (or no CMS at all) never leaves a hole in the page.
export function makeReader(snapshot: CmsSnapshot | null | undefined) {
  const snap = snapshot ?? null

  return {
    snapshot: snap,

    text(section: string, field: string, fallback: string): string {
      const v = snap?.blocks?.[section]?.[field]
      return typeof v === "string" && v !== "" ? v : fallback
    },

    media(section: string, field: string): CmsMedia | undefined {
      const v = snap?.blocks?.[section]?.[field]
      return v !== undefined && typeof v === "object" ? v : undefined
    },

    // undefined (not []) when the CMS has nothing, so callers pick the fallback list.
    list(key: string): CmsItem[] | undefined {
      const l = snap?.lists?.[key]
      return l && l.length > 0 ? l : undefined
    },

    setting<T extends string | number | boolean>(key: string, fallback: T): T {
      const v = snap?.settings?.[key]
      return typeof v === typeof fallback && v !== "" ? (v as T) : fallback
    },

    visible(section: string, fallback = true): boolean {
      const s = snap?.sections?.find((x) => x.key === section)
      return s ? s.visible : fallback
    },

    plan(code: string): CmsPlan | undefined {
      return snap?.plans?.find((p) => p.code === code)
    },

    extra(code: string): CmsExtra | undefined {
      return snap?.extra_pricing?.find((e) => e.code === code)
    },

    links(group: string): CmsLink[] | undefined {
      const l = snap?.links?.[group]
      return l && l.length > 0 ? l : undefined
    },
  }
}

export type CmsReader = ReturnType<typeof makeReader>
