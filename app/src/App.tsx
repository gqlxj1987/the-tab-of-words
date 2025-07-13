import { useAtom } from 'jotai'
import { useEffect, Suspense, useState } from 'react'

import { View } from './types'
import Book from './components/book'
import FadeContainer from './components/fade-container'
import Header from './components/header'
import Settings from './components/settings'
import WordCard from './components/word'
import { viewAtom, wordsAtom } from './context/store'
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
  const [storageReady, setStorageReady] = useState(false)
  const { connected, data, error } = useFetchWordsWithCache()
  const loading = !data && !error

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Migrate from localStorage to chrome.storage if needed
        await migrateFromLocalStorage()
        
        // Pre-load storage data to avoid async issues
        await Promise.all([
          ExtensionStorage.get(STORAGE_KEYS.LEARNED),
          ExtensionStorage.get(STORAGE_KEYS.MET),
          ExtensionStorage.get(STORAGE_KEYS.SETTINGS)
        ])
        
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

  if (!storageReady) {
    return (
      <div className="absolute-center">
        <code className="text-stone-400">Initializing storage...</code>
      </div>
    )
  }

  const app = (
    <>
      <FadeContainer show={loading}>
        <code className="absolute-center text-stone-400">Initializing...</code>
      </FadeContainer>
      <FadeContainer show={!!data}>
        <MainView />
      </FadeContainer>
      <FadeContainer show={!!error}>
        <code className="text-base text-stone-400">
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
        <code className="text-stone-400">Loading...</code>
      </div>
    }>
      {connected && app}
    </Suspense>
  )
}

export default App
