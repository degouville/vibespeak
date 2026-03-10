import { useState, useRef, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { gsap } from 'gsap'
import { LANGUAGES } from '../lib/constants'
import { initSession } from '../server/functions'

type Step = 'native' | 'target'

export default function LanguagePicker() {
  const [step, setStep] = useState<Step>('native')
  const [nativeLang, setNativeLang] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!gridRef.current) return
    const items = gridRef.current.querySelectorAll('.lang-btn')
    gsap.fromTo(
      items,
      { opacity: 0, y: 16, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.04, duration: 0.4, ease: 'power3.out' }
    )
  }, [step])

  const handleSelect = async (code: string) => {
    if (step === 'native') {
      setNativeLang(code)
      setStep('target')
      return
    }

    if (!nativeLang) return

    const { sessionId } = await initSession({ data: { nativeLang, targetLang: code } })
    localStorage.setItem('vibespeak_session', JSON.stringify({
      sessionId,
      nativeLang,
      targetLang: code,
    }))
    navigate({ to: '/learn' })
  }

  const availableLanguages = step === 'target'
    ? LANGUAGES.filter((l) => l.code !== nativeLang)
    : LANGUAGES

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />

        <p className="island-kicker mb-3">
          {step === 'native' ? 'Step 1 of 2' : 'Step 2 of 2'}
        </p>
        <h1 className="display-title mb-3 max-w-3xl text-3xl leading-tight font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
          {step === 'native'
            ? 'What language do you speak?'
            : 'What language do you want to learn?'}
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)]">
          {step === 'native'
            ? 'We will map new sounds to phonemes you already know.'
            : 'Pick your target language and start learning pronunciation.'}
        </p>

        {step === 'target' && (
          <button
            type="button"
            onClick={() => { setStep('native'); setNativeLang(null) }}
            className="mb-4 text-sm font-medium text-[var(--lagoon-deep)] hover:underline"
          >
            &larr; Back to native language
          </button>
        )}

        <div ref={gridRef} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className="lang-btn island-shell feature-card flex items-center gap-3 rounded-xl p-4 text-left transition hover:-translate-y-0.5"
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="text-lg font-bold text-[var(--sea-ink)]">
                {lang.name}
              </span>
              <span className="ml-auto text-xs uppercase tracking-wider text-[var(--sea-ink-soft)]">
                {lang.code}
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
