"use client"

import { useState } from "react"
import Link from "next/link"
import { buildWidgetSnippet } from "@/lib/widget-snippet"

interface BillingStatus {
  state: "trial" | "active" | "expired"
  daysLeft: number | null
  plan: "auto" | "integration"
}

interface Assistant {
  id: number
  slug: string
  name: string
  role: string
  industry: string
  active: number
  widget_color: string
  widget_title: string
  created_at: string
  billingStatus: BillingStatus
}

interface Props {
  assistants: Assistant[]
  baseUrl: string
}

function BillingBadge({ billing }: { billing: BillingStatus }) {
  if (billing.state === "trial") {
    return (
      <span style={{
        padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 500,
        background: "rgba(99,102,241,0.1)", color: "#818cf8",
        border: "1px solid rgba(99,102,241,0.25)", whiteSpace: "nowrap",
      }}>
        Триал · {billing.daysLeft ?? 0} дн.
      </span>
    )
  }
  if (billing.state === "active") {
    return (
      <span style={{
        padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 500,
        background: "rgba(34,197,94,0.08)", color: "#4ade80",
        border: "1px solid rgba(34,197,94,0.2)", whiteSpace: "nowrap",
      }}>
        Активен
        {billing.daysLeft != null ? ` · ${billing.daysLeft} дн.` : ""}
      </span>
    )
  }
  // expired
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 500,
      background: "rgba(232,32,32,0.1)", color: "var(--op-accent)",
      border: "1px solid rgba(232,32,32,0.25)", whiteSpace: "nowrap",
    }}>
      Остановлен — нужна оплата
    </span>
  )
}

function buildSnippet(slug: string, baseUrl: string): string {
  return buildWidgetSnippet(slug, baseUrl)
}

function SnippetModal({ snippet, onClose }: { snippet: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)", zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--op-bg-card)", border: "1px solid var(--op-border)",
          borderRadius: "var(--op-radius-lg)", padding: 24, width: "100%", maxWidth: 560,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Код виджета</h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--op-text-secondary)", cursor: "pointer", fontSize: 20 }}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{
            background: "var(--op-bg)", border: "1px solid var(--op-border)", borderRadius: 8,
            padding: "12px 52px 12px 16px",
            fontFamily: "monospace", fontSize: 13, color: "var(--op-text-primary)",
            overflowX: "auto", whiteSpace: "nowrap",
          }}>
            {snippet}
          </div>
          <button
            onClick={handleCopy}
            style={{
              position: "absolute", top: 8, right: 8, background: "var(--op-bg-elevated)",
              border: "1px solid var(--op-border)", borderRadius: 6, padding: "4px 10px",
              fontSize: 12, color: copied ? "#22c55e" : "var(--op-text-secondary)", transition: "color 0.2s",
            }}
          >
            {copied ? (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Скопировано
              </span>
            ) : "Копировать"}
          </button>
        </div>
        <p style={{ fontSize: 12, color: "var(--op-text-muted)", marginTop: 12, lineHeight: 1.5 }}>
          Вставьте этот код перед &lt;/body&gt; на вашем сайте.
          Работает на Tilda, WordPress, любом конструкторе.
        </p>
      </div>
    </div>
  )
}

export default function AssistantsClient({ assistants, baseUrl }: Props) {
  const [snippetFor, setSnippetFor] = useState<string | null>(null)
  const [toggleLoading, setToggleLoading] = useState<number | null>(null)
  const [localActive, setLocalActive] = useState<Record<number, boolean>>(
    Object.fromEntries(assistants.map((a) => [a.id, a.active === 1]))
  )

  const roleLabel: Record<string, string> = {
    admin: "Администратор", consultant: "Консультант",
    sales: "Продажи", support: "Поддержка",
  }

  async function handleToggle(id: number) {
    setToggleLoading(id)
    const newActive = !localActive[id]
    try {
      const res = await fetch(`/api/assistants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive ? 1 : 0 }),
      })
      if (res.ok) {
        setLocalActive((prev) => ({ ...prev, [id]: newActive }))
      }
    } catch { /* ignore */ }
    setToggleLoading(null)
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {assistants.map((a) => (
          <div
            key={a.id}
            style={{
              padding: "20px 24px", background: "var(--op-bg-card)",
              border: "1px solid var(--op-border)", borderRadius: "var(--op-radius-lg)",
            }}
          >
            <div className="assistant-row" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{a.name}</h3>
                  <span style={{
                    padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 500,
                    background: localActive[a.id] ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.06)",
                    color: localActive[a.id] ? "#22c55e" : "var(--op-text-muted)",
                    border: `1px solid ${localActive[a.id] ? "rgba(34,197,94,0.3)" : "var(--op-border)"}`,
                  }}>
                    {localActive[a.id] ? "Вкл" : "Откл"}
                  </span>
                  <BillingBadge billing={a.billingStatus} />
                </div>
                <div style={{ fontSize: 13, color: "var(--op-text-secondary)" }}>
                  {roleLabel[a.role] ?? a.role} · {a.industry}
                </div>
                <div style={{ fontSize: 12, color: "var(--op-text-muted)", marginTop: 4, fontFamily: "monospace" }}>
                  /chat/{a.slug}
                </div>
                {a.billingStatus.state === "expired" && (
                  <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <a
                      href="https://t.me/aleg_rad"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
                        background: "rgba(232,32,32,0.15)", color: "var(--op-accent)",
                        border: "1px solid rgba(232,32,32,0.3)", textDecoration: "none",
                        transition: "background 160ms",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      Оплатить — @aleg_rad
                    </a>
                    <a
                      href="tel:+79785768451"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 500,
                        background: "rgba(255,255,255,0.05)", color: "var(--op-text-secondary)",
                        border: "1px solid var(--op-border)", textDecoration: "none",
                      }}
                    >
                      +79785768451
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="assistant-actions" style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                <Link
                  href={`${baseUrl}/chat/${a.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ fontSize: 13, padding: "6px 14px" }}
                >
                  Открыть чат
                </Link>
                <button
                  onClick={() => setSnippetFor(buildSnippet(a.slug, baseUrl))}
                  className="btn btn-ghost"
                  style={{ fontSize: 13, padding: "6px 14px" }}
                >
                  Сниппет
                </button>
                <button
                  onClick={() => handleToggle(a.id)}
                  disabled={toggleLoading === a.id}
                  className="btn btn-ghost"
                  style={{
                    fontSize: 13, padding: "6px 14px",
                    color: localActive[a.id] ? "var(--op-warning)" : "var(--op-success)",
                    borderColor: localActive[a.id] ? "var(--op-warning)" : "var(--op-success)",
                    opacity: toggleLoading === a.id ? 0.5 : 1,
                  }}
                >
                  {toggleLoading === a.id ? "…" : localActive[a.id] ? "Отключить" : "Включить"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {snippetFor !== null && (
        <SnippetModal snippet={snippetFor} onClose={() => setSnippetFor(null)} />
      )}

      <style>{`
        @media (max-width: 640px) {
          .assistant-row { flex-direction: column; }
          .assistant-actions { width: 100%; }
        }
      `}</style>
    </>
  )
}
