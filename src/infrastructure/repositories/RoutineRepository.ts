/**
 * Implementación SQLite del repositorio de rutinas.
 * Carga rutina completa con días y ejercicios.
 */

import { getDatabase } from '../database/database';
import type { Routine, RoutineDay, RoutineExercise } from '@/domain/entities';
import type { IRoutineRepository } from '@/domain/repositories';

export class RoutineRepository implements IRoutineRepository {
  async getById(id: string): Promise<Routine | null> {
    const db = await getDatabase();
    const routineRow = await db.getFirstAsync<{
      id: string;
      name: string;
      objective: string;
      level: string;
      created_at: string;
    }>('SELECT * FROM routines WHERE id = ?', [id]);
    if (!routineRow) return null;

    const days = await this.getDays(db, id);
    return {
      id: routineRow.id,
      name: routineRow.name,
      objective: routineRow.objective as Routine['objective'],
      level: routineRow.level as Routine['level'],
      days,
      createdAt: routineRow.created_at,
    };
  }

  async getAll(): Promise<Routine[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      id: string;
      name: string;
      objective: string;
      level: string;
      created_at: string;
    }>('SELECT * FROM routines ORDER BY created_at DESC');
    const routines: Routine[] = [];
    for (const row of rows) {
      const days = await this.getDays(db, row.id);
      routines.push({
        id: row.id,
        name: row.name,
        objective: row.objective as Routine['objective'],
        level: row.level as Routine['level'],
        days,
        createdAt: row.created_at,
      });
    }
    return routines;
  }

  async save(routine: Routine): Promise<void> {
    const db = await getDatabase();
    await this.deleteRoutineContent(db, routine.id);
    await db.runAsync(
      'INSERT OR REPLACE INTO routines (id, name, objective, level, created_at) VALUES (?, ?, ?, ?, ?)',
      [routine.id, routine.name, routine.objective, routine.level, routine.createdAt]
    );
    for (const day of routine.days) {
      await db.runAsync(
        'INSERT INTO routine_days (id, routine_id, name, "order") VALUES (?, ?, ?, ?)',
        [day.id, routine.id, day.name, day.order]
      );
      for (const ex of day.exercises) {
        await db.runAsync(
          `INSERT INTO routine_exercises (routine_day_id, exercise_id, name, sets, reps, suggested_weight_kg, "order")
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            day.id,
            ex.exerciseId,
            ex.name,
            ex.sets,
            ex.reps,
            ex.suggestedWeightKg ?? null,
            ex.order,
          ]
        );
      }
    }
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await this.deleteRoutineContent(db, id);
    await db.runAsync('DELETE FROM routines WHERE id = ?', [id]);
  }

  private async deleteRoutineContent(
    db: Awaited<ReturnType<typeof getDatabase>>,
    routineId: string
  ): Promise<void> {
    const days = await db.getAllAsync<{ id: string }>('SELECT id FROM routine_days WHERE routine_id = ?', [
      routineId,
    ]);
    for (const d of days) {
      await db.runAsync('DELETE FROM routine_exercises WHERE routine_day_id = ?', [d.id]);
    }
    await db.runAsync('DELETE FROM routine_days WHERE routine_id = ?', [routineId]);
  }

  private async getDays(db: Awaited<ReturnType<typeof getDatabase>>, routineId: string): Promise<RoutineDay[]> {
    const dayRows = await db.getAllAsync<{
      id: string;
      name: string;
      order: number;
    }>('SELECT id, name, "order" FROM routine_days WHERE routine_id = ? ORDER BY "order"', [routineId]);
    const days: RoutineDay[] = [];
    for (const dr of dayRows) {
      const exercises = await this.getExercises(db, dr.id);
      days.push({
        id: dr.id,
        name: dr.name,
        order: dr.order,
        exercises,
      });
    }
    return days;
  }

  private async getExercises(
    db: Awaited<ReturnType<typeof getDatabase>>,
    routineDayId: string
  ): Promise<RoutineExercise[]> {
    const rows = await db.getAllAsync<{
      exercise_id: string;
      name: string;
      sets: number;
      reps: number;
      suggested_weight_kg: number | null;
      order: number;
    }>(
      'SELECT exercise_id, name, sets, reps, suggested_weight_kg, "order" FROM routine_exercises WHERE routine_day_id = ? ORDER BY "order"',
      [routineDayId]
    );
    return rows.map((r) => ({
      exerciseId: r.exercise_id,
      name: r.name,
      sets: r.sets,
      reps: r.reps,
      suggestedWeightKg: r.suggested_weight_kg,
      order: r.order,
    }));
  }
}
