# Diseño: integración de DevTools en la arquitectura

## Objetivo

Entorno de desarrollo con Fast Refresh, logs claros, errores visibles en pantalla y una pantalla DevTools que use **los mismos casos de uso y repositorios** que el resto de la app, sin romper Clean Architecture.

---

## Flujo de integración

```
┌─────────────────────────────────────────────────────────────────────────┐
│  app/dev.tsx (Pantalla DevTools)                                         │
│  - Solo accesible cuando config.IS_DEV === true                          │
│  - Usa useApp() → mismas dependencias (repos + generador)               │
│  - Lee datos: getOrCreateProfile, routineRepo.getAll(), getSessions…    │
│  - Acciones: casos de uso DevResetDatabase, GenerateAndSaveRoutine,      │
│              InsertMockProgress, SimulatePerformanceChange              │
│  - Helpers: prettyPrintJSON(), logger                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Capa de aplicación (use cases)                                         │
│  - GetOrCreateProfile, SaveProfile, GenerateAndSaveRoutine, LogWorkout   │
│  - DevResetDatabase (usa IUserProfileRepository, IRoutineRepository,   │
│                      IWorkoutLogRepository)                             │
│  - InsertMockProgress (usa IRoutineRepository, IWorkoutLogRepository)   │
│  - SimulatePerformanceChange (usa IRoutineRepository, IWorkoutLogRepo)   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Dominio (puertos)                                                       │
│  - IUserProfileRepository, IRoutineRepository, IWorkoutLogRepository     │
│  - IWorkoutLogRepository.extend: clearAll() para reset (solo dev path)   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Infraestructura (implementaciones)                                      │
│  - UserProfileRepository, RoutineRepository, WorkoutLogRepository         │
│  - AppContext inyecta las mismas instancias; opcionalmente en IS_DEV    │
│    se podría inyectar mocks (preparado, no activo por defecto)          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Decisiones

| Aspecto | Decisión |
|--------|----------|
| **Flag de entorno** | `config.ts` exporta `IS_DEV = __DEV__` (Expo/RN). No hay variables de entorno extra. |
| **DevTools** | Pantalla en `app/dev.tsx`. Ruta registrada en Stack; enlace visible solo si `IS_DEV`. |
| **Datos mostrados** | Perfil → getOrCreateProfile. Última rutina → routineRepo.getAll() y tomar la primera. Último WorkoutLog → getSessionsByDateRange(fecha amplia) y tomar la sesión más reciente. |
| **Reset DB** | Caso de uso `DevResetDatabase` que llama a profileRepo.delete(), borra cada rutina con routineRepo.delete(id), y workoutLogRepo.clearAll(). Se añade `clearAll()` al contrato del repositorio de logs. |
| **Regenerar rutina** | Mismo `generateAndSaveRoutine` con objective/level del perfil actual (o valores por defecto si no hay perfil). |
| **Mock progreso** | Caso de uso `InsertMockProgress`: obtiene una rutina (ej. última), toma un día y ejercicios, inserta N entradas de workout_log con fechas pasadas. |
| **Simular rendimiento** | Caso de uso `SimulatePerformanceChange`: igual que mock pero con pesos crecientes (aumento) o decrecientes (disminución) por sesión. |
| **Helpers** | `lib/logger.ts` (logger centralizado, en prod no-op o mínimo). `lib/prettyPrintJSON.ts` (formateo JSON para pantalla). |
| **Errores en dev** | ErrorBoundary que en `IS_DEV` muestra el error en pantalla; en prod solo lo relanza o muestra mensaje genérico. |
| **Mocks opcionales** | En `AppContext` se puede, si `IS_DEV` y un flag (ej. `MOCK_DEPS`), inyectar implementaciones mock; por defecto no. |

---

## Archivos a crear/modificar

- `src/config.ts` — IS_DEV, (opcional) MOCK_DEPS.
- `src/lib/logger.ts` — logger centralizado.
- `src/lib/prettyPrintJSON.ts` — formateo JSON.
- `src/app/DevErrorBoundary.tsx` — boundary que en dev muestra error en UI.
- `src/domain/repositories/IWorkoutLogRepository.ts` — añadir clearAll().
- `src/infrastructure/repositories/WorkoutLogRepository.ts` — implementar clearAll().
- `src/usecases/DevResetDatabase.ts` — reset completo (perfil, rutinas, logs).
- `src/usecases/InsertMockProgress.ts` — insertar N sesiones mock.
- `src/usecases/SimulatePerformanceChange.ts` — mock con tendencia up/down.
- `app/dev.tsx` — pantalla DevTools (datos + botones).
- `app/_layout.tsx` — registrar ruta dev, envolver con DevErrorBoundary si IS_DEV.
- `app/index.tsx` — botón "DevTools" cuando IS_DEV.
