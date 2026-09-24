import type {
  CreateMenuCategoryPayload,
  MenuCategory,
  UpdateMenuCategoryPayload,
} from "@/entities/menu-category/model/menu-category.types"
import { menuCategoryColumns } from "@/modules/owner/menu-category/columns/menu-category.columns"
import { MenuCategoryForm } from "@/modules/owner/menu-category/components/MenuCategoryForm"
import { createCrudService } from "@/shared/api/crud/createCrudService"
import { CrudSection } from "@/shared/ui/crud/CrudSection"

const menuCategoryService = createCrudService<
  MenuCategory,
  CreateMenuCategoryPayload,
  UpdateMenuCategoryPayload
>("/master/menu-categories")

export function MenuCategorySection() {
  return (
    <CrudSection
      title="Kategori"
      queryKey="menu-categories"
      service={menuCategoryService}
      module="menu"
      listParams={{ page: 1, per_page: 100 }}
      columns={menuCategoryColumns}
      getRowId={(row) => row.id ?? 0}
      emptyMessage="Belum ada kategori menu."
      renderForm={({ row, isSubmitting, onSubmit }) => (
        <MenuCategoryForm row={row} isSubmitting={isSubmitting} onSubmit={onSubmit} />
      )}
    />
  )
}
