"use client"

import { useState, useRef, useEffect, use } from "react"
import Image from "next/image"
import Link from "next/link"

type Msg = { role: "user" | "assistant"; content: string }

// ── Contact form (152-ФЗ consent required) ────────────────────────────────────

function ContactForm({ slug, onSent }: { slug: string; onSent: () => void }) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [pdConsent, setPdConsent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pdConsent) {
      setError("Необходимо согласие на обработку персональных данных")
      return
    }
    setSending(true)
    setError("")
    try {
      const res = await fetch(`/api/bots/${slug}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, pdConsent: true, consentVersion: "1.0" }),
      })
      if (res.ok) {
        setSent(true)
        onSent()
      } else {
        setError("Ошибка отправки. Попробуйте снова.")
      }
    } catch {
      setError("Ошибка сети.")
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div style={{
        padding: "14px 16px", background: "rgba(34,197,94,0.08)",
        border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12,
        fontSize: 14, color: "#4ade80", textAlign: "center",
      }}>
        Спасибо! Мы свяжемся с вами в ближайшее время.
      </div>
    )
  }

  return (
    <div style={{
      background: "var(--op-bg-card)", border: "1px solid var(--op-border)",
      borderRadius: 12, padding: 16,
    }}>
      <p style={{ fontSize: 13, color: "var(--op-text-secondary)", marginBottom: 12 }}>
        Оставьте контакт — мы ответим:
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ваше имя"
          required
          style={contactInputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,32,32,0.5)" }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)" }}
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Телефон или Telegram"
          required
          style={contactInputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,32,32,0.5)" }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)" }}
        />

        {/* 152-ФЗ Consent */}
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={pdConsent}
            onChange={(e) => setPdConsent(e.target.checked)}
            required
            style={{ width: 16, height: 16, marginTop: 2, accentColor: "var(--op-accent)", flexShrink: 0 }}
            aria-required="true"
          />
          <span style={{ fontSize: 12, color: "var(--op-text-muted)", lineHeight: 1.5 }}>
            Даю согласие на обработку персональных данных (152-ФЗ).{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--op-accent)", textDecoration: "none" }}
              onClick={(e) => e.stopPropagation()}
            >
              Политика конфиденциальности
            </a>
          </span>
        </label>

        {error && (
          <p role="alert" aria-live="polite" style={{ fontSize: 12, color: "var(--op-danger)", margin: 0 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending || !pdConsent}
          className="btn btn-primary"
          style={{ opacity: (!pdConsent || sending) ? 0.6 : 1 }}
        >
          {sending ? "Отправляем…" : "Отправить"}
        </button>
      </form>
    </div>
  )
}

const contactInputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, color: "var(--op-text-primary)",
  fontSize: "0.875rem", outline: "none", transition: "border-color 0.15s",
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user"
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0, marginRight: 8, marginBottom: "auto",
          background: "linear-gradient(135deg, #e82020, #ff4a4a)",
          boxShadow: "0 0 8px rgba(232,32,32,0.4)",
        }} aria-hidden="true" />
      )}
      <div style={{
        maxWidth: "78%", padding: "10px 14px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? "rgba(232,32,32,0.18)" : "rgba(255,255,255,0.04)",
        border: isUser ? "1px solid rgba(232,32,32,0.35)" : "1px solid rgba(255,255,255,0.08)",
        color: "var(--op-text-primary)", fontSize: "0.9375rem",
        lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>
        {msg.content}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function ChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactSent, setContactSent] = useState(false)
  const [botName, setBotName] = useState("AI-ассистент")
  const [sessionId] = useState(() => `s-${Math.random().toString(36).slice(2)}`)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  // iOS keyboard offset
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return
    const vv = window.visualViewport!
    const update = () => setKeyboardOffset(Math.max(0, window.innerHeight - vv.height - vv.offsetTop))
    update()
    vv.addEventListener("resize", update)
    vv.addEventListener("scroll", update)
    return () => { vv.removeEventListener("resize", update); vv.removeEventListener("scroll", update) }
  }, [])

  // Load greeting
  useEffect(() => {
    fetch(`/api/bots/${slug}/config`)
      .then((r) => r.ok ? r.json() : null)
      .then((cfg) => {
        if (cfg?.greeting) setMessages([{ role: "assistant", content: cfg.greeting }])
        if (cfg?.name) setBotName(cfg.name)
      })
      .catch(() => {})
  }, [slug])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" })
  }, [messages, streaming])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || streaming) return
    setInput("")

    const newMessages: Msg[] = [...messages, { role: "user", content: text }]
    setMessages(newMessages)
    setStreaming(true)

    // Check if user is asking to leave contact
    const contactKeywords = ["контакт", "связаться", "позвонить", "телефон", "оставить"]
    if (contactKeywords.some((kw) => text.toLowerCase().includes(kw)) && !contactSent) {
      setShowContactForm(true)
    }

    try {
      const res = await fetch(`/api/bots/${slug}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, sessionId }),
      })

      if (!res.ok || !res.body) {
        setMessages((m) => [...m, { role: "assistant", content: "Ошибка соединения. Попробуйте снова." }])
        return
      }

      setMessages((m) => [...m, { role: "assistant", content: "" }])
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages((m) => {
          const updated = [...m]
          updated[updated.length - 1] = { role: "assistant", content: full }
          return updated
        })
      }

      // After first real response, offer contact form
      if (newMessages.length >= 3 && !showContactForm && !contactSent) {
        setTimeout(() => setShowContactForm(true), 2000)
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Ошибка соединения." }])
    } finally {
      setStreaming(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes optiPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(232,32,32,0.5); }
          50% { box-shadow: 0 0 16px rgba(255,74,74,0.7); }
        }
        @keyframes typingDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>

      <main style={{ display: "flex", flexDirection: "column", height: "100dvh", maxWidth: 760, margin: "0 auto" }}>
        {/* Header */}
        <header style={{
          padding: "0 16px", height: 60, flexShrink: 0,
          borderBottom: "1px solid var(--op-border)", background: "var(--op-bg-card)",
          display: "flex", alignItems: "center", gap: 12,
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
            <Image src="/optisphere-logo-dark.png" alt="Optisphere" width={100} height={22} style={{ height: 20, width: "auto" }} />
          </Link>
          <div style={{ width: 1, height: 24, background: "var(--op-border)", flexShrink: 0 }} />
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #e82020, #ff4a4a)",
            animation: "optiPulse 2.5s ease-in-out infinite",
          }} aria-hidden="true" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{botName}</div>
            <div style={{ fontSize: 12, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} aria-hidden="true" />
              Онлайн
            </div>
          </div>
        </header>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "20px 16px",
          display: "flex", flexDirection: "column", gap: 12,
          scrollbarWidth: "thin",
        }}>
          {messages.length === 0 && (
            <p style={{ color: "var(--op-text-muted)", textAlign: "center", marginTop: 40, fontSize: 14 }}>
              Напишите вопрос — ассистент ответит за секунды.
            </p>
          )}

          {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}

          {/* Typing indicator */}
          {streaming && messages[messages.length - 1]?.content === "" && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #e82020, #ff4a4a)", flexShrink: 0 }} aria-hidden="true" />
              <div style={{
                padding: "12px 16px", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px 16px 16px 4px",
                display: "flex", gap: 4,
              }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{
                    width: 7, height: 7, borderRadius: "50%", background: "var(--op-text-muted)",
                    animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Contact form */}
          {showContactForm && !contactSent && (
            <div style={{ maxWidth: 400 }}>
              <ContactForm slug={slug} onSent={() => { setContactSent(true); setShowContactForm(false) }} />
            </div>
          )}
          {contactSent && (
            <div style={{
              padding: "10px 14px", background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12,
              fontSize: 14, color: "#4ade80", maxWidth: 340,
            }}>
              Контакт получен! Мы свяжемся с вами.
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "12px 16px", borderTop: "1px solid var(--op-border)",
            background: "var(--op-bg-card)", display: "flex", gap: 10,
            flexShrink: 0, paddingBottom: `calc(12px + ${keyboardOffset}px + env(safe-area-inset-bottom))`,
          }}
        >
          {!showContactForm && !contactSent && (
            <button
              type="button"
              onClick={() => setShowContactForm(true)}
              title="Оставить контакт"
              style={{
                width: 40, height: 40, borderRadius: "var(--op-radius-md)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--op-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, color: "var(--op-text-muted)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
            </button>
          )}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Напишите вопрос…"
            disabled={streaming}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSubmit(e) } }}
            style={{
              flex: 1, padding: "10px 14px",
              background: "var(--op-bg-elevated)", border: "1px solid var(--op-border)",
              borderRadius: "var(--op-radius-md)", color: "var(--op-text-primary)",
              fontSize: "0.9375rem", outline: "none", transition: "border-color 0.15s",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,32,32,0.5)" }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--op-border)" }}
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            aria-label="Отправить"
            style={{
              width: 42, height: 40, borderRadius: "var(--op-radius-md)",
              background: "linear-gradient(135deg, #e82020, #ff4a4a)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: (streaming || !input.trim()) ? 0.5 : 1,
              transition: "opacity 0.15s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22 2L11 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </main>
    </>
  )
}
