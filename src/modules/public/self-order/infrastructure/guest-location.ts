export interface GuestLocation {
  latitude: number
  longitude: number
  // Meters; the browser's own estimate of how far off the fix might be.
  accuracy: number
}

// Where the guest is, for the cashier's "di luar radius" flag. Asked only when
// they press "Kirim ke Kasir", never on page load, and never blocking: a
// refused permission, an unsupported browser or a slow GPS all resolve to null
// and the order is simply sent without a location.
export function getGuestLocation(timeoutMs = 8000): Promise<GuestLocation | null> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) return Promise.resolve(null)

  return new Promise((resolve) => {
    // Some browsers never call back when the permission prompt is ignored, so
    // the promise has its own deadline in addition to the API's.
    const deadline = setTimeout(() => resolve(null), timeoutMs + 1000)
    const done = (value: GuestLocation | null) => {
      clearTimeout(deadline)
      resolve(value)
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        done({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      () => done(null),
      // Cached fixes up to a minute old are fine (the cafe doesn't move), and
      // high accuracy isn't worth a longer wait indoors.
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 60_000 }
    )
  })
}
