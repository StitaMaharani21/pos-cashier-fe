import { ListPlusIcon } from "lucide-react"

import type { AddonGroup } from "@/entities/menu-addon/model/menu-addon.types"
import {
  ADDON_GROUPS_KEY,
  menuAddonService,
  type AddonGroupDraft,
} from "@/modules/owner/menu-addon/api/menu-addon.service"
import { menuAddonColumns } from "@/modules/owner/menu-addon/columns/menu-addon.columns"
import { AddonGroupForm } from "@/modules/owner/menu-addon/components/AddonGroupForm"
import { CrudSection } from "@/shared/ui/crud/CrudSection"

// Add-ons a customer can pick on a menu for a surcharge (e.g. "Tambahan":
// Gula +Rp5.000). A group is created once here and attached to as many menus
// as needed — the cashier app and the QR self-order page read them from the
// menu detail.
export function MenuAddonSection() {
  return (
    <CrudSection<AddonGroup, AddonGroupDraft, AddonGroupDraft>
      title="Addon Menu"
      queryKey={ADDON_GROUPS_KEY}
      service={menuAddonService}
      module="menu"
      listParams={{ page: 1, per_page: 100 }}
      columns={menuAddonColumns}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      describeCount={(total) => `${total} grup addon terdaftar`}
      searchText={(row) => `${row.name} ${(row.options ?? []).map((option) => option.name).join(" ")}`}
      searchPlaceholder="Cari grup atau opsi addon..."
      statusOf={(row) => row.status}
      empty={{
        icon: ListPlusIcon,
        title: "Belum ada addon menu",
        hint: 'Buat grup seperti "Tambahan" berisi Gula +Rp5.000, lalu pilih menu yang menawarkannya.',
      }}
      presentation="sheet"
      describeForm={(row) =>
        row ? "Perbarui opsi, harga, dan menu yang memakai grup ini" : "Pilihan tambahan berbayar yang bisa dipilih customer"
      }
      renderForm={(args) => <AddonGroupForm {...args} />}
    />
  )
}
