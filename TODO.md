# VibeSpeak — Model Integration TODO

## Models
| Role | Model ID | Via |
|------|----------|-----|
| Text (word expansion + phonetics) | `google/gemini-2.5-flash-lite-preview` | OpenRouter chat |
| TTS (pronunciation audio) | `openai/gpt-audio-mini` | OpenRouter audio |

> Note: `google/gemini-3.1-flash-lite-preview` — verify exact slug on
> https://openrouter.ai/models before shipping. Use `google/gemini-2.5-flash-lite-preview`
> as fallback if 3.1 isn't live yet.

---

## Step 1 — Server-side OpenRouter client (`src/lib/openrouter.ts`)

Single fetch wrapper — no SDK needed, avoids bundle bloat.

```ts
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

export const orFetch = (path: string, body: unknown) =>
  fetch(`${OPENROUTER_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://vibespeak.app',
    },
    body: JSON.stringify(body),
  })
```

---

## Step 2 — Text model call (word expansion + phonetics)

File: `src/lib/text.ts`

```ts
import { orFetch } from './openrouter'

export type TextResult = {
  relatedWords: string[]
  sentence: string
  phonetic: string
  usage: { promptTokens: number; completionTokens: number }
}

export const expandWord = async (
  word: string,
  targetLang: string,
  nativeLang: string
): Promise<TextResult> => {
  const res = await orFetch('/chat/completions', {
    model: 'google/gemini-2.5-flash-lite-preview',
    max_tokens: 300,
    response_format: { type: 'json_object' },
    messages: [{
      role: 'user',
      content: `You are a language coach. Return JSON only.
Word: "${word}" in ${targetLang}.
Native speaker language: ${nativeLang}.
Return: { "relatedWords": [3 related words], "sentence": "1 example sentence", "phonetic": "pronunciation guide using ${nativeLang} sounds" }`,
    }],
  })

  const data = await res.json()
  const parsed = JSON.parse(data.choices[0].message.content)

  return {
    ...parsed,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
    },
  }
}
```

Estimated cost: ~150 tokens/call × rates ≈ $0.00005/call → $0.10 = ~2000 text calls

---

## Step 3 — TTS model call (audio output)

File: `src/lib/tts.ts`

```ts
import { orFetch } from './openrouter'

export type AudioResult = {
  audioBase64: string
  usage: { audioTokens: number }
}

export const speakWord = async (word: string): Promise<AudioResult> => {
  const res = await orFetch('/audio/speech', {
    model: 'openai/gpt-audio-mini',
    input: word,
    voice: 'alloy',
    response_format: 'mp3',
  })

  const buffer = await res.arrayBuffer()
  const audioBase64 = Buffer.from(buffer).toString('base64')

  // gpt-audio-mini audio endpoint doesn't return token counts
  // Estimate: 1 token ≈ 4 chars
  const audioTokens = Math.ceil(word.length / 4)

  return { audioBase64, usage: { audioTokens } }
}
```

Estimated cost: ~$0.015/1k audio tokens → single word ≈ $0.0001 → $0.10 = ~1000 TTS calls

---

## Step 4 — SQLite rate limit table

File: `src/db/schema.sql`

```sql
CREATE TABLE IF NOT EXISTS user_usage (
  session_id   TEXT PRIMARY KEY,
  usd_spent    REAL NOT NULL DEFAULT 0.0,
  calls_count  INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);
```

File: `src/db/index.ts`

```ts
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'

const db = new Database('vibespeak.db')
db.exec(readFileSync('src/db/schema.sql', 'utf8'))

const USD_CAP = 0.10

const PRICE = {
  geminiInputPer1M:  0.075,
  geminiOutputPer1M: 0.30,
  audioTokenPer1k:   0.015,
}

export const calcTextCost = (promptTokens: number, completionTokens: number) =>
  (promptTokens / 1_000_000) * PRICE.geminiInputPer1M +
  (completionTokens / 1_000_000) * PRICE.geminiOutputPer1M

export const calcAudioCost = (audioTokens: number) =>
  (audioTokens / 1_000) * PRICE.audioTokenPer1k

export const checkAndDebit = (sessionId: string, costUsd: number): boolean => {
  const row = db
    .prepare('SELECT usd_spent FROM user_usage WHERE session_id = ?')
    .get(sessionId) as { usd_spent: number } | undefined

  const current = row?.usd_spent ?? 0
  if (current + costUsd > USD_CAP) return false

  db.prepare(`
    INSERT INTO user_usage (session_id, usd_spent, calls_count)
    VALUES (?, ?, 1)
    ON CONFLICT(session_id) DO UPDATE SET
      usd_spent   = usd_spent + excluded.usd_spent,
      calls_count = calls_count + 1,
      updated_at  = unixepoch()
  `).run(sessionId, costUsd)

  return true
}

export const getUsage = (sessionId: string) =>
  db
    .prepare('SELECT usd_spent, calls_count FROM user_usage WHERE session_id = ?')
    .get(sessionId) as { usd_spent: number; calls_count: number } | undefined
```

---

## Step 5 — TanStack server functions with rate limit guard

File: `src/routes/api/expand.ts`

```ts
import { createServerFn } from '@tanstack/react-start'
import { expandWord } from '../../lib/text'
import { checkAndDebit, calcTextCost } from '../../db'

export const expandWordFn = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { word: string; targetLang: string; nativeLang: string; sessionId: string })
  .handler(async ({ data }) => {
    // Pre-flight: debit worst-case estimate
    const estimatedCost = calcTextCost(200, 300)
    const allowed = checkAndDebit(data.sessionId, estimatedCost)
    if (!allowed) return { error: 'rate_limit', message: 'Budget reached ($0.10)' }

    const result = await expandWord(data.word, data.targetLang, data.nativeLang)

    // Refund overage based on actual usage
    const actualCost = calcTextCost(result.usage.promptTokens, result.usage.completionTokens)
    const overage = estimatedCost - actualCost
    if (overage > 0) checkAndDebit(data.sessionId, -overage)

    return { ok: true, ...result }
  })
```

File: `src/routes/api/speak.ts`

```ts
import { createServerFn } from '@tanstack/react-start'
import { speakWord } from '../../lib/tts'
import { checkAndDebit, calcAudioCost } from '../../db'

export const speakWordFn = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { word: string; sessionId: string })
  .handler(async ({ data }) => {
    const estimatedCost = calcAudioCost(20)
    const allowed = checkAndDebit(data.sessionId, estimatedCost)
    if (!allowed) return { error: 'rate_limit', message: 'Budget reached ($0.10)' }

    const result = await speakWord(data.word)

    const actualCost = calcAudioCost(result.usage.audioTokens)
    const overage = estimatedCost - actualCost
    if (overage > 0) checkAndDebit(data.sessionId, -overage)

    return { ok: true, audioBase64: result.audioBase64 }
  })
```

---

## Step 6 — Session ID (client-side, no auth)

File: `src/lib/session.ts`

```ts
export const getSessionId = (): string => {
  const key = 'vs_session'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}
```

---

## Step 7 — Usage meter UI

- Query `getUsage(sessionId)` on page load via server function
- Sidebar: `$0.04 / $0.10 used` as stock-ticker progress bar
- At $0.09 → warning toast
- At $0.10 → disable all cards, show "Budget reached" state
- Client plays audio: `new Audio('data:audio/mp3;base64,...').play()`

---

## Verification checklist

- [ ] `OPENROUTER_API_KEY` in `.env.local` (never in client bundle)
- [ ] Verify `google/gemini-2.5-flash-lite-preview` slug at openrouter.ai/models
- [ ] Verify `openai/gpt-audio-mini` returns raw bytes from `/audio/speech`
- [ ] `vibespeak.db` created at project root on first run
- [ ] `checkAndDebit` returns `false` when over $0.10 — server returns `{ error: 'rate_limit' }`
- [ ] Client shows toast on rate limit, does not crash
- [ ] No API key in any client-side file or browser network tab
