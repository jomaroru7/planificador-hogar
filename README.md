# Planificador de Hogar

Aplicación web (y móvil) para organizar las tareas, comidas y eventos de casa:

- **Calendario** con las tareas del día, el menú planificado y otros eventos.
- **Comidas**: catálogo de platos con un contador de raciones congeladas.
- **Panel de administración** para gestionar tareas, comidas y eventos.

El estado siempre vive en la base de datos (Supabase), así que se ve igual
desde cualquier dispositivo — Redux solo mantiene una copia en memoria para
que la interfaz responda al instante.

## Stack

| Capa       | Tecnología                                |
| ---------- | ------------------------------------------ |
| Frontend   | React + Next.js (App Router, TypeScript)   |
| Estado     | Redux Toolkit                              |
| Estilos    | Tailwind CSS v4 (mobile-first, sin cards)  |
| Backend    | Supabase (Postgres + Auth), plan gratuito  |
| Móvil      | Exportación estática + Apache Cordova      |

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # rellena tus credenciales de Supabase
npm run dev
```

Antes de nada, crea el esquema de base de datos siguiendo
[`docs/SUPABASE.md`](docs/SUPABASE.md) — incluye el SQL completo (tablas,
índices y políticas de seguridad) y cómo crear usuarios.

Abre [http://localhost:3000](http://localhost:3000). Como no hay registro
público, inicia sesión con un usuario creado desde el panel de Supabase.

## Scripts

```bash
npm run dev      # servidor de desarrollo
npm run build    # build de producción (exporta a out/, ver next.config.ts)
npm run start    # sirve el build (útil para probarlo, aunque es 100% estático)
npm run lint     # ESLint
```

## Documentación

- [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) — estructura de carpetas,
  flujo de datos Redux ⇄ Supabase, cómo funciona la recurrencia de tareas y el
  sistema de diseño (listas planas, sin tarjetas/burbujas).
- [`docs/SUPABASE.md`](docs/SUPABASE.md) — esquema SQL completo, políticas de
  seguridad (RLS) y gestión de usuarios.
- [`docs/CORDOVA.md`](docs/CORDOVA.md) — cómo empaquetar el build estático
  como app instalable con Apache Cordova (Android/iOS). Es opcional: la web
  funciona igualmente instalada como PWA o abierta en el navegador del móvil.
- [`docs/GITHUB_PAGES.md`](docs/GITHUB_PAGES.md) — despliegue automático en
  GitHub Pages con el workflow de `.github/workflows/deploy.yml`.

## Estructura del proyecto

```
src/
  app/          # Rutas de Next.js (Hoy, Calendario, Comidas, Admin, Login)
  components/   # Componentes de UI (layout, calendario, admin, auth)
  store/        # Redux Toolkit: store y slices por dominio
  lib/          # Cliente de Supabase y utilidades de fechas/recurrencia
  types/        # Tipos alineados con el esquema de Supabase
docs/           # Documentación (arquitectura, Supabase, Cordova)
cordova/        # config.xml de referencia para el empaquetado móvil
```

Más detalle en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).
