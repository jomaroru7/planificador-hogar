<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Planificador de Hogar

App de planificación doméstica: calendario (tareas del día + menú + eventos),
catálogo de comidas con contador de raciones congeladas, y panel de
administración. Interfaz en **español**, pensada mobile-first.

## Stack

- **Next.js** (App Router, TypeScript, `src/` dir), exportado como sitio
  estático (`output: "export"`) — no hay servidor Node en producción.
- **Redux Toolkit** para el estado en memoria (un slice por dominio, con
  `createAsyncThunk` llamando a Supabase directamente, sin API routes).
- **Supabase** (Postgres + Auth) es la única fuente de verdad; Redux solo
  cachea la última respuesta para que la UI no espere a cada render.
- **Tailwind CSS v4**, configurado en `@theme` dentro de `globals.css` (no
  hay `tailwind.config.js`).

## Documentación detallada

Antes de asumir cómo funciona algo, consulta:

- [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) — estructura de carpetas,
  flujo Redux ⇄ Supabase, recurrencia de tareas, sistema de diseño.
- [`docs/SUPABASE.md`](docs/SUPABASE.md) — esquema SQL completo (tablas,
  índices, RLS) y modelo de acceso (login manual, sin registro público, todos
  los usuarios autenticados comparten los mismos datos del hogar).
- [`docs/GITHUB_PAGES.md`](docs/GITHUB_PAGES.md) — despliegue automático,
  `basePath` condicional (`GITHUB_PAGES=true`) y por qué existe
  `src/lib/basePath.ts` / `src/app/manifest.ts`.
- [`docs/CORDOVA.md`](docs/CORDOVA.md) — empaquetado móvil opcional/secundario,
  no está scaffoldeado (solo `cordova/config.xml` de referencia).
- [`docs/TELEGRAM.md`](docs/TELEGRAM.md) — bot de Telegram (Supabase Edge
  Functions) que envía el resumen diario de tareas/menú/eventos y responde a
  `/hoy`.

## Convenciones a respetar

- **Sin tarjetas/burbujas**: nada de contenedores con fondo + sombra +
  bordes redondeados. Usa listas planas (`divide-y`, `border-b`) y las
  clases utilitarias ya definidas en `globals.css`: `.list-row`,
  `.field-input`, `.field-label`, `.btn-primary`, `.btn-secondary`,
  `.section-heading`.
- **Mobile-first**: navegación inferior fija (`BottomNav`), objetivos
  táctiles grandes, `viewport` sin zoom accidental.
- Todo el texto de la UI y los mensajes de error van en español.
- Los thunks de Redux son la única forma de tocar Supabase; los componentes
  no llaman a `supabase` directamente.

## Gotchas importantes

- `@supabase/supabase-js` está fijado a la versión exacta `2.45.0` (sin
  `^`) en `package.json`. Versiones ≥2.58 tienen un bug de inferencia de
  tipos que rompe `.from(tabla).insert(...)` con el generic `Database`
  (el tipo del Insert se resuelve a `never[]`/`any[]`). No actualizar sin
  volver a comprobarlo.
- El build de producción usa Turbopack por defecto (`next build`). Si falla
  en un entorno sandboxed/CI con errores de "binding a port" o de proceso,
  prueba `next build --webpack` — es una limitación del entorno, no del
  proyecto.
- `next/font/google` requiere red en build time; por eso se usa una pila de
  fuentes de sistema en `globals.css` en vez de Geist (mejor también para
  Cordova offline).
- No hay registro público: las cuentas se crean a mano desde el panel de
  Supabase (Authentication → Users). Si se invita a alguien, hay que revisar
  el "Site URL" de Supabase para que el enlace no apunte a `localhost`.

