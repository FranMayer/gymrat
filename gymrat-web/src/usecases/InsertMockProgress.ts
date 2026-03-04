import type { WorkoutLogSet } from '@/domain/entities';
import type { IRoutineRepository, IWorkoutLogRepository } from '@/domain/repositories';

export interface InsertMockProgressInput {
  sessionsCount?: number;
}

function dateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function insertMockProgress(
  routineRepo: IRoutineRepository,
  workoutLogRepo: IWorkoutLogRepository,
  input: InsertMockProgressInput = {}
): Promise<void> {
  const routines = await routineRepo.getAll();
  const routine = routines[0];
  if (!routine || routine.days.length === 0) return;
  const day = routine.days[0];
  const count = input.sessionsCount ?? 3;
  for (let s = 0; s < count; s++) {
    const date = dateDaysAgo(s);
    for (const ex of day.exercises) {
      const sets: WorkoutLogSet[] = [
        { setNumber: 1, reps: ex.reps, weightKg: 20 },
        { setNumber: 2, reps: ex.reps - 1, weightKg: 20 },
        { setNumber: 3, reps: ex.reps - 2, weightKg: 18 },
      ];
      await workoutLogRepo.saveEntry({
        id: `mock_${ex.exerciseId}_${date}_${s}_${Date.now()}`,
        routineId: routine.id,
        routineDayId: day.id,
        exerciseId: ex.exerciseId,
        exerciseName: ex.name,
        sets,
        date,
      });
    }
  }
}
