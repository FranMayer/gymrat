import type { ExercisePR, WeeklyVolumePR } from '@/domain/entities';
import type { IPRRepository } from '@/domain/repositories';
import { STORAGE_KEYS } from './storageKeys';

function readExercisePRs(): ExercisePR[] {
  const raw = localStorage.getItem(STORAGE_KEYS.exercisePRs);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ExercisePR[];
  } catch {
    return [];
  }
}

function writeExercisePRs(prs: ExercisePR[]): void {
  localStorage.setItem(STORAGE_KEYS.exercisePRs, JSON.stringify(prs));
}

function readWeeklyVolumePR(): WeeklyVolumePR | null {
  const raw = localStorage.getItem(STORAGE_KEYS.weeklyVolumePR);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WeeklyVolumePR;
  } catch {
    return null;
  }
}

function writeWeeklyVolumePR(pr: WeeklyVolumePR): void {
  localStorage.setItem(STORAGE_KEYS.weeklyVolumePR, JSON.stringify(pr));
}

export class LocalStoragePRRepository implements IPRRepository {
  async getExercisePRs(): Promise<ExercisePR[]> {
    return readExercisePRs();
  }

  async saveExercisePR(pr: ExercisePR): Promise<void> {
    const prs = readExercisePRs();
    const idx = prs.findIndex(
      (p) => p.exerciseId === pr.exerciseId && p.metric === pr.metric
    );
    if (idx >= 0) {
      prs[idx] = pr;
    } else {
      prs.push(pr);
    }
    writeExercisePRs(prs);
  }

  async getWeeklyVolumePR(): Promise<WeeklyVolumePR | null> {
    return readWeeklyVolumePR();
  }

  async saveWeeklyVolumePR(pr: WeeklyVolumePR): Promise<void> {
    writeWeeklyVolumePR(pr);
  }
}

