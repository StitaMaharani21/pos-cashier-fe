import { cn } from "@/shared/lib/utils"

export interface PageTab<T extends string> {
  id: T
  label: string
  count?: number
}

// Underlined tabs with count badges above a page that combines two screens
// (Menu: Kategori | Menu, Pengguna: Akun Kasir | Perangkat Kasir).
export function PageTabs<T extends string>({
  label,
  tabs,
  active,
  onChange,
}: {
  label: string
  tabs: PageTab<T>[]
  active: T
  onChange: (id: T) => void
}) {
  return (
    <div role="tablist" aria-label={label} className="-mb-2 flex gap-2 border-b">
      {tabs.map((item) => {
        const selected = item.id === active
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3 pt-1 pb-3 text-sm font-semibold transition-colors",
              selected ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold",
                  selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
