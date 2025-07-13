// Chrome Extension Storage Utilities
// Replaces localStorage with chrome.storage.local for extension compatibility

export class ExtensionStorage {
  static async get(key: string): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key])
      })
    })
  }

  static async set(key: string, value: any): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve()
      })
    })
  }

  static async remove(key: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], () => {
        resolve()
      })
    })
  }

  static async clear(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve()
      })
    })
  }
}

// Storage keys for the extension
export const STORAGE_KEYS = {
  WORDS: 'tab-of-words-words',
  LEARNED: 'tab-of-words-learned', 
  MET: 'tab-of-words-met',
  SETTINGS: 'tab-of-words-settings',
  LAST_FETCH: 'tab-of-words-last-fetch'
}

// Migration utility to move from localStorage to chrome.storage
export async function migrateFromLocalStorage() {
  const keysToMigrate = [
    'tab-of-words-learned',
    'tab-of-words-met', 
    'tab-of-words-settings'
  ]

  for (const key of keysToMigrate) {
    const localStorageValue = localStorage.getItem(key)
    if (localStorageValue) {
      try {
        const parsedValue = JSON.parse(localStorageValue)
        await ExtensionStorage.set(key, parsedValue)
        localStorage.removeItem(key)
      } catch (error) {
        console.warn(`Failed to migrate ${key}:`, error)
      }
    }
  }
}