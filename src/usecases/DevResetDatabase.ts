import type {
  IUserProfileRepository,
  IRoutineRepository,
  IWorkoutLogRepository,
} from '@/domain/repositories';

export async function devResetDatabase(
  userProfileRepo: IUserProfileRepository,
  routineRepo: IRoutineRepository,
  workoutLogRepo: IWorkoutLogRepository
): Promise<void> {
  await workoutLogRepo.clearAll();
  const routines = await routineRepo.getAll();
  for (const r of routines) {
    await routineRepo.delete(r.id);
  }
  await userProfileRepo.delete();
}
