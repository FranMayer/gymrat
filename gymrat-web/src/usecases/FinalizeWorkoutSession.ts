import type {
  WorkoutSession,
  WorkoutLogEntry,
  PostWorkoutSummary,
} from '@/domain/entities';
import type {
  IWorkoutLogRepository,
  IPRRepository,
  IStreakRepository,
} from '@/domain/repositories';
import { PREngine, StreakEngine, SummaryEngine } from '@/domain/engine';

export interface FinalizeWorkoutSessionInput {
  routineId: string;
  routineDayId: string;
  date: string;
}

export interface FinalizeWorkoutSessionDeps {
  workoutLogRepo: IWorkoutLogRepository;
  prRepo: IPRRepository;
  streakRepo: IStreakRepository;
}

function buildSessionId(routineDayId: string, date: string): string {
  return `${routineDayId}::${date}`;
}

function buildSession(
  entries: WorkoutLogEntry[],
  routineId: string,
  routineDayId: string,
  date: string
): WorkoutSession {
  return {
    id: buildSessionId(routineDayId, date),
    routineId,
    routineDayId,
    date,
    entries,
  };
}

export async function finalizeWorkoutSession(
  deps: FinalizeWorkoutSessionDeps,
  input: FinalizeWorkoutSessionInput
): Promise<PostWorkoutSummary | null> {
  const { workoutLogRepo, prRepo, streakRepo } = deps;

  const entries = await workoutLogRepo.getEntriesByRoutineDay(
    input.routineDayId,
    input.date
  );
  if (entries.length === 0) {
    return null;
  }

  const session = buildSession(entries, input.routineId, input.routineDayId, input.date);

  // PRs
  const prEngine = new PREngine();
  const existingPRs = await prRepo.getExercisePRs();
  const newExercisePRs = prEngine.evaluateExercisePRsForSession(session, existingPRs);
  for (const pr of newExercisePRs) {
    await prRepo.saveExercisePR(pr);
  }
  const existingWeekly = await prRepo.getWeeklyVolumePR();
  const newWeekly = prEngine.evaluateWeeklyVolumePRForSession(session, existingWeekly);
  if (newWeekly) {
    await prRepo.saveWeeklyVolumePR(newWeekly);
  }

  // Streak
  const streakEngine = new StreakEngine();
  const currentStreak = await streakRepo.get();
  const updatedStreak = streakEngine.updateStreak(currentStreak, input.date);
  await streakRepo.save(updatedStreak);

  // Summary (no se persiste por ahora; se devuelve a la UI)
  const summaryEngine = new SummaryEngine();
  const sessions = await workoutLogRepo.getSessionsByDateRange('2000-01-01', '2100-12-31');
  const previous = sessions
    .filter(
      (s) =>
        s.routineDayId === input.routineDayId &&
        s.date < input.date
    )
    .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;

  const summary = summaryEngine.generate(session, previous ?? null);
  return summary;
}

