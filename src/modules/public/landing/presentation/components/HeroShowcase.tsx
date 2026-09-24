import type { CSSProperties } from "react"
import { Clock, QrCode, ReceiptText } from "lucide-react"

import orderScreen from "@/assets/landing/order-screen.webp"
import payCash from "@/assets/landing/pay-cash.webp"
import payQris from "@/assets/landing/pay-qris.webp"
import shiftStart from "@/assets/landing/shift-start.webp"

// The hero's product visual — implemented from the Claude Design canvas
// "Neela POS — Iklan Kasir" (https://claude.ai/artifact/UEUWcX8UWuvXF5vGu45gWQ),
// a 1200×900 artboard. Every coordinate below is that artboard's px value,
// scaled to whatever width the hero column gives it: `--u` is one design
// px expressed in container-query width units, so the whole composition
// shrinks in proportion instead of being a flat PNG.
const DESIGN_WIDTH = 1200

function u(px: number): string {
  return `calc(${px} * var(--u))`
}

// Callout text/padding would get unreadably small at phone widths if
// scaled like the screenshots, so they never go below a floor.
function atLeast(px: number, minPx: number): string {
  return `max(${minPx}px, ${u(px)})`
}

function box(style: {
  left?: number
  right?: number
  top?: number
  bottom?: number
  width?: number
  height?: number
  rotate?: number
}): CSSProperties {
  return {
    position: "absolute",
    left: style.left !== undefined ? u(style.left) : undefined,
    right: style.right !== undefined ? u(style.right) : undefined,
    top: style.top !== undefined ? u(style.top) : undefined,
    bottom: style.bottom !== undefined ? u(style.bottom) : undefined,
    width: style.width !== undefined ? u(style.width) : undefined,
    height: style.height !== undefined ? u(style.height) : undefined,
    transform: style.rotate ? `rotate(${style.rotate}deg)` : undefined,
  }
}

const pill = (fontPx: number, padY: number, padX: number): CSSProperties => ({
  fontSize: atLeast(fontPx, 10),
  paddingBlock: atLeast(padY, 5),
  paddingInline: atLeast(padX, 9),
  gap: atLeast(10, 5),
})

export function HeroShowcase() {
  return (
    <div className="@container w-full">
      <div
        className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-[#eef1fb]"
        style={{ "--u": `calc(100cqw / ${DESIGN_WIDTH})` } as CSSProperties}
      >
        {/* Decorative shapes */}
        <div aria-hidden className="rounded-full bg-neela-primary-container" style={box({ right: -90, top: -110, width: 360, height: 360 })} />
        <div aria-hidden className="rounded-full bg-neela-primary-fixed" style={box({ left: -60, bottom: -80, width: 240, height: 240 })} />
        <div aria-hidden className="bg-neela-on-primary-fixed" style={{ ...box({ left: 66, top: 196, width: 704, height: 620 }), borderRadius: u(40) }} />

        {/* Tablet: the cashier "Buat Pesanan" screen */}
        <div
          className="bg-[#0b1020] shadow-[0_30px_60px_rgba(0,24,73,0.35)]"
          style={{ ...box({ left: 110, top: 138 }), padding: u(14), borderRadius: u(34) }}
        >
          <img
            src={orderScreen}
            alt="Layar Buat Pesanan aplikasi kasir Neela: katalog menu dan panel order"
            width={2000}
            height={1794}
            fetchPriority="high"
            className="block object-cover"
            style={{ width: u(660), height: u(592), borderRadius: u(22), objectPosition: "left top" }}
          />
        </div>

        {/* Mulai Shift card */}
        <div
          className="overflow-hidden bg-white shadow-[0_24px_48px_rgba(0,24,73,0.22)]"
          style={{ ...box({ right: 44, top: 78, width: 420, rotate: 4 }), borderRadius: u(22) }}
        >
          <img
            src={shiftStart}
            alt="Layar Mulai Shift: kasir memasukkan saldo kas awal"
            width={2000}
            height={1249}
            className="block"
            style={{ width: u(420), height: u(262) }}
          />
        </div>

        {/* Payment modals — cash behind, QRIS in front (both have their own
            transparent margin + baked-in shadow, hence drop-shadow). */}
        <img
          src={payCash}
          alt="Modal pembayaran tunai dengan uang diterima dan kembalian"
          width={2000}
          height={1458}
          className="drop-shadow-[0_20px_36px_rgba(0,24,73,0.22)]"
          style={box({ right: 150, bottom: 262, width: 430, height: 313, rotate: -7 })}
        />
        <img
          src={payQris}
          alt="Modal pembayaran QRIS dengan kode QR toko"
          width={2000}
          height={1458}
          className="drop-shadow-[0_26px_44px_rgba(0,24,73,0.28)]"
          style={box({ right: 26, bottom: 58, width: 480, height: 350, rotate: 2 })}
        />

        {/* Callouts */}
        <div
          className="flex items-center rounded-full bg-neela-inverse-surface font-bold whitespace-nowrap text-neela-tertiary-fixed shadow-[0_12px_28px_rgba(0,24,73,0.25)]"
          style={{ ...box({ left: 110, top: 64 }), ...pill(17, 12, 20) }}
        >
          <span aria-hidden className="shrink-0 rounded-full bg-neela-tertiary-fixed" style={{ width: atLeast(10, 6), height: atLeast(10, 6) }} />
          <span>Mode Offline Aktif — Transaksi Disimpan Aman</span>
        </div>

        {/* The two secondary pills only fit once the visual is ≥ 28rem wide. */}
        <div
          className="hidden items-center rounded-full bg-white font-bold whitespace-nowrap text-neela-on-primary-fixed shadow-[0_10px_24px_rgba(0,24,73,0.18)] @md:flex"
          style={{ ...box({ right: 60, top: 24 }), ...pill(16, 10, 18) }}
        >
          <Clock aria-hidden className="shrink-0 text-neela-tertiary" style={{ width: atLeast(20, 12), height: atLeast(20, 12) }} />
          <span>Buka shift + saldo kas awal</span>
        </div>

        <div
          className="hidden items-center rounded-full bg-neela-on-primary-fixed font-bold whitespace-nowrap text-white shadow-[0_12px_28px_rgba(0,24,73,0.3)] @md:flex"
          style={{ ...box({ right: 60, bottom: 16 }), ...pill(16, 10, 18) }}
        >
          <QrCode aria-hidden className="shrink-0 text-neela-tertiary-fixed" style={{ width: atLeast(20, 12), height: atLeast(20, 12) }} />
          <span>QRIS, Tunai, Kartu &amp; E-Wallet</span>
        </div>

        <div
          className="flex items-center bg-white text-neela-on-primary-fixed shadow-[0_14px_32px_rgba(0,24,73,0.2)]"
          style={{
            ...box({ left: 40, bottom: 48 }),
            gap: atLeast(12, 6),
            paddingBlock: atLeast(14, 6),
            paddingInline: atLeast(22, 10),
            borderRadius: atLeast(18, 10),
          }}
        >
          <span
            aria-hidden
            className="flex shrink-0 items-center justify-center bg-neela-primary-container text-white"
            style={{ width: atLeast(40, 22), height: atLeast(40, 22), borderRadius: atLeast(12, 6) }}
          >
            <ReceiptText style={{ width: atLeast(22, 13), height: atLeast(22, 13) }} />
          </span>
          <span className="flex flex-col whitespace-nowrap" style={{ gap: u(2) }}>
            <span className="font-extrabold" style={{ fontSize: atLeast(17, 10) }}>
              Buat pesanan dalam hitungan detik
            </span>
            <span className="hidden font-medium text-neela-on-surface-variant @md:inline" style={{ fontSize: atLeast(13, 9) }}>
              Menu, catatan &amp; diskon dalam satu layar
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
