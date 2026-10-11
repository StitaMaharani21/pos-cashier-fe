import { ListPlusIcon } from "lucide-react"

import type { AddonGroup } from "@/entities/menu-addon/model/menu-addon.types"
import {
  ADDON_GROUPS_KEY,
  ADDON_LIST_PARAMS,
  menuAddonService,
  type AddonGroupDraft,
} from "@/modules/owner/menu-addon/api/menu-addon.service"
import { menuAddonColumns } from "@/modules/owner/menu-addon/columns/menu-addon.columns"
import { AddonGroupForm } from "@/modules/owner/menu-addon/components/AddonGroupForm"
import { CrudSection } from "@/shared/ui/crud/CrudSection"

// "Tambahan" tab of /app/menu: every add-on group (e.g. "Tambahan": Gula
// +Rp5.000) a pelanggan can pick on a menu for a surcharge. Groups are
// normally created and attached while adding/editing a menu (MenuForm); this
// list is for reviewing them and editing a group shared by many menus. The
// cashier app and the QR self-order page read them from the menu detail.
export function MenuAddonSection() {
  return (
    <CrudSection<AddonGroup, AddonGroupDraft, AddonGroupDraft>
      title="Tambahan Menu"
      queryKey={ADDON_GROUPS_KEY}
      service={menuAddonService}
      module="menu"
      listParams={ADDON_LIST_PARAMS}
      columns={menuAddonColumns}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      describeCount={(total) => `${total} grup tambahan terdaftar`}
      searchText={(row) => `${row.name} ${(row.options ?? []).map((option) => option.name).join(" ")}`}
      searchPlaceholder="Cari grup atau pilihan tambahan..."
      statusOf={(row) => row.status}
      empty={{
        icon: ListPlusIcon,
        title: "Belum ada tambahan menu",
        hint: 'Buat grup seperti "Tambahan" berisi Gula +Rp5.000, lalu pilih menu yang menawarkannya.',
      }}
      presentation="sheet"
      describeForm={(row) =>
        row ? "Perbarui opsi, harga, dan menu yang memakai grup ini" : "Pilihan tambahan berbayar yang bisa dipilih pelanggan"
      }
      renderForm={(args) => <AddonGroupForm {...args} />}
    />
  )
}
