const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

/**
 * Format a date string deterministically using UTC so server and client
 * always produce the same string — no hydration mismatch.
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  const h = d.getUTCHours()
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${h % 12 || 12}:${m} ${ampm}`
}
