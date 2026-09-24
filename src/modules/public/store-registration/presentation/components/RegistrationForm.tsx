import { ArrowRight, AtSign, CircleCheck, IdCard, LoaderCircle, Lock, Mail, MapPin, Phone, ShieldCheck, Smartphone, Store, User } from "lucide-react"
import { Link } from "react-router-dom"
import type { UseFormReturn } from "react-hook-form"

import {
  passwordStrength,
  type StoreRegistrationFormValues,
} from "@/modules/public/store-registration/domain/store-registration.schema"
import { PasswordField, TextField } from "@/modules/public/store-registration/presentation/components/FormFields"

interface RegistrationFormProps {
  form: UseFormReturn<StoreRegistrationFormValues>
  isSubmitting: boolean
  onSubmit: (values: StoreRegistrationFormValues) => void
}

function GroupTitle({ icon: Icon, children }: { icon: typeof Store; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 text-neela-primary">
      <Icon className="size-5" />
      <span className="text-neela-label-md tracking-wide text-neela-on-primary-fixed uppercase">{children}</span>
    </div>
  )
}

// Field set = pos-kasir-be's dto.SubmitRegistrationRequest. The Stitch
// design's "Kategori Bisnis" and "Kota Operasional" aren't stored by the
// backend, so they're replaced by the store address + phone it does require.
export function RegistrationForm({ form, isSubmitting, onSubmit }: RegistrationFormProps) {
  const { register, handleSubmit, watch, formState } = form
  const errors = formState.errors
  const password = watch("password")

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-xl bg-neela-surface-container-low/60 p-4">
        <GroupTitle icon={Store}>1. Profil Usaha &amp; Toko</GroupTitle>
        <TextField
          id="storeName"
          label="Nama Usaha / Kafe"
          icon={Store}
          required
          placeholder="Contoh: Kopi Temu Senopati"
          autoComplete="organization"
          registration={register("storeName")}
          error={errors.storeName?.message}
        />
        <TextField
          id="address"
          label="Alamat Toko"
          icon={MapPin}
          required
          placeholder="Contoh: Jl. Senopati No. 12, Jakarta Selatan"
          autoComplete="street-address"
          registration={register("address")}
          error={errors.address?.message}
        />
        <TextField
          id="phoneNo"
          label="Nomor Telepon Toko"
          icon={Phone}
          required
          type="tel"
          inputMode="tel"
          placeholder="Contoh: 021-1234-5678"
          registration={register("phoneNo")}
          error={errors.phoneNo?.message}
          hint="Dicetak di struk sebagai kontak toko."
        />
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-neela-surface-container-low/60 p-4">
        <GroupTitle icon={IdCard}>2. Data Pemilik &amp; Kredensial Login</GroupTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            id="ownerName"
            label="Nama Lengkap Pemilik"
            icon={User}
            required
            placeholder="Contoh: Budi Santoso"
            autoComplete="name"
            registration={register("ownerName")}
            error={errors.ownerName?.message}
          />
          <TextField
            id="ownerPhoneNo"
            label="Nomor WhatsApp"
            icon={Smartphone}
            type="tel"
            inputMode="tel"
            placeholder="0812-3456-7890"
            autoComplete="tel"
            registration={register("ownerPhoneNo")}
            error={errors.ownerPhoneNo?.message}
            hint="Untuk dihubungi tim kami saat pendampingan setup."
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            id="ownerEmail"
            label="Email"
            icon={Mail}
            required
            type="email"
            inputMode="email"
            placeholder="budi@kopitemu.id"
            autoComplete="email"
            registration={register("ownerEmail")}
            error={errors.ownerEmail?.message}
            hint="Dipakai untuk masuk ke dashboard owner."
          />
          <TextField
            id="ownerUsername"
            label="Username Pemilik"
            icon={AtSign}
            required
            placeholder="budi_kopitemu"
            autoComplete="username"
            autoCapitalize="none"
            registration={register("ownerUsername")}
            error={errors.ownerUsername?.message}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PasswordField
            id="password"
            label="Kata Sandi"
            icon={Lock}
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            registration={register("password")}
            error={errors.password?.message}
            hint="Kombinasi huruf besar, kecil & angka."
            strength={{ score: passwordStrength(password), hasValue: password.length > 0 }}
          />
          <PasswordField
            id="confirmPassword"
            label="Ulangi Kata Sandi"
            icon={ShieldCheck}
            placeholder="Ketik ulang kata sandi"
            autoComplete="new-password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
        </div>
      </div>

      <div>
        <div className="flex items-start gap-2">
          <input
            id="consent"
            type="checkbox"
            className="mt-1 size-4 rounded accent-neela-primary"
            aria-invalid={errors.consent ? true : undefined}
            {...register("consent")}
          />
          {/* No Syarat & Ketentuan / Kebijakan Privasi pages exist yet, so
              the consent covers what the flow actually does instead of
              linking to documents that aren't written. */}
          <label htmlFor="consent" className="text-neela-body-sm leading-relaxed text-neela-on-surface-variant">
            Saya menyatakan data di atas benar dan bersedia dihubungi tim Neela untuk proses verifikasi
            serta panduan aktivasi sistem kasir.
          </label>
        </div>
        {errors.consent && <p className="mt-1 text-[11px] text-neela-error">{errors.consent.message}</p>}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-neela-primary px-4 py-3.5 text-neela-label-lg font-bold text-neela-on-primary shadow-md transition-all hover:bg-neela-on-primary-fixed-variant active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-5 animate-spin" />
              <span>Mengirim Pendaftaran...</span>
            </>
          ) : (
            <>
              <span>Kirim Pendaftaran</span>
              <ArrowRight className="size-5" />
            </>
          )}
        </button>
        <div className="mt-2 flex items-center justify-center gap-1 text-neela-on-surface-variant">
          <CircleCheck className="size-4 text-neela-tertiary" />
          <p className="text-neela-body-sm">Tanpa kartu kredit. Bebas batalkan kapan saja.</p>
        </div>
      </div>

      <div className="rounded-xl bg-neela-surface-container-low px-4 py-2 text-center">
        <span className="text-neela-body-md text-neela-on-surface-variant">Sudah memiliki akun toko? </span>
        <Link to="/login" className="text-neela-label-md font-semibold text-neela-primary hover:underline">
          Masuk ke Portal
        </Link>
      </div>
    </form>
  )
}
