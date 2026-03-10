/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from '@tanstack/react-start'
import { db } from '../lib/db'
import { sessions, usage } from '../lib/schema'
import { aiResponseSchema, generateRequestSchema, initSessionRequestSchema } from '../lib/schemas'
import { chatCompletion } from '../lib/openrouter'
import { buildSystemPrompt, buildGeneratePrompt } from './prompts'
import { LANGUAGES, RATE_LIMIT_USD } from '../lib/constants'
import { eq, sql } from 'drizzle-orm'

const _initSession = createServerFn({ method: 'POST' })
  .handler(async (ctx: any) => {
    const { nativeLang, targetLang } = initSessionRequestSchema.parse(ctx.data)
    const id = crypto.randomUUID()

    db.insert(sessions).values({
      id,
      nativeLang,
      targetLang,
      createdAt: new Date(),
    }).run()

    return { sessionId: id }
  })

const _getSessionUsage = createServerFn({ method: 'GET' })
  .handler(async (ctx: any) => {
    const { sessionId } = ctx.data as { sessionId: string }
    const result = db
      .select({
        totalCost: sql<number>`coalesce(sum(${usage.costUsd}), 0)`,
        totalInputTokens: sql<number>`coalesce(sum(${usage.inputTokens}), 0)`,
        totalOutputTokens: sql<number>`coalesce(sum(${usage.outputTokens}), 0)`,
      })
      .from(usage)
      .where(eq(usage.sessionId, sessionId))
      .get()

    return {
      totalCost: result?.totalCost ?? 0,
      totalInputTokens: result?.totalInputTokens ?? 0,
      totalOutputTokens: result?.totalOutputTokens ?? 0,
      limit: RATE_LIMIT_USD,
      remaining: RATE_LIMIT_USD - (result?.totalCost ?? 0),
    }
  })

const _generateWords = createServerFn({ method: 'POST' })
  .handler(async (ctx: any) => {
    const { sessionId, nativeLang, targetLang, category, context } = generateRequestSchema.parse(ctx.data)

    const currentUsage = await (_getSessionUsage as any)({ data: { sessionId } })
    if (currentUsage.remaining <= 0) {
      return { error: 'Budget limit reached. You have used your $0.10 session budget.', words: [] }
    }

    const nativeName = LANGUAGES.find((l) => l.code === nativeLang)?.name ?? nativeLang
    const targetName = LANGUAGES.find((l) => l.code === targetLang)?.name ?? targetLang

    const systemPrompt = buildSystemPrompt(nativeName, targetName)
    const userPrompt = buildGeneratePrompt({ category, context })

    const result = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])

    db.insert(usage).values({
      sessionId,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costUsd: result.cost,
      createdAt: new Date(),
    }).run()

    try {
      const parsed = JSON.parse(result.content)
      const validated = aiResponseSchema.parse(parsed)
      return { words: validated.words, error: null }
    } catch {
      return { error: 'Failed to parse AI response. Try again.', words: [] }
    }
  })

export const initSession = _initSession as unknown as (opts: { data: { nativeLang: string; targetLang: string } }) => Promise<{ sessionId: string }>

export const getSessionUsage = _getSessionUsage as unknown as (opts: { data: { sessionId: string } }) => Promise<{
  totalCost: number
  totalInputTokens: number
  totalOutputTokens: number
  limit: number
  remaining: number
}>

export const generateWords = _generateWords as unknown as (opts: { data: {
  sessionId: string
  nativeLang: string
  targetLang: string
  category?: string
  context?: string
} }) => Promise<{ words: Array<{ word: string; translation: string; phonetic: string; nativeApprox: string; difficulty: 'beginner' | 'intermediate' | 'advanced'; category: string; exampleSentence: string }>; error: string | null }>
