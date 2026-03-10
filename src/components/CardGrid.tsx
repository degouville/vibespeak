import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import type { WordCard as WordCardType } from '../lib/schemas'
import WordCard from './WordCard'

interface CardGridProps {
  cards: WordCardType[]
  targetLang: string
  onExplore: (word: string) => void
  isLoading: boolean
}

export default function CardGrid({ cards, targetLang, onExplore, isLoading }: CardGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current || cards.length === 0) return

    const items = gridRef.current.querySelectorAll('.word-card')
    gsap.fromTo(
      items,
      { opacity: 0, y: 24, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.06,
        duration: 0.5,
        ease: 'power3.out',
      }
    )
  }, [cards])

  if (isLoading) {
    return (
      <div className="bento-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`island-shell animate-pulse rounded-2xl p-5 ${i === 0 || i === 3 ? 'card-lg' : ''}`}
          >
            <div className="mb-3 h-6 w-2/3 rounded-lg bg-[var(--line)]" />
            <div className="mb-2 h-4 w-1/2 rounded bg-[var(--line)]" />
            <div className="mb-3 h-16 rounded-xl bg-[var(--line)]" />
            <div className="h-3 w-3/4 rounded bg-[var(--line)]" />
          </div>
        ))}
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="island-shell flex flex-col items-center justify-center rounded-2xl p-12 text-center">
        <p className="mb-2 text-lg font-semibold text-[var(--sea-ink)]">
          Ready to learn?
        </p>
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Pick a category or generate words to get started.
        </p>
      </div>
    )
  }

  return (
    <div ref={gridRef} className="bento-grid">
      {cards.map((card, i) => (
        <WordCard
          key={`${card.word}-${i}`}
          card={card}
          targetLang={targetLang}
          onExplore={onExplore}
          index={i}
        />
      ))}
    </div>
  )
}
