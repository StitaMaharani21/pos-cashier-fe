import { useState, type ReactNode } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { Module } from "@/shared/access/types"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { CrudServiceError, type CrudColumn, type CrudService } from "@/shared/api/crud/types"
import { Button } from "@/shared/ui/button"
import { CrudDialogFrame } from "@/shared/ui/crud/CrudDialogFrame"
import { CrudTable } from "@/shared/ui/crud/CrudTable"

interface RenderFormArgs<T, TCreate, TUpdate> {
  row: T | null
  isSubmitting: boolean
  onSubmit: (payload: TCreate | TUpdate) => void
}

interface CrudSectionProps<T, TCreate, TUpdate> {
  title: string
  // react-query cache key for this resource's list — keep it unique per
  // feature (e.g. "menu-categories").
  queryKey: string
  service: CrudService<T, TCreate, TUpdate>
  columns: CrudColumn<T>[]
  getRowId: (row: T) => string | number
  renderForm: (args: RenderFormArgs<T, TCreate, TUpdate>) => ReactNode
  emptyMessage?: string
  // Forwarded to `service.list()` on every fetch — required for backend
  // resources whose list endpoint mandates `page`/`per_page` (e.g.
  // `/master/menu-categories`), which would otherwise 400 with no params.
  listParams?: Record<string, unknown>
  // RBAC module this resource is gated by (see rbac.AllModules() in
  // pos-kasir-be). Omit only for resources RequireAccess already gates at
  // the route level with no finer action-level distinction to make.
  module?: Module
}

// The orchestrator every owner master-data feature's `section/*.tsx` wires
// up: list + create/edit dialog + delete, all against a CrudService. Mirrors
// oasis-college-web's CrudSection — agnostic to what's behind the service
// (there it was Supabase, here it's the Go API via createCrudService).
export function CrudSection<T, TCreate, TUpdate>({
  title,
  queryKey,
  service,
  columns,
  getRowId,
  renderForm,
  emptyMessage,
  listParams,
  module,
}: CrudSectionProps<T, TCreate, TUpdate>) {
  const queryClient = useQueryClient()
  const { can } = useCapabilities()
  const canCreate = can(module, "create")
  const canEdit = can(module, "edit")
  const canDelete = can(module, "delete")
  const [dialogState, setDialogState] = useState<{ open: boolean; row: T | null }>({
    open: false,
    row: null,
  })

  const { data: rows = [], isLoading } = useQuery({
    queryKey: [queryKey, listParams],
    queryFn: () => service.list(listParams),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [queryKey] })
  const closeDialog = () => setDialogState({ open: false, row: null })

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
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {canCreate && (
          <Button onClick={() => setDialogState({ open: true, row: null })}>
            Tambah {title}
          </Button>
        )}
      </div>

      <CrudTable
        columns={columns}
        rows={rows}
        getRowId={getRowId}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        onRowClick={canEdit ? (row) => setDialogState({ open: true, row }) : undefined}
      />

      <CrudDialogFrame
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((state) => ({ ...state, open }))}
        title={dialogState.row ? `Edit ${title}` : `Tambah ${title}`}
        footer={
          dialogState.row &&
          canDelete && (
            <Button
              type="button"
              variant="destructive"
              disabled={removeMutation.isPending}
              onClick={() => removeMutation.mutate(getRowId(dialogState.row!))}
            >
              Hapus
            </Button>
          )
        }
      >
        {renderForm({
          row: dialogState.row,
          isSubmitting,
          onSubmit: (payload) => {
            if (dialogState.row) {
              updateMutation.mutate({
                id: getRowId(dialogState.row),
                payload: payload as TUpdate,
              })
            } else {
              createMutation.mutate(payload as TCreate)
            }
          },
        })}
      </CrudDialogFrame>
    </div>
  )
}

function errorMessage(error: unknown): string {
  if (error instanceof CrudServiceError) return error.message
  return "Terjadi kesalahan"
}
