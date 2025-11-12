/**
 * Offline Check-In Queue
 * Handles ticket scanning when offline and syncs when connection is restored
 */

export interface OfflineCheckIn {
  id: string
  ticketId: string
  qrCode: string
  eventId: string
  scannedAt: string
  scannedBy: string
  synced: boolean
  syncAttempts: number
  lastSyncAttempt?: string
  error?: string
}

const STORAGE_KEY = 'gvteway_offline_checkins'
const MAX_SYNC_ATTEMPTS = 5

/**
 * Add a check-in to the offline queue
 */
export function queueOfflineCheckIn(checkIn: Omit<OfflineCheckIn, 'id' | 'synced' | 'syncAttempts'>): OfflineCheckIn {
  const queue = getOfflineQueue()
  
  const offlineCheckIn: OfflineCheckIn = {
    ...checkIn,
    id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    synced: false,
    syncAttempts: 0,
  }
  
  queue.push(offlineCheckIn)
  saveOfflineQueue(queue)
  
  return offlineCheckIn
}

/**
 * Get all queued offline check-ins
 */
export function getOfflineQueue(): OfflineCheckIn[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load offline queue:', error)
    return []
  }
}

/**
 * Get count of pending check-ins
 */
export function getPendingCheckInCount(): number {
  return getOfflineQueue().filter(c => !c.synced).length
}

/**
 * Save offline queue to localStorage
 */
function saveOfflineQueue(queue: OfflineCheckIn[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.error('Failed to save offline queue:', error)
  }
}

/**
 * Mark a check-in as synced
 */
export function markCheckInSynced(id: string): void {
  const queue = getOfflineQueue()
  const checkIn = queue.find(c => c.id === id)
  
  if (checkIn) {
    checkIn.synced = true
    saveOfflineQueue(queue)
  }
}

/**
 * Mark a check-in sync attempt as failed
 */
export function markCheckInSyncFailed(id: string, error: string): void {
  const queue = getOfflineQueue()
  const checkIn = queue.find(c => c.id === id)
  
  if (checkIn) {
    checkIn.syncAttempts += 1
    checkIn.lastSyncAttempt = new Date().toISOString()
    checkIn.error = error
    saveOfflineQueue(queue)
  }
}

/**
 * Remove synced check-ins older than 24 hours
 */
export function cleanupSyncedCheckIns(): void {
  const queue = getOfflineQueue()
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
  
  const cleaned = queue.filter(checkIn => {
    if (!checkIn.synced) return true
    const scannedAt = new Date(checkIn.scannedAt).getTime()
    return scannedAt > oneDayAgo
  })
  
  saveOfflineQueue(cleaned)
}

/**
 * Sync all pending check-ins to the server
 */
export async function syncOfflineCheckIns(): Promise<{
  success: number
  failed: number
  errors: Array<{ id: string; error: string }>
}> {
  const queue = getOfflineQueue()
  const pending = queue.filter(c => !c.synced && c.syncAttempts < MAX_SYNC_ATTEMPTS)
  
  let success = 0
  let failed = 0
  const errors: Array<{ id: string; error: string }> = []
  
  for (const checkIn of pending) {
    try {
      const response = await fetch('/api/v1/tickets/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrCode: checkIn.qrCode,
          eventId: checkIn.eventId,
          scannedAt: checkIn.scannedAt,
          offline: true,
        }),
      })
      
      if (response.ok) {
        markCheckInSynced(checkIn.id)
        success++
      } else {
        const error = await response.text()
        markCheckInSyncFailed(checkIn.id, error)
        failed++
        errors.push({ id: checkIn.id, error })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      markCheckInSyncFailed(checkIn.id, errorMessage)
      failed++
      errors.push({ id: checkIn.id, error: errorMessage })
    }
  }
  
  // Cleanup old synced check-ins
  cleanupSyncedCheckIns()
  
  return { success, failed, errors }
}

/**
 * Check if online and auto-sync if needed
 */
export async function autoSyncIfOnline(): Promise<void> {
  if (!navigator.onLine) return
  
  const pendingCount = getPendingCheckInCount()
  if (pendingCount === 0) return
  
  console.log(`Auto-syncing ${pendingCount} pending check-ins...`)
  const result = await syncOfflineCheckIns()
  console.log(`Sync complete: ${result.success} success, ${result.failed} failed`)
}

/**
 * Initialize offline check-in listeners
 */
export function initializeOfflineCheckIn(): void {
  if (typeof window === 'undefined') return
  
  // Auto-sync when coming back online
  window.addEventListener('online', () => {
    console.log('Connection restored, syncing offline check-ins...')
    autoSyncIfOnline()
  })
  
  // Periodic sync attempt every 5 minutes
  setInterval(() => {
    autoSyncIfOnline()
  }, 5 * 60 * 1000)
  
  // Initial sync on load if online
  if (navigator.onLine) {
    autoSyncIfOnline()
  }
}
