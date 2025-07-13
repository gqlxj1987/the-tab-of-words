// Chrome Extension Storage Utilities
// Replaces localStorage with chrome.storage.local for extension compatibility

// Fallback storage for development mode when Chrome APIs aren't available
const fallbackStorage: Record<string, any> = {}

const isExtensionContext = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local

export class ExtensionStorage {
  static async get(key: string): Promise<any> {
    if (!isExtensionContext) {
      // Fallback to memory storage in development
      return Promise.resolve(fallbackStorage[key])
    }

    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            console.warn(`Storage get error for ${key}:`, chrome.runtime.lastError)
            resolve(undefined)
          } else {
            resolve(result[key])
          }
        })
      } catch (error) {
        console.warn(`Storage get exception for ${key}:`, error)
        resolve(undefined)
      }
    })
  }

  static async set(key: string, value: any): Promise<void> {
    if (!isExtensionContext) {
      // Fallback to memory storage in development
      fallbackStorage[key] = value
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            console.warn(`Storage set error for ${key}:`, chrome.runtime.lastError)
          }
          resolve()
        })
      } catch (error) {
        console.warn(`Storage set exception for ${key}:`, error)
        resolve()
      }
    })
  }

  static async remove(key: string): Promise<void> {
    if (!isExtensionContext) {
      // Fallback to memory storage in development
      delete fallbackStorage[key]
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.remove([key], () => {
          if (chrome.runtime.lastError) {
            console.warn(`Storage remove error for ${key}:`, chrome.runtime.lastError)
          }
          resolve()
        })
      } catch (error) {
        console.warn(`Storage remove exception for ${key}:`, error)
        resolve()
      }
    })
  }

  static async clear(): Promise<void> {
    if (!isExtensionContext) {
      // Fallback to memory storage in development
      Object.keys(fallbackStorage).forEach(key => delete fallbackStorage[key])
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.clear(() => {
          if (chrome.runtime.lastError) {
            console.warn('Storage clear error:', chrome.runtime.lastError)
          }
          resolve()
        })
      } catch (error) {
        console.warn('Storage clear exception:', error)
        resolve()
      }
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