// Currency & date formatting utilities for GAJIKU
// Timestamps are Unix ms (number) — all format functions accept number | string | Date

type DateInput = number | string | Date;

function toDate(input: DateInput): Date {
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);
  // ISO string
  return new Date(input);
}

export function formatCurrency(amount: number, currency = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(input: DateInput): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(toDate(input));
}

export function formatDateShort(input: DateInput): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(toDate(input));
}

export function formatDateInput(input: DateInput): string {
  // Returns YYYY-MM-DD for <input type="date">
  const d = toDate(input);
  return d.toISOString().slice(0, 10);
}

export function getMonthYear(input: DateInput): string {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(toDate(input));
}

export function getMonthYearShort(input: DateInput): string {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'short',
    year: 'numeric',
  }).format(toDate(input));
}

// Returns "Hari ini", "Kemarin", or formatted date
export function formatRelativeDate(input: DateInput): string {
  const date = toDate(input);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = today.getTime() - target.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return formatDateShort(input);
}

// Convert <input type="date"> value (YYYY-MM-DD) to Unix ms at start of day (local tz)
export function dateInputToMs(value: string): number {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

// Convert Unix ms back to YYYY-MM-DD for input
export function msToDateInput(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}
