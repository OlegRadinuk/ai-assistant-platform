import { redirect } from "next/navigation"
import { getCurrentUserId } from "@/lib/auth"
import { getAssistantsByOwner, getAssistantStatus } from "@/lib/db"
import Link from "next/link"
import AssistantsClient from "./AssistantsClient"

export default async function AssistantsPage() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const assistants = getAssistantsByOwner(userId)
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000"

  const assistantsWithBilling = assistants.map((a) => ({
    ...a,
    billingStatus: getAssistantStatus(a),
  }))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Ассистенты</h1>
          <p style={{ fontSize: 14, color: "var(--op-text-secondary)" }}>
            Управляйте вашими AI-сотрудниками
          </p>
        </div>
        <Link href="/onboarding" className="btn btn-primary" style={{ fontSize: 14 }}>
          + Новый ассистент
        </Link>
      </div>

      {assistantsWithBilling.length === 0 ? (
        <div style={{
          padding: "60px 40px", textAlign: "center",
          background: "var(--op-bg-card)", border: "1px solid var(--op-border)",
          borderRadius: "var(--op-radius-lg)",
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--op-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><line x1="12" y1="3" x2="12" y2="11"/><circle cx="12" cy="16" r="1"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Ещё нет ассистентов</h3>
          <p style={{ color: "var(--op-text-secondary)", marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
            Создайте первого AI-сотрудника за 10 минут. Он будет отвечать клиентам и собирать заявки.
          </p>
          <Link href="/onboarding" className="btn btn-primary">
            Создать ассистента
          </Link>
        </div>
      ) : (
        <AssistantsClient assistants={assistantsWithBilling} baseUrl={baseUrl} />
      )}
    </div>
  )
}
