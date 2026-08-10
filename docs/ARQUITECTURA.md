# Arquitectura

## Stack

- **Next.js 16** (App Router, TypeScript, `src/` dir) — exportado como sitio
  estático (`output: "export"` en [`next.config.ts`](../next.config.ts)) para
  poder empaquetarlo con Cordova y servirlo sin necesidad de un servidor Node.
- **Redux Toolkit** — único origen de la verdad en el cliente. Cada dominio
  (tareas, comidas, menú, eventos, sesión) tiene su propio *slice* con
  `createAsyncThunk` para las llamadas a Supabase.
- **Supabase** — Postgres + Auth. El cliente vive en
  [`src/lib/supabase/client.ts`](../src/lib/supabase/client.ts) y se llama
  directamente desde los thunks de Redux (sin API routes intermedias).
- **Tailwind CSS v4** — configurado vía `@theme` en
  [`globals.css`](../src/app/globals.css), sin `tailwind.config.js`.

## Por qué el estado vive en Supabase, no solo en Redux

Redux mantiene una copia en memoria de los datos para que la UI reaccione al
instante, pero **la fuente de verdad es siempre la base de datos**. Cada thunk:

1. Llama a Supabase (`select`/`insert`/`update`/`delete`).
2. Solo actualiza el store de Redux con la respuesta de Supabase.

Así, si abres la app en el móvil y en el ordenador, ambos verán los mismos
datos en cuanto recarguen/vuelvan a consultar — no hay estado que viva solo en
un dispositivo.

## Estructura de carpetas

```
src/
  app/                      # Rutas (App Router)
    layout.tsx              # Shell raíz + <Providers> (Redux)
    providers.tsx           # <Provider store> + listener de sesión de Supabase
    page.tsx                # "Hoy": tareas, menú y eventos del día
    login/page.tsx
    calendario/page.tsx     # Vista mensual + detalle del día seleccionado
    comidas/page.tsx        # Lista de comidas con contador de raciones
    admin/
      layout.tsx            # Pestañas Resumen / Tareas / Comidas / Eventos
      page.tsx
      tareas/page.tsx
      comidas/page.tsx
      eventos/page.tsx
  components/
    auth/AuthGuard.tsx      # Redirige a /login si no hay sesión
    layout/                 # AppShell, AppHeader, BottomNav
    calendar/               # MonthGrid, DayDetail
    admin/AdminTabs.tsx
  store/
    store.ts, hooks.ts
    slices/                 # authSlice, tasksSlice, mealsSlice, mealPlanSlice, eventsSlice
  lib/
    supabase/client.ts
    dates.ts                # Cálculo de recurrencia de tareas y utilidades de fecha
  types/database.ts         # Tipos alineados con el esquema SQL (ver docs/SUPABASE.md)
```

## Recurrencia de tareas

Las tareas no se generan como filas repetidas; se guarda **una fila con una
regla** (`recurrence`: `none` | `daily` | `weekly` | `monthly`) y la función
`taskOccursOnDate` ([`src/lib/dates.ts`](../src/lib/dates.ts)) calcula, para
una fecha dada, si la tarea aplica ese día. Que una ocurrencia esté marcada
como hecha se guarda aparte, en `task_completions` (clave `task_id` + `date`),
así una tarea semanal puede estar "hecha" un lunes y "pendiente" el siguiente.

## Sistema de diseño (sin tarjetas/burbujas)

A propósito, la interfaz evita contenedores tipo "card" con fondo, sombra y
bordes redondeados. En su lugar:

- Listas planas separadas por líneas finas (`divide-y`, `border-b`).
- Formularios con `input`/`select` de solo borde inferior (`.field-input` en
  `globals.css`), no cajas rellenas.
- Botones planos, sin `border-radius`, con dos variantes (`.btn-primary`,
  `.btn-secondary`).
- Navegación inferior (`BottomNav`) para uso con una mano en móvil, con
  cabecera superior simple (`AppHeader`) y contenido a ancho completo.

Estas clases utilitarias están definidas una vez en
[`globals.css`](../src/app/globals.css) para mantener la coherencia visual sin
repetir clases largas de Tailwind en cada componente.

## Mobile-first

- `viewport` fijado a `width=device-width` y `maximumScale=1` (evita zoom
  accidental al tocar inputs).
- Navegación por pestañas inferior fija, con `env(safe-area-inset-bottom)`
  para respetar la barra de gestos de iOS/Android.
- Objetivos táctiles de al menos 44×44 px en los controles interactivos
  (botones +/- de raciones, checkboxes de tareas, etc.).
- El layout usa una única columna con `max-w-2xl` centrado — funciona igual
  de bien en pantallas grandes sin necesitar un diseño de escritorio aparte.
