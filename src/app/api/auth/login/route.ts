import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { cookies } from "next/headers"
import { getUserByEmail } from "@/lib/db"
import { verifyPassword } from "@/lib/password"
import { createSessionToken } from "@/lib/session"
import { SESSION_COOKIE, cookieOptions } from "@/lib/auth"

const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = LoginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400 })
  }

  const { email, password } = parsed.data

  const user = getUserByEmail(email)
  if (!user || !verifyPassword(password, user.password_hash)) {
    // Same error message for both cases — avoid email enumeration
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 })
  }

  const token = createSessionToken(user.id)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, cookieOptions(process.env.NODE_ENV === "production"))

  return NextResponse.json({ id: user.id, email: user.email, displayName: user.display_name })
}
