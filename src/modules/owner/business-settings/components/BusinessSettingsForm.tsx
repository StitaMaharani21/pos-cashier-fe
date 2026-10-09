import { useState } from "react"
import { LocateFixedIcon } from "lucide-react"

import type { BusinessSettings } from "@/entities/business-settings/model/business-settings.types"
import {
  businessSettingsSchema,
  type BusinessSettingsFormValues,
} from "@/modules/owner/business-settings/schemas/business-settings.schema"
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
import { Textarea } from "@/shared/ui/textarea"

interface BusinessSettingsFormPayload {
  business_name: string
  address: string
  phone_no: string
  email: string
  tax_percentage: number
  receipt_footer: string
  latitude?: number
  longitude?: number
  self_order_radius_m?: number
}

interface BusinessSettingsFormProps {
  settings: BusinessSettings | null
  isSubmitting: boolean
  onSubmit: (payload: BusinessSettingsFormPayload) => void
}

export function BusinessSettingsForm({
  settings,
  isSubmitting,
  onSubmit,
}: BusinessSettingsFormProps) {
  const form = useCrudForm({
    schema: businessSettingsSchema,
    defaultValues: {
      businessName: settings?.business_name ?? "",
      address: settings?.address ?? "",
      phoneNo: settings?.phone_no ?? "",
      email: settings?.email ?? "",
      taxPercentage: settings?.tax_percentage != null ? String(settings.tax_percentage) : "",
      receiptFooter: settings?.receipt_footer ?? "",
      latitude: settings?.latitude != null ? String(settings.latitude) : "",
      longitude: settings?.longitude != null ? String(settings.longitude) : "",
      selfOrderRadiusM: settings?.self_order_radius_m != null ? String(settings.self_order_radius_m) : "100",
    },
  })
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Fill the coordinates from this device — meant to be pressed at the cafe.
  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setLocationError("Peramban ini tidak mendukung lokasi.")
      return
    }
    setLocating(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("latitude", position.coords.latitude.toFixed(6), { shouldDirty: true, shouldValidate: true })
        form.setValue("longitude", position.coords.longitude.toFixed(6), { shouldDirty: true, shouldValidate: true })
        setLocating(false)
      },
      () => {
        setLocationError("Tidak bisa membaca lokasi. Izinkan akses lokasi di peramban, atau isi manual.")
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    )
  }

  function handleSubmit(values: BusinessSettingsFormValues) {
    onSubmit({
      business_name: values.businessName,
      address: values.address,
      phone_no: values.phoneNo,
      email: values.email ?? "",
      tax_percentage: values.taxPercentage ? Number(values.taxPercentage) : 0,
      receipt_footer: values.receiptFooter ?? "",
      ...(values.latitude?.trim() && values.longitude?.trim()
        ? { latitude: Number(values.latitude), longitude: Number(values.longitude) }
        : {}),
      ...(values.selfOrderRadiusM?.trim() ? { self_order_radius_m: Number(values.selfOrderRadiusM) } : {}),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
        <div>
          <h2 className="text-base font-extrabold text-foreground">Informasi Bisnis</h2>
          <p className="text-xs text-muted-foreground">
            Detail ini akan tampil pada struk transaksi.
          </p>
        </div>

        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Bisnis</FormLabel>
              <FormControl>
                <Input placeholder="Kedai Senja Coffee & Eatery" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat</FormLabel>
              <FormControl>
                <Textarea placeholder="Jl. Kenanga No. 12, Bandung, Jawa Barat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3.5">
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

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="halo@kedaisenja.id" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="taxPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pajak (%)</FormLabel>
              <FormControl>
                <Input type="number" min={0} max={100} className="max-w-40" {...field} />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Diterapkan otomatis ke setiap transaksi
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receiptFooter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan Kaki Struk</FormLabel>
              <FormControl>
                <Textarea placeholder="Terima kasih telah berkunjung ke Kedai Senja!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3.5 rounded-xl border bg-muted/30 p-4">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">Lokasi Kafe (Pesan dari Meja)</h3>
            <p className="text-xs text-muted-foreground">
              Dipakai untuk memberi tanda pada pesanan dari QR meja yang dikirim dari luar kafe, supaya kasir tahu. Pesanan
              tetap diterima. Tekan tombol "Gunakan lokasi saya sekarang" saat Anda sedang berada di kafe.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garis lintang (Latitude)</FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" placeholder="-6.175392" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garis bujur (Longitude)</FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" placeholder="106.827153" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="selfOrderRadiusM"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jarak dari kafe (meter)</FormLabel>
                <FormControl>
                  <Input type="number" min={10} max={2000} className="max-w-40" {...field} />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Standarnya 100 meter. Lokasi di dalam ruangan sering kurang tepat, jadi jangan diisi terlalu kecil.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" size="sm" disabled={locating} onClick={useMyLocation}>
              <LocateFixedIcon />
              {locating ? "Membaca lokasi..." : "Gunakan lokasi saya sekarang"}
            </Button>
            {locationError && <span className="text-xs text-destructive">{locationError}</span>}
          </div>
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
