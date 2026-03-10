import { z } from 'zod'

export const wordCardSchema = z.object({
  word: z.string(),
  translation: z.string(),
  phonetic: z.string(),
  nativeApprox: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.string(),
  exampleSentence: z.string(),
})

export type WordCard = z.infer<typeof wordCardSchema>

export const aiResponseSchema = z.object({
  words: z.array(wordCardSchema),
})

export const generateRequestSchema = z.object({
  sessionId: z.string().uuid(),
  nativeLang: z.string().min(2).max(5),
  targetLang: z.string().min(2).max(5),
  category: z.string().optional(),
  context: z.string().optional(),
  interactionNum: z.number().int().min(1).max(100).optional(),
})

export const initSessionRequestSchema = z.object({
  nativeLang: z.string().min(2).max(5),
  targetLang: z.string().min(2).max(5),
})
