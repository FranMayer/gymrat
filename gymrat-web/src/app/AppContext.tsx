import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { LocalStorageUserProfileRepository } from '@/infrastructure/repositories/localStorage/LocalStorageUserProfileRepository';
import { LocalStorageRoutineRepository } from '@/infrastructure/repositories/localStorage/LocalStorageRoutineRepository';
import { LocalStorageWorkoutLogRepository } from '@/infrastructure/repositories/localStorage/LocalStorageWorkoutLogRepository';
import { LocalStoragePRRepository } from '@/infrastructure/repositories/localStorage/LocalStoragePRRepository';
import { LocalStorageStreakRepository } from '@/infrastructure/repositories/localStorage/LocalStorageStreakRepository';
import { LocalStorageUserSettingsRepository } from '@/infrastructure/repositories/localStorage/LocalStorageUserSettingsRepository';
import { RoutineEngineAdapter } from '@/infrastructure/routineGenerator/RoutineEngineAdapter';
import { RoutineEngine, DefaultVolumeStrategy, DefaultProgressionStrategy } from '@/domain/engine';
import { EXERCISE_CATALOG } from '@/infrastructure/routineGenerator/exerciseCatalog';
import type {
  IUserProfileRepository,
  IRoutineRepository,
  IWorkoutLogRepository,
  IPRRepository,
  IStreakRepository,
  IUserSettingsRepository,
} from '@/domain/repositories';
import type { IRoutineGenerator } from '@/domain/services/IRoutineGenerator';

export interface AppDependencies {
  userProfileRepo: IUserProfileRepository;
  routineRepo: IRoutineRepository;
  workoutLogRepo: IWorkoutLogRepository;
  routineGenerator: IRoutineGenerator;
  prRepo: IPRRepository;
  streakRepo: IStreakRepository;
  userSettingsRepo: IUserSettingsRepository;
}

const AppContext = createContext<AppDependencies | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const deps = useMemo<AppDependencies>(() => {
    const userProfileRepo = new LocalStorageUserProfileRepository();
    const routineRepo = new LocalStorageRoutineRepository();
    const workoutLogRepo = new LocalStorageWorkoutLogRepository();
    const prRepo = new LocalStoragePRRepository();
    const streakRepo = new LocalStorageStreakRepository();
    const userSettingsRepo = new LocalStorageUserSettingsRepository();
    const engine = new RoutineEngine(
      new DefaultVolumeStrategy(),
      new DefaultProgressionStrategy()
    );
    const routineGenerator = new RoutineEngineAdapter(
      engine,
      EXERCISE_CATALOG,
      userProfileRepo,
      workoutLogRepo
    );
    return {
      userProfileRepo,
      routineRepo,
      workoutLogRepo,
      routineGenerator,
      prRepo,
      streakRepo,
      userSettingsRepo,
    };
  }, []);
  return <AppContext.Provider value={deps}>{children}</AppContext.Provider>;
}

export function useApp(): AppDependencies {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
