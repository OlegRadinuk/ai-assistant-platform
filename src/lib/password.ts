import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto"

const N = 16384, r = 8, p = 1, keyLen = 64

export function hashPassword(plain: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(plain, salt, keyLen, { N, r, p })
  return `scrypt$${N}$${salt.toString("hex")}$${hash.toString("hex")}`
}

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split("$")
  if (parts.length !== 4) return false
  const [scheme, nStr, saltHex, hashHex] = parts
  if (scheme !== "scrypt") return false
  const n = Number(nStr)
  if (!Number.isFinite(n) || n < 1024) return false
  const salt = Buffer.from(saltHex, "hex")
  const expected = Buffer.from(hashHex, "hex")
  if (expected.length === 0) return false
  try {
    const actual = scryptSync(plain, salt, expected.length, { N: n, r, p })
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}
