import { ArrowRightIcon, ClockIcon, UsersIcon } from "lucide-react"

import type { GuestSession } from "@/modules/public/self-order/domain/self-order.types"
import { formatClock } from "@/modules/public/self-order/presentation/self-order-helpers"
import { NeelaWordmark } from "@/modules/public/shared/NeelaWordmark"

export function LandingScreen({ session, onStart }: { session: GuestSession; onStart: () => void }) {
  return (
    <div className="so-landing">
      <div>
        <div className="so-brand">
          <NeelaWordmark />
          <span className="tag">Pesan dari Meja</span>
        </div>
        <div className="so-stub">
          <div className="num">{session.table_number}</div>
          <div className="cap">Nomor meja</div>
        </div>
        <h1>Selamat datang!</h1>
        <p className="lead">Langsung pilih menu dan pesan dari HP kamu. Tidak perlu masuk akun atau pasang aplikasi.</p>
        <div className="so-pill">
          <ClockIcon size={13} aria-hidden />
          <span>
            Meja ini bisa dipakai memesan sampai <b>{formatClock(session.expired_at)}</b>
          </span>
        </div>
        <div className="so-note">
          <UsersIcon aria-hidden />
          <span>
            Satu keranjang untuk seluruh meja. Siapa pun di meja ini yang pesan lewat HP-nya masing-masing akan masuk
            ke keranjang yang sama.
          </span>
        </div>
      </div>
      <div>
        <button type="button" className="so-cta" onClick={onStart}>
          Lihat Menu
          <ArrowRightIcon size={16} aria-hidden />
        </button>
        <div className="so-footnote">Tanpa akun · tanpa pasang aplikasi</div>
      </div>
    </div>
  )
}
