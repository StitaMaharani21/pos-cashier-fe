import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { QRCodeSVG } from "qrcode.react"

export interface QrCard {
  number: string
  url: string
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)
}

// One card per page, sized for a table tent / sticker: the store, a big table
// number, the QR and a one-line instruction. Rendered to static SVG so the
// throwaway print window needs no app code or network.
export function buildQrPrintHtml(cards: QrCard[], storeName: string): string {
  const pages = cards
    .map((card) => {
      const svg = renderToStaticMarkup(
        createElement(QRCodeSVG, { value: card.url, size: 320, level: "M", marginSize: 1 })
      )
      return (
        `<section class="card">` +
        (storeName ? `<p class="store">${escapeHtml(storeName)}</p>` : "") +
        `<h1>Meja ${escapeHtml(card.number)}</h1>` +
        `<div class="qr">${svg}</div>` +
        `<p class="cta">Pindai untuk melihat menu &amp; memesan</p>` +
        `<p class="note">Pembayaran dilakukan di kasir.</p>` +
        `</section>`
      )
    })
    .join("")

  return (
    `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>QR Meja</title><style>` +
    `@page{margin:10mm}` +
    `*{box-sizing:border-box}` +
    `body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#141b2b}` +
    `.card{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;` +
    `min-height:270mm;page-break-after:always;padding:8mm}` +
    `.card:last-child{page-break-after:auto}` +
    `.store{margin:0 0 4mm;font-size:18pt;font-weight:600;color:#424656}` +
    `h1{margin:0 0 8mm;font-size:56pt;line-height:1;font-weight:800}` +
    `.qr{padding:6mm;border:2px solid #141b2b;border-radius:6mm;background:#fff}` +
    `.qr svg{display:block;width:90mm;height:90mm}` +
    `.cta{margin:8mm 0 0;font-size:20pt;font-weight:700}` +
    `.note{margin:2mm 0 0;font-size:12pt;color:#424656}` +
    `</style></head><body>${pages}</body></html>`
  )
}

// Browsers only allow a popup opened straight from a click, so a flow that has
// to load data first ("Cetak semua QR") opens the window right away and fills
// it later with printInto(). null = the popup was blocked.
export function openPrintWindow(): Window | null {
  const win = window.open("", "_blank", "width=720,height=900")
  win?.document.write('<p style="font-family:sans-serif;padding:24px">Menyiapkan QR…</p>')
  return win
}

export function printInto(win: Window, cards: QrCard[], storeName: string): void {
  win.document.open()
  win.document.write(buildQrPrintHtml(cards, storeName))
  win.document.close()
  win.focus()
  // Let the SVGs lay out before the print preview captures them.
  setTimeout(() => win.print(), 300)
}

// Opens the browser's print dialog for the given cards. Returns false when the
// popup was blocked.
export function printQrCards(cards: QrCard[], storeName: string): boolean {
  const win = openPrintWindow()
  if (!win) return false
  printInto(win, cards, storeName)
  return true
}
