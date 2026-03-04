/**
 * Implementación SQLite del repositorio de registros de entrenamiento.
 */

import { getDatabase } from '../database/database';
import type { WorkoutLogEntry, WorkoutLogSet, WorkoutSession } from '@/domain/entities';
import type { IWorkoutLogRepository } from '@/domain/repositories';

const TABLE = 'workout_log';

export class WorkoutLogRepository implements IWorkoutLogRepository {
  async saveEntry(entry: WorkoutLogEntry): Promise<void> {
    const db = await getDatabase();
    const setsJson = JSON.stringify(entry.sets);
    await db.runAsync(
      `INSERT OR REPLACE INTO ${TABLE} (id, routine_id, routine_day_id, exercise_id, exercise_name, sets_json, date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.routineId,
        entry.routineDayId,
        entry.exerciseId,
        entry.exerciseName,
        setsJson,
        entry.date,
        entry.notes ?? null,
      ]
    );
  }

  async getEntriesByExercise(exerciseId: string): Promise<WorkoutLogEntry[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      id: string;
      routine_id: string;
      routine_day_id: string;
      exercise_id: string;
      exercise_name: string;
      sets_json: string;
      date: string;
      notes: string | null;
    }>(`SELECT * FROM ${TABLE} WHERE exercise_id = ? ORDER BY date DESC`, [exerciseId]);
    return rows.map(rowToEntry);
  }

  async getSessionsByDateRange(from: string, to: string): Promise<WorkoutSession[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      id: string;
      routine_id: string;
      routine_day_id: string;
      date: string;
    }>(`SELECT id, routine_id, routine_day_id, date FROM ${TABLE} WHERE date >= ? AND date <= ? ORDER BY date DESC`, [
      from,
      to,
    ]);
    const bySession = new Map<string, WorkoutLogEntry[]>();
    for (const r of rows) {
      const key = `${r.routine_day_id}_${r.date}`;
      if (!bySession.has(key)) {
        const entries = await this.getEntriesByRoutineDay(r.routine_day_id, r.date);
        bySession.set(key, entries);
      }
    }
    const sessions: WorkoutSession[] = [];
    bySession.forEach((entries, key) => {
      const [routineDayId, date] = key.split('_');
      const first = entries[0];
      if (first)
        sessions.push({
          id: first.id,
          routineId: first.routineId,
          routineDayId,
          date,
          entries,
        });
    });
    return sessions;
  }

  async getEntriesByRoutineDay(routineDayId: string, date: string): Promise<WorkoutLogEntry[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      id: string;
      routine_id: string;
      routine_day_id: string;
      exercise_id: string;
      exercise_name: string;
      sets_json: string;
      date: string;
      notes: string | null;
    }>(`SELECT * FROM ${TABLE} WHERE routine_day_id = ? AND date = ?`, [routineDayId, date]);
    return rows.map(rowToEntry);
  }

  async clearAll(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM ${TABLE}`);
  }
}

function rowToEntry(row: {
  id: string;
  routine_id: string;
  routine_day_id: string;
  exercise_id: string;
  exercise_name: string;
  sets_json: string;
  date: string;
  notes: string | null;
}): WorkoutLogEntry {
  const sets: WorkoutLogSet[] = JSON.parse(row.sets_json);
  return {
    id: row.id,
    routineId: row.routine_id,
    routineDayId: row.routine_day_id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_name,
    sets,
    date: row.date,
    notes: row.notes ?? undefined,
  };
}
