import type { WorkoutLogEntry, WorkoutLogSet } from '@/domain/entities';
import type { IWorkoutLogRepository } from '@/domain/repositories';

export interface LogWorkoutInput {
  routineId: string;
  routineDayId: string;
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutLogSet[];
  date: string;
  notes?: string;
}

export async function logWorkout(
  repo: IWorkoutLogRepository,
  input: LogWorkoutInput
): Promise<void> {
  const entry: WorkoutLogEntry = {
    id: `${input.exerciseId}_${input.date}_${Date.now()}`,
    routineId: input.routineId,
    routineDayId: input.routineDayId,
    exerciseId: input.exerciseId,
    exerciseName: input.exerciseName,
    sets: input.sets,
    date: input.date,
    notes: input.notes,
  };
  await repo.saveEntry(entry);
}
