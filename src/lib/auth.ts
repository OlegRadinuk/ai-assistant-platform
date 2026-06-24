import { cookies } from "next/headers"
import { verifySessionToken } from "@/lib/session"

export const SESSION_COOKIE = "aiap_session"

export async function getCurrentUserId(): Promise<number | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  return verifySessionToken(token)?.userId ?? null
}

export async function requireUserId(): Promise<number> {
  const id = await getCurrentUserId()
  if (id == null) {
    // This will be caught in route handlers and result in a 401.
    throw Object.assign(new Error("Unauthorized"), { status: 401 })
  }
  return id
}

export function cookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure,
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  }
}
