"use client"

import { useEffect, useState } from "react"

type LeadStatus = "new" | "working" | "closed"

interface Lead {
  id: number
  name: string | null
  phone: string | null
  email: string | null
  message: string | null
  status: LeadStatus
  source: string | null
  created_at: string
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; bg: string; color: string; border: string }> = {
  new: { label: "Новая", bg: "rgba(232,32,32,0.1)", color: "var(--op-accent)", border: "rgba(232,32,32,0.25)" },
  working: { label: "В работе", bg: "rgba(99,102,241,0.1)", color: "#818cf8", border: "rgba(99,102,241,0.25)" },
  closed: { label: "Закрыта", bg: "rgba(34,197,94,0.08)", color: "#4ade80", border: "rgba(34,197,94,0.2)" },
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 10px",
      borderRadius: 9999, background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`, fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
    }} aria-label={`Статус: ${cfg.label}`}>
      {cfg.label}
    </span>
  )
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  created_at: string
}

function LeadDrawer({ lead, onClose, onStatusChange }: {
  lead: Lead
  onClose: () => void
  onStatusChange: (id: number, status: LeadStatus) => void
}) {
  const [changingStatus, setChangingStatus] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(true)

  useEffect(() => {
    setLoadingMsgs(true)
    fetch(`/api/dashboard/messages?leadId=${lead.id}`)
      .then((r) => r.ok ? r.json() : { messages: [] })
      .then((data: { messages: ChatMessage[] }) => {
        setMessages(data.messages ?? [])
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false))
  }, [lead.id])

  async function handleStatusChange(newStatus: LeadStatus) {
    setChangingStatus(true)
    try {
      const res = await fetch(`/api/dashboard/leads`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, status: newStatus }),
      })
      if (res.ok) onStatusChange(lead.id, newStatus)
    } catch { /* ignore */ }
    setChangingStatus(false)
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)", zIndex: 200,
        }}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Заявка — ${lead.name ?? "Без имени"}`}
        style={{
          position: "fixed", right: 0, top: 0, bottom: 0, width: 420,
          maxWidth: "100vw", background: "var(--op-bg-card)", zIndex: 201,
          display: "flex", flexDirection: "column",
          boxShadow: "-12px 0 48px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{
          height: 60, padding: "0 20px", display: "flex", alignItems: "center", gap: 12,
          borderBottom: "1px solid var(--op-border)", flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: "rgba(232,32,32,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--op-accent)" }}>
              {(lead.name ?? "?").charAt(0)}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{lead.name ?? "Без имени"}</div>
            <div style={{ fontSize: 12, color: "var(--op-text-muted)" }}>
              {new Date(lead.created_at).toLocaleString("ru-RU")}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,0.06)", border: "1px solid var(--op-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--op-text-secondary)", flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="2" y1="2" x2="10" y2="10" /><line x1="10" y1="2" x2="2" y2="10" />
            </svg>
          </button>
        </div>

        {/* Status */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--op-border)", flexShrink: 0 }}>
          <StatusBadge status={lead.status} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Contact info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {lead.phone && (
              <div>
                <div style={{ fontSize: 11, color: "var(--op-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Телефон</div>
                <a href={`tel:${lead.phone}`} style={{ fontSize: 14, color: "var(--op-accent)", textDecoration: "none" }}>{lead.phone}</a>
              </div>
            )}
            {lead.email && (
              <div>
                <div style={{ fontSize: 11, color: "var(--op-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Email</div>
                <a href={`mailto:${lead.email}`} style={{ fontSize: 14, color: "var(--op-accent)", textDecoration: "none" }}>{lead.email}</a>
              </div>
            )}
            {lead.source && (
              <div>
                <div style={{ fontSize: 11, color: "var(--op-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Источник</div>
                <div style={{ fontSize: 14, color: "var(--op-text-secondary)" }}>{lead.source}</div>
              </div>
            )}
          </div>

          {/* Chat history */}
          <div>
            <div style={{ fontSize: 11, color: "var(--op-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
              Переписка с ботом
            </div>
            {loadingMsgs ? (
              <div style={{ fontSize: 13, color: "var(--op-text-muted)" }}>Загружаем историю…</div>
            ) : messages.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--op-text-muted)" }}>История переписки недоступна</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {messages.map((msg, i) => {
                  const isUser = msg.role === "user"
                  return (
                    <div key={i} style={{
                      display: "flex", flexDirection: isUser ? "row-reverse" : "row",
                      gap: 6, alignItems: "flex-end",
                    }}>
                      {!isUser && (
                        <div style={{
                          width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                          background: "linear-gradient(135deg, #e82020, #ff4a4a)",
                        }} aria-hidden="true" />
                      )}
                      <div style={{
                        maxWidth: "82%", padding: "8px 12px", fontSize: 13, lineHeight: 1.5,
                        borderRadius: isUser ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                        background: isUser ? "rgba(232,32,32,0.12)" : "rgba(255,255,255,0.05)",
                        border: isUser ? "1px solid rgba(232,32,32,0.2)" : "1px solid rgba(255,255,255,0.07)",
                        color: "var(--op-text-primary)",
                        wordBreak: "break-word",
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid var(--op-border)", padding: "16px 20px",
          display: "flex", flexDirection: "column", gap: 8, flexShrink: 0,
          paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
        }}>
          <div style={{ fontSize: 12, color: "var(--op-text-muted)", marginBottom: 4 }}>Сменить статус:</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["new", "working", "closed"] as LeadStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={changingStatus || lead.status === s}
                className="btn btn-ghost"
                style={{
                  fontSize: 13, padding: "6px 12px", flex: 1,
                  opacity: lead.status === s ? 0.4 : 1,
                  color: STATUS_CONFIG[s].color,
                  borderColor: `${STATUS_CONFIG[s].color}55`,
                }}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ justifyContent: "center", height: 38, fontSize: 14 }}>
            Закрыть
          </button>
        </div>
      </div>
    </>
  )
}

export default function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [filter, setFilter] = useState<"all" | LeadStatus>("all")
  const [search, setSearch] = useState("")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const filtered = leads.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false
    if (search && !(l.name ?? "").toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleStatusChange = (id: number, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l))
    if (selectedLead?.id === id) setSelectedLead((prev) => prev ? { ...prev, status } : null)
  }

  const tabs: { key: "all" | LeadStatus; label: string }[] = [
    { key: "all", label: "Все" },
    { key: "new", label: "Новые" },
    { key: "working", label: "В работе" },
    { key: "closed", label: "Закрытые" },
  ]

  return (
    <>
      {/* Filter bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, marginBottom: 20, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--op-border)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: "8px 16px", background: "transparent", border: "none",
                borderBottom: filter === tab.key ? "2px solid var(--op-accent)" : "2px solid transparent",
                fontSize: 14,
                color: filter === tab.key ? "var(--op-text-primary)" : "var(--op-text-secondary)",
                fontWeight: filter === tab.key ? 600 : 400,
                marginBottom: -1, transition: "color 160ms, border-color 160ms",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Поиск по имени..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Поиск по имени"
          style={{
            background: "var(--op-bg-card)", border: "1px solid var(--op-border)",
            borderRadius: 8, padding: "8px 12px", fontSize: 14,
            color: "var(--op-text-primary)", outline: "none", width: 200,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,32,32,0.4)" }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--op-border)" }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--op-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 18, color: "var(--op-text-secondary)", marginBottom: 8 }}>Заявок нет</h3>
          <p style={{ fontSize: 14, color: "var(--op-text-muted)" }}>
            Когда клиент напишет ассистенту — заявка появится здесь
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="leads-table">
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
              <thead>
                <tr>
                  {["Клиент", "Сообщение", "Статус", "Дата", ""].map((h) => (
                    <th key={h} style={{
                      fontFamily: "monospace", fontSize: 11, color: "var(--op-text-muted)",
                      fontWeight: 500, padding: "0 12px 10px", textAlign: "left",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id}>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--op-border)" }}>
                      <div style={{ fontWeight: 500 }}>{lead.name || "Без имени"}</div>
                      <div style={{ fontSize: 12, color: "var(--op-text-muted)" }}>
                        {lead.phone ?? lead.email ?? ""}
                      </div>
                    </td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--op-border)", maxWidth: 260 }}>
                      <div style={{
                        fontSize: 14, color: "var(--op-text-secondary)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {lead.message?.slice(0, 60) ?? "—"}
                      </div>
                    </td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--op-border)" }}>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--op-border)" }}>
                      <span style={{ fontSize: 12, color: "var(--op-text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(lead.created_at).toLocaleDateString("ru-RU")}
                      </span>
                    </td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--op-border)" }}>
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="btn btn-ghost"
                        style={{ height: 32, padding: "0 12px", fontSize: 13 }}
                      >
                        Открыть
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="leads-cards" style={{ display: "none", flexDirection: "column", gap: 10 }}>
            {filtered.map((lead) => (
              <div key={lead.id} style={{
                background: "var(--op-bg-card)", border: "1px solid var(--op-border)",
                borderRadius: "var(--op-radius-md)", padding: 16,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(232,32,32,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--op-accent)" }}>
                      {(lead.name ?? "?").charAt(0)}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500 }}>{lead.name ?? "Без имени"}</div>
                    <div style={{ fontSize: 12, color: "var(--op-text-muted)" }}>
                      {lead.phone ?? lead.email ?? ""}
                    </div>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
                {lead.message && (
                  <p style={{ fontSize: 13, color: "var(--op-text-secondary)", marginBottom: 12, lineHeight: 1.4 }}>
                    {lead.message.slice(0, 80)}
                  </p>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--op-text-muted)" }}>
                    {new Date(lead.created_at).toLocaleDateString("ru-RU")}
                  </span>
                  <button onClick={() => setSelectedLead(lead)} className="btn btn-ghost" style={{ height: 32, padding: "0 12px", fontSize: 13 }}>
                    Открыть
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      <style>{`
        @media (max-width: 767px) {
          .leads-table { display: none !important; }
          .leads-cards { display: flex !important; }
        }
      `}</style>
    </>
  )
}
