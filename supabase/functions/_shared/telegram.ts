const TELEGRAM_API = "https://api.telegram.org";

function apiUrl(path: string): string {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!token) throw new Error("Falta el secreto TELEGRAM_BOT_TOKEN");
  return `${TELEGRAM_API}/bot${token}/${path}`;
}

export async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  const res = await fetch(apiUrl("sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) {
    console.error("Error enviando mensaje de Telegram:", res.status, await res.text());
  }
}
