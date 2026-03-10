import { LANGUAGES, CATEGORIES } from '../lib/constants'
import type { Category } from '../lib/constants'
import UsageMeter from './UsageMeter'
import { Sparkles, RotateCcw } from 'lucide-react'

interface SidebarProps {
  nativeLang: string
  targetLang: string
  spent: number
  selectedCategory: string | null
  onSelectCategory: (cat: Category | null) => void
  onGenerate: () => void
  onReset: () => void
  isLoading: boolean
}

export default function Sidebar({
  nativeLang,
  targetLang,
  spent,
  selectedCategory,
  onSelectCategory,
  onGenerate,
  onReset,
  isLoading,
}: SidebarProps) {
  const native = LANGUAGES.find((l) => l.code === nativeLang)
  const target = LANGUAGES.find((l) => l.code === targetLang)

  return (
    <aside className="sidebar flex w-full flex-col gap-5 lg:w-64 lg:flex-shrink-0">
      <div className="island-shell rounded-2xl p-4">
        <p className="island-kicker mb-2">Language Pair</p>
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--sea-ink)]">
          <span className="rounded-lg border border-[var(--chip-line)] bg-[var(--chip-bg)] px-2 py-1">
            {native?.name ?? nativeLang}
          </span>
          <span className="text-[var(--lagoon)]">&rarr;</span>
          <span className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-2 py-1 text-yellow-600">
            {target?.name ?? targetLang}
          </span>
        </div>
      </div>

      <div className="island-shell rounded-2xl p-4">
        <p className="island-kicker mb-2">Categories</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
              selectedCategory === null
                ? 'border-yellow-400/40 bg-yellow-400/15 text-yellow-600'
                : 'border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize transition ${
                selectedCategory === cat
                  ? 'border-yellow-400/40 bg-yellow-400/15 text-yellow-600'
                  : 'border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="island-shell rounded-2xl p-4">
        <UsageMeter spent={spent} />
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)] disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <Sparkles className="h-4 w-4" />
          {isLoading ? 'Generating...' : 'Generate Words'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink-soft)] transition hover:-translate-y-0.5 hover:text-[var(--sea-ink)]"
        >
          <RotateCcw className="h-4 w-4" />
          New Session
        </button>
      </div>
    </aside>
  )
}
