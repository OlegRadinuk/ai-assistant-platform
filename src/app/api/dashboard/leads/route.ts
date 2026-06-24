import { NextRequest, NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth"
import { getLeadsByOwner, updateLeadStatus, getDb } from "@/lib/db"
import { z } from "zod"

export async function GET(req: NextRequest): Promise<NextResponse> {
  let ownerId: number
  try {
    ownerId = await requireUserId()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") ?? undefined
  const leads = getLeadsByOwner(ownerId, { status, limit: 200 })

  return NextResponse.json(leads)
}

const PatchLeadSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(["new", "working", "closed"]),
})

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  let ownerId: number
  try {
    ownerId = await requireUserId()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = PatchLeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400 })
  }

  // Verify the lead belongs to this owner via a single JOIN-SELECT (no full scan)
  const owned = getDb()
    .prepare(`
      SELECT l.id FROM leads l
      JOIN clients c ON c.id = l.client_id
      WHERE l.id = ? AND c.owner_id = ?
    `)
    .get(parsed.data.id, ownerId) as { id: number } | undefined
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  updateLeadStatus(parsed.data.id, parsed.data.status)
  return NextResponse.json({ ok: true })
}
