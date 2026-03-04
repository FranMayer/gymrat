# Diseño: RoutineEngine con VolumeStrategy y ProgressionStrategy

## Objetivo

Motor de rutinas desacoplado que usa:
- **VolumeStrategy**: series y repeticiones según objetivo (y nivel).
- **ProgressionStrategy**: siguiente peso sugerido según último registro de entrenamiento.
- **Historial de WorkoutLog**: última entrada por ejercicio para calcular progresión.

Sin romper Clean Architecture: el engine vive en dominio, recibe datos y devuelve una `Routine`; la infraestructura orquesta repos y catálogo.

---

## Ubicación en capas

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Use case: GenerateAndSaveRoutine                                        │
│  - Obtiene perfil (userProfileRepo)                                      │
│  - Obtiene último log por ejercicio (workoutLogRepo.getLastEntryPerExercise) │
│  - Obtiene catálogo (desde infra o constante)                            │
│  - Llama RoutineEngine.generate(profile, catalog, lastEntryByExercise)   │
│  - Guarda rutina (routineRepo.save)                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Domain: src/domain/engine/                                              │
│  - RoutineEngine: genera Routine usando VolumeStrategy + ProgressionStrategy │
│  - VolumeStrategy: getVolume(objective, level) -> { sets, reps }          │
│  - ProgressionStrategy: calculateNextWeight(entry, targetReps, default?) │
│       -> peso siguiente (kg)                                             │
│  Sin dependencias de repos ni infra; solo entidades y tipos.              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Infraestructura                                                         │
│  - Sigue exponiendo SimpleRoutineGenerator O RoutineEngineAdapter       │
│  - Catálogo de ejercicios (exerciseCatalog) se pasa al engine             │
│  - Repositorio de logs: nuevo método getLastEntryPerExercise()          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Contratos

### 1. ProgressionStrategy

**Responsabilidad**: calcular el siguiente peso (kg) a usar según el último entrenamiento y el objetivo de repeticiones.

| Situación | Regla |
|-----------|--------|
| Sin historial | Devolver `defaultWeightKg` (ej. null → UI muestra "a elegir") |
| Completó todas las reps (cada set ≥ targetReps) | +2,5 % sobre el peso usado |
| Superó reps (algún set > targetReps) | +5 % |
| Fallo leve (1–2 reps menos que target) | Mantener peso |
| Fallo fuerte (>2 reps menos) | -2 % |

**Firma**:
```ts
calculateNextWeight(
  lastEntry: WorkoutLogEntry | null,
  targetReps: number,
  defaultWeightKg?: number | null
): number | null
```
- `lastEntry`: última entrada de ese ejercicio (sets con reps y peso).
- `targetReps`: repeticiones objetivo (vienen de VolumeStrategy).
- `defaultWeightKg`: si no hay historial, valor por defecto (opcional).
- Retorno: peso sugerido en kg o `null` si no hay historial ni default.

**Criterio de “éxito” por set**: se usa el set con **menor** reps como limitante. Si en todos los sets se alcanzó ≥ targetReps → “completó”. Si en algún set se hizo > targetReps → “superó”.

---

### 2. VolumeStrategy

**Responsabilidad**: definir series y repeticiones según objetivo y nivel (igual que la tabla actual por objetivo/nivel).

**Firma**:
```ts
getVolume(objective: Objective, level: Level): { sets: number; reps: number }
```

Se mantiene la misma lógica que hoy (ganar_masa 4–5×6–8, tonificar 3–4×10–12, adelgazar 3×12–15, etc.).

---

### 3. RoutineEngine

**Responsabilidad**: generar una `Routine` (días, ejercicios, series, reps, peso sugerido) usando volumen y progresión.

**Entrada**:
- `profile: UserProfile` (objective, level).
- `exerciseCatalog: CatalogExercise[]` (id, name, muscleGroup).
- `lastEntryByExercise: Map<string, WorkoutLogEntry>`: última entrada por `exerciseId`.

**Salida**: `Routine` (id, name, objective, level, days[], createdAt).

**Flujo interno**:
1. Obtener volumen: `VolumeStrategy.getVolume(profile.objective, profile.level)`.
2. Para cada plantilla de día (según nivel: 3 o 4 días):
   - Por cada grupo muscular del día, elegir ejercicios del catálogo.
   - Por cada ejercicio:
     - sets/reps = volumen.
     - lastEntry = lastEntryByExercise.get(exercise.id).
     - suggestedWeightKg = ProgressionStrategy.calculateNextWeight(lastEntry, volume.reps, null).
   - Construir RoutineDay con ejercicios (incluyendo suggestedWeightKg).
3. Devolver Routine con todos los días.

El engine **no** llama a repos ni a servicios externos; solo usa las estrategias y los datos pasados.

---

## Repositorio de logs

Se añade un método al puerto para soportar el engine sin acoplar dominio a infra:

- **IWorkoutLogRepository**: `getLastEntryPerExercise(): Promise<Map<string, WorkoutLogEntry>>`
  - Devuelve la última entrada (por fecha) por cada `exerciseId` que tenga al menos un registro.

Implementación:
- **LocalStorage**: leer todas las entradas, agrupar por `exerciseId`, quedarse con la más reciente por grupo.
- **SQLite** (en app móvil): consulta o varias por ejercicio; en memoria construir el `Map`.

---

## Integración con el use case

- **GenerateAndSaveRoutine** (o equivalente):
  1. Obtener perfil (getOrCreateProfile o solo get).
  2. `lastByExercise = await workoutLogRepo.getLastEntryPerExercise()`.
  3. Catálogo: desde módulo de infra (exerciseCatalog) o inyectado.
  4. `routine = RoutineEngine.generate(profile, exerciseCatalog, lastByExercise)`.
  5. `routineRepo.save(routine)`.

El generador actual (SimpleRoutineGenerator) puede seguir existiendo para rutinas “sin historial” o sustituirse por el engine; en ambos casos la interfaz de “generador” (ej. `IRoutineGenerator`) puede recibir un adapter que use el RoutineEngine por debajo.

---

## Resumen de archivos

| Archivo | Responsabilidad |
|---------|-----------------|
| `domain/engine/ProgressionStrategy.ts` | Reglas de progresión de peso; función pura o clase sin I/O. |
| `domain/engine/VolumeStrategy.ts` | Mapa objetivo+nivel → sets/reps. |
| `domain/engine/RoutineEngine.ts` | Orquesta volumen + progresión; genera `Routine`. |
| `domain/repositories/IWorkoutLogRepository.ts` | Añadir `getLastEntryPerExercise()`. |
| Infra: repositorio de logs | Implementar `getLastEntryPerExercise()`. |
| Infra / use case | Llamar al engine con profile, catalog y lastEntryByExercise; guardar rutina. |
