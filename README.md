# Gymrat

App **web** para generar rutinas de gimnasio y seguir tu progreso.  
React + TypeScript + Vite, arquitectura limpia y modular.

📖 **[Guía de uso](docs/GUIA-DE-USO.md)** – Cómo usar la app paso a paso.

---

## Cómo ejecutar

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).  
Para producción: `npm run build` y sirve la carpeta `dist`.

---

## Estructura

- **`src/`** – Código fuente (dominio, casos de uso, infraestructura, UI)
- **`public/`** – Assets estáticos
- **Vite** – Build y dev server

---

## Scripts

| Script     | Descripción        |
|-----------|--------------------|
| `npm run dev`    | Servidor de desarrollo |
| `npm run build`  | Build de producción    |
| `npm run preview`| Vista previa del build  |
| `npm run lint`   | Comprobación TypeScript |
