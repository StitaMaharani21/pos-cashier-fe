import { Fragment, useState, type ReactNode } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import type { Module } from "@/shared/access/types"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { CrudServiceError, type CrudColumn, type CrudService } from "@/shared/api/crud/types"
import { STATUS_FILTER_OPTIONS, useClientTable } from "@/shared/hooks/useClientTable"
import { Button } from "@/shared/ui/button"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { CrudDialogFrame } from "@/shared/ui/crud/CrudDialogFrame"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { FilterSelect } from "@/shared/ui/filter-select"
import { PageHeader } from "@/shared/ui/page-header"
import { RowActionButton, RowActions } from "@/shared/ui/row-actions"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet"
import { TablePagination } from "@/shared/ui/table-pagination"
import type { TableEmptyState } from "@/shared/ui/table-states"
import { TableToolbar } from "@/shared/ui/table-toolbar"

interface RenderFormArgs<T, TCreate, TUpdate> {
  row: T | null
  isSubmitting: boolean
  onSubmit: (payload: TCreate | TUpdate) => void
  // Sheet presentation only — the form renders its own Batal / Hapus
  // footer (the dialog variant puts Hapus in the dialog footer instead).
  onCancel: () => void
  onDelete?: () => void
  isDeleting: boolean
}

interface CrudSectionProps<T, TCreate, TUpdate> {
  title: string
  // react-query cache key for this resource's list — keep it unique per
  // feature (e.g. "menu-categories").
  queryKey: string
  service: CrudService<T, TCreate, TUpdate>
  columns: CrudColumn<T>[]
  getRowId: (row: T) => string | number
  // Row name for the action buttons' labels and the delete confirmation.
  getRowLabel: (row: T) => string
  renderForm: (args: RenderFormArgs<T, TCreate, TUpdate>) => ReactNode
  // Page subtitle from the total, e.g. (n) => `${n} voucher terdaftar`.
  describeCount: (total: number) => string
  // Search box (client-side) — the text a row is matched against.
  searchText?: (row: T) => string
  searchPlaceholder?: string
  // "Status: Semua / Aktif / Nonaktif" filter — the row's status value.
  statusOf?: (row: T) => string | undefined
  empty?: TableEmptyState
  minWidth?: string
  // Forwarded to `service.list()` on every fetch — required for backend
  // resources whose list endpoint mandates `page`/`per_page` (e.g.
  // `/master/menu-categories`), which would otherwise 400 with no params.
  listParams?: Record<string, unknown>
  // RBAC module this resource is gated by (see rbac.AllModules() in
  // pos-kasir-be). Omit only for resources RequireAccess already gates at
  // the route level with no finer action-level distinction to make.
  module?: Module
  // "sheet": the form opens in a right-hand drawer (the form owns its
  // scrolling body and footer — see renderForm's onCancel/onDelete).
  presentation?: "dialog" | "sheet"
  // Form subtitle, per mode.
  describeForm?: (row: T | null) => string
  // Feature-specific buttons (RowActionButton) placed before Edit / Hapus in
  // each row's "Aksi" column. Keep the row at three buttons or fewer.
  extraRowActions?: (row: T) => ReactNode
  // Extra UI that lives next to the table (e.g. a dialog the row actions open).
  children?: ReactNode
  // Buttons placed in the toolbar next to "Tambah …" (e.g. "Cetak semua QR").
  toolbarActions?: ReactNode
}

// The orchestrator every owner master-data feature's `section/*.tsx` wires
// up: the standard list page (PageHeader, TableToolbar, CrudTable with an
// "Aksi" column, TablePagination — see shared/ui/README.md "Tabel") plus
// create/edit form and delete confirmation, all against a CrudService. The
// whole list is fetched once; search, filter and paging are client-side.
export function CrudSection<T, TCreate, TUpdate>({
  title,
  queryKey,
  service,
  columns,
  getRowId,
  getRowLabel,
  renderForm,
  describeCount,
  searchText,
  searchPlaceholder = "Cari...",
  statusOf,
  empty,
  minWidth,
  listParams,
  module,
  presentation = "dialog",
  describeForm,
  extraRowActions,
  children,
  toolbarActions,
}: CrudSectionProps<T, TCreate, TUpdate>) {
  const queryClient = useQueryClient()
  const { can } = useCapabilities()
  const canCreate = can(module, "create")
  const canEdit = can(module, "edit")
  const canDelete = can(module, "delete")
  const [dialogState, setDialogState] = useState<{ open: boolean; row: T | null; session: number }>({
    open: false,
    row: null,
    session: 0,
  })
  const [deleting, setDeleting] = useState<T | null>(null)
  // Each open is a fresh form (keyed by session), and the row is kept while
  // the drawer animates closed so its content doesn't flip to "Tambah".
  const openForm = (row: T | null) => setDialogState((state) => ({ open: true, row, session: state.session + 1 }))

  const { data: rows = [], isLoading } = useQuery({
    queryKey: [queryKey, listParams],
    queryFn: () => service.list(listParams),
  })

  const table = useClientTable({ rows, searchText: searchText ?? (() => ""), filterValue: statusOf })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [queryKey] })
  const closeDialog = () => setDialogState((state) => ({ ...state, open: false }))

  const createMutation = useMutation({
    mutationFn: (payload: TCreate) => service.create(payload),
    onSuccess: () => {
      toast.success(`${title} ditambahkan`)
      closeDialog()
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: TUpdate }) =>
      service.update(id, payload),
    onSuccess: () => {
      toast.success(`${title} diperbarui`)
      closeDialog()
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string | number) => service.remove(id),
    onSuccess: () => {
      toast.success(`${title} dihapus`)
      closeDialog()
      setDeleting(null)
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const editingRow = dialogState.row
  const formTitle = editingRow ? `Edit ${title}` : `Tambah ${title}`
  const form = renderForm({
    row: editingRow,
    isSubmitting,
    onSubmit: (payload) => {
      if (editingRow) {
        updateMutation.mutate({ id: getRowId(editingRow), payload: payload as TUpdate })
      } else {
        createMutation.mutate(payload as TCreate)
      }
    },
    onCancel: closeDialog,
    onDelete:
      presentation === "sheet" && editingRow && canDelete
        ? () => removeMutation.mutate(getRowId(editingRow))
        : undefined,
    isDeleting: removeMutation.isPending,
  })

  const tableColumns: CrudColumn<T>[] =
    canEdit || canDelete || extraRowActions
      ? [
          ...columns,
          {
            key: "actions",
            header: "Aksi",
            className: extraRowActions ? "w-40" : "w-28",
            render: (row) => (
              <RowActions>
                {extraRowActions?.(row)}
                {canEdit && (
                  <RowActionButton icon={PencilIcon} label={`Edit ${getRowLabel(row)}`} onClick={() => openForm(row)} />
                )}
                {canDelete && (
                  <RowActionButton
                    icon={Trash2Icon}
                    tone="danger"
                    label={`Hapus ${getRowLabel(row)}`}
                    onClick={() => setDeleting(row)}
                  />
                )}
              </RowActions>
            ),
          },
        ]
      : columns

  const noun = title.toLowerCase()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={describeCount(rows.length)} />

      <TableToolbar
        search={searchText ? table.search : undefined}
        onSearchChange={searchText ? table.setSearch : undefined}
        searchPlaceholder={searchPlaceholder}
        filtering={table.filtering}
        onReset={table.reset}
        action={
          (toolbarActions || canCreate) && (
            <div className="flex flex-wrap gap-2">
              {toolbarActions}
              {canCreate && (
                <Button className="h-10" onClick={() => openForm(null)}>
                  <PlusIcon />
                  Tambah {title}
                </Button>
              )}
            </div>
          )
        }
      >
        {statusOf && (
          <FilterSelect label="Status" value={table.filter} options={STATUS_FILTER_OPTIONS} onChange={table.setFilter} />
        )}
      </TableToolbar>

      <CrudTable
        columns={tableColumns}
        rows={table.pageRows}
        getRowId={getRowId}
        isLoading={isLoading}
        minWidth={minWidth}
        empty={
          table.filtering
            ? { title: `Tidak ada ${noun} yang cocok`, hint: "Ubah kata kunci atau filter." }
            : empty ?? { title: `Belum ada ${noun}` }
        }
        footer={
          !isLoading &&
          table.total > 0 && (
            <TablePagination
              page={table.page}
              totalPages={table.totalPages}
              total={table.total}
              perPage={table.perPage}
              noun={noun}
              onPageChange={table.setPage}
            />
          )
        }
      />

      {presentation === "sheet" ? (
        <Sheet open={dialogState.open} onOpenChange={(open) => (open ? undefined : closeDialog())}>
          <SheetContent className="flex max-w-xl flex-col p-0">
            <SheetHeader className="pr-14">
              <SheetTitle className="text-xl font-bold">{formTitle}</SheetTitle>
              {describeForm && <SheetDescription>{describeForm(dialogState.row)}</SheetDescription>}
            </SheetHeader>
            <Fragment key={dialogState.session}>{form}</Fragment>
          </SheetContent>
        </Sheet>
      ) : (
        <CrudDialogFrame
          open={dialogState.open}
          onOpenChange={(open) => setDialogState((state) => ({ ...state, open }))}
          title={formTitle}
          description={describeForm?.(dialogState.row)}
        >
          <Fragment key={dialogState.session}>{form}</Fragment>
        </CrudDialogFrame>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Hapus ${noun}?`}
        description={deleting ? `"${getRowLabel(deleting)}" akan dihapus permanen.` : undefined}
        isPending={removeMutation.isPending}
        onConfirm={() => deleting && removeMutation.mutate(getRowId(deleting))}
      />

      {children}
    </div>
  )
}

function errorMessage(error: unknown): string {
  if (error instanceof CrudServiceError) return error.message
  return "Terjadi kesalahan"
}
