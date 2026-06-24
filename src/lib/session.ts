import { createHmac, timingSafeEqual } from "node:crypto"

// Stateless HMAC-SHA256 session token.
// Format: `${userId}.${issuedAt}.${sigBase64Url}`
// sig = HMAC_SHA256(SESSION_SECRET, `${userId}.${issuedAt}`)
// 7-day TTL. Survives process restarts (stateless).

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

const DEV_SECRET = "dev-secret-replace-in-production-32c"

function getSecret(): string {
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    throw new Error(
      "SESSION_SECRET env variable is required in production. " +
      "Generate one with: openssl rand -base64 32"
    )
  }
  return process.env.SESSION_SECRET || DEV_SECRET
}

function sign(userId: number, issuedAt: number): string {
  return createHmac("sha256", getSecret())
    .update(`${userId}.${issuedAt}`)
    .digest("base64url")
}

export function createSessionToken(userId: number): string {
  const issuedAt = Date.now()
  return `${userId}.${issuedAt}.${sign(userId, issuedAt)}`
}

export function verifySessionToken(token: string | undefined): { userId: number } | null {
  if (!token) return null

  const firstDot = token.indexOf(".")
  if (firstDot <= 0) return null
  const secondDot = token.indexOf(".", firstDot + 1)
  if (secondDot <= firstDot) return null

  const userIdStr = token.slice(0, firstDot)
  const issuedAtStr = token.slice(firstDot + 1, secondDot)
  const sig = token.slice(secondDot + 1)

  const userId = Number(userIdStr)
  const issuedAt = Number(issuedAtStr)

  if (!Number.isFinite(userId) || userId <= 0) return null
  if (!Number.isFinite(issuedAt)) return null
  if (Date.now() - issuedAt > MAX_AGE_MS) return null

  const expected = sign(userId, issuedAt)
  if (sig.length !== expected.length) return null

  try {
    const valid = timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    return valid ? { userId } : null
  } catch {
    return null
  }
}
