import type { Routine } from '../entities';

export interface IRoutineRepository {
  getById(id: string): Promise<Routine | null>;
  getAll(): Promise<Routine[]>;
  save(routine: Routine): Promise<void>;
  delete(id: string): Promise<void>;
}
