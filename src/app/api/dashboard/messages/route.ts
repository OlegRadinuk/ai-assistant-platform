import { NextRequest, NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth"
import { getDb } from "@/lib/db"

/**
 * GET /api/dashboard/messages?leadId=<id>
 * Returns messages for a lead's session, verifying ownership.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  let ownerId: number
  try {
    ownerId = await requireUserId()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const leadId = req.nextUrl.searchParams.get("leadId")
  if (!leadId || isNaN(Number(leadId))) {
    return NextResponse.json({ error: "leadId required" }, { status: 400 })
  }

  const db = getDb()

  // Get lead + verify ownership through client → owner chain
  const lead = db
    .prepare(`
      SELECT l.session_id, l.client_id
      FROM leads l
      JOIN clients c ON c.id = l.client_id
      WHERE l.id = ? AND c.owner_id = ?
    `)
    .get(Number(leadId), ownerId) as { session_id: string; client_id: number } | undefined

  if (!lead) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const messages = db
    .prepare(`
      SELECT role, content, created_at
      FROM messages
      WHERE client_id = ? AND session_id = ?
      ORDER BY created_at ASC
      LIMIT 50
    `)
    .all(lead.client_id, lead.session_id) as Array<{
      role: "user" | "assistant"
      content: string
      created_at: string
    }>

  return NextResponse.json({ messages })
}
