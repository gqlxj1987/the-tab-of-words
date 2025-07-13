// Chrome Extension Storage Provider for Jotai
// Custom storage implementation that uses chrome.storage.local instead of localStorage

import { ExtensionStorage, STORAGE_KEYS } from './extension-storage'

export function createExtensionStorage<T>(key: string, defaultValue: T) {
  return {
    getItem: async (): Promise<T> => {
      const value = await ExtensionStorage.get(key)
      return value !== undefined ? value : defaultValue
    },
    setItem: async (value: T): Promise<void> => {
      await ExtensionStorage.set(key, value)
    },
    removeItem: async (): Promise<void> => {
      await ExtensionStorage.remove(key)
    }
  }
}

// Storage instances for each data type
export const learnedStorage = createExtensionStorage(STORAGE_KEYS.LEARNED, [])
export const metStorage = createExtensionStorage(STORAGE_KEYS.MET, [])
export const settingsStorage = createExtensionStorage(STORAGE_KEYS.SETTINGS, {
  version: '0.0.1',
  mode: 'ichigoichie',
  romaji: false,
  levels: [1, 2, 3, 4, 5].map(level => ({ level, enabled: true }))
})