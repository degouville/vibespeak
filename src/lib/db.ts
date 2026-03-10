import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const dbPath = resolve(tmpdir(), 'vibespeak.db')
const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    native_lang TEXT NOT NULL,
    target_lang TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES sessions(id),
    input_tokens INTEGER NOT NULL,
    output_tokens INTEGER NOT NULL,
    cost_usd REAL NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
`)

export const db = drizzle(sqlite, { schema })
