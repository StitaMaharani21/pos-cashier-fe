import type { Profile, UpdateProfilePayload } from "@/entities/auth/model/profile.types"
import {
  profileSchema,
  type ProfileFormValues,
} from "@/modules/owner/profile/schemas/profile.schema"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { Button } from "@/shared/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"

interface ProfileFormProps {
  profile: Profile
  isSubmitting: boolean
  onSubmit: (payload: UpdateProfilePayload) => void
}

export function ProfileForm({ profile, isSubmitting, onSubmit }: ProfileFormProps) {
  const form = useCrudForm({
    schema: profileSchema,
    defaultValues: {
      name: profile.name ?? "",
      phoneNo: profile.phone_no ?? "",
    },
  })

  function handleSubmit(values: ProfileFormValues) {
    onSubmit({ name: values.name, phone_no: values.phoneNo })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
        <div>
          <h2 className="text-base font-extrabold text-foreground">Informasi Akun</h2>
          <p className="text-xs text-muted-foreground">Nama tampil di dashboard dan laporan.</p>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input placeholder="Nama lengkap" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {/* Read-only on purpose: the owner's email is the login key the
              backend resolves the store from (see profile.types.ts). */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={profile.email ?? "-"} readOnly disabled />
            <p className="text-xs text-muted-foreground">
              Email dipakai untuk login dan tidak dapat diubah.
            </p>
          </div>

          <FormField
            control={form.control}
            name="phoneNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Telepon</FormLabel>
                <FormControl>
                  <Input placeholder="0812-3456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Batalkan
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
