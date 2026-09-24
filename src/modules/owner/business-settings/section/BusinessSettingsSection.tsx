import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { UpdateBusinessSettingsPayload } from "@/entities/business-settings/model/business-settings.types"
import {
  getBusinessSettings,
  updateBusinessSettings,
} from "@/modules/owner/business-settings/api/business-settings.service"
import { BusinessLogoCard } from "@/modules/owner/business-settings/components/BusinessLogoCard"
import { BusinessSettingsForm } from "@/modules/owner/business-settings/components/BusinessSettingsForm"
import { CrudServiceError } from "@/shared/api/crud/types"
import { Button } from "@/shared/ui/button"

const QUERY_KEY = ["business-settings"]

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof CrudServiceError ? error.message : fallback
}

export function BusinessSettingsSection() {
  const queryClient = useQueryClient()

  const { data: settings, isPending, isError, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getBusinessSettings,
  })

  const onSaved = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const mutation = useMutation({
    mutationFn: updateBusinessSettings,
    onSuccess: () => {
      toast.success("Perubahan berhasil disimpan")
      onSaved()
    },
    onError: (error) => toast.error(errorMessage(error, "Gagal menyimpan perubahan")),
  })

  // Separate mutation so the logo card's "Mengunggah..." state doesn't
  // also disable the form's buttons (and vice versa).
  const logoMutation = useMutation({
    mutationFn: updateBusinessSettings,
    onSuccess: () => {
      toast.success("Logo berhasil diperbarui")
      onSaved()
    },
    onError: (error) => toast.error(errorMessage(error, "Gagal mengunggah logo")),
  })

  if (isPending) {
    return <div className="h-96 animate-pulse rounded-[18px] border bg-muted/40" />
  }

  // Only a 404 ("not created yet") resolves to null — anything else lands
  // here, instead of showing an empty form that would overwrite real data.
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[18px] border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">Gagal memuat pengaturan bisnis.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Coba Lagi
        </Button>
      </div>
    )
  }

  function uploadLogo(file: File) {
    if (!settings) return
    // The PUT replaces every field, so resend the saved values alongside the
    // logo — not the form's unsaved edits, which stay in the form untouched.
    const payload: UpdateBusinessSettingsPayload = {
      business_name: settings.business_name ?? "",
      address: settings.address ?? "",
      phone_no: settings.phone_no ?? "",
      email: settings.email ?? "",
      tax_percentage: settings.tax_percentage ?? 0,
      receipt_footer: settings.receipt_footer ?? "",
      logo: file,
    }
    logoMutation.mutate(payload)
  }

  return (
    <div className="flex flex-wrap items-start gap-5">
      <div className="min-w-[320px] flex-[1.5] rounded-[18px] border bg-card px-7 py-6">
        <BusinessSettingsForm
          settings={settings}
          isSubmitting={mutation.isPending}
          onSubmit={(payload) => mutation.mutate(payload)}
        />
      </div>

      <div className="min-w-[280px] flex-1">
        <BusinessLogoCard
          businessName={settings?.business_name ?? ""}
          logoUrl={settings?.logo_url}
          canUpload={settings != null}
          isUploading={logoMutation.isPending}
          onUpload={uploadLogo}
        />
      </div>
    </div>
  )
}
