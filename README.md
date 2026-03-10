# VibeSpeak

Language learning app — type a word, get related words, an example sentence, a phonetic guide, and audio pronunciation.

## Stack

- **TanStack Start** (React + file-based routing + server functions)
- **TailwindCSS 4** + **Shadcn/ui**
- **SQLite** via `better-sqlite3` + **Drizzle ORM**
- **OpenRouter** (Gemini 2.5 Flash Lite for text, Web Speech API for TTS)
- **Bun** as runtime and package manager

## Getting Started

```bash
bun install
cp .env.example .env.local  # add OPENROUTER_API_KEY
bun run dev
```

## Roadmap

### Done ✅

- [x] Project scaffold — TanStack Start + Tailwind + Shadcn
- [x] OpenRouter client (`src/lib/openrouter.ts`) — bare `fetch` wrapper, no SDK
- [x] TTS via Web Speech API (`src/lib/tts.ts`) — browser-native, zero cost
- [x] SQLite schema + Drizzle ORM (`src/lib/schema.ts`, `src/lib/db.ts`) — sessions + usage tables
- [x] Server functions (`src/server/functions.ts`) — `initSession`, `generateWords` with rate-limit guard
- [x] Prompts (`src/server/prompts.ts`) — structured JSON prompt for word expansion
- [x] UI components — `WordCard`, `CardGrid`, `PlayButton`, `UsageMeter`, `LanguagePicker`, `Sidebar`, `Header`, `Footer`
- [x] Routes — `/` (home) and `/learn` (word cards)
- [x] `.claudeignore` — excludes auto-generated `routeTree.gen.ts`

### In Progress 🚧

- [ ] Session ID persistence — `localStorage` key `vs_session` wired to server
- [ ] Usage meter UI — live `$spent / $0.10` progress bar in sidebar
- [ ] Rate limit feedback — warning toast at $0.09, disabled state at $0.10

### Upcoming 📋

- [ ] Language picker wired to API calls (targetLang / nativeLang params)
- [ ] Related words expand on click — fetch sub-words inline
- [ ] Keyboard shortcut — `Space` to play pronunciation
- [ ] PWA manifest + offline shell
- [ ] Deploy to Fly.io with persistent SQLite volume

## Cost Model

| Call type | Model | Est. cost | Budget ($0.10) |
|-----------|-------|-----------|----------------|
| Word expansion | `google/gemini-2.5-flash-lite-preview` | ~$0.00005 | ~2000 calls |
| TTS | Web Speech API (browser) | free | unlimited |

## Env Variables

```bash
OPENROUTER_API_KEY=sk-or-...
```

Never expose this in client-side code. All AI calls go through server functions.
