import { format, parseISO } from 'date-fns';

const CURRENCY = import.meta.env.VITE_CURRENCY || 'USD';

const money = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

export const formatPrice = (amount) => money.format(amount ?? 0);

/** Date -> "2026-12-24" using the user's local calendar day (what they clicked) */
export const toDateKey = (date) => format(date, 'yyyy-MM-dd');

/** "2026-12-24" or ISO string -> Date in local time at midnight (Date objects are returned as they are) */
export const fromDateKey = (key) => (key instanceof Date ? key : parseISO(String(key).slice(0, 10)));

/** "2026-12-24T00:00:00.000Z" -> "Dec 24, 2026" (ignores time zones on purpose) */
export const formatDate = (value, pattern = 'MMM d, yyyy') => format(fromDateKey(value), pattern);

export const formatDateRange = (start, end) => {
  const a = fromDateKey(start);
  const b = fromDateKey(end);
  const sameYear = a.getFullYear() === b.getFullYear();
  return `${format(a, sameYear ? 'MMM d' : 'MMM d, yyyy')} – ${format(b, 'MMM d, yyyy')}`;
};

export const plural = (count, word, pluralWord = `${word}s`) => `${count} ${count === 1 ? word : pluralWord}`;

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
