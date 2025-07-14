import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import { atomWithStorage } from 'jotai/utils'
import { Levels, Level, Id, Settings, View, Word, Theme } from '../types'
import { learnedStorage, metStorage, settingsStorage } from '../utils/extension-storage-provider'

const KEY = `tab-of-words`

export const DEFAULT_LEVELS: Levels = ([1, 2, 3, 4, 5] as Level[]).reduce(
  (pre, level) => [...pre, { level, enabled: true }],
  [] as Levels
)

const DEFAULT_SETTINGS: Settings = {
  version: '0.0.1',
  mode: 'ichigoichie',
  romaji: false,
  levels: DEFAULT_LEVELS,
  theme: 'light',
}

export const wordsAtom = atom<Word[]>([])

// Use Chrome extension storage instead of localStorage
export const learnedAtom = atomWithStorage<Id[]>(`${KEY}-learned`, [], learnedStorage)
export const metAtom = atomWithStorage<Id[]>(`${KEY}-met`, [], metStorage)

export const randomWordAtom = atom<Word | null>(null)

export const settingsAtom = atomWithStorage<Settings>(
  `${KEY}-settings`,
  DEFAULT_SETTINGS,
  settingsStorage
)
export const modeAtom = focusAtom(settingsAtom, (optic) => optic.prop('mode'))
export const levelsAtom = focusAtom(settingsAtom, (optic) =>
  optic.prop('levels')
)
export const romajiAtom = focusAtom(settingsAtom, (optic) =>
  optic.prop('romaji')
)
export const themeAtom = focusAtom(settingsAtom, (optic) =>
  optic.prop('theme').optional()
)

export const viewAtom = atom<View>('word')

// helpers ================================================================

export const enabledLevelsAtom = atom<Level[]>((get) =>
  get(levelsAtom)
    .filter((l) => l.enabled)
    .map((l) => l.level)
)

export const switchLevelAtom = atom(null, (get, set, level: Level) => {
  set(levelsAtom, (prev) =>
    prev.map((item) =>
      item.level === level ? { ...item, enabled: !item.enabled } : item
    )
  )
  // refresh random word
  const randomWord = get(randomWordAtom)
  if (randomWord && !get(enabledLevelsAtom).includes(randomWord.level)) {
    set(getRandomWordAtom)
  }
})

export const addLearnedAtom = atom(null, (get, set, value: Id) => {
  if (get(learnedAtom).includes(value)) return
  set(learnedAtom, (prev) => [value, ...prev])
})

export const removeLearnedAtom = atom(null, (get, set, value: Id) => {
  set(learnedAtom, (prev) => prev.filter((id) => id !== value))
})

export const learnedWordsAtom = atom<Word[]>((get) => {
  const learned = get(learnedAtom)
  const words = get(wordsAtom)
  return learned.map((uuid) => words.find((w) => w.uuid === uuid)!)
})

export const restOfWordsAtom = atom<Word[]>((get) => {
  const words = get(wordsAtom)
  const learned = get(learnedAtom)
  const met = get(metAtom)
  const mode = get(modeAtom)
  const enabledLevels = get(enabledLevelsAtom)

  return words.filter((word) => {
    if (!enabledLevels.includes(word.level)) {
      return false
    }
    if (mode === 'ichigoichie') {
      return !met.includes(word.uuid)
    } else {
      return !learned.includes(word.uuid)
    }
  })
})

export const getRandomWordAtom = atom(
  (get) => get(randomWordAtom),
  (get, set) => {
    const rest = get(restOfWordsAtom)
    if (!rest || rest.length === 0) return
    
    const randomWord = rest[Math.floor(Math.random() * rest.length)]
    set(randomWordAtom, randomWord)

    if (randomWord && get(modeAtom) === 'ichigoichie') {
      set(metAtom, (prev) => [randomWord.uuid, ...prev])
    }
  }
)
