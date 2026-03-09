export type StreakLevel = 'Rat' | 'AlphaRat' | 'WarRat' | 'ApexRat';

export interface LevelThreshold {
  level: StreakLevel;
  minDays: number;
}

export const LEVELS: LevelThreshold[] = [
  { level: 'Rat', minDays: 1 },
  { level: 'AlphaRat', minDays: 7 },
  { level: 'WarRat', minDays: 21 },
  { level: 'ApexRat', minDays: 46 },
];

export function nextThreshold(currentDays: number): LevelThreshold {
  for (const l of LEVELS) {
    if (currentDays < l.minDays) return l;
  }
  return LEVELS[LEVELS.length - 1];
}

export function levelForDays(currentDays: number): StreakLevel {
  let level: StreakLevel = 'Rat';
  for (const l of LEVELS) {
    if (currentDays >= l.minDays) level = l.level;
  }
  return level;
}

export function progressToNextLevel(currentDays: number): number {
  const currentLevel = levelForDays(currentDays);
  const next = nextThreshold(currentDays);
  if (currentLevel === 'ApexRat') return 1;
  const currentDef = LEVELS.find((l) => l.level === currentLevel)!;
  const span = next.minDays - currentDef.minDays;
  const progressed = currentDays - currentDef.minDays;
  return Math.min(1, Math.max(0, progressed / span));
}
