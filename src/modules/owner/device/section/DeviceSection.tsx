import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { BanIcon, PlusIcon, TabletSmartphoneIcon } from "lucide-react"
import { toast } from "sonner"

import type { Device } from "@/entities/device/model/device.types"
import { DEVICES_KEY, listDevices, revokeDevice } from "@/modules/owner/device/api/device.service"
import { PairingQrDialog } from "@/modules/owner/device/components/PairingQrDialog"
import { DEVICE_FILTER_OPTIONS, DEVICE_STATE_META, deviceState } from "@/modules/owner/device/lib/device-status"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { CrudServiceError, type CrudColumn } from "@/shared/api/crud/types"
import { useClientTable } from "@/shared/hooks/useClientTable"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { FilterSelect } from "@/shared/ui/filter-select"
import { PageHeader } from "@/shared/ui/page-header"
import { RowActionButton, RowActions } from "@/shared/ui/row-actions"
import { IconTile, TitleCell } from "@/shared/ui/table-cells"
import { TablePagination } from "@/shared/ui/table-pagination"
import { TableToolbar } from "@/shared/ui/table-toolbar"

function formatDateTime(value?: string): string {
  return value ? format(new Date(value), "d MMM yyyy, HH:mm", { locale: localeId }) : "—"
}

function formatAgo(value?: string): string {
  return value ? formatDistanceToNow(new Date(value), { addSuffix: true, locale: localeId }) : "—"
}

// "Perangkat Kasir" tab of /app/users: devices paired through the QR
// (pos-kasir-be internal/central/device). Only a BOUND device can log a
// cashier in; revoking one cuts its session off on the next request.
export function DeviceSection() {
  const queryClient = useQueryClient()
  const { can } = useCapabilities()
  const [pairingOpen, setPairingOpen] = useState(false)
  const [revoking, setRevoking] = useState<Device | null>(null)

  const { data: devices = [], isPending, isError, refetch } = useQuery({
    queryKey: DEVICES_KEY,
    queryFn: listDevices,
  })

  const table = useClientTable({
    rows: devices,
    searchText: (device) => `${device.name ?? ""} ${device.device_id ?? ""}`,
    filterValue: (device) => deviceState(device),
  })

  const revokeMutation = useMutation({
    mutationFn: (device: Device) => revokeDevice(device.device_id ?? ""),
    onSuccess: () => {
      toast.success("Akses perangkat dicabut")
      setRevoking(null)
      queryClient.invalidateQueries({ queryKey: DEVICES_KEY })
    },
    onError: (error) => toast.error(error instanceof CrudServiceError ? error.message : "Terjadi kesalahan"),
  })

  const canManage = can("user", "edit")
  const bound = devices.filter((device) => device.status === "BOUND").length
  const label = (device: Device) => device.name || "Perangkat tanpa nama"

  const columns: CrudColumn<Device>[] = [
    {
      key: "name",
      header: "Perangkat",
      render: (device) => (
        <TitleCell
          leading={<IconTile icon={TabletSmartphoneIcon} />}
          title={label(device)}
          subtitle={<span className="font-mono">ID {device.device_id?.slice(0, 8)}</span>}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-40",
      render: (device) => {
        const meta = DEVICE_STATE_META[deviceState(device)]
        return (
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", meta.className)}>
            <span aria-hidden className={cn("size-1.5 rounded-full", meta.dot)} />
            {meta.label}
          </span>
        )
      },
    },
    {
      key: "bound_at",
      header: "Terhubung Sejak",
      className: "text-muted-foreground",
      render: (device) => formatDateTime(device.bound_at),
    },
    {
      key: "last_seen_at",
      header: "Terakhir Aktif",
      className: "text-muted-foreground",
      render: (device) => formatAgo(device.last_seen_at),
    },
  ]

  if (canManage) {
    columns.push({
      key: "actions",
      header: "Aksi",
      className: "w-24",
      render: (device) => {
        const state = deviceState(device)
        if (state !== "bound" && state !== "pending") return <span className="text-muted-foreground">—</span>
        return (
          <RowActions>
            <RowActionButton
              icon={BanIcon}
              tone="danger"
              label={`Cabut akses ${label(device)}`}
              onClick={() => setRevoking(device)}
            />
          </RowActions>
        )
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Perangkat Kasir"
        description={`${bound} perangkat terhubung · hanya perangkat terdaftar yang bisa login kasir`}
      />

      <TableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Cari nama atau ID perangkat..."
        filtering={table.filtering}
        onReset={table.reset}
        action={
          canManage && (
            <Button className="h-10" onClick={() => setPairingOpen(true)}>
              <PlusIcon />
              Hubungkan Perangkat
            </Button>
          )
        }
      >
        <FilterSelect label="Status" value={table.filter} options={DEVICE_FILTER_OPTIONS} onChange={table.setFilter} />
      </TableToolbar>

      <CrudTable
        columns={columns}
        rows={table.pageRows}
        getRowId={(device) => device.device_id ?? ""}
        isLoading={isPending}
        isError={isError}
        onRetry={() => refetch()}
        empty={
          table.filtering
            ? { title: "Tidak ada perangkat yang cocok", hint: "Ubah kata kunci atau filter." }
            : {
                icon: TabletSmartphoneIcon,
                title: "Belum ada perangkat kasir",
                hint: "Klik \"Hubungkan Perangkat\", lalu pindai QR-nya dari aplikasi kasir. Perangkat lain tidak akan bisa login kasir.",
              }
        }
        footer={
          !isPending &&
          table.total > 0 && (
            <TablePagination
              page={table.page}
              totalPages={table.totalPages}
              total={table.total}
              perPage={table.perPage}
              noun="perangkat"
              onPageChange={table.setPage}
            />
          )
        }
      />

      <PairingQrDialog open={pairingOpen} onOpenChange={setPairingOpen} />

      <ConfirmDialog
        open={revoking !== null}
        onOpenChange={(open) => !open && setRevoking(null)}
        title="Cabut akses perangkat?"
        description={
          revoking
            ? `"${label(revoking)}" tidak bisa dipakai login kasir lagi, dan sesi kasir yang sedang berjalan di perangkat itu langsung terputus. Untuk memakainya lagi, pasangkan ulang lewat QR.`
            : undefined
        }
        confirmLabel="Cabut akses"
        pendingLabel="Mencabut..."
        isPending={revokeMutation.isPending}
        onConfirm={() => revoking && revokeMutation.mutate(revoking)}
      />
    </div>
  )
}
