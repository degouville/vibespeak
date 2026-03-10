import { Volume2 } from 'lucide-react'
import { speak } from '../lib/tts'

export default function PlayButton({ text, langCode }: { text: string, langCode: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        speak(text, langCode)
      }}
      className="inline-flex items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] p-2 text-[var(--sea-ink-soft)] transition hover:-translate-y-0.5 hover:text-[var(--lagoon)]"
      aria-label={`Listen to pronunciation of ${text}`}
    >
      <Volume2 className="h-4 w-4" />
    </button>
  )
}
