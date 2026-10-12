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
    <div
      role="tablist"
      aria-label={label}
      className="-mb-2 flex gap-2 overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
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
              "-mb-px flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3 pt-1 pb-3 text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected ? "border-primary text-primary-strong" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold",
                  selected ? "bg-primary/10 text-primary-strong" : "bg-muted text-muted-foreground"
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
