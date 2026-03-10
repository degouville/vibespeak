# Roadmap

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
