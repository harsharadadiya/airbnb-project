// Date helpers. Booking dates are "date only" values like "2026-12-24".
// We always store them as midnight UTC so every computer agrees on the same day.

export const DAY_MS = 24 * 60 * 60 * 1000;

/** "2026-12-24" -> Date(2026-12-24T00:00:00.000Z), or null if the date does not exist */
export function parseDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const valid = date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
  return valid ? date : null;
}

/** Date -> "2026-12-24" */
export function toDateString(date) {
  return new Date(date).toISOString().slice(0, 10);
}

/** Today at midnight UTC */
export function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** Add whole days to a date */
export function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Every night of a stay. Check-in 24th, check-out 27th -> [24th, 25th, 26th] */
export function nightsBetween(checkIn, checkOut) {
  const nights = [];
  for (let d = new Date(checkIn); d < checkOut; d = addDays(d, 1)) nights.push(d);
  return nights;
}
