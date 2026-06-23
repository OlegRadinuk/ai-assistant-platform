/**
 * Chat engine (фрагмент) — потоковый ответ AI-ассистента для конкретного арендатора.
 *
 * Демонстрирует несколько неочевидных решений, важных для продакшена:
 *
 *  1. Per-tenant system prompt берётся из БД по slug — один код на всех клиентов.
 *  2. Дата/время считаются В КОДЕ (по МСК) и подмешиваются в промпт. LLM плохо
 *     считает календарь («какая суббота ближайшая?») — поэтому мы не доверяем это
 *     модели, а даём ей готовые числа. Текст нейтральный — один и тот же для
 *     клиники, апартаментов и стройки (multi-tenant без утечки чужого контекста).
 *  3. Живой контекст по context_url (актуальные цены/слоты/наличие) подтягивается
 *     в рантайме — знания не «протухают» в промпте.
 *  4. Если пользователь прислал ссылку — она фетчится и кладётся в контекст,
 *     но только после SSRF-проверки (isSafeFetchUrl).
 *  5. Ответ стримится клиенту через ReadableStream.
 *
 * (Иллюстративный фрагмент из приватной платформы; очищен от инфраструктуры и секретов.)
 */

import Anthropic from "@anthropic-ai/sdk"
import { getClientBySlug, saveMessage } from "@/lib/db"
import { isSafeFetchUrl, fetchPageAsContext } from "@/lib/safe-url"

type ChatMsg = { role: "user" | "assistant"; content: string }

export async function streamAssistantReply(slug: string, messages: ChatMsg[]): Promise<Response> {
  const client = getClientBySlug(slug)
  if (!client || !client.active) {
    return new Response("Bot not found", { status: 404 })
  }

  // ── 1. Готовый «сейчас» по Москве — не даём модели считать календарь ──────────
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" }))
  const fmt = (d: Date) => d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long" })
  const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 864e5)
  const dow = now.getDay() // 0=Вс, 6=Сб
  const thisSat = addDays(now, dow === 6 ? 0 : (6 - dow + 7) % 7)

  const calendarCtx =
    `\n\n━━━ ТЕКУЩИЕ ДАТА И ВРЕМЯ (Москва) ━━━\n` +
    `Сейчас: ${now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}, ` +
    `${now.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.\n` +
    `Завтра — ${fmt(addDays(now, 1))}. Ближайшие выходные: ${fmt(thisSat)} – ${fmt(addDays(thisSat, 1))}.\n` +
    `Это РЕАЛЬНОЕ «сейчас». Сам даты не вычисляй — бери только отсюда.`

  let systemPrompt = client.system_prompt + calendarCtx

  // ── 2. Живой контекст клиента (цены/слоты/наличие) — не протухает в промпте ───
  if (client.context_url) {
    try {
      const res = await fetch(client.context_url, { signal: AbortSignal.timeout(3000) })
      if (res.ok) systemPrompt += "\n\n" + (await res.text()).trim()
    } catch {
      /* бот работает и без живого контекста — деградируем мягко */
    }
  }

  // ── 3. Ссылка от пользователя → в контекст, но только после SSRF-проверки ─────
  const lastUser = messages[messages.length - 1]
  if (lastUser?.role === "user") {
    saveMessage(client.id, lastUser.content)
    const url = extractUrl(lastUser.content)
    if (url && isSafeFetchUrl(url)) {
      const page = await fetchPageAsContext(url)
      if (page) systemPrompt += `\n\n--- Пользователь прислал ссылку: ${url}\n${page}\n---`
    }
  }

  // ── 4. Стриминг ответа Claude ────────────────────────────────────────────────
  const ai = new Anthropic({ apiKey: client.api_key || process.env.ANTHROPIC_API_KEY })
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const response = ai.messages.stream({
        model: client.model, // per-tenant: дешёвая модель по умолчанию, дорогая — где нужно качество
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      })
      for await (const chunk of response) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*", // виджет живёт на внешних сайтах
    },
  })
}

function extractUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s<>"']+/i)
  return m ? m[0].replace(/[.,;!?)]+$/, "") : null
}
