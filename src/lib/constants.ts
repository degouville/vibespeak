export const LANGUAGES = [
  { code: 'en', name: 'English', ttsCode: 'en-US' },
  { code: 'fr', name: 'French', ttsCode: 'fr-FR' },
  { code: 'es', name: 'Spanish', ttsCode: 'es-ES' },
  { code: 'de', name: 'German', ttsCode: 'de-DE' },
  { code: 'it', name: 'Italian', ttsCode: 'it-IT' },
  { code: 'pt', name: 'Portuguese', ttsCode: 'pt-BR' },
  { code: 'ja', name: 'Japanese', ttsCode: 'ja-JP' },
  { code: 'ko', name: 'Korean', ttsCode: 'ko-KR' },
  { code: 'zh', name: 'Chinese', ttsCode: 'zh-CN' },
  { code: 'ru', name: 'Russian', ttsCode: 'ru-RU' },
  { code: 'ar', name: 'Arabic', ttsCode: 'ar-SA' },
  { code: 'hi', name: 'Hindi', ttsCode: 'hi-IN' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']

export const RATE_LIMIT_USD = 0.10

export const MODEL_NAME = 'google/gemini-2.0-flash-lite-001'

export const PRICING = {
  inputPerMillion: 0.075,
  outputPerMillion: 0.30,
}

export const DIFFICULTY_COLORS = {
  beginner: { bg: 'bg-emerald-500/15', text: 'text-emerald-600', border: 'border-emerald-500/30' },
  intermediate: { bg: 'bg-yellow-400/15', text: 'text-yellow-600', border: 'border-yellow-400/30' },
  advanced: { bg: 'bg-red-500/15', text: 'text-red-500', border: 'border-red-500/30' },
} as const

export type Difficulty = keyof typeof DIFFICULTY_COLORS

export const CATEGORIES = [
  'greetings',
  'food',
  'travel',
  'numbers',
  'family',
  'emotions',
  'nature',
  'daily life',
] as const

export type Category = (typeof CATEGORIES)[number]
