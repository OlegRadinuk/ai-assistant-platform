/**
 * GET /api/telegram/start-link?clientId=<id>
 *
 * Returns a Telegram deep-link for the "Connect Telegram" step in onboarding.
 * The link opens the shared platform bot and triggers chat_id capture.
 *
 * Response: { url: "https://t.me/<botUsername>?start=<token>", botUsername: string }
 *
 * The bot username is resolved dynamically from the Telegram API (getMe) so we
 * don't need to hardcode it. Falls back to env TELEGRAM_BOT_USERNAME if set.
 */

import { NextRequest, NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth"
import { createTelegramStartToken } from "@/lib/db"
import { TELEGRAM_API_BASE } from "@/lib/telegram"

// Cache bot username for the process lifetime (avoids repeated getMe calls)
let cachedBotUsername: string | null = null

async function getBotUsername(token: string): Promise<string | null> {
  if (cachedBotUsername) return cachedBotUsername
  if (process.env.TELEGRAM_BOT_USERNAME) {
    cachedBotUsername = process.env.TELEGRAM_BOT_USERNAME
    return cachedBotUsername
  }
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/getMe`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { ok: boolean; result?: { username?: string } }
    if (data.ok && data.result?.username) {
      cachedBotUsername = data.result.username
      return cachedBotUsername
    }
  } catch (err) {
    console.error("[telegram/start-link/getMe]", err)
  }
  return null
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  let ownerId: number
  try {
    ownerId = await requireUserId()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN not configured" },
      { status: 503 }
    )
  }

  // Optional: tie the token to a specific assistant
  const clientIdParam = req.nextUrl.searchParams.get("clientId")
  const clientId = clientIdParam ? Number(clientIdParam) : null

  const startToken = createTelegramStartToken(ownerId, Number.isFinite(clientId) ? clientId : null)

  const botUsername = await getBotUsername(botToken)
  if (!botUsername) {
    return NextResponse.json(
      { error: "Could not resolve bot username. Check TELEGRAM_BOT_TOKEN or set TELEGRAM_BOT_USERNAME." },
      { status: 502 }
    )
  }

  const url = `https://t.me/${botUsername}?start=${startToken}`
  return NextResponse.json({ url, botUsername })
}
