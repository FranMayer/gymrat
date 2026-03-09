# Guía de uso – Gymrat

Esta guía explica cómo usar la app web Gymrat paso a paso.

---

## 1. Arrancar la app

En la raíz del proyecto:

```bash
npm install
npm run dev
```

Abre el navegador en **http://localhost:5173**.

---

## 2. Navegación

En la parte superior verás el **header** (logo + GYMRAT) y un **menú**:

| Enlace     | Qué hace |
|-----------|----------|
| **HOME**  | Inicio: resumen de perfil, acceso a generar rutina e historial |
| **WORKOUT** | Ir a generar una nueva rutina |
| **RECORDS** | Ver tus récords (max peso, max reps, max volumen, PR semanal) |
| **PROGRESS** | Ver racha de entrenamientos y nivel (Rat → Apex Rat) |
| **PERFIL** | Editar edad, sexo, altura, peso, objetivo y nivel |
| **HISTORIAL** | Ver rutinas guardadas y sesiones de entrenamiento |

---

## 3. Flujo típico

### Paso 1: Configurar perfil (primera vez)

1. Ve a **PERFIL**.
2. Rellena **edad**, **sexo**, **altura (cm)**, **peso (kg)**.
3. Elige **objetivo**: tonificar, adelgazar o ganar masa.
4. Elige **nivel**: principiante, intermedio o avanzado.
5. Pulsa **Guardar**. Verás tu IMC calculado.

Puedes cambiar el perfil cuando quieras; la próxima rutina que generes usará estos datos.

---

### Paso 2: Generar una rutina

1. Desde **HOME** pulsa **“Generar nueva rutina”** o ve a **WORKOUT**.
2. Elige **Objetivo** y **Nivel** (por defecto se usan los de tu perfil).
3. Pulsa **“Generar rutina”**.
4. Serás redirigido a la **pantalla de la rutina**: verás su nombre, objetivo, nivel y los **días** (ej. “Día 1 – Pecho”, “Día 2 – Espalda”, etc.).
5. En cada día se listan los **ejercicios** con series × repeticiones y peso sugerido (kg).

---

### Paso 3: Registrar un entrenamiento

1. En la pantalla de la rutina, en el **día** que hayas entrenado, pulsa **“Registrar entrenamiento”**.
2. Elige la **fecha** del entrenamiento.
3. Para cada ejercicio rellena **peso (kg)** y **repeticiones** por serie. Cada serie mantiene sus valores de forma independiente: al editar peso o repeticiones de una serie no se modifican ni se sobrescriben las demás.
4. Pulsa **“Guardar”**.

Se guarda el entrenamiento, se actualizan tus **récords** (si superas alguno) y tu **racha** (Progress). Puedes volver a la rutina o al historial.

---

## 4. Qué hace cada sección

### HOME

- Muestra un resumen de tu **perfil** (edad, objetivo, nivel, IMC).
- Enlaces rápidos a **Editar perfil**, **Generar nueva rutina** y **Ver historial**.

### WORKOUT (Generar rutina)

- Genera una **rutina nueva** según objetivo y nivel.
- La rutina se guarda y puedes verla en **Historial** y usarla para registrar entrenamientos.

### RECORDS

- **PR semanal**: mayor volumen (kg) en una semana.
- **Por ejercicio**: máximo peso, máximo de repeticiones y máximo volumen por ejercicio, con fecha.
- Si no hay datos, verás un mensaje indicando que registres entrenamientos.

### PROGRESS

- **Racha actual**: días consecutivos entrenando.
- **Racha más larga**: mejor racha histórica.
- **Nivel**: Rat → Alpha Rat → War Rat → Apex Rat según días (1, 7, 21, 46+).
- **Barra de progreso**: avance hacia el siguiente nivel.

### PERFIL

- Editas **edad**, **sexo**, **altura**, **peso**, **objetivo** y **nivel**.
- El IMC se calcula automáticamente al guardar.

### HISTORIAL

- **Rutinas guardadas**: lista de rutinas; al pulsar una entras en su detalle (días y ejercicios) y puedes registrar entrenamientos.
- **Sesiones de entrenamiento**: lista de sesiones ya registradas (fecha y número de ejercicios).

---

## 5. Resumen rápido

1. **Perfil** → Completa datos y objetivo/nivel.
2. **WORKOUT** → Genera una rutina.
3. Entra en la **rutina** → Elige un día → **“Registrar entrenamiento”**.
4. Rellena **peso y reps** por ejercicio y **Guardar**.
5. Consulta **RECORDS** y **PROGRESS** para ver récords y racha.

Los datos se guardan en el navegador (localStorage). Si borras datos del sitio o usas otro dispositivo, tendrás que volver a configurar perfil y rutinas.
