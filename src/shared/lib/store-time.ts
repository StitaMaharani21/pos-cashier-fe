// "Today" for the owner console is a day of the STORE, not of the device.
//
// pos-kasir-be evaluates every calendar day (the reports' from/to, a voucher's
// start date, "hari ini") in the store's timezone (APP_TIMEZONE, default
// Asia/Jakarta). A device in another zone — WITA/WIT for a WIB store — has a
// different date for a few hours every day, so a preset like "Hari Ini" built from
// the device clock asks for the wrong day. The zone comes from GET /me/capabilities
// (`timezone`) and is set once it loads; until then, or when it is missing or
// unknown, the device's own clock is used (the old behaviour).

let storeTimezone: string | null = null

function isValidTimezone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: zone })
    return true
  } catch {
    return false
  }
}

export function setStoreTimezone(zone?: string | null): void {
  storeTimezone = zone && isValidTimezone(zone) ? zone : null
}

export function getStoreTimezone(): string | null {
  return storeTimezone
}

const pad = (value: number) => String(value).padStart(2, "0")

// "YYYY-MM-DD" of `now` on the store's calendar (the device's when the zone is unknown).
export function storeDateOf(now: Date = new Date(), zone: string | null = storeTimezone): string {
  if (!zone) return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ""
  return `${get("year")}-${get("month")}-${get("day")}`
}

// Adds whole days to a "YYYY-MM-DD" (calendar arithmetic, no timezone involved).
export function addDaysToDate(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number)
  const shifted = new Date(Date.UTC(year, month - 1, day + days))
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`
}

// Today on the store's calendar, optionally shifted by whole days.
export function storeToday(offsetDays = 0, now: Date = new Date(), zone: string | null = storeTimezone): string {
  const today = storeDateOf(now, zone)
  return offsetDays === 0 ? today : addDaysToDate(today, offsetDays)
}

// First day of the month that `date` ("YYYY-MM-DD") belongs to.
export function startOfMonthOf(date: string): string {
  return `${date.slice(0, 8)}01`
}
