export const LANGUAGES = [
  { code: 'en', name: 'English', ttsCode: 'en-US', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'fr', name: 'French', ttsCode: 'fr-FR', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: 'es', name: 'Spanish', ttsCode: 'es-ES', flag: '\u{1F1EA}\u{1F1F8}' },
  { code: 'de', name: 'German', ttsCode: 'de-DE', flag: '\u{1F1E9}\u{1F1EA}' },
  { code: 'it', name: 'Italian', ttsCode: 'it-IT', flag: '\u{1F1EE}\u{1F1F9}' },
  { code: 'pt', name: 'Portuguese', ttsCode: 'pt-BR', flag: '\u{1F1E7}\u{1F1F7}' },
  { code: 'ja', name: 'Japanese', ttsCode: 'ja-JP', flag: '\u{1F1EF}\u{1F1F5}' },
  { code: 'ko', name: 'Korean', ttsCode: 'ko-KR', flag: '\u{1F1F0}\u{1F1F7}' },
  { code: 'zh', name: 'Chinese', ttsCode: 'zh-CN', flag: '\u{1F1E8}\u{1F1F3}' },
  { code: 'ru', name: 'Russian', ttsCode: 'ru-RU', flag: '\u{1F1F7}\u{1F1FA}' },
  { code: 'ar', name: 'Arabic', ttsCode: 'ar-SA', flag: '\u{1F1F8}\u{1F1E6}' },
  { code: 'hi', name: 'Hindi', ttsCode: 'hi-IN', flag: '\u{1F1EE}\u{1F1F3}' },
  { code: 'vi', name: 'Vietnamese', ttsCode: 'vi-VN', flag: '\u{1F1FB}\u{1F1F3}' },
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
