import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { WordCard } from '../lib/schemas'
import type { Category } from '../lib/constants'
import { generateWords } from '../server/functions'
import Sidebar from '../components/Sidebar'
import CardGrid from '../components/CardGrid'
import Breadcrumb from '../components/Breadcrumb'
import { LANGUAGES } from '../lib/constants'

export const Route = createFileRoute('/learn')({ component: LearnPage })

interface SessionData {
  sessionId: string
  nativeLang: string
  targetLang: string
}

const INTERACTION_KEY = 'vibespeak_interaction'

function LearnPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionData | null>(null)
  const [cards, setCards] = useState<WordCard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [interactionNum, setInteractionNum] = useState(1)
  const didInit = useRef(false)
  const sessionRef = useRef<SessionData | null>(null)
  const categoryRef = useRef<Category | null>(null)
  const interactionRef = useRef(1)

  // Keep refs in sync
  sessionRef.current = session
  categoryRef.current = selectedCategory
  interactionRef.current = interactionNum

  useEffect(() => {
    const stored = localStorage.getItem('vibespeak_session')
    if (!stored) {
      navigate({ to: '/' })
      return
    }
    try {
      const parsed = JSON.parse(stored) as SessionData
      setSession(parsed)
      // Load saved interaction count
      const savedInteraction = localStorage.getItem(INTERACTION_KEY)
      if (savedInteraction) {
        const num = parseInt(savedInteraction, 10)
        setInteractionNum(num)
        interactionRef.current = num
      }
    } catch {
      navigate({ to: '/' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerate = useCallback(async (context?: string) => {
    const s = sessionRef.current
    if (!s) return
    setIsLoading(true)
    setError(null)

    try {
      const currentInteraction = interactionRef.current
      const result = await generateWords({
        data: {
          sessionId: s.sessionId,
          nativeLang: s.nativeLang,
          targetLang: s.targetLang,
          category: categoryRef.current ?? undefined,
          context,
          interactionNum: context ? undefined : currentInteraction,
        },
      })

      if (result.error) {
        setError(result.error)
      } else {
        setCards(result.words)
        // Increment interaction count after successful generation (only for non-context requests)
        if (!context) {
          const nextInteraction = Math.min(currentInteraction + 1, 4)
          setInteractionNum(nextInteraction)
          interactionRef.current = nextInteraction
          localStorage.setItem(INTERACTION_KEY, String(nextInteraction))
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-generate on first session load
  useEffect(() => {
    if (session && !didInit.current) {
      didInit.current = true
      handleGenerate()
    }
  }, [session, handleGenerate])

  const handleExplore = (word: string) => {
    handleGenerate(word)
  }

  const handleReset = () => {
    localStorage.removeItem('vibespeak_session')
    localStorage.removeItem(INTERACTION_KEY)
    navigate({ to: '/' })
  }

  const handleCategorySelect = (cat: Category | null) => {
    setSelectedCategory(cat)
  }

  if (!session) return null

  const targetName = LANGUAGES.find((l) => l.code === session.targetLang)?.name ?? session.targetLang

  return (
    <main className="px-4 pb-8 pt-6">
      <div className="mb-4">
        <Breadcrumb items={[
          { label: 'VibeSPeak', href: '/' },
          { label: 'Learn' },
          { label: targetName },
        ]} />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <Sidebar
          nativeLang={session.nativeLang}
          targetLang={session.targetLang}
          spent={0}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          onGenerate={() => handleGenerate()}
          onReset={handleReset}
          isLoading={isLoading}
        />

        <div className="min-w-0 flex-1">
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <CardGrid
            cards={cards}
            targetLang={session.targetLang}
            onExplore={handleExplore}
            isLoading={isLoading}
          />
        </div>
      </div>
    </main>
  )
}
