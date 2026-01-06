import { format } from 'date-fns'

/**
 * Safely parse a date string (YYYY-MM-DD) without timezone issues
 * This prevents the common issue where "2026-01-06" becomes January 5th
 * due to timezone interpretation
 */
export function parseDateSafely(dateString: string): Date {
  const parts = dateString.split('-')
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
    const day = parseInt(parts[2], 10)
    return new Date(year, month, day)
  }
  
  // Fallback for other formats - still might have timezone issues
  return new Date(dateString)
}

/**
 * Format a date string safely for display
 */
export function formatDateSafely(dateString: string, formatStr: string = 'EEEE, MMMM d, yyyy'): string {
  const date = parseDateSafely(dateString)
  return format(date, formatStr)
}

/**
 * Format a date object or string for display
 */
export function formatDate(date: Date | string, formatStr: string = 'EEEE, MMMM d, yyyy'): string {
  if (typeof date === 'string') {
    return formatDateSafely(date, formatStr)
  }
  return format(date, formatStr)
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Convert a Date object to YYYY-MM-DD string
 */
export function dateToString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}