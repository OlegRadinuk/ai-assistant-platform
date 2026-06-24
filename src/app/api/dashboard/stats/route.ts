import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth"
import { getOwnerStats, getAssistantsByOwner, getServiceTimeStats } from "@/lib/db"

export async function GET(): Promise<NextResponse> {
  let ownerId: number
  try {
    ownerId = await requireUserId()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const ownerStats = getOwnerStats(ownerId)
  const assistants = getAssistantsByOwner(ownerId)

  // Aggregate service-time stats across all assistants
  const perAssistant = assistants.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    active: a.active,
    serviceTime: getServiceTimeStats(a.id),
  }))

  return NextResponse.json({
    ...ownerStats,
    perAssistant,
  })
}
