import type { WordCard } from './schemas'
import seedData from '../data/seed-words.json'

export type LanguageCode = 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt' | 'ja' | 'ko' | 'zh' | 'ru' | 'ar' | 'hi' | 'vi'

export interface SeedWord {
  word: string
  translation: string
  phonetic: string
  nativeApprox: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  exampleSentence: string
}

export interface InteractionData {
  interaction: number
  description: string
  words: Record<LanguageCode, SeedWord[]>
}

export interface SeedData {
  interactions: InteractionData[]
}

const typedSeedData = seedData as SeedData

export function getSeedWords(
  interactionNum: number,
  targetLang: string,
  nativeLang: string
): WordCard[] | null {
  // Only use seed words for interactions 1-3
  if (interactionNum < 1 || interactionNum > 3) {
    return null
  }

  const interaction = typedSeedData.interactions.find(
    (i) => i.interaction === interactionNum
  )

  if (!interaction) {
    return null
  }

  const words = interaction.words[targetLang as LanguageCode]
  if (!words || words.length === 0) {
    return null
  }

  // Get native language name for translation
  const nativeLangNames: Record<string, string> = {
    en: 'English',
    fr: 'French',
    es: 'Spanish',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ru: 'Russian',
    ar: 'Arabic',
    hi: 'Hindi',
    vi: 'Vietnamese'
  }

  const nativeName = nativeLangNames[nativeLang] || nativeLang

  // Map seed words to WordCard format
  return words.map((word) => ({
    word: word.word,
    translation: word.translation,
    phonetic: word.phonetic,
    nativeApprox: word.nativeApprox,
    difficulty: word.difficulty,
    category: word.category,
    exampleSentence: word.exampleSentence
  }))
}

export function getNextInteractionNum(sessionId: string): number {
  // Get current interaction count from localStorage (client-side) or return 1
  // This is a placeholder - the actual count is managed in the component
  return 1
}
