import { TYPE_META } from "@/modules/owner/payment-method/constants/payment-type-meta"
import { cn } from "@/shared/lib/utils"
import { Switch } from "@/shared/ui/switch"

interface MethodListItemProps {
  type: string
  name: string
  summary: string
  active: boolean
  selected: boolean
  toggling: boolean
  onSelect: () => void
  onToggle: (next: boolean) => void
}

// One row of "Daftar Metode Pembayaran": select to open its settings, the
// switch turns the method on/off right away (saved immediately).
export function MethodListItem({
  type,
  name,
  summary,
  active,
  selected,
  toggling,
  onSelect,
  onToggle,
}: MethodListItemProps) {
  const meta = TYPE_META[type]
  const Icon = meta.icon

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors",
        selected ? "border-primary ring-1 ring-primary" : "hover:bg-muted/40",
        !active && !selected && "bg-muted/40"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            meta.tile,
            !active && "opacity-50"
          )}
        >
          <Icon className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className={cn("truncate text-sm font-bold", active ? "text-foreground" : "text-muted-foreground")}>
              {name}
            </span>
            {!active && (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Nonaktif
              </span>
            )}
          </span>
          <span className="block truncate text-xs text-muted-foreground">{summary}</span>
        </span>
      </button>
      <Switch
        checked={active}
        disabled={toggling}
        onCheckedChange={onToggle}
        aria-label={`${active ? "Nonaktifkan" : "Aktifkan"} ${name}`}
        className="data-[state=checked]:bg-emerald-500"
      />
    </div>
  )
}
