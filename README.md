# VibeSpeak

Language learning app — type a word, get related words, an example sentence, a phonetic guide, and audio pronunciation.

## Features

- **Smart Word Expansion** — Enter any word and get AI-generated related words with definitions
- **Phonetic Guides** — Learn proper pronunciation with IPA-style phonetic transcriptions
- **Audio Pronunciation** — Hear words spoken aloud using your browser's text-to-speech
- **Example Sentences** — See words used in context with bilingual translations
- **Session-based Learning** — Track your usage across sessions
- **Lightweight & Fast** — Runs on SQLite with zero external TTS costs

## Quick Start

```bash
bun install
cp .env.example .env.local  # add your OPENROUTER_API_KEY
bun run dev
```

Open `http://localhost:3000` and start learning.

## Stack

- **TanStack Start** — React framework with file-based routing and server functions
- **TailwindCSS 4** — Utility-first styling
- **Shadcn/ui** — Accessible UI components
- **SQLite** — Lightweight embedded database via `better-sqlite3`
- **Drizzle ORM** — Type-safe SQL queries
- **OpenRouter** — AI text generation (Gemini 2.5 Flash Lite)
- **Web Speech API** — Browser-native text-to-speech (free)
- **Bun** — Fast runtime and package manager

## Usage

1. Visit the home page and enter a word you want to learn
2. Choose your target language (what you're learning) and native language (for translations)
3. Click "Learn" to generate related words, phonetics, and example sentences
4. Click the play button on any card to hear pronunciation
5. Track your usage in the sidebar — each AI call costs ~$0.00005 from your $0.10 budget

## Cost Model

| Call type | Model | Est. cost | Budget ($0.10) |
|-----------|-------|-----------|----------------|
| Word expansion | `google/gemini-2.5-flash-lite-preview` | ~$0.00005 | ~2000 calls |
| TTS | Web Speech API (browser) | free | unlimited |

## Environment Variables

```bash
OPENROUTER_API_KEY=sk-or-...
```

Never expose this in client-side code. All AI calls go through server functions.

## Development

See [ROADMAP.md](./ROADMAP.md) for planned features and progress.
