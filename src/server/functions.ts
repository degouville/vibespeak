/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from '@tanstack/react-start'
import { aiResponseSchema, generateRequestSchema } from '../lib/schemas'
import { chatCompletion } from '../lib/openrouter'
import { buildSystemPrompt, buildGeneratePrompt } from './prompts'
import { LANGUAGES } from '../lib/constants'
import { getSeedWords } from '../lib/seed-words'

const _generateWords = createServerFn({ method: 'POST' })
  .handler(async (ctx: any) => {
    const { nativeLang, targetLang, category, context, interactionNum } = generateRequestSchema.parse(ctx.data)

    // Use seed words for first 3 interactions (no API call needed)
    if (interactionNum && interactionNum >= 1 && interactionNum <= 3 && !context && !category) {
      const seedWords = getSeedWords(interactionNum, targetLang, nativeLang)
      if (seedWords && seedWords.length > 0) {
        return { words: seedWords, error: null }
      }
    }

    const nativeName = LANGUAGES.find((l) => l.code === nativeLang)?.name ?? nativeLang
    const targetName = LANGUAGES.find((l) => l.code === targetLang)?.name ?? targetLang

    const systemPrompt = buildSystemPrompt(nativeName, targetName)
    const userPrompt = buildGeneratePrompt({ category, context })

    const result = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])

    try {
      const parsed = JSON.parse(result.content)
      const validated = aiResponseSchema.parse(parsed)
      return { words: validated.words, error: null }
    } catch {
      return { error: 'Failed to parse AI response. Try again.', words: [] }
    }
  })

export const generateWords = _generateWords as unknown as (opts: { data: {
  sessionId: string
  nativeLang: string
  targetLang: string
  category?: string
  context?: string
  interactionNum?: number
} }) => Promise<{ words: Array<{ word: string; translation: string; phonetic: string; nativeApprox: string; difficulty: 'beginner' | 'intermediate' | 'advanced'; category: string; exampleSentence: string }>; error: string | null }>
