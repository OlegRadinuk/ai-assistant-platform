import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import Anthropic from "@anthropic-ai/sdk"
import { getClientBySlug, saveMessage, getMessagesBySession, getDb, isAssistantActive } from "@/lib/db"
import { isSafeFetchUrl } from "@/lib/safe-url"
import { resolveBaseURL } from "@/lib/ai-config"
import { streamMockReply, streamPlainText } from "@/lib/mock-chat"
import { TRIAL_EXPIRED_MESSAGE } from "@/lib/pricing"
import { TELEGRAM_API_BASE } from "@/lib/telegram"

// ── Telegram helper ────────────────────────────────────────────────────────────
async function sendTelegram(token: string, chatId: string, text: string) {
  try {
    await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    })
  } catch (err) {
    console.error("[chat/telegram]", err)
  }
}

// ── Rate limiter (per ip+slug, in-memory) ─────────────────────────────────────
const rateLimitMap = new Map<string, number[]>()

function checkRateLimit(key: string, limit: number): boolean {
  const now = Date.now()
  const window = now - 60_000
  const ts = (rateLimitMap.get(key) ?? []).filter((t) => t > window)
  if (ts.length >= limit) return false
  ts.push(now)
  rateLimitMap.set(key, ts)
  return true
}

// ── URL fetcher ────────────────────────────────────────────────────────────────
function extractURL(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s<>"']+/i)
  return m ? m[0].replace(/[.,;!?)]+$/, "") : null
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 4000)
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AiAssistantBot/1.0)" },
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const html = await res.text()
    const title = html.match(/<title[^>]*>([^<]{1,200})<\/title>/i)?.[1]?.trim() ?? ""
    const desc =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']{1,400})["']/i)?.[1]?.trim() ?? ""
    const body = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<head[\s\S]*?<\/head>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 3000)
    return [title && `Заголовок: ${title}`, desc && `Описание: ${desc}`, body && `Содержимое: ${body}`]
      .filter(Boolean)
      .join("\n\n")
  } catch {
    return null
  }
}

/** Escape characters that are special in Telegram HTML parse_mode. */
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

// ── Validation ─────────────────────────────────────────────────────────────────
const ChatMsgSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(8000),
})

const BodySchema = z.object({
  messages: z.array(ChatMsgSchema).min(1).max(50),
  sessionId: z.string().max(200).optional(),
})

// ── Types ──────────────────────────────────────────────────────────────────────
type ChatMsg = z.infer<typeof ChatMsgSchema>
type Body = z.infer<typeof BodySchema>

// ── Handler ────────────────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params

  // Public widget endpoint — open CORS without credentials.
  // Dashboard routes do NOT get CORS headers (they rely on same-origin cookies).
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }

  const client = getClientBySlug(slug)
  if (!client || !client.active) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404, headers: corsHeaders })
  }

  // Trial-gate: if billing period expired, stream a polite message instead of Claude
  if (!isAssistantActive(client)) {
    const expiredResponse = streamPlainText(TRIAL_EXPIRED_MESSAGE)
    const headers = new Headers(expiredResponse.headers)
    for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v)
    return new Response(expiredResponse.body, { headers })
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(`${ip}:${slug}`, client.rate_limit)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: corsHeaders })
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: corsHeaders })
  }

  const bodyParsed = BodySchema.safeParse(rawBody)
  if (!bodyParsed.success) {
    return NextResponse.json({ error: "Invalid request", errors: bodyParsed.error.issues }, { status: 400, headers: corsHeaders })
  }
  const body: Body = bodyParsed.data

  const sessionId = body.sessionId ?? `anon-${Date.now()}`
  const lastUserMsg = body.messages[body.messages.length - 1]

  if (lastUserMsg?.role === "user") {
    try { saveMessage(client.id, sessionId, "user", lastUserMsg.content) } catch {}
  }

  // Pre-calculate Moscow time (don't trust the model's calendar math)
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" }))
  const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
  const fmt = (d: Date) => d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long" })
  const dow = now.getDay()
  const thisSat = addDays(now, dow === 6 ? 0 : (6 - dow + 7) % 7)

  const calendarCtx =
    `\n\n━━━ ТЕКУЩИЕ ДАТА И ВРЕМЯ (Москва) ━━━\n` +
    `Сейчас: ${now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}, ` +
    `${now.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.\n` +
    `Завтра — ${fmt(addDays(now, 1))}. Ближайшие выходные: ${fmt(thisSat)} – ${fmt(addDays(thisSat, 1))}.\n` +
    `Это РЕАЛЬНОЕ «сейчас». Сам даты не вычисляй — бери только отсюда.`

  let systemPrompt = client.system_prompt + calendarCtx

  // Live context from client's website — SSRF guard before fetch
  if (client.context_url && isSafeFetchUrl(client.context_url)) {
    try {
      const ctxRes = await fetch(client.context_url, {
        signal: AbortSignal.timeout(3000),
        headers: { "User-Agent": "AiAssistantBot/1.0" },
      })
      if (ctxRes.ok) {
        const ctxText = await ctxRes.text()
        if (ctxText.trim()) systemPrompt += "\n\n" + ctxText.trim()
      }
    } catch {
      // Silent fail — bot works without live context
    }
  }

  // URL detection in user message
  let urlFetchPromise: Promise<string | null> = Promise.resolve(null)
  let detectedUrl: string | null = null
  if (lastUserMsg?.role === "user") {
    detectedUrl = extractURL(lastUserMsg.content)
    if (detectedUrl && !isSafeFetchUrl(detectedUrl)) detectedUrl = null
    if (detectedUrl) urlFetchPromise = fetchPage(detectedUrl)
  }

  // ── Demo mode: no API key → stream mock reply ──────────────────────────────
  const apiKey = client.api_key || process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    const mockResponse = streamMockReply(lastUserMsg?.content ?? "")
    const headers = new Headers(mockResponse.headers)
    for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v)
    return new Response(mockResponse.body, { headers })
  }

  // ── Real Claude streaming ──────────────────────────────────────────────────
  const baseURL = resolveBaseURL(client.base_url || process.env.ANTHROPIC_BASE_URL) || undefined

  const ai = new Anthropic({ apiKey, ...(baseURL ? { baseURL } : {}) })
  const encoder = new TextEncoder()
  let assistantReply = ""

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (detectedUrl) {
          const content = await urlFetchPromise
          if (content) {
            systemPrompt += `\n\n---\nПользователь поделился ссылкой: ${detectedUrl}\n${content}\n---`
          }
        }

        const response = await ai.messages.stream({
          model: client.model,
          max_tokens: 1024,
          system: systemPrompt,
          messages: body.messages,
        })

        for await (const chunk of response) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            const text = chunk.delta.text
            if (text) {
              assistantReply += text
              controller.enqueue(encoder.encode(text))
            }
          }
        }

        if (assistantReply) {
          try { saveMessage(client.id, sessionId, "assistant", assistantReply) } catch {}
        }

        // Engaged session notification — fire when session hits 6 messages with no lead yet
        if (assistantReply) {
          try {
            const db = getDb()
            const totalMessages = (db
              .prepare("SELECT COUNT(*) as n FROM messages WHERE client_id = ? AND session_id = ?")
              .get(client.id, sessionId) as { n: number }).n

            if (totalMessages === 6) {
              const hasLead = (db
                .prepare("SELECT COUNT(*) as n FROM leads WHERE client_id = ? AND session_id = ?")
                .get(client.id, sessionId) as { n: number }).n > 0

              if (!hasLead) {
                // Determine which token/chatId to use
                const tgToken = client.tg_token || process.env.TELEGRAM_BOT_TOKEN || ""
                const tgChatId = client.tg_chat_id || ""

                if (tgToken && tgChatId) {
                  const recentMsgs = getMessagesBySession(client.id, sessionId, 4).reverse()
                  const history = recentMsgs
                    .map((m) => `${m.role === "user" ? "Клиент" : "Ассистент"}: ${escapeHtml(m.content.slice(0, 300))}`)
                    .join("\n")
                  const label = client.tg_token ? "" : " (платформа)"
                  const text = [
                    `<b>Активный диалог${label} — ${escapeHtml(client.name)}</b>`,
                    "",
                    history,
                    "",
                    "Контакт пока не оставил",
                  ].join("\n")
                  const chatIds = tgChatId.split(",").map((id: string) => id.trim()).filter(Boolean)
                  await Promise.all(chatIds.map((chatId: string) => sendTelegram(tgToken, chatId, text)))
                }
              }
            }
          } catch (notifyErr) {
            console.error("[chat/engaged-notify]", notifyErr)
          }
        }
      } catch (err) {
        console.error(`[bots/${slug}/chat]`, err)
        controller.enqueue(encoder.encode("Произошла ошибка. Попробуйте позже."))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

export async function OPTIONS(_request: NextRequest): Promise<Response> {
  // Public widget endpoint — open CORS without credentials.
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
