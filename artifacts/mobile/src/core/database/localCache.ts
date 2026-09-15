import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('sakani_cache.db');

const ensureTable = () => {
  if (!db) return;
  db.execSync(`
    CREATE TABLE IF NOT EXISTS cache_entries (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
};

if (db) ensureTable();

export async function saveCacheEntry<T>(key: string, value: T): Promise<void> {
  const payload = JSON.stringify(value);
  await db.runAsync(
    'INSERT INTO cache_entries (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
    [key, payload, new Date().toISOString()],
  );
}

export async function getCacheEntry<T>(key: string): Promise<T | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM cache_entries WHERE key = ?',
    [key],
  );

  if (!row?.value) return null;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
}

export async function clearCacheEntry(key: string): Promise<void> {
  await db.runAsync('DELETE FROM cache_entries WHERE key = ?', [key]);
}

export async function clearAllCache(): Promise<void> {
  await db.runAsync('DELETE FROM cache_entries');
}
