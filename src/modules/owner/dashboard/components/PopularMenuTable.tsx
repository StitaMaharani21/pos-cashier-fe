import { UtensilsCrossedIcon } from "lucide-react"

import { usePopularMenu } from "@/modules/owner/dashboard/dashboard.queries"
import { formatRupiah } from "@/shared/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

export function PopularMenuTable() {
  const { data, isPending } = usePopularMenu(5)

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between border-b px-4 py-4">
        <h2 className="text-xl font-semibold text-foreground">Menu Terpopuler Minggu Ini</h2>
        <button type="button" className="text-sm font-medium text-primary hover:underline">
          Lihat Semua
        </button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-primary/10 hover:bg-primary/10">
            <TableHead className="font-semibold text-foreground">Nama Menu</TableHead>
            <TableHead className="font-semibold text-foreground">Kategori</TableHead>
            <TableHead className="text-right font-semibold text-foreground">Jumlah</TableHead>
            <TableHead className="text-right font-semibold text-foreground">
              Pendapatan
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                Memuat...
              </TableCell>
            </TableRow>
          )}

          {!isPending && (data?.length ?? 0) === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                Belum ada data penjualan minggu ini.
              </TableCell>
            </TableRow>
          )}

          {data?.map((item) => (
            <TableRow key={item.menu_id}>
              <TableCell>
                <div className="flex items-center gap-2 whitespace-normal">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt=""
                      className="size-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <UtensilsCrossedIcon className="size-4 text-muted-foreground" />
                    </span>
                  )}
                  <span className="font-medium text-foreground">{item.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-primary">{item.category_name}</TableCell>
              <TableCell className="text-right">{item.qty_sold}</TableCell>
              <TableCell className="text-right">{formatRupiah(item.revenue ?? 0)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
