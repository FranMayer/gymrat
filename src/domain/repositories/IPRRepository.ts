import type { ExercisePR, WeeklyVolumePR } from '../entities';

export interface IPRRepository {
  getExercisePRs(): Promise<ExercisePR[]>;
  saveExercisePR(pr: ExercisePR): Promise<void>;
  getWeeklyVolumePR(): Promise<WeeklyVolumePR | null>;
  saveWeeklyVolumePR(pr: WeeklyVolumePR): Promise<void>;
}

