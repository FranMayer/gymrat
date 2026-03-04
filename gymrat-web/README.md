# Gymrat Web

Versión web de Gymrat: generador de rutinas de gimnasio con React, TypeScript, Vite y persistencia en `localStorage`. Desplegable en Vercel como sitio estático.

## Estructura del proyecto

```
gymrat-web/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── pages/           # Pantallas (Home, Profile, GenerateRoutine, History, DevTools, RoutineDetail, LogWorkout)
│   ├── components/     # Layout con navegación
│   ├── domain/          # Entidades, tipos, interfaces de repositorios y servicios
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── services/
│   ├── usecases/        # Casos de uso (perfil, rutinas, log, dev reset/mock)
│   ├── infrastructure/
│   │   ├── repositories/localStorage/   # Implementaciones con localStorage
│   │   └── routineGenerator/            # SimpleRoutineGenerator + catálogo
│   ├── app/            # AppContext (inyección de dependencias)
│   └── lib/             # config, logger, prettyPrintJSON
└── README.md
```

## Decisiones

- **Sin Expo/React Native**: solo React + Vite. Código 100% web.
- **Arquitectura limpia**: dominio e interfaces igual que la app móvil; solo cambia la capa de infraestructura (localStorage en lugar de SQLite).
- **Persistencia**: tres claves en `localStorage` — `gymrat_user`, `gymrat_routines`, `gymrat_workout_logs` — con JSON serializado.
- **React Router**: rutas para Inicio, Perfil, Generar rutina, Rutina (detalle), Registrar entrenamiento, Historial, DevTools (solo en dev).
- **TypeScript estricto**: `strict: true` en `tsconfig`.
- **Deploy**: `npm run build` genera `dist/` listo para Vercel (static export).

## Comandos

```bash
npm install
npm run dev      # Desarrollo (http://localhost:5173)
npm run build    # Build para producción
npm run preview  # Vista previa del build
```

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio (perfil resumido, enlaces) |
| `/profile` | Editar perfil e IMC |
| `/generate` | Generar y guardar rutina (objetivo + nivel) |
| `/routines/:id` | Detalle de rutina (días y ejercicios) |
| `/routines/:id/log?dayId=...` | Registrar entrenamiento del día |
| `/history` | Rutinas guardadas y sesiones de entrenamiento |
| `/dev` | DevTools (solo si `import.meta.env.DEV`) |

## Vercel

Conectar el repositorio a Vercel y usar la carpeta `gymrat-web` como raíz (o el root si solo está la web). Build: `npm run build`. Output: `dist`. No se requiere backend.
