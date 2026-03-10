import { LANGUAGES } from './constants'

export function speak(text: string, langCode: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  window.speechSynthesis.cancel()

  const lang = LANGUAGES.find((l) => l.code === langCode)
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang?.ttsCode ?? langCode
  utterance.rate = 0.8

  window.speechSynthesis.speak(utterance)
}
