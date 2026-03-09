import type { WorkoutLogEntry, WorkoutSession } from '@/domain/entities';
import type { IWorkoutLogRepository } from '@/domain/repositories';
import { STORAGE_KEYS } from './storageKeys';

function readEntries(): WorkoutLogEntry[] {
  const raw = localStorage.getItem(STORAGE_KEYS.workoutLogs);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WorkoutLogEntry[];
  } catch {
    return [];
  }
}

function writeEntries(entries: WorkoutLogEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.workoutLogs, JSON.stringify(entries));
}

export class LocalStorageWorkoutLogRepository implements IWorkoutLogRepository {
  async saveEntry(entry: WorkoutLogEntry): Promise<void> {
    const entries = readEntries();
    const idx = entries.findIndex((e) => e.id === entry.id);
    if (idx >= 0) entries[idx] = entry;
    else entries.push(entry);
    writeEntries(entries);
  }

  async getEntriesByExercise(exerciseId: string): Promise<WorkoutLogEntry[]> {
    return readEntries()
      .filter((e) => e.exerciseId === exerciseId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async getSessionsByDateRange(from: string, to: string): Promise<WorkoutSession[]> {
    const entries = readEntries().filter((e) => e.date >= from && e.date <= to);
    const bySession = new Map<string, WorkoutLogEntry[]>();
    for (const e of entries) {
      const key = `${e.routineDayId}::${e.date}`;
      if (!bySession.has(key)) bySession.set(key, []);
      bySession.get(key)!.push(e);
    }
    const sessions: WorkoutSession[] = [];
    bySession.forEach((es, key) => {
      const [routineDayId, date] = key.split('::');
      const first = es[0];
      if (first)
        sessions.push({
          id: first.id,
          routineId: first.routineId,
          routineDayId,
          date,
          entries: es,
        });
    });
    return sessions.sort((a, b) => b.date.localeCompare(a.date));
  }

  async getEntriesByRoutineDay(routineDayId: string, date: string): Promise<WorkoutLogEntry[]> {
    return readEntries().filter(
      (e) => e.routineDayId === routineDayId && e.date === date
    );
  }

  async getLastEntryPerExercise(): Promise<Map<string, WorkoutLogEntry>> {
    const entries = readEntries().sort((a, b) => b.date.localeCompare(a.date));
    const map = new Map<string, WorkoutLogEntry>();
    for (const e of entries) {
      if (!map.has(e.exerciseId)) map.set(e.exerciseId, e);
    }
    return map;
  }

  async clearAll(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.workoutLogs);
  }
}
