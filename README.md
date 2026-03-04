# Gymrat

App móvil **100% offline** para generar rutinas de gimnasio (estilo GRAVL, simplificada).  
React Native + TypeScript + SQLite, arquitectura limpia y modular.

---

## Estructura del proyecto

```
Gymrat/
├── app/                          # Expo Router (pantallas)
│   ├── _layout.tsx               # Layout raíz + AppProvider
│   ├── index.tsx                 # Inicio: perfil resumido, rutinas, generar
│   ├── profile.tsx               # Edición perfil + IMC
│   └── routines/
│       ├── index.tsx             # Lista de rutinas
│       ├── generate.tsx          # Generar rutina (objetivo + nivel)
│       ├── [id].tsx              # Detalle rutina (días, ejercicios)
│       └── log.tsx               # Registrar entrenamiento (peso, reps, fecha)
├── src/
│   ├── app/
│   │   └── AppContext.tsx        # Inyección de dependencias (repos, generador)
│   ├── domain/
│   │   ├── entities/             # Entidades y tipos del dominio
│   │   │   ├── types.ts          # Objective, Level, Sex
│   │   │   ├── UserProfile.ts    # Perfil + calculateBMI
│   │   │   ├── Routine.ts        # Routine, RoutineDay, RoutineExercise
│   │   │   ├── WorkoutLog.ts     # WorkoutLogEntry, WorkoutSession
│   │   │   └── index.ts
│   │   ├── repositories/        # Puertos (interfaces)
│   │   │   ├── IUserProfileRepository.ts
│   │   │   ├── IRoutineRepository.ts
│   │   │   ├── IWorkoutLogRepository.ts
│   │   │   └── index.ts
│   │   └── services/
│   │       └── IRoutineGenerator.ts   # Puerto del motor de rutinas
│   ├── usecases/                 # Casos de uso
│   │   ├── GetOrCreateProfile.ts
│   │   ├── SaveProfile.ts
│   │   ├── GenerateAndSaveRoutine.ts
│   │   ├── LogWorkout.ts
│   │   └── index.ts
│   └── infrastructure/
│       ├── database/
│       │   ├── schema.ts         # Tablas SQLite
│       │   └── database.ts       # Cliente expo-sqlite
│       ├── repositories/         # Implementaciones SQLite
│       │   ├── UserProfileRepository.ts
│       │   ├── RoutineRepository.ts
│       │   └── WorkoutLogRepository.ts
│       └── routineGenerator/
│           ├── exerciseCatalog.ts    # Catálogo estático de ejercicios
│           └── SimpleRoutineGenerator.ts  # Reglas simples (series/reps por objetivo+nivel)
├── package.json
├── tsconfig.json
├── app.json
└── README.md
```

- **UI**: `app/*` (Expo Router) y componentes que quieras extraer a `src/components/`.
- **Lógica de negocio**: `src/domain/` (entidades, tipos) y `src/usecases/`.
- **Motor de rutinas**: interfaz en `domain/services/`, implementación en `infrastructure/routineGenerator/`.
- **Datos**: interfaces en `domain/repositories/`, implementación en `infrastructure/repositories/` (SQLite).

---

## Decisiones arquitectónicas

1. **Clean Architecture simplificada**
   - **Dominio**: entidades y contratos (repositorios, generador). Sin dependencias externas.
   - **Casos de uso**: orquestan repos y motor; no conocen SQLite ni React.
   - **Infraestructura**: implementa los puertos (SQLite, `SimpleRoutineGenerator`).
   - **App**: `AppContext` inyecta implementaciones concretas; las pantallas usan `useApp()` y casos de uso.

2. **Repository pattern**
   - Toda lectura/escritura persistente pasa por interfaces (`IUserProfileRepository`, etc.). Se puede sustituir SQLite por otro almacenamiento o añadir sincronización sin tocar dominio ni casos de uso.

3. **Motor de rutinas intercambiable**
   - `IRoutineGenerator` recibe objetivo y nivel y devuelve una `Routine`. La implementación actual usa reglas fijas (series/repeticiones por objetivo y nivel, plantillas de días por grupo muscular). Más adelante se puede sustituir por un servicio con IA o reglas más complejas sin cambiar la UI ni los casos de uso.

4. **Base de datos local**
   - Una sola base SQLite (`gymrat.db`) con tablas: `user_profile`, `routines`, `routine_days`, `routine_exercises`, `workout_log`. Sin backend; la app funciona 100% offline.

5. **Escalabilidad**
   - **IA**: nuevo servicio que implemente `IRoutineGenerator` y se inyecte en `AppContext`.
   - **Métricas y gráficos**: nuevos casos de uso que lean de `IWorkoutLogRepository` (y opcionalmente `IRoutineRepository`); pantallas que consuman esos datos.
   - **Exportación**: caso de uso que lea de los repos y genere JSON/CSV; capa de infra si se exporta a archivo.

---

## Cómo ejecutar

```bash
npm install
npx expo start
```

Luego abre en dispositivo o emulador (Android/iOS). No se requiere backend.

---

## Fase 1 (MVP) – Funcionalidades

- Perfil: edad, sexo, altura, peso, objetivo (tonificar | adelgazar | ganar_masa), nivel (principiante | intermedio | avanzado).
- Cálculo automático de IMC.
- Generador básico de rutina por objetivo y nivel (días, ejercicios, series, repeticiones; peso sugerido como placeholder).
- Guardar rutina generada en SQLite.
- Registrar entrenamiento: peso real, repeticiones por serie, fecha.

---

## Próximas extensiones (ideas)

- IA para personalización avanzada de rutinas.
- Gráficos de progreso (peso, reps por ejercicio).
- Exportar datos (JSON/CSV).
- Recordatorios y planificación semanal.
