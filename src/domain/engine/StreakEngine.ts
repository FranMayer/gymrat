import type { StreakState } from '../entities';

function todayFromDate(dateStr: string): string {
  // Normaliza a fecha UTC sin hora
  const d = new Date(dateStr);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export class StreakEngine {
  updateStreak(current: StreakState | null, sessionDate: string): StreakState {
    const d = todayFromDate(sessionDate);

    if (!current || !current.lastTrainingDate) {
      return {
        currentStreakDays: 1,
        longestStreakDays: Math.max(1, current?.longestStreakDays ?? 1),
        lastTrainingDate: d,
      };
    }

    const last = todayFromDate(current.lastTrainingDate);
    if (d === last) {
      // misma fecha, no cambia la racha
      return current;
    }

    const expectedNext = addDays(last, 1);
    let newCurrent: number;
    if (d === expectedNext) {
      newCurrent = current.currentStreakDays + 1;
    } else {
      newCurrent = 1;
    }
    const newLongest = Math.max(current.longestStreakDays, newCurrent);

    return {
      currentStreakDays: newCurrent,
      longestStreakDays: newLongest,
      lastTrainingDate: d,
    };
  }

  getLevel(currentStreakDays: number): 'Rat' | 'AlphaRat' | 'WarRat' | 'ApexRat' {
    if (currentStreakDays >= 46) return 'ApexRat';
    if (currentStreakDays >= 21) return 'WarRat';
    if (currentStreakDays >= 7) return 'AlphaRat';
    return 'Rat';
  }
}

