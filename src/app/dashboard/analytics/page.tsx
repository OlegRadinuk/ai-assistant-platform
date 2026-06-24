import { redirect } from "next/navigation"
import { getCurrentUserId } from "@/lib/auth"
import { getOwnerStats, getAssistantsByOwner, getServiceTimeStats } from "@/lib/db"
import AnalyticsClient from "./AnalyticsClient"

export default async function AnalyticsPage() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const stats = getOwnerStats(userId)
  const assistants = getAssistantsByOwner(userId)
  const perAssistant = assistants.map((a) => ({ ...a, svc: getServiceTimeStats(a.id) }))

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Аналитика</h1>
        <p style={{ fontSize: 14, color: "var(--op-text-secondary)" }}>
          Эффективность AI-сотрудников
        </p>
      </div>
      <AnalyticsClient stats={stats} perAssistant={perAssistant} />
    </div>
  )
}
