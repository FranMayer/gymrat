/**
 * Cliente SQLite (expo-sqlite).
 * Abre la base de datos y ejecuta el esquema solo si es la primera vez o hay migraciones pendientes.
 */

import * as SQLite from 'expo-sqlite';
import { DB_NAME, DB_VERSION, CREATE_META_TABLE, CREATE_TABLES } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Devuelve la versión guardada en meta (0 si no existe o no hay fila).
 */
async function getStoredVersion(database: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const row = await database.getFirstAsync<{ db_version: number }>(
      'SELECT db_version FROM meta LIMIT 1'
    );
    return row?.db_version ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Crea la tabla meta si no existe y aplica el schema/migraciones según la versión.
 * Se ejecuta una sola vez por apertura de app; las tablas se crean solo si la DB es nueva.
 */
async function ensureSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(CREATE_META_TABLE);
  const stored = await getStoredVersion(database);
  if (stored >= DB_VERSION) return;
  await database.execAsync(CREATE_TABLES);
  if (stored === 0) {
    await database.runAsync('INSERT INTO meta (db_version) VALUES (?)', [DB_VERSION]);
  } else {
    await database.runAsync('UPDATE meta SET db_version = ?', [DB_VERSION]);
  }
}

/**
 * Obtiene la instancia de la base de datos.
 * Inicializa tablas solo la primera vez (o cuando sube DB_VERSION).
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await ensureSchema(db);
  return db;
}

/**
 * Cierra la conexión (útil para tests o reinicio).
 */
export function closeDatabase(): void {
  if (db) {
    db.closeAsync();
    db = null;
  }
}
