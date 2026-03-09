import type { Routine } from '@/domain/entities';
import type { IRoutineRepository } from '@/domain/repositories';
import { STORAGE_KEYS } from './storageKeys';

function readRoutines(): Routine[] {
  const raw = localStorage.getItem(STORAGE_KEYS.routines);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Routine[];
  } catch {
    return [];
  }
}

function writeRoutines(routines: Routine[]): void {
  localStorage.setItem(STORAGE_KEYS.routines, JSON.stringify(routines));
}

export class LocalStorageRoutineRepository implements IRoutineRepository {
  async getById(id: string): Promise<Routine | null> {
    const routines = readRoutines();
    return routines.find((r) => r.id === id) ?? null;
  }

  async getAll(): Promise<Routine[]> {
    const routines = readRoutines();
    return [...routines].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async save(routine: Routine): Promise<void> {
    const routines = readRoutines();
    const idx = routines.findIndex((r) => r.id === routine.id);
    if (idx >= 0) routines[idx] = routine;
    else routines.push(routine);
    writeRoutines(routines);
  }

  async delete(id: string): Promise<void> {
    writeRoutines(readRoutines().filter((r) => r.id !== id));
  }
}
