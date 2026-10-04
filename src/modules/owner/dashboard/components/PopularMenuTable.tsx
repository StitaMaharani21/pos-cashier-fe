import { UtensilsCrossedIcon } from "lucide-react"
import { Link } from "react-router-dom"

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
import { IconTile, TitleCell } from "@/shared/ui/table-cells"
import { TableEmptyRow, TableSkeletonRows } from "@/shared/ui/table-states"

export function PopularMenuTable() {
  const { data, isPending } = usePopularMenu(5)

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-card lg:col-span-2">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-lg font-bold text-foreground">Menu Terpopuler Minggu Ini</h2>
        <Link
          to="/app/financial-report?tab=top-products"
          className="text-sm font-medium text-primary hover:underline"
        >
          Lihat Laporan
        </Link>
      </div>

      <Table className="min-w-[520px]">
        <TableHeader>
          <TableRow>
            <TableHead>Menu</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Terjual</TableHead>
            <TableHead className="text-right">Pendapatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending && <TableSkeletonRows colSpan={4} />}

          {!isPending && (data?.length ?? 0) === 0 && (
            <TableEmptyRow colSpan={4} icon={UtensilsCrossedIcon} title="Belum ada penjualan minggu ini" />
          )}

          {data?.map((item) => (
            <TableRow key={item.menu_id}>
              <TableCell>
                <TitleCell
                  leading={
                    item.image_url ? (
                      <img src={item.image_url} alt="" className="size-9 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <IconTile icon={UtensilsCrossedIcon} className="bg-muted text-muted-foreground" />
                    )
                  }
                  title={item.name}
                />
              </TableCell>
              <TableCell className="text-muted-foreground">{item.category_name}</TableCell>
              <TableCell className="text-right tabular-nums">{item.qty_sold}</TableCell>
              <TableCell className="text-right font-semibold tabular-nums">{formatRupiah(item.revenue ?? 0)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
