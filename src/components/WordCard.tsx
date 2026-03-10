import type { WordCard as WordCardType } from '../lib/schemas'
import { DIFFICULTY_COLORS } from '../lib/constants'
import PlayButton from './PlayButton'

interface WordCardProps {
  card: WordCardType
  targetLang: string
  onExplore: (word: string) => void
  index: number
}

export default function WordCard({ card, targetLang, onExplore, index }: WordCardProps) {
  const colors = DIFFICULTY_COLORS[card.difficulty]
  const isLarge = index === 0 || index === 3

  return (
    <article
      onClick={() => onExplore(card.word)}
      className={`word-card island-shell group cursor-pointer rounded-2xl p-5 transition hover:-translate-y-1 ${isLarge ? 'card-lg' : ''}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="mb-0.5 truncate text-xl font-bold text-[var(--sea-ink)]">
            {card.word}
          </h3>
          <p className="text-sm text-[var(--sea-ink-soft)]">{card.translation}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <PlayButton text={card.word} langCode={targetLang} />
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border}`}>
            {card.difficulty}
          </span>
        </div>
      </div>

      <div className="phonetic-guide mb-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
        <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-[var(--kicker)]">
          Say it like
        </p>
        <p className="text-base font-bold text-[var(--lagoon-deep)]">
          {card.nativeApprox}
        </p>
        <p className="mt-0.5 text-xs text-[var(--sea-ink-soft)] opacity-70">
          {card.phonetic}
        </p>
      </div>

      <p className="mb-1 text-xs italic text-[var(--sea-ink-soft)]">
        {card.exampleSentence}
      </p>

      <div className="mt-2 flex items-center justify-between">
        <span className="inline-flex rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-2 py-0.5 text-xs text-[var(--sea-ink-soft)]">
          {card.category}
        </span>
        <span className="text-xs text-[var(--lagoon)] opacity-0 transition group-hover:opacity-100">
          Click to explore related words
        </span>
      </div>
    </article>
  )
}
