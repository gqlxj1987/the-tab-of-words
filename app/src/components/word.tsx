import WordActions from './word-actions'
import Furigana from './furigana'
import { useAtom } from 'jotai'
import { getRandomWordAtom, randomWordAtom, wordsAtom } from '../context/store'
import { useEffect, useState } from 'react'

const wordStyle = {
  fontSize: 'calc(24px + 5vw)',
  lineHeight: '1',
}

export default function Word() {
  const [randomWord, refreshRandomWord] = useAtom(getRandomWordAtom)
  const [, setRandomWord] = useAtom(randomWordAtom)
  const [words] = useAtom(wordsAtom)
  const [isLoading, setIsLoading] = useState(false)

  console.log('Word component rendered, current word:', randomWord)

  useEffect(() => {
    if (!randomWord) {
      console.log('No random word, calling refreshRandomWord')
      refreshRandomWord()
    }
  }, [randomWord, refreshRandomWord])

  const fetchNewRandomWord = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('https://jlpt-vocab-api.vercel.app/api/words/random')
      const newWord = await response.json()
      console.log('Fetched new word from API:', newWord)
      
      // Set the new word directly
      setRandomWord(newWord)
    } catch (error) {
      console.error('Error fetching new word:', error)
      // Fallback to refreshRandomWord if API fails
      refreshRandomWord()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('Setting up keyboard listener...')
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Space key to change word
      if (event.key === ' ' || event.code === 'Space' || event.keyCode === 32) {
        event.preventDefault()
        console.log('Space pressed, fetching new word from API')
        fetchNewRandomWord()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    console.log('Keyboard listener attached')
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (!randomWord)
    return (
      <>
        <code className="text-base text-stone-400">
          :)
          <br />
          You met all the words
          <br />
          Change the Level or Mode to see more words
        </code>
      </>
    ) // TODO: show empty when all learned

  return (
    <div className="absolute left-1/2 top-1/2 w-[80vw] translate-x-[-50%] translate-y-[-60%] text-center text-base md:text-xl">
      {isLoading && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <code className="text-stone-400">Loading...</code>
        </div>
      )}
      <Furigana word={randomWord} />
      <h1 className="my-8 font-serif japanese_gothic" style={wordStyle}>
        {randomWord.word}
      </h1>
      <p>{randomWord.meaning}</p>
      <div className="mt-12">
        <WordActions word={randomWord} />
      </div>
    </div>
  )
}
