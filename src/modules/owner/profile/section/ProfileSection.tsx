import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getProfile, updateProfile } from "@/modules/owner/profile/api/profile.service"
import { ProfileForm } from "@/modules/owner/profile/components/ProfileForm"
import { CrudServiceError } from "@/shared/api/crud/types"
import { useAuthStore } from "@/shared/auth/store"
import { Button } from "@/shared/ui/button"

const QUERY_KEY = ["me", "profile"]

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  cashier: "Kasir",
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return (first + second).toUpperCase() || "?"
}

export function ProfileSection() {
  const queryClient = useQueryClient()
  const setProfile = useAuthStore((state) => state.setProfile)
  const storeCode = useAuthStore((state) => state.store_code)

  const { data: profile, isPending, isError, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getProfile,
  })

  // The header reads name/email from the auth store, which only has what
  // login returned — refresh it from the authoritative profile.
  useEffect(() => {
    if (profile?.name) setProfile({ name: profile.name, email: profile.email })
  }, [profile, setProfile])

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      toast.success("Profil berhasil disimpan")
      queryClient.setQueryData(QUERY_KEY, updated)
    },
    onError: (error) =>
      toast.error(error instanceof CrudServiceError ? error.message : "Gagal menyimpan profil"),
  })

  if (isPending) {
    return <div className="h-96 animate-pulse rounded-[18px] border bg-muted/40" />
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[18px] border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">Gagal memuat profil.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 rounded-[18px] border bg-card px-7 py-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-extrabold text-primary">
          {getInitials(profile.name ?? "")}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-extrabold text-foreground">{profile.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {ROLE_LABELS[profile.role ?? ""] ?? profile.role}
            {profile.username && ` · @${profile.username}`}
            {storeCode && ` · Toko ${storeCode}`}
          </p>
        </div>
      </div>

      {/* Password changes live on their own page (/app/change-password),
          opened from the header avatar menu. */}
      <div className="max-w-2xl rounded-[18px] border bg-card px-7 py-6">
        {/* Keyed on the saved values so a successful save re-seeds the
            form's defaults — otherwise "Batalkan" would revert to the
            pre-save values. */}
        <ProfileForm
          key={`${profile.name}|${profile.phone_no}`}
          profile={profile}
          isSubmitting={mutation.isPending}
          onSubmit={(payload) => mutation.mutate(payload)}
        />
      </div>
    </div>
  )
}
