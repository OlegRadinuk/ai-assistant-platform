import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { cookies } from "next/headers"
import { createUser, getUserByEmail } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { createSessionToken } from "@/lib/session"
import { SESSION_COOKIE, cookieOptions } from "@/lib/auth"
import { MAX_SIGNUPS_PER_IP_PER_HOUR } from "@/lib/pricing"

// In-memory IP rate-limit for registrations (soft abuse guard)
const signupRateMap = new Map<string, number[]>()

function checkSignupRateLimit(ip: string): boolean {
  const now = Date.now()
  const window = now - 60 * 60 * 1000 // 1 hour
  const ts = (signupRateMap.get(ip) ?? []).filter((t) => t > window)
  if (ts.length >= MAX_SIGNUPS_PER_IP_PER_HOUR) return false
  ts.push(now)
  signupRateMap.set(ip, ts)
  return true
}

const SignupSchema = z.object({
  email: z.string().email("Некорректный email").toLowerCase(),
  password: z.string().min(6, "Пароль минимум 6 символов"),
  displayName: z.string().max(100).optional(),
  pdConsent: z.literal(true, { error: "Необходимо согласие на обработку персональных данных" }),
  consentVersion: z.string().default("1.0"),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Soft rate-limit: ≤ MAX_SIGNUPS_PER_IP_PER_HOUR registrations per IP per hour
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkSignupRateLimit(ip)) {
    return NextResponse.json(
      { error: "Слишком много регистраций с этого IP. Попробуйте позже." },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = SignupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400 })
  }

  const { email, password, displayName, consentVersion } = parsed.data

  // Check duplicate email
  const existing = getUserByEmail(email)
  if (existing) {
    return NextResponse.json({ error: "Этот email уже зарегистрирован" }, { status: 409 })
  }

  const consentIp =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"

  const password_hash = hashPassword(password)
  const user = createUser({
    email,
    password_hash,
    display_name: displayName,
    pd_consent_at: new Date().toISOString(),
    pd_consent_ip: consentIp,
    pd_consent_version: consentVersion,
  })

  const token = createSessionToken(user.id)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, cookieOptions(process.env.NODE_ENV === "production"))

  return NextResponse.json({ id: user.id, email: user.email, displayName: user.display_name })
}
