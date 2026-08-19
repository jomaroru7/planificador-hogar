# Notificaciones por Telegram

Envía cada día un resumen (tareas, menú y eventos) a quien vincule su cuenta
con un bot de Telegram, y responde a demanda al comando `/hoy`. La app sigue
siendo 100% estática (GitHub Pages): esta pieza vive en **Supabase Edge
Functions** (Deno), no en un servidor Node.

## 1. Crear el bot con @BotFather

1. Abre una conversación con [@BotFather](https://t.me/BotFather) en Telegram.
2. Envía `/newbot` y sigue las instrucciones (nombre visible + `@username`
   único acabado en `bot`).
3. Guarda el **token** que te da (algo como `123456789:AA...`) — es el secreto
   `TELEGRAM_BOT_TOKEN` del paso 3.

## 2. Esquema de base de datos

Ejecuta el SQL de `telegram_subscribers` y `telegram_link_codes` de
[`docs/SUPABASE.md`](SUPABASE.md) (ya incluido en el script completo de ese
documento) si aún no lo has hecho.

## 3. Scaffolding de Supabase CLI

Este repo no incluye `supabase/config.toml` (se genera con la CLI, cambia de
formato entre versiones). La primera vez:

```bash
npm install -g supabase
supabase login
supabase init          # crea supabase/config.toml sin tocar supabase/functions/
supabase link --project-ref <tu-project-ref>   # Project Settings > General
```

## 4. Configurar secretos

Además de `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (los inyecta Supabase
automáticamente en cada función), define:

`supabase secrets set` no imprime el valor guardado (ni deja consultarlo
después), así que genera cada secreto en un paso separado para poder verlo y
reutilizarlo en los pasos siguientes (6 y 7):

```bash
openssl rand -hex 24   # cópialo, será <webhook-secret> en el paso 6
openssl rand -hex 24   # cópialo, será <cron-secret> en el paso 7
```

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=123456789:AA...
supabase secrets set TELEGRAM_WEBHOOK_SECRET=<pega-aquí-el-primero>
supabase secrets set CRON_SECRET=<pega-aquí-el-segundo>
```

- `TELEGRAM_WEBHOOK_SECRET`: evita que cualquiera pueda llamar a la URL
  pública del webhook haciéndose pasar por Telegram.
- `CRON_SECRET`: protege el endpoint del resumen diario para que solo lo
  pueda invocar tu propio `pg_cron`.

## 5. Desplegar las funciones

```bash
supabase functions deploy telegram-webhook --no-verify-jwt
supabase functions deploy daily-digest --no-verify-jwt
```

`--no-verify-jwt` es necesario porque Telegram y `pg_cron` no envían un JWT de
Supabase Auth; la protección real la dan los secretos del paso 4.

## 6. Registrar el webhook en Telegram

Sustituye `<token>`, `<project-ref>` y `<webhook-secret>`:

```bash
curl -X POST "https://api.telegram.org/bot<token>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://<project-ref>.supabase.co/functions/v1/telegram-webhook",
    "secret_token": "<webhook-secret>"
  }'
```

Debe responder `{"ok":true,...}`. Puedes comprobar el estado con
`https://api.telegram.org/bot<token>/getWebhookInfo`.

## 7. Programar el resumen diario (pg_cron + pg_net)

En el **SQL Editor** de Supabase (requiere las extensiones `pg_cron` y
`pg_net`, disponibles en el plan gratuito):

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'telegram-daily-digest',
  '0 6 * * *', -- 06:00 UTC = 07:00/08:00 hora de Madrid según horario de verano
  $$
  select net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/daily-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', '<cron-secret>'
    )
  );
  $$
);
```

Ajusta la hora del `cron.schedule` a cuándo quieres recibir el resumen (está
en UTC). Para desactivarlo: `select cron.unschedule('telegram-daily-digest');`.

## 8. Vincular cada cuenta

Cada persona, desde su sesión en la app:

1. Ve a **Admin → Notificaciones**.
2. Pulsa **Generar código** (caduca a los 15 minutos).
3. Abre el bot en Telegram y envía `/vincular TU_CODIGO`.

A partir de ahí ese chat recibe el resumen diario y puede pedirlo cuando
quiera con `/hoy`. Como todos los usuarios autenticados comparten los mismos
datos del hogar (ver [`docs/SUPABASE.md`](SUPABASE.md)), el contenido del
resumen es igual para todo el mundo; solo cambia quién lo recibe.

## Variable opcional en el front-end

`NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` (en `.env.local`) es el `@username`
público del bot; si se define, la página de Notificaciones muestra un enlace
directo a `https://t.me/<username>`. No es un secreto.

## Límites conocidos

- El resumen se calcula en la zona horaria `Europe/Madrid` (fijo en el código
  de las Edge Functions); si el hogar cambia de zona horaria habría que
  ajustar `todayISOInMadrid()` en `supabase/functions/_shared/digest.ts`.
- `supabase/functions/_shared/*` duplica manualmente la lógica de
  `taskOccursOnDate` de [`src/lib/dates.ts`](../src/lib/dates.ts) y los tipos
  de [`src/types/database.ts`](../src/types/database.ts), porque las Edge
  Functions (Deno) se despliegan por separado del build de Next.js y no
  pueden importar `src/` directamente. Si cambias el esquema o las reglas de
  recurrencia, actualiza también esa carpeta.
