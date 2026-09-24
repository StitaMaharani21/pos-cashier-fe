import { Headset, User, Zap } from "lucide-react"
import { Link } from "react-router-dom"

import { COPYRIGHT_HOLDER, SUPPORT_HOURS, waLink } from "@/modules/public/shared/contact"
import { NeelaWordmark } from "@/modules/public/shared/NeelaWordmark"

// Header + footer of the Stitch registration page. The design's
// "Pendaftaran / Data Outlet / Sinkron Perangkat" step nav is dropped — the
// backend flow is a single submit followed by admin approval, there are no
// further self-serve steps to link to.
export function RegistrationHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-neela-surface-container-lowest/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2" aria-label="Kembali ke beranda Neela">
            <NeelaWordmark />
          </Link>
          <span className="hidden h-5 w-px bg-neela-outline-variant sm:inline-block" />
          <span className="hidden items-center gap-1 rounded bg-neela-surface-container-low px-2 py-1 text-neela-label-sm tracking-wider text-neela-on-surface-variant uppercase sm:inline-flex">
            <Zap className="size-4 text-neela-tertiary" />
            Daftar Early Access
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={waLink("Halo Neela POS, saya butuh bantuan pendaftaran toko")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-neela-surface-container-low px-3 py-1 text-neela-label-sm text-neela-on-surface-variant md:flex"
          >
            <Headset className="size-4 text-neela-tertiary" />
            Bantuan {SUPPORT_HOURS}
          </a>
          <Link
            to="/login"
            className="hidden px-2 text-neela-label-md text-neela-primary transition-colors hover:text-neela-on-primary-fixed-variant sm:inline-flex"
          >
            Sudah ada akun? Masuk
          </Link>
          <Link
            to="/login"
            aria-label="Masuk Portal"
            className="flex size-8 items-center justify-center rounded-full bg-neela-primary text-neela-on-primary"
          >
            <User className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}

// The design's "Standar Keamanan Data Kominfo" badge and PT name are left out
// until they're real (same call as the landing footer).
export function RegistrationFooter() {
  return (
    <footer className="mt-auto w-full bg-neela-surface-container-lowest py-4 shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 px-4 text-neela-body-sm text-neela-on-surface-variant sm:flex-row md:px-6 lg:px-8">
        <div>
          © {new Date().getFullYear()} {COPYRIGHT_HOLDER}. Sistem POS Offline-First untuk F&amp;B Indonesia.
        </div>
        <a
          href={waLink("Halo Neela POS, saya butuh bantuan")}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-neela-on-surface"
        >
          Pusat Bantuan
        </a>
      </div>
    </footer>
  )
}
