import { getDb } from "@/lib/db"
import { randomBytes } from "node:crypto"

// Simple transliteration map for Russian → Latin
const TRANSLIT: Record<string, string> = {
  а:"a", б:"b", в:"v", г:"g", д:"d", е:"e", ё:"e", ж:"zh", з:"z",
  и:"i", й:"y", к:"k", л:"l", м:"m", н:"n", о:"o", п:"p", р:"r",
  с:"s", т:"t", у:"u", ф:"f", х:"kh", ц:"ts", ч:"ch", ш:"sh",
  щ:"shch", ъ:"", ы:"y", ь:"", э:"e", ю:"yu", я:"ya",
}

function transliterate(str: string): string {
  return str
    .toLowerCase()
    .split("")
    .map((c) => TRANSLIT[c] ?? c)
    .join("")
}

function toKebab(str: string): string {
  return transliterate(str)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
}

function slugExists(slug: string): boolean {
  const row = getDb().prepare("SELECT 1 FROM clients WHERE slug = ?").get(slug)
  return row != null
}

export function generateUniqueSlug(name: string): string {
  const base = toKebab(name) || "assistant"
  if (!slugExists(base)) return base

  // Add 4 random hex chars until unique
  for (let i = 0; i < 10; i++) {
    const suffix = randomBytes(2).toString("hex")
    const candidate = `${base}-${suffix}`
    if (!slugExists(candidate)) return candidate
  }

  // Fallback: timestamp
  return `${base}-${Date.now().toString(36)}`
}
