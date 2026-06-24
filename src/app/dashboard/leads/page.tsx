import { redirect } from "next/navigation"
import { getCurrentUserId } from "@/lib/auth"
import { getLeadsByOwner } from "@/lib/db"
import LeadsClient from "./LeadsClient"

export default async function LeadsPage() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const leads = getLeadsByOwner(userId, { limit: 200 })

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Заявки</h1>
        <p style={{ fontSize: 14, color: "var(--op-text-secondary)" }}>
          Все обращения клиентов через AI-ассистента
        </p>
      </div>
      <LeadsClient initialLeads={leads} />
    </div>
  )
}
