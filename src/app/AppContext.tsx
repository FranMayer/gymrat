/**
 * Contexto de la aplicación: inyección de repositorios y motor de rutinas.
 * Las pantallas consumen estas dependencias sin conocer la infraestructura concreta.
 * Opcional: cuando config.MOCK_DEPS sea true, aquí se pueden inyectar implementaciones mock.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { UserProfileRepository } from '@/infrastructure/repositories/UserProfileRepository';
import { RoutineRepository } from '@/infrastructure/repositories/RoutineRepository';
import { WorkoutLogRepository } from '@/infrastructure/repositories/WorkoutLogRepository';
import { SimpleRoutineGenerator } from '@/infrastructure/routineGenerator/SimpleRoutineGenerator';
import type { IUserProfileRepository, IRoutineRepository, IWorkoutLogRepository } from '@/domain/repositories';
import type { IRoutineGenerator } from '@/domain/services/IRoutineGenerator';

export interface AppDependencies {
  userProfileRepo: IUserProfileRepository;
  routineRepo: IRoutineRepository;
  workoutLogRepo: IWorkoutLogRepository;
  routineGenerator: IRoutineGenerator;
}

const AppContext = createContext<AppDependencies | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const deps = useMemo<AppDependencies>(
    () => ({
      userProfileRepo: new UserProfileRepository(),
      routineRepo: new RoutineRepository(),
      workoutLogRepo: new WorkoutLogRepository(),
      routineGenerator: new SimpleRoutineGenerator(),
    }),
    []
  );
  return <AppContext.Provider value={deps}>{children}</AppContext.Provider>;
}

export function useApp(): AppDependencies {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
