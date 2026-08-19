# Supabase — esquema y configuración

Este proyecto usa [Supabase](https://supabase.com) (plan gratuito) como backend:
Postgres para los datos y Auth para el login. El cliente (`src/lib/supabase/client.ts`)
habla directamente con Supabase desde el navegador — no hay servidor Node intermedio,
lo cual encaja con el build estático (`next build` con `output: "export"`).

## 1. Crear el proyecto

1. Crea una cuenta y un proyecto en [supabase.com](https://supabase.com).
2. En **Project Settings → API** copia la `Project URL` y la `anon public key`.
3. Copia `.env.example` a `.env.local` y rellena:

   ```bash
   cp .env.example .env.local
   ```

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

## 2. Crear el esquema

Abre **SQL Editor** en el panel de Supabase y ejecuta el siguiente script completo.
Crea las tablas, restricciones y políticas de seguridad (RLS) necesarias.

```sql
-- Extensión para generar UUIDs
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- Tareas del hogar (catálogo con reglas de repetición)
-- ─────────────────────────────────────────────
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  recurrence text not null default 'none'
    check (recurrence in ('none', 'daily', 'weekly', 'monthly')),
  recurrence_days int[], -- 0 (domingo) .. 6 (sábado), solo para 'weekly'
  start_date date not null default current_date,
  end_date date,
  assigned_to text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Marca qué ocurrencias (día concreto) de una tarea están hechas
create table public.task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  date date not null,
  completed_at timestamptz not null default now(),
  unique (task_id, date)
);

-- ─────────────────────────────────────────────
-- Catálogo de comidas con raciones congeladas
-- ─────────────────────────────────────────────
create table public.meals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text check (category in ('comida', 'cena', 'ambas')),
  portions int not null default 0 check (portions >= 0),
  notes text,
  created_at timestamptz not null default now()
);

-- Qué se come cada día (comida / cena)
create table public.meal_plan (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  meal_type text not null check (meal_type in ('comida', 'cena')),
  meal_id uuid references public.meals (id) on delete set null,
  custom_text text,
  notes text,
  created_at timestamptz not null default now(),
  unique (date, meal_type)
);

-- ─────────────────────────────────────────────
-- Eventos genéricos del calendario
-- ─────────────────────────────────────────────
create table public.events (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- Notificaciones de Telegram (ver docs/TELEGRAM.md)
-- ─────────────────────────────────────────────
-- Chats de Telegram vinculados a una cuenta; reciben el resumen diario y
-- pueden pedirlo a demanda con /hoy.
create table public.telegram_subscribers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  chat_id text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Código de un solo uso (caduca) que un usuario genera en la app y envía al
-- bot con /vincular para asociar su chat_id a su cuenta.
create table public.telegram_link_codes (
  code text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Índices para las consultas por rango de fechas del calendario
create index tasks_start_date_idx on public.tasks (start_date);
create index task_completions_date_idx on public.task_completions (date);
create index meal_plan_date_idx on public.meal_plan (date);
create index events_date_idx on public.events (date);

-- ─────────────────────────────────────────────
-- Row Level Security: cualquier usuario autenticado
-- (toda la familia comparte los mismos datos del hogar)
-- ─────────────────────────────────────────────
alter table public.tasks enable row level security;
alter table public.task_completions enable row level security;
alter table public.meals enable row level security;
alter table public.meal_plan enable row level security;
alter table public.events enable row level security;

create policy "authenticated read/write tasks" on public.tasks
  for all to authenticated using (true) with check (true);

create policy "authenticated read/write task_completions" on public.task_completions
  for all to authenticated using (true) with check (true);

create policy "authenticated read/write meals" on public.meals
  for all to authenticated using (true) with check (true);

create policy "authenticated read/write meal_plan" on public.meal_plan
  for all to authenticated using (true) with check (true);

create policy "authenticated read/write events" on public.events
  for all to authenticated using (true) with check (true);

-- A diferencia de las tablas de arriba, aquí sí importa el dueño: cada
-- usuario solo ve/gestiona su propio chat vinculado. Los inserts/deletes que
-- hace el bot (al procesar /vincular) usan la service role key y saltan RLS.
alter table public.telegram_subscribers enable row level security;
alter table public.telegram_link_codes enable row level security;

create policy "users read own telegram subscription" on public.telegram_subscribers
  for select to authenticated using (user_id = auth.uid());

create policy "users unlink own telegram subscription" on public.telegram_subscribers
  for delete to authenticated using (user_id = auth.uid());

create policy "users manage own telegram link codes" on public.telegram_link_codes
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
```

> **Nota sobre el modelo de acceso:** no hay aislamiento por usuario/hogar — cualquier
> cuenta autenticada ve y edita los mismos datos. Es el modelo más simple para una
> familia que comparte un único hogar. Si en el futuro quieres varios hogares
> independientes, añade una tabla `households` y una columna `household_id` en cada
> tabla, y cambia las políticas para filtrar por el hogar del usuario.

## 3. Crear usuarios

Este proyecto no tiene registro público (no hay página de "crear cuenta"): las
cuentas se crean manualmente para controlar quién entra en el planificador.

En el panel de Supabase, ve a **Authentication → Users → Add user** y crea una
cuenta (email + contraseña) por cada miembro del hogar que necesite acceder.
También puedes desactivar las confirmaciones por email en **Authentication →
Providers → Email** si quieres poder iniciar sesión inmediatamente.

## 4. Tipos de TypeScript

Los tipos en [`src/types/database.ts`](../src/types/database.ts) están escritos a
mano para que coincidan con el SQL de arriba. Si cambias el esquema, actualiza
también ese archivo (o genera los tipos automáticamente con `supabase gen types
typescript`, si usas la CLI oficial).
