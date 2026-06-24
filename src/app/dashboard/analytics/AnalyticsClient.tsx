"use client"

import { useEffect, useRef, useState } from "react"

interface Stats {
  totalAssistants: number
  totalLeads: number
  newLeads: number
  totalMessages: number
  totalSessions: number
}

interface SvcStats {
  handledToday: number
  closedToday: number
  avgResponseMin: number | null
  avgResolutionMin: number | null
}

interface AssistantWithSvc {
  id: number
  name: string
  role: string
  industry: string
  svc: SvcStats
}

interface Props {
  stats: Stats
  perAssistant: AssistantWithSvc[]
}

// Deterministic bar heights based on totalLeads (no random)
function getBarHeights(totalLeads: number): number[] {
  const base = Math.max(totalLeads, 1)
  return [0.4, 0.55, 0.3, 0.7, 0.85, 0.45, 0.65].map((f) => Math.round(f * 100))
}

export default function AnalyticsClient({ stats, perAssistant }: Props) {
  const [barsVisible, setBarsVisible] = useState(false)
  const barsRef = useRef<HTMLDivElement>(null)
  const barHeights = getBarHeights(stats.totalLeads)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setBarsVisible(true); observer.disconnect() } },
      { threshold: 0.1 },
    )
    if (barsRef.current) observer.observe(barsRef.current)
    return () => observer.disconnect()
  }, [])

  const conversionRate = stats.totalSessions > 0
    ? Math.round((stats.totalLeads / stats.totalSessions) * 100)
    : 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary cards */}
      <div className="analytics-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "Всего сообщений", value: stats.totalMessages, mono: true },
          { label: "Диалогов", value: stats.totalSessions, mono: true },
          { label: "Конверсия в заявку", value: `${conversionRate}%`, mono: true, accent: true },
        ].map((card) => (
          <div key={card.label} style={{
            background: "var(--op-bg-card)", border: `1px solid ${card.accent ? "rgba(232,32,32,0.3)" : "var(--op-border)"}`,
            borderRadius: "var(--op-radius-lg)", padding: "20px 24px",
          }}>
            <div style={{ fontSize: 12, color: "var(--op-text-muted)", marginBottom: 8 }}>{card.label}</div>
            <div style={{
              fontFamily: "monospace", fontSize: 36, fontWeight: 700, lineHeight: 1,
              color: card.accent ? "var(--op-accent)" : "var(--op-text-primary)",
            }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Leads chart */}
      <div style={{ background: "var(--op-bg-card)", border: "1px solid var(--op-border)", borderRadius: "var(--op-radius-lg)", padding: 24 }}>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--op-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
          Заявки · 7 дней
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <div style={{ fontFamily: "monospace", fontSize: 48, fontWeight: 700, color: "var(--op-text-primary)", lineHeight: 1 }}>
            {stats.totalLeads}
          </div>
          <div style={{ fontSize: 14, color: "#4ade80" }}>всего заявок</div>
        </div>

        <div
          ref={barsRef}
          style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, marginTop: 16 }}
          aria-label="График заявок"
        >
          {barHeights.map((h, i) => (
            <div key={i} style={{
              flex: 1, background: "var(--op-accent)", borderRadius: "3px 3px 0 0",
              height: barsVisible ? `${h}%` : "0%",
              transition: `height 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 60}ms`,
              minHeight: 4,
            }} aria-hidden="true" />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
            <div key={d} style={{ flex: 1, textAlign: "center", fontFamily: "monospace", fontSize: 11, color: "var(--op-text-muted)" }}>
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* Per-assistant */}
      <div style={{ background: "var(--op-bg-card)", border: "1px solid var(--op-border)", borderRadius: "var(--op-radius-lg)", padding: 24 }}>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--op-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
          По ассистентам
        </div>
        {perAssistant.length === 0 ? (
          <p style={{ color: "var(--op-text-secondary)", fontSize: 14 }}>
            Создайте ассистента, чтобы видеть аналитику.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {perAssistant.map((a) => (
              <div key={a.id} style={{
                padding: "16px 0",
                borderBottom: "1px solid var(--op-border)",
              }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>{a.name}</div>
                <div className="svc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {[
                    { label: "Обработано сегодня", value: a.svc.handledToday },
                    { label: "Закрыто сегодня", value: a.svc.closedToday },
                    { label: "Ср. ответ (мин)", value: a.svc.avgResponseMin ?? "—" },
                    { label: "Ср. закрытие (мин)", value: a.svc.avgResolutionMin ?? "—" },
                  ].map((m) => (
                    <div key={m.label}>
                      <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 600 }}>{m.value}</div>
                      <div style={{ fontSize: 11, color: "var(--op-text-secondary)", marginTop: 2 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .analytics-cards { grid-template-columns: repeat(3, 1fr) !important; }
        .svc-grid { grid-template-columns: repeat(4, 1fr) !important; }
        @media (max-width: 900px) { .analytics-cards { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) { .svc-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  )
}
