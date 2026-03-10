import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import type { WordCard } from '../lib/schemas'
import type { Category } from '../lib/constants'
import { generateWords, getSessionUsage } from '../server/functions'
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

function LearnPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionData | null>(null)
  const [cards, setCards] = useState<WordCard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [spent, setSpent] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('vibespeak_session')
    if (!stored) {
      navigate({ to: '/' })
      return
    }
    try {
      const parsed = JSON.parse(stored) as SessionData
      setSession(parsed)
    } catch {
      navigate({ to: '/' })
    }
  }, [navigate])

  const refreshUsage = useCallback(async () => {
    if (!session) return
    const data = await getSessionUsage({ data: { sessionId: session.sessionId } })
    setSpent(data.totalCost)
  }, [session])

  const handleGenerate = useCallback(async (context?: string) => {
    if (!session) return
    setIsLoading(true)
    setError(null)

    try {
      const result = await generateWords({
        data: {
          sessionId: session.sessionId,
          nativeLang: session.nativeLang,
          targetLang: session.targetLang,
          category: selectedCategory ?? undefined,
          context,
        },
      })

      if (result.error) {
        setError(result.error)
      } else {
        setCards(result.words)
      }

      await refreshUsage()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }, [session, selectedCategory, refreshUsage])

  useEffect(() => {
    if (session && cards.length === 0) {
      handleGenerate()
    }
  }, [session])

  useEffect(() => {
    if (session) refreshUsage()
  }, [session, refreshUsage])

  const handleExplore = (word: string) => {
    handleGenerate(word)
  }

  const handleReset = () => {
    localStorage.removeItem('vibespeak_session')
    navigate({ to: '/' })
  }

  const handleCategorySelect = (cat: Category | null) => {
    setSelectedCategory(cat)
  }

  if (!session) return null

  const targetName = LANGUAGES.find((l) => l.code === session.targetLang)?.name ?? session.targetLang

  return (
    <main className="page-wrap px-4 pb-8 pt-6">
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
          spent={spent}
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
