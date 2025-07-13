import { useState, useEffect } from 'react'
import { ExtensionStorage, STORAGE_KEYS } from './extension-storage'

export default function useFetchWithCache<T>(cacheId: string, url: string) {
  const [data, setData] = useState<T | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        // Check if we have cached data in Chrome storage
        const cachedData = await ExtensionStorage.get(STORAGE_KEYS.WORDS)
        const lastFetch = await ExtensionStorage.get(STORAGE_KEYS.LAST_FETCH)
        
        // Use cached data if it's less than 1 hour old
        const oneHour = 60 * 60 * 1000
        if (cachedData && lastFetch && (Date.now() - lastFetch) < oneHour) {
          setData(cachedData)
          setConnected(true)
          return
        }

        // Fetch fresh data
        setConnected(true)
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const fetchedData = await response.json()
        
        // Cache the data
        await ExtensionStorage.set(STORAGE_KEYS.WORDS, fetchedData)
        await ExtensionStorage.set(STORAGE_KEYS.LAST_FETCH, Date.now())
        
        setData(fetchedData)
      } catch (error: any) {
        console.error('Fetch error:', error)
        setError(error)
        setConnected(true)
      }
    }

    run()
  }, [url, cacheId])

  return { connected, data, error }
}
