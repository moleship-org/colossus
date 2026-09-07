import type { QuadletUnitInfo } from '~/composables/use-quadlet'

/**
 * Human-readable label for a quadlet unit's status, accounting for the
 * case where the status lookup itself failed.
 */
export function getQuadletStatusLabel(item: Pick<QuadletUnitInfo, 'status' | 'statusError'>) {
  if (item.statusError) {
    return 'Status unavailable'
  }

  return item.status || 'Unknown'
}

/**
 * Maps a raw systemd status string to the border/background/text classes
 * used to render its badge, shared by the quadlet list and detail pages.
 */
export function getQuadletStatusToneClass(status?: string | null) {
  const normalized = status?.toLowerCase() ?? ''

  if (normalized.includes('inactive')) {
    return 'border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
  }

  if (normalized.includes('active') || normalized.includes('running')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
  }

  if (normalized.includes('failed') || normalized.includes('dead')) {
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
  }

  return 'border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
}
