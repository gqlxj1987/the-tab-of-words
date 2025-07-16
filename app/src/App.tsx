import { useAtom } from 'jotai'
import { useEffect, Suspense, useState } from 'react'

import { View } from './types'
import Book from './components/book'
import FadeContainer from './components/fade-container'
import Header from './components/header'
import Settings from './components/settings'
import WordCard from './components/word'
import { viewAtom, wordsAtom, themeAtom } from './context/store'
import { useFetchWordsWithCache } from './utils/api'
import { migrateFromLocalStorage, ExtensionStorage, STORAGE_KEYS } from './utils/extension-storage'

function MainView() {
  const [view] = useAtom(viewAtom)
  
  const Views: Array<[key: View, el: () => JSX.Element]> = [
    ['word', WordCard],
    ['book', Book],
    ['settings', Settings],
  ]

  return (
    <>
      <Header />
      {Views.map(([key, Comp]) => (
        <FadeContainer key={key} show={view === key}>
          {Comp()}
        </FadeContainer>
      ))}
    </>
  )
}

function App() {
  const [, setWords] = useAtom(wordsAtom)
  const [theme] = useAtom(themeAtom)
  const [storageReady, setStorageReady] = useState(false)
  const { connected, data, error } = useFetchWordsWithCache()
  const loading = !data && !error

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        console.log('[App] Starting storage initialization')
        // Migrate from localStorage to chrome.storage if needed
        await migrateFromLocalStorage()
        
        // Pre-load storage data to avoid async issues
        const [learned, met, settings] = await Promise.all([
          ExtensionStorage.get(STORAGE_KEYS.LEARNED),
          ExtensionStorage.get(STORAGE_KEYS.MET),
          ExtensionStorage.get(STORAGE_KEYS.SETTINGS)
        ])
        
        console.log('[App] Storage data loaded:', { learned, met, settings })
        
        // Apply theme immediately if found in storage
        if (settings?.theme) {
          console.log('[App] Applying theme from storage:', settings.theme)
          if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
        
        setStorageReady(true)
      } catch (error) {
        console.warn('Storage initialization error:', error)
        setStorageReady(true) // Continue anyway
      }
    }

    initializeStorage()
  }, [])

  useEffect(() => {
    if (data) setWords(data)
  }, [data])

  useEffect(() => {
    // Apply theme class to document root
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  if (!storageReady) {
    return (
      <div className="absolute-center">
        <code className="text-stone-400 dark:text-stone-500">Initializing storage...</code>
      </div>
    )
  }

  const app = (
    <>
      <FadeContainer show={loading}>
        <code className="absolute-center text-stone-400 dark:text-stone-500">Initializing...</code>
      </FadeContainer>
      <FadeContainer show={!!data}>
        <MainView />
      </FadeContainer>
      <FadeContainer show={!!error}>
        <code className="text-base text-stone-400 dark:text-stone-500">
          :(
          <br />
          Something wrong happened
          <br />
          Try to refresh the page
        </code>
      </FadeContainer>
    </>
  )

  return (
    <Suspense fallback={
      <div className="absolute-center">
        <code className="text-stone-400 dark:text-stone-500">Loading...</code>
      </div>
    }>
      {connected && app}
    </Suspense>
  )
}

export default App
