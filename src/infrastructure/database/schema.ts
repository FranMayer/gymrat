/**
 * Esquema SQLite: definición de tablas y migraciones.
 * Versionado con tabla meta (db_version); el schema completo se ejecuta solo si la DB es nueva.
 */

export const DB_NAME = 'gymrat.db';

/** Versión actual del esquema. Incrementar y añadir migración al agregar cambios. */
export const DB_VERSION = 1;

/** Tabla de metadatos: una sola fila con la versión de la base de datos. */
export const CREATE_META_TABLE = `
CREATE TABLE IF NOT EXISTS meta (
  db_version INTEGER NOT NULL
);
`;

/** Script SQL para crear todas las tablas de la app (migración v1). No incluye meta. */
export const CREATE_TABLES = `
-- Perfil de usuario (un solo registro)
CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY,
  age INTEGER NOT NULL,
  sex TEXT NOT NULL,
  height_cm REAL NOT NULL,
  weight_kg REAL NOT NULL,
  objective TEXT NOT NULL,
  level TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Rutinas generadas
CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  objective TEXT NOT NULL,
  level TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Días de una rutina
CREATE TABLE IF NOT EXISTS routine_days (
  id TEXT PRIMARY KEY,
  routine_id TEXT NOT NULL,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE
);

-- Ejercicios por día (detalle de la rutina)
CREATE TABLE IF NOT EXISTS routine_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  routine_day_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  suggested_weight_kg REAL,
  "order" INTEGER NOT NULL,
  FOREIGN KEY (routine_day_id) REFERENCES routine_days(id) ON DELETE CASCADE
);

-- Registros de entrenamiento (peso real, reps, fecha)
CREATE TABLE IF NOT EXISTS workout_log (
  id TEXT PRIMARY KEY,
  routine_id TEXT NOT NULL,
  routine_day_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  sets_json TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  FOREIGN KEY (routine_id) REFERENCES routines(id)
);

CREATE INDEX IF NOT EXISTS idx_workout_log_date ON workout_log(date);
CREATE INDEX IF NOT EXISTS idx_workout_log_exercise ON workout_log(exercise_id);
CREATE INDEX IF NOT EXISTS idx_routine_days_routine ON routine_days(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_exercises_day ON routine_exercises(routine_day_id);
`;

/**
 * Para futuras migraciones: incrementar DB_VERSION, añadir en database.ts
 * un bloque "if (stored < 2) { await db.execAsync(MIGRATION_2); ... }" y
 * actualizar meta con la nueva versión. No volver a ejecutar CREATE_TABLES completo.
 */
