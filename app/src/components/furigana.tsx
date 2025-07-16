import { useAtomValue } from 'jotai'
import { romajiAtom } from '../context/store'
import { Word } from '../types'

export default function Furigana({ word }: { word: Word }) {
  const { furigana, romaji } = word
  const showRomaji = useAtomValue(romajiAtom) && romaji
  
  console.log(`[Furigana] romaji atom value: ${useAtomValue(romajiAtom)}, word has romaji: ${!!romaji}, showRomaji: ${showRomaji}`)

  return (
    <div>
      {!furigana && !showRomaji && '　'}

      {furigana && <span>{furigana}</span>}

      {showRomaji && (
        <>
          {furigana && <span className="select-none"> ・ </span>}
          <span>{romaji}</span>
        </>
      )}
    </div>
  )
}
