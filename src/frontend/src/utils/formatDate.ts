type DateLike = Date | string | number | null | undefined

const pad2 = (value: number): string => String(value).padStart(2, '0')

const toValidDate = (value: DateLike): Date | null => {
  if (value == null) return null

  const date = value instanceof Date ? value : new Date(value)

  // Single validity check (removes redundant validation logic)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Format a date-like input into a string.
 * Default format remains "YYYY-MM-DD" (no behavior change intended).
 */
export const formatDate = (
  value: DateLike,
  format: string = 'YYYY-MM-DD'
): string => {
  const date = toValidDate(value)
  if (!date) return ''

  const tokens: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: pad2(date.getMonth() + 1),
    DD: pad2(date.getDate()),
    HH: pad2(date.getHours()),
    mm: pad2(date.getMinutes()),
    ss: pad2(date.getSeconds()),
  }

  // Single-pass formatting (replaces multiple chained .replace calls)
  return format.replace(
    /YYYY|MM|DD|HH|mm|ss/g,
    (match) => tokens[match] ?? match
  )
}
