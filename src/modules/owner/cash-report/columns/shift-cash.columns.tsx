import { format } from "date-fns"
import { AlertTriangleIcon } from "lucide-react"

import type { ShiftCashRow } from "@/modules/owner/cash-report/cash-report.types"
import { formatSelisih, selisihToneClassName } from "@/modules/owner/cash-report/lib/selisih"
import type { CrudColumn } from "@/shared/api/crud/types"
import { cn, formatRupiah } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"

function formatDateTime(value: string | null) {
  return value ? format(new Date(value), "d MMM yyyy, HH:mm") : "—"
}

export const shiftCashColumns: CrudColumn<ShiftCashRow>[] = [
  {
    key: "kasir_name",
    header: "Kasir",
    render: (row) => <span className="font-medium text-foreground">{row.kasir_name || "—"}</span>,
  },
  {
    key: "opened_at",
    header: "Waktu Buka",
    render: (row) => formatDateTime(row.opened_at),
  },
  {
    key: "closed_at",
    header: "Waktu Tutup",
    render: (row) =>
      row.is_open ? (
        // Neutral/blue, not a warning tone — an open shift isn't a problem,
        // just still in progress.
        <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
          Sedang Buka
        </Badge>
      ) : (
        formatDateTime(row.closed_at)
      ),
  },
  {
    key: "saldo_awal",
    header: "Uang Modal Awal",
    align: "right",
    render: (row) => <span className="tabular-nums">{formatRupiah(row.saldo_awal ?? 0)}</span>,
  },
  {
    key: "kas_masuk",
    header: "Kas Masuk",
    align: "right",
    render: (row) => <span className="tabular-nums">{formatRupiah(row.kas_masuk ?? 0)}</span>,
  },
  {
    key: "kas_keluar",
    header: "Kas Keluar",
    align: "right",
    render: (row) => <span className="tabular-nums">{formatRupiah(row.kas_keluar ?? 0)}</span>,
  },
  {
    key: "penjualan_tunai",
    header: "Penjualan Tunai",
    align: "right",
    render: (row) => <span className="tabular-nums">{formatRupiah(row.penjualan_tunai ?? 0)}</span>,
  },
  {
    key: "estimasi_saldo_akhir",
    // "(live)" caption — this is a provisional estimate, still meaningful
    // for an open shift, unlike saldo_akhir/selisih below which require the
    // shift to be closed and physically counted.
    header: "Perkiraan Uang di Laci (belum final)",
    align: "right",
    render: (row) => (
      <span className="tabular-nums text-muted-foreground">{formatRupiah(row.estimasi_saldo_akhir ?? 0)}</span>
    ),
  },
  {
    key: "saldo_akhir",
    header: "Uang di Laci Saat Tutup",
    align: "right",
    render: (row) =>
      // Em dash, not "Rp0" — a null saldo_akhir means "not counted yet", not
      // "zero cash".
      row.saldo_akhir === null ? (
        <span className="text-muted-foreground" title="Kasir belum ditutup">
          —
        </span>
      ) : (
        <span className="tabular-nums font-semibold text-foreground">{formatRupiah(row.saldo_akhir)}</span>
      ),
  },
  {
    key: "selisih",
    header: "Uang Kurang/Lebih",
    align: "right",
    render: (row) =>
      row.selisih === null ? (
        <span className="text-muted-foreground" title="Kasir belum ditutup">
          —
        </span>
      ) : (
        <span
          className={cn(
            "inline-flex items-center justify-end gap-1 tabular-nums font-semibold",
            selisihToneClassName(row.selisih)
          )}
        >
          {row.is_anomaly && (
            <AlertTriangleIcon className="size-3.5 shrink-0" aria-label="Selisih besar" />
          )}
          {formatSelisih(row.selisih)}
        </span>
      ),
  },
]
