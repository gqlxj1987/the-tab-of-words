// Chrome Extension Storage Provider for Jotai
// Custom storage implementation that uses chrome.storage.local instead of localStorage

import { ExtensionStorage, STORAGE_KEYS } from './extension-storage'

// Create a synchronous-style storage adapter for better jotai compatibility
export function createExtensionStorage<T>(storageKey: string, defaultValue: T) {
  let cachedValue: T = defaultValue
  let isInitialized = false

  // Initialize cache from storage
  const initCache = async () => {
    if (!isInitialized) {
      try {
        const value = await ExtensionStorage.get(storageKey)
        if (value !== undefined) {
          cachedValue = value
        }
        isInitialized = true
      } catch (error) {
        console.warn(`Failed to initialize cache for ${storageKey}:`, error)
        isInitialized = true
      }
    }
  }

  return {
    getItem: (key: string): T | null => {
      // Initialize cache if not done yet
      if (!isInitialized) {
        initCache()
      }
      return cachedValue
    },
    setItem: (key: string, value: T): void => {
      cachedValue = value
      // Async save to storage (fire and forget)
      ExtensionStorage.set(storageKey, value).catch(error => {
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
  levels: [1, 2, 3, 4, 5].map(level => ({ level: level as 1 | 2 | 3 | 4 | 5, enabled: true }))
})