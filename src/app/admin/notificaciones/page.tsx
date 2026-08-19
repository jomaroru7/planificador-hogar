"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchTelegramSubscription,
  generateTelegramLinkCode,
  unlinkTelegram,
} from "@/store/slices/telegramSlice";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

export default function NotificationsAdminPage() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const { subscriber, linkCode, status } = useAppSelector((state) => state.telegram);

  useEffect(() => {
    if (userId) dispatch(fetchTelegramSubscription(userId));
  }, [dispatch, userId]);

  const linked = Boolean(subscriber);
  const codeExpired = linkCode ? new Date(linkCode.expiresAt) < new Date() : true;

  return (
    <div>
      <p className="mb-6 text-sm text-neutral-500">
        Vincula tu Telegram para recibir cada día un resumen de las tareas,
        el menú y los eventos, y para poder pedirlo cuando quieras con{" "}
        <span className="font-mono">/hoy</span>.
      </p>

      <section className="mb-8">
        <h2 className="section-heading mb-2">Estado</h2>
        {status === "loading" ? (
          <p className="py-3 text-sm text-neutral-400">Comprobando…</p>
        ) : linked ? (
          <div className="list-row justify-between">
            <p>Chat vinculado ✅</p>
            <button
              type="button"
              onClick={() => userId && dispatch(unlinkTelegram(userId))}
              className="text-xs text-red-600 hover:underline"
            >
              Desvincular
            </button>
          </div>
        ) : (
          <p className="py-3 text-sm text-neutral-400">Todavía no has vinculado ningún chat.</p>
        )}
      </section>

      {!linked && (
        <section>
          <h2 className="section-heading mb-2">Vincular un chat</h2>
          <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-neutral-500">
            <li>
              Abre{" "}
              {BOT_USERNAME ? (
                <a
                  href={`https://t.me/${BOT_USERNAME}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  el bot de Telegram
                </a>
              ) : (
                "el bot de Telegram del hogar"
              )}{" "}
              y pulsa <span className="font-mono">Start</span>.
            </li>
            <li>Genera un código aquí abajo.</li>
            <li>
              Envía al bot <span className="font-mono">/vincular TU_CODIGO</span>.
            </li>
          </ol>

          {linkCode && !codeExpired ? (
            <p className="py-3 text-2xl font-semibold tracking-widest">{linkCode.code}</p>
          ) : null}

          <button
            type="button"
            onClick={() => userId && dispatch(generateTelegramLinkCode(userId))}
            className="btn-primary"
          >
            {linkCode && !codeExpired ? "Generar otro código" : "Generar código"}
          </button>
        </section>
      )}
    </div>
  );
}
