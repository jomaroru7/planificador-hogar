import { createAdminClient } from "../_shared/admin-client.ts";
import { sendTelegramMessage } from "../_shared/telegram.ts";
import { buildDailyDigest, todayISOInMadrid } from "../_shared/digest.ts";
import type { TelegramLinkCodeRow, TelegramSubscriberRow } from "../_shared/types.ts";

const HELP_TEXT =
  "No entiendo ese comando. Prueba /hoy para ver el resumen de hoy, o /start para vincular este chat.";

const START_TEXT =
  "¡Hola! Soy el bot del Planificador de Hogar.\n\n" +
  "Para vincular este chat con tu cuenta, abre la app → Admin → Notificaciones, " +
  "genera un código y envíamelo aquí con:\n/vincular TU_CODIGO";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  // Telegram sends this header when the webhook is set with a secret_token
  // (see docs/TELEGRAM.md) so random requests to this public URL are ignored.
  const expectedSecret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
  if (expectedSecret) {
    const gotSecret = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (gotSecret !== expectedSecret) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const update = await req.json().catch(() => null);
  const message = update?.message;
  const chatId = message?.chat?.id;
  const text: string | undefined = message?.text;

  // Always 200 back to Telegram (retries otherwise), even for updates we ignore.
  if (!chatId || !text) return new Response("ok");

  const chatIdStr = String(chatId);
  const [rawCommand, ...args] = text.trim().split(/\s+/);
  const command = rawCommand.toLowerCase();
  const supabase = createAdminClient();

  try {
    if (command === "/start") {
      await sendTelegramMessage(chatIdStr, START_TEXT);
    } else if (command === "/vincular") {
      await handleVincular(supabase, chatIdStr, args[0]);
    } else if (command === "/hoy") {
      await handleHoy(supabase, chatIdStr);
    } else {
      await sendTelegramMessage(chatIdStr, HELP_TEXT);
    }
  } catch (err) {
    console.error("Error procesando update de Telegram:", err);
  }

  return new Response("ok");
});

async function handleVincular(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  chatId: string,
  rawCode: string | undefined,
) {
  const code = rawCode?.toUpperCase();
  if (!code) {
    await sendTelegramMessage(chatId, "Usa: /vincular TU_CODIGO");
    return;
  }

  const { data: linkCode } = await supabase
    .from("telegram_link_codes")
    .select("*")
    .eq("code", code)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle() as { data: TelegramLinkCodeRow | null };

  if (!linkCode) {
    await sendTelegramMessage(
      chatId,
      "Ese código no es válido o ha caducado. Genera uno nuevo desde la app.",
    );
    return;
  }

  await supabase
    .from("telegram_subscribers")
    .upsert(
      { chat_id: chatId, user_id: linkCode.user_id, active: true },
      { onConflict: "chat_id" },
    );
  await supabase.from("telegram_link_codes").delete().eq("code", code);

  await sendTelegramMessage(
    chatId,
    "✅ ¡Chat vinculado! A partir de ahora recibirás el resumen diario. Prueba /hoy para verlo ya.",
  );
}

async function handleHoy(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  chatId: string,
) {
  const { data: subscriber } = await supabase
    .from("telegram_subscribers")
    .select("*")
    .eq("chat_id", chatId)
    .eq("active", true)
    .maybeSingle() as { data: TelegramSubscriberRow | null };

  if (!subscriber) {
    await sendTelegramMessage(
      chatId,
      "Este chat todavía no está vinculado. Usa /start para ver cómo hacerlo.",
    );
    return;
  }

  const digest = await buildDailyDigest(supabase, todayISOInMadrid());
  await sendTelegramMessage(chatId, digest);
}
