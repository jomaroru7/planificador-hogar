import { createAdminClient } from "../_shared/admin-client.ts";
import { sendTelegramMessage } from "../_shared/telegram.ts";
import { buildDailyDigest, todayISOInMadrid } from "../_shared/digest.ts";
import type { TelegramSubscriberRow } from "../_shared/types.ts";

/**
 * Scheduled once a day (see docs/TELEGRAM.md for the pg_cron setup). Sends
 * the same digest text used by /hoy to every active subscriber.
 */
Deno.serve(async (req) => {
  const expectedSecret = Deno.env.get("CRON_SECRET");
  if (expectedSecret) {
    const gotSecret = req.headers.get("X-Cron-Secret");
    if (gotSecret !== expectedSecret) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const supabase = createAdminClient();
  const isoDate = todayISOInMadrid();
  const digest = await buildDailyDigest(supabase, isoDate);

  const { data, error } = await supabase
    .from("telegram_subscribers")
    .select("chat_id")
    .eq("active", true);

  if (error) {
    console.error("Error leyendo suscriptores de Telegram:", error);
    return new Response("error", { status: 500 });
  }

  const subscribers = (data ?? []) as Pick<TelegramSubscriberRow, "chat_id">[];
  await Promise.all(subscribers.map((s) => sendTelegramMessage(s.chat_id, digest)));

  return new Response(`ok: ${subscribers.length} mensajes enviados para ${isoDate}`);
});
