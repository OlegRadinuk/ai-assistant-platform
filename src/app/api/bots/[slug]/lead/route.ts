import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getClientBySlug, saveLead, getMessagesBySession } from "@/lib/db"
import { TELEGRAM_API_BASE } from "@/lib/telegram"

// Public widget endpoint — open CORS without credentials.
// Dashboard routes do NOT get CORS headers (they rely on same-origin cookies).
const corsHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
})

const LeadSchema = z.object({
  name: z.string().max(200).default(""),
  phone: z.string().max(50).default(""),
  email: z.string().max(200).default(""),
  message: z.string().max(2000).default(""),
  sessionId: z.string().max(200).default(""),
  source: z.string().max(50).default("chat"),
  pdConsent: z.literal(true, { error: "Необходимо согласие на обработку персональных данных" }),
  consentVersion: z.string().default("1.0"),
})

/** Escape characters that are special in Telegram HTML parse_mode. */
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

async function sendTelegram(token: string, chatId: string, text: string) {
  try {
    await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    })
  } catch (err) {
    console.error("[lead/telegram]", err)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params
  const cors = corsHeaders()

  const client = getClientBySlug(slug)
  if (!client || !client.active) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404, headers: cors })
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: cors })
  }

  const parsed = LeadSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400, headers: cors })
  }

  const { name, phone, email, message, sessionId, source, consentVersion } = parsed.data

  if (!phone && !email) {
    return NextResponse.json({ error: "phone or email required" }, { status: 400, headers: cors })
  }

  const allowedSources = ["chat", "cf7", "booking", "import"]
  const safeSource = allowedSources.includes(source) ? source : "chat"

  const consentIp =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"

  saveLead({
    client_id: client.id,
    session_id: sessionId,
    name,
    phone,
    email,
    message,
    source: safeSource,
    pd_consent_at: new Date().toISOString(),
    pd_consent_ip: consentIp,
    pd_consent_version: consentVersion,
  })

  // Optional Telegram notification:
  // Use client's own bot if tg_token is set; otherwise fall back to the shared platform bot.
  const tgToken  = client.tg_token  || process.env.TELEGRAM_BOT_TOKEN || ""
  const tgChatId = client.tg_chat_id || ""

  if (tgToken && tgChatId) {
    const mskTime = new Date().toLocaleString("ru-RU", {
      timeZone: "Europe/Moscow",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })

    const sourceLabel: Record<string, string> = {
      chat: "из чата", cf7: "с формы сайта", booking: "запись", import: "импорт",
    }
    // Indicate shared-bot delivery so Oleg can tell
    const botLabel = client.tg_token ? "" : " [общий бот]"
    const header = [
      `<b>Новая заявка${botLabel} — ${escapeHtml(client.name)}</b> (${escapeHtml(sourceLabel[safeSource] ?? safeSource)})`,
      "",
      `${escapeHtml(name) || "—"}`,
      ...(phone ? [`Тел: ${escapeHtml(phone)}`] : []),
      ...(email ? [`Email: ${escapeHtml(email)}`] : []),
      ...(message ? [`Сообщение: ${escapeHtml(message)}`] : []),
    ].join("\n")

    let fullText = header

    if (sessionId) {
      const msgs = getMessagesBySession(client.id, sessionId, 10).reverse()
      if (msgs.length > 0) {
        const botName = client.widget_title || client.name
        const history = msgs
          .map((m) => `${m.role === "user" ? "Клиент" : escapeHtml(botName)}: ${escapeHtml(m.content.trim().slice(0, 500))}`)
          .join("\n\n")
        fullText += `\n\n<b>Переписка:</b>\n${history}`
      }
    }

    fullText += `\n\n${mskTime} МСК`

    const chatIds = tgChatId.split(",").map((id: string) => id.trim()).filter(Boolean)
    await Promise.all(chatIds.map((chatId: string) => sendTelegram(tgToken, chatId, fullText)))
  }

  return NextResponse.json({ ok: true }, { headers: cors })
}

export async function OPTIONS(_request: NextRequest): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
