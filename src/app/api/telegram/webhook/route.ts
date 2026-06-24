/**
 * POST /api/telegram/webhook
 *
 * Receives Telegram Bot API updates for the shared platform bot.
 * The webhook must be registered via setWebhook after deploy:
 *
 *   curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
 *        -H "Content-Type: application/json" \
 *        -d '{"url":"https://<your-domain>/api/telegram/webhook"}'
 *
 * Or use the helper script: `node scripts/set-telegram-webhook.mjs`
 *
 * In local dev this endpoint is inert (Telegram cannot reach localhost).
 */

import { NextRequest, NextResponse } from "next/server"
import { consumeTelegramStartToken, saveTelegramChatId, saveUserTelegramChatId } from "@/lib/db"
import { TELEGRAM_API_BASE } from "@/lib/telegram"

// Minimal shape of a Telegram Update we care about
type TelegramUpdate = {
  update_id: number
  message?: {
    message_id: number
    chat: { id: number; type: string }
    from?: { id: number; first_name?: string; username?: string }
    text?: string
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    // Webhook is misconfigured — silently 200 so Telegram doesn't retry
    return NextResponse.json({ ok: true })
  }

  // Authenticate the request — Telegram sends TELEGRAM_WEBHOOK_SECRET in this header
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (webhookSecret) {
    const incomingSecret = req.headers.get("x-telegram-bot-api-secret-token")
    if (incomingSecret !== webhookSecret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }
  }

  let update: TelegramUpdate
  try {
    update = (await req.json()) as TelegramUpdate
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  const message = update.message
  if (!message?.text || !message.chat) {
    // We only care about text messages
    return NextResponse.json({ ok: true })
  }

  const chatId = String(message.chat.id)
  const text   = message.text.trim()

  // Deep-link flow: /start <token>
  if (text.startsWith("/start ")) {
    const token = text.slice(7).trim()
    if (token) {
      const result = consumeTelegramStartToken(token)
      if (result) {
        const { ownerId, clientId } = result

        // Save chat_id to the specific assistant (if link was per-assistant)
        if (clientId !== null) {
          saveTelegramChatId(clientId, chatId)
        }
        // Always save on the user/owner level for shared-bot fallback
        saveUserTelegramChatId(ownerId, chatId)

        await sendTelegramMessage(
          botToken,
          chatId,
          "Telegram подключён. Теперь вы будете получать уведомления о новых заявках здесь."
        )
        return NextResponse.json({ ok: true })
      }
    }

    // Unknown or expired token — friendly reply
    await sendTelegramMessage(
      botToken,
      chatId,
      "Ссылка не найдена или устарела. Пожалуйста, получите новую ссылку в личном кабинете."
    )
    return NextResponse.json({ ok: true })
  }

  // Plain /start (no token) — generic greeting
  if (text === "/start") {
    await sendTelegramMessage(
      botToken,
      chatId,
      "Добро пожаловать! Для подключения уведомлений используйте ссылку из вашего кабинета на платформе."
    )
  }

  return NextResponse.json({ ok: true })
}

async function sendTelegramMessage(token: string, chatId: string, text: string): Promise<void> {
  try {
    await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
  } catch (err) {
    console.error("[telegram/webhook/sendMessage]", err)
  }
}
