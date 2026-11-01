import { ClockIcon, PencilIcon, PowerIcon, PowerOffIcon, StarIcon } from "lucide-react"

import type { Menu } from "@/entities/menu/model/menu.types"
import { stockLabel } from "@/modules/owner/menu/constants/menu-display"
import { formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet"
import { StatusBadge } from "@/shared/ui/status-badge"

interface MenuPreviewSheetProps {
  menu: Menu | null
  canEdit: boolean
  isTogglingStatus: boolean
  onClose: () => void
  onEdit: (menu: Menu) => void
  // Switch the menu on/off (menus are never deleted).
  onToggleStatus: (menu: Menu) => void
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{children}</span>
    </div>
  )
}

// The eye action: a read-only look at one menu, with edit / nonaktifkan from
// here (the list row itself only has edit + view, per the design).
export function MenuPreviewSheet({ menu, canEdit, isTogglingStatus, onClose, onEdit, onToggleStatus }: MenuPreviewSheetProps) {
  return (
    <Sheet open={menu !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col gap-0 p-0">
        {menu && (
          <>
            <SheetHeader>
              <SheetTitle>{menu.name}</SheetTitle>
              <SheetDescription>{menu.code}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
              {menu.image_url ? (
                <img src={menu.image_url} alt={menu.name ?? ""} className="aspect-video w-full rounded-xl object-cover" />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
                  Belum ada foto
                </div>
              )}
              {menu.description && <p className="text-sm text-muted-foreground">{menu.description}</p>}
              <div>
                <Row label="Kategori">{menu.category_name || "—"}</Row>
                <Row label="Harga">
                  {menu.discount && menu.final_price !== menu.price ? (
                    <>
                      {formatRupiah(menu.final_price ?? 0)}{" "}
                      <span className="text-xs font-normal text-muted-foreground line-through">{formatRupiah(menu.price ?? 0)}</span>
                    </>
                  ) : (
                    formatRupiah(menu.price ?? 0)
                  )}
                </Row>
                <Row label="Stok">{stockLabel(menu)}</Row>
                <Row label="Estimasi penyajian">
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon className="size-3.5 text-muted-foreground" />
                    {menu.preparation_time ? `${menu.preparation_time} menit` : "—"}
                  </span>
                </Row>
                <Row label="Status">
                  <StatusBadge
                    active={menu.effective_active ?? menu.status !== "inactive"}
                    inactiveLabel={menu.inactive_reason === "category" ? "Nonaktif (kategori)" : "Nonaktif"}
                  />
                </Row>
                <Row label="Tersedia">
                  <StatusBadge active={menu.is_available ?? false} activeLabel="Tersedia" inactiveLabel="Tidak tersedia" />
                </Row>
                <Row label="Unggulan">
                  {menu.is_featured ? (
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <StarIcon className="size-3.5 fill-amber-400 text-amber-500" /> Ya
                    </span>
                  ) : (
                    "Tidak"
                  )}
                </Row>
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-2.5 border-t px-6 py-4">
                {menu.status === "inactive" ? (
                  <Button variant="outline" disabled={isTogglingStatus} onClick={() => onToggleStatus(menu)}>
                    <PowerIcon />
                    Aktifkan
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    disabled={isTogglingStatus}
                    onClick={() => onToggleStatus(menu)}
                  >
                    <PowerOffIcon />
                    Nonaktifkan
                  </Button>
                )}
                {canEdit && (
                  <Button className="flex-1" onClick={() => onEdit(menu)}>
                    <PencilIcon />
                    Ubah Menu
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
