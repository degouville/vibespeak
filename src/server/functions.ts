import { createServerFn } from '@tanstack/react-start'
import { db } from '../lib/db'
import { sessions, usage } from '../lib/schema'
import { aiResponseSchema, generateRequestSchema, initSessionRequestSchema } from '../lib/schemas'
import { chatCompletion } from '../lib/openrouter'
import { buildSystemPrompt, buildGeneratePrompt } from './prompts'
import { LANGUAGES, RATE_LIMIT_USD } from '../lib/constants'
import { eq, sql } from 'drizzle-orm'

export const initSession = createServerFn({ method: 'POST' })
  .validator((data: unknown) => initSessionRequestSchema.parse(data))
  .handler(async ({ data }) => {
    const { nativeLang, targetLang } = data
    const id = crypto.randomUUID()

    db.insert(sessions).values({
      id,
      nativeLang,
      targetLang,
      createdAt: new Date(),
    }).run()

    return { sessionId: id }
  })

export const getSessionUsage = createServerFn({ method: 'GET' })
  .validator((data: { sessionId: string }) => data)
  .handler(async ({ data }) => {
    const result = db
      .select({
        totalCost: sql<number>`coalesce(sum(${usage.costUsd}), 0)`,
        totalInputTokens: sql<number>`coalesce(sum(${usage.inputTokens}), 0)`,
        totalOutputTokens: sql<number>`coalesce(sum(${usage.outputTokens}), 0)`,
      })
      .from(usage)
      .where(eq(usage.sessionId, data.sessionId))
      .get()

    return {
      totalCost: result?.totalCost ?? 0,
      totalInputTokens: result?.totalInputTokens ?? 0,
      totalOutputTokens: result?.totalOutputTokens ?? 0,
      limit: RATE_LIMIT_USD,
      remaining: RATE_LIMIT_USD - (result?.totalCost ?? 0),
    }
  })

export const generateWords = createServerFn({ method: 'POST' })
  .validator((data: unknown) => generateRequestSchema.parse(data))
  .handler(async ({ data }) => {
    const { sessionId, nativeLang, targetLang, category, context } = data

    // Rate limit check
    const currentUsage = await getSessionUsage({ data: { sessionId } })
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

    // Track usage
    db.insert(usage).values({
      sessionId,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costUsd: result.cost,
      createdAt: new Date(),
    }).run()

    // Parse and validate AI response
    try {
      const parsed = JSON.parse(result.content)
      const validated = aiResponseSchema.parse(parsed)
      return { words: validated.words, error: null }
    } catch {
      return { error: 'Failed to parse AI response. Try again.', words: [] }
    }
  })
