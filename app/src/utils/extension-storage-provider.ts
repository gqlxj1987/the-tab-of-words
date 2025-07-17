// Chrome Extension Storage Provider for Jotai
// Custom storage implementation that uses chrome.storage.local instead of localStorage

import { ExtensionStorage, STORAGE_KEYS } from './extension-storage'

// Create a synchronous-style storage adapter for better jotai compatibility
export function createExtensionStorage<T>(storageKey: string, defaultValue: T) {
  let cachedValue: T = defaultValue
  let isInitialized = false
  let initPromise: Promise<void> | null = null
  let listeners: Array<() => void> = []

  // Initialize cache from storage
  const initCache = async () => {
    if (!isInitialized && !initPromise) {
      initPromise = (async () => {
        try {
          const value = await ExtensionStorage.get(storageKey)
          if (value !== undefined) {
            cachedValue = value
          }
          isInitialized = true
        } catch (error) {
          isInitialized = true
        }
      })()
      await initPromise
    }
  }

  // Listen for external storage changes (e.g., from popup)
  const setupStorageListener = () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes[storageKey]) {
          const newValue = changes[storageKey].newValue
          if (JSON.stringify(newValue) !== JSON.stringify(cachedValue)) {
            cachedValue = newValue !== undefined ? newValue : defaultValue
            // Notify any listeners (like Jotai's storage implementation)
            listeners.forEach(listener => listener())
          }
        }
      })
    }
  }

  // Set up storage listener
  setupStorageListener()

  // Pre-initialize all storage keys to ensure they're ready when accessed
  initCache()

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
      isInitialized = true
      // Async save to storage (fire and forget)
      ExtensionStorage.set(storageKey, value).catch(() => {
        // Silently handle storage errors
      })
    },
    removeItem: (key: string): void => {
      cachedValue = defaultValue
      isInitialized = true
      // Async remove from storage (fire and forget)
      ExtensionStorage.remove(storageKey).catch(() => {
        // Silently handle storage errors
      })
    },
    // Jotai storage interface support
    subscribe: (listener: () => void) => {
      listeners.push(listener)
      return () => {
        const index = listeners.indexOf(listener)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
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