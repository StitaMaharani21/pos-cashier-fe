import { BadgePercentIcon } from "lucide-react"

import type {
  CreateProductDiscountPayload,
  ProductDiscount,
  UpdateProductDiscountPayload,
} from "@/entities/product-discount/model/product-discount.types"
import { productDiscountColumns } from "@/modules/owner/product-discount/columns/product-discount.columns"
import { ProductDiscountForm } from "@/modules/owner/product-discount/components/ProductDiscountForm"
import { createCrudService } from "@/shared/api/crud/createCrudService"
import { CrudSection } from "@/shared/ui/crud/CrudSection"

const productDiscountService = createCrudService<
  ProductDiscount,
  CreateProductDiscountPayload,
  UpdateProductDiscountPayload
>("/master/discounts/product-discounts")

export function ProductDiscountSection() {
  return (
    <CrudSection
      title="Diskon Otomatis"
      queryKey="product-discounts"
      service={productDiscountService}
      module="discount"
      listParams={{ page: 1, per_page: 100 }}
      columns={productDiscountColumns}
      getRowId={(row) => row.id ?? 0}
      getRowLabel={(row) => row.name ?? "diskon"}
      describeCount={(total) => `${total} diskon otomatis terdaftar`}
      searchText={(row) => `${row.name ?? ""} ${row.menus?.map((menu) => menu.menu_name).join(" ") ?? ""}`}
      searchPlaceholder="Cari nama diskon atau menu..."
      statusOf={(row) => row.status}
      minWidth="min-w-[860px]"
      empty={{
        icon: BadgePercentIcon,
        title: "Belum ada diskon otomatis",
        hint: "Diskon otomatis langsung terpasang saat menu terpilih masuk keranjang.",
      }}
      presentation="sheet"
      describeForm={(row) =>
        row ? "Perbarui aturan diskon otomatis" : "Potongan harga yang terpasang otomatis pada menu terpilih"
      }
      renderForm={(args) => <ProductDiscountForm {...args} />}
    />
  )
}
