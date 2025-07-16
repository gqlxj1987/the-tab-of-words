// Chrome Extension Storage Provider for Jotai
// Custom storage implementation that uses chrome.storage.local instead of localStorage

import { ExtensionStorage, STORAGE_KEYS } from './extension-storage'

// Create a synchronous-style storage adapter for better jotai compatibility
export function createExtensionStorage<T>(storageKey: string, defaultValue: T) {
  console.log(`[Storage] Creating storage for ${storageKey} with default:`, defaultValue)
  let cachedValue: T = defaultValue
  let isInitialized = false
  let initPromise: Promise<void> | null = null

  // Initialize cache from storage
  const initCache = async () => {
    if (!isInitialized && !initPromise) {
      console.log(`[Storage] Starting initialization for ${storageKey}`)
      initPromise = (async () => {
        try {
          const value = await ExtensionStorage.get(storageKey)
          console.log(`[Storage] Retrieved value for ${storageKey}:`, value)
          if (value !== undefined) {
            cachedValue = value
            console.log(`[Storage] Updated cache for ${storageKey}:`, cachedValue)
          } else {
            console.log(`[Storage] No stored value for ${storageKey}, using default`)
          }
          isInitialized = true
        } catch (error) {
          console.warn(`Failed to initialize cache for ${storageKey}:`, error)
          isInitialized = true
        }
      })()
      await initPromise
    }
  }

  // Pre-initialize all storage keys to ensure they're ready when accessed
  initCache()

  return {
    getItem: (key: string): T | null => {
      console.log(`[Storage] getItem called for ${storageKey}, initialized: ${isInitialized}, cachedValue:`, cachedValue)
      // Initialize cache if not done yet
      if (!isInitialized) {
        console.log(`[Storage] Not initialized yet, triggering init for ${storageKey}`)
        initCache()
      }
      return cachedValue
    },
    setItem: (key: string, value: T): void => {
      console.log(`[Storage] setItem called for ${storageKey} with value:`, value)
      cachedValue = value
      isInitialized = true
      // Async save to storage (fire and forget)
      ExtensionStorage.set(storageKey, value)
        .then(() => console.log(`[Storage] Successfully saved ${storageKey}`))
        .catch(error => {
          console.warn(`Failed to save ${storageKey} to storage:`, error)
        })
    },
    removeItem: (key: string): void => {
      cachedValue = defaultValue
      // Async remove from storage (fire and forget)
      ExtensionStorage.remove(storageKey).catch(error => {
        console.warn(`Failed to remove ${storageKey} from storage:`, error)
      })
    }
  }
}

// Storage instances for each data type
export const learnedStorage = createExtensionStorage(STORAGE_KEYS.LEARNED, [])
export const metStorage = createExtensionStorage(STORAGE_KEYS.MET, [])
export const settingsStorage = createExtensionStorage(STORAGE_KEYS.SETTINGS, {
  version: '0.0.1',
  mode: 'ichigoichie' as const,
  romaji: false,
  levels: [1, 2, 3, 4, 5].map(level => ({ level: level as 1 | 2 | 3 | 4 | 5, enabled: true })),
  theme: 'light' as const
})