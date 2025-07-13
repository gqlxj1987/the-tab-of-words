import { getAudioUrl } from '../utils/api'
import { Word } from '../types'
import { useRef } from 'react'

export default function Audio({ word }: { word: Word }) {
  const url = getAudioUrl(word.furigana)
  const audioRef = useRef<HTMLAudioElement>(null)

  const play = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.play().catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Audio playback error:', error)
        }
      })
    }
  }

  return (
    <audio ref={audioRef} hidden>
      <source src={url} type="audio/mp3" />
    </audio>
  )
}
