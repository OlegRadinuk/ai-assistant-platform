import { redirect } from "next/navigation"
import { getCurrentUserId } from "@/lib/auth"
import { getOwnerStats, getAssistantsByOwner, getLeadsByOwner, getAssistantStatus } from "@/lib/db"
import type { AssistantStatus } from "@/lib/db"
import Link from "next/link"

export default async function DashboardPage() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const stats = getOwnerStats(userId)
  const assistantsRaw = getAssistantsByOwner(userId)
  const assistants = assistantsRaw.map((a) => ({ ...a, billingStatus: getAssistantStatus(a) }))
  const hotLeads = getLeadsByOwner(userId, { status: "new", limit: 3 })

  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000"

  const statCards = [
    {
      label: "Ассистентов",
      value: stats.totalAssistants,
      sub: "активных",
      accent: false,
    },
    {
      label: "Новых заявок",
      value: stats.newLeads,
      sub: "ждут обработки",
      accent: stats.newLeads > 0,
    },
    {
      label: "Всего заявок",
      value: stats.totalLeads,
      sub: "за всё время",
      accent: false,
    },
    {
      label: "Диалогов",
      value: stats.totalSessions,
      sub: "всего сессий",
      accent: false,
    },
  ]

  const statusLabel: Record<string, string> = { new: "Новая", working: "В работе", closed: "Закрыта" }
  const statusColor: Record<string, string> = { new: "var(--op-accent)", working: "var(--op-warning)", closed: "var(--op-success)" }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Обзор</h1>
          <p style={{ fontSize: 14, color: "var(--op-text-secondary)" }}>
            Общая картина по вашим AI-сотрудникам
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "block", width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.7)" }} aria-hidden="true" />
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#22c55e" }}>ОНЛАЙН</span>
        </div>
      </div>

      {/* Stat cards */}
      <div data-tour="tour-stats" className="dash-stat-cards" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {statCards.map((s) => (
          <div
            key={s.label}
            style={{
              background: s.accent
                ? "linear-gradient(135deg, rgba(232,32,32,0.15), rgba(255,74,74,0.08))"
                : "var(--op-bg-card)",
              border: `1px solid ${s.accent ? "rgba(232,32,32,0.3)" : "var(--op-border)"}`,
              borderRadius: "var(--op-radius-lg)",
              padding: "20px 24px",
              display: "flex", flexDirection: "column", gap: 6,
            }}
          >
            <div style={{ fontSize: 12, color: "var(--op-text-muted)" }}>{s.label}</div>
            <div style={{
              fontFamily: "monospace", fontSize: 36, fontWeight: 700, lineHeight: 1,
              color: s.accent ? "var(--op-accent)" : "var(--op-text-primary)",
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--op-text-secondary)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Hot leads */}
      {hotLeads.length > 0 && (
        <section data-tour="tour-leads">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Требуют обработки</h2>
            <span style={{
              width: 22, height: 22, borderRadius: "50%", background: "var(--op-accent)", color: "#fff",
              fontFamily: "monospace", fontSize: 11, fontWeight: 700,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }} aria-label={`${hotLeads.length} заявок`}>
              {hotLeads.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {hotLeads.map((lead) => (
              <div key={lead.id} style={{
                padding: "14px 0", borderBottom: "1px solid var(--op-border)",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(232,32,32,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--op-accent)" }}>
                    {(lead.name || "?").charAt(0)}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{lead.name || "Без имени"}</div>
                  <div style={{ fontSize: 13, color: "var(--op-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {lead.message?.slice(0, 60) ?? "Нет сообщения"}
                  </div>
                </div>
                <span style={{
                  padding: "3px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
                  background: statusColor[lead.status] + "22", color: statusColor[lead.status],
                  border: `1px solid ${statusColor[lead.status]}55`,
                }}>
                  {statusLabel[lead.status] ?? lead.status}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/leads"
            style={{ display: "inline-block", marginTop: 14, fontSize: 14, color: "var(--op-accent)", textDecoration: "none" }}
          >
            Все заявки →
          </Link>
        </section>
      )}

      {/* Assistants quick list */}
      <section data-tour="tour-assistants">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Ваши ассистенты</h2>
          <Link href="/dashboard/assistants" style={{ fontSize: 14, color: "var(--op-accent)", textDecoration: "none" }}>
            Все →
          </Link>
        </div>
        {assistants.length === 0 ? (
          <div style={{
            padding: "40px", textAlign: "center",
            background: "var(--op-bg-card)", border: "1px solid var(--op-border)",
            borderRadius: "var(--op-radius-lg)",
          }}>
            <p style={{ color: "var(--op-text-secondary)", marginBottom: 16 }}>
              Ассистентов пока нет.
            </p>
            <Link href="/onboarding" className="btn btn-primary">Создать первого</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {assistants.slice(0, 3).map((a) => {
              const billing: AssistantStatus = a.billingStatus
              return (
                <div key={a.id} style={{
                  padding: "16px 20px", background: "var(--op-bg-card)",
                  border: `1px solid ${billing.state === "expired" ? "rgba(232,32,32,0.3)" : "var(--op-border)"}`,
                  borderRadius: "var(--op-radius-md)",
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
                  flexWrap: "wrap",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600 }}>{a.name}</span>
                      {billing.state === "trial" && (
                        <span style={{ padding: "1px 7px", borderRadius: 9999, fontSize: 11, fontWeight: 500, background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)" }}>
                          Триал · {billing.daysLeft ?? 0} дн.
                        </span>
                      )}
                      {billing.state === "active" && (
                        <span style={{ padding: "1px 7px", borderRadius: 9999, fontSize: 11, fontWeight: 500, background: "rgba(34,197,94,0.08)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>
                          Активен
                        </span>
                      )}
                      {billing.state === "expired" && (
                        <span style={{ padding: "1px 7px", borderRadius: 9999, fontSize: 11, fontWeight: 500, background: "rgba(232,32,32,0.1)", color: "var(--op-accent)", border: "1px solid rgba(232,32,32,0.25)" }}>
                          Остановлен
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--op-text-secondary)", marginTop: 2 }}>
                      {a.role} · {a.industry}
                    </div>
                    {billing.state === "expired" && (
                      <div style={{ marginTop: 6 }}>
                        <a href="https://t.me/aleg_rad" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--op-accent)", textDecoration: "none" }}>
                          Оплатить → @aleg_rad / +79785768451
                        </a>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <Link
                      href={`${baseUrl}/chat/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost"
                      style={{ fontSize: "0.8125rem", padding: "6px 14px" }}
                    >
                      Открыть чат
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <style>{`
        .dash-stat-cards { grid-template-columns: repeat(4, 1fr) !important; }
        @media (max-width: 900px) { .dash-stat-cards { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 500px) { .dash-stat-cards { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
