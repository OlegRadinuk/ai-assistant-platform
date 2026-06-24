"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function genUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function getSessionId(): string {
  if (typeof window === "undefined") return genUUID()
  const key = "opti_landing_session"
  const stored = sessionStorage.getItem(key)
  if (stored) return stored
  const id = genUUID()
  sessionStorage.setItem(key, id)
  return id
}

// ── Sub-components ───────────────────────────────────────────────────────────

function OptiAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--op-accent) 0%, #ff6b35 100%)",
        boxShadow: "0 0 8px rgba(232,32,32,0.4)",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "36%",
          height: "36%",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.35)",
          top: "14%",
          left: "16%",
        }}
      />
    </div>
  )
}

function TypingDots() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "10px 14px",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--op-text-muted)",
            animation: `optiDotLanding 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user"
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: "flex",
        gap: 8,
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-end",
      }}
    >
      {!isUser && <OptiAvatar size={26} />}
      <div
        style={{
          maxWidth: "80%",
          padding: "9px 13px",
          borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          background: isUser
            ? "rgba(232,32,32,0.15)"
            : "rgba(255,255,255,0.04)",
          border: isUser
            ? "1px solid rgba(232,32,32,0.3)"
            : "1px solid var(--op-border)",
          color: "var(--op-text-primary)",
          fontSize: "0.875rem",
          lineHeight: 1.55,
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        {msg.content}
      </div>
    </motion.div>
  )
}

// ── Quick-reply chips ────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  "Сколько стоит?",
  "Как подключить к сайту?",
  "Есть бесплатный период?",
  "Для каких сфер подходит?",
]

// ── Main component ───────────────────────────────────────────────────────────

export default function HeroChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Привет! Я Опти — могу рассказать, как работает платформа, и помочь подобрать тариф. Что вас интересует?",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [quickRepliesUsed, setQuickRepliesUsed] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sessionId = useRef<string>("")
  const isAtBottom = useRef(true)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // keyboard offset for iOS
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  useEffect(() => {
    sessionId.current = getSessionId()
  }, [])

  // auto-scroll
  useEffect(() => {
    if (isAtBottom.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" })
    }
  }, [messages, isTyping])

  // iOS keyboard offset via visualViewport
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return
    const vv = window.visualViewport
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKeyboardOffset(offset)
    }
    update()
    vv.addEventListener("resize", update)
    vv.addEventListener("scroll", update)
    return () => {
      vv.removeEventListener("resize", update)
      vv.removeEventListener("scroll", update)
    }
  }, [])

  const handleScroll = () => {
    const el = messagesContainerRef.current
    if (!el) return
    isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  }

  const sendToApi = useCallback(async (msgs: ChatMessage[]) => {
    setIsTyping(true)
    isAtBottom.current = true

    try {
      const res = await fetch("/api/bots/opti/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs, sessionId: sessionId.current }),
      })

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ""
      let firstChunk = true

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        assistantText += chunk

        if (firstChunk && assistantText.trim()) {
          firstChunk = false
          setIsTyping(false)
          setMessages((prev) => [...prev, { role: "assistant", content: assistantText }])
        } else if (!firstChunk) {
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: "assistant", content: assistantText }
            return updated
          })
        }
      }

      if (firstChunk) setIsTyping(false)
    } catch (err) {
      console.error("[HeroChatPanel] error:", err)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Что-то пошло не так. Попробуйте ещё раз." },
      ])
    }
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isTyping) return

      setQuickRepliesUsed(true)
      const newMsgs: ChatMessage[] = [...messages, { role: "user", content: trimmed }]
      setMessages(newMsgs)
      setInput("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
      await sendToApi(newMsgs)
    },
    [isTyping, messages, sendToApi],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage(input)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = "auto"
      ta.style.height = `${Math.min(ta.scrollHeight, 88)}px`
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--op-bg-card)",
        border: "1px solid var(--op-border)",
        borderRadius: "var(--op-radius-xl)",
        overflow: "hidden",
        boxShadow:
          "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(232,32,32,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
        paddingBottom: keyboardOffset,
        transition: "padding-bottom 0.2s ease",
      }}
    >
      {/* Top accent line */}
      <div
        aria-hidden="true"
        style={{
          height: 2,
          background: "linear-gradient(90deg, var(--op-accent), #ff6b35)",
          flexShrink: 0,
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--op-border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <OptiAvatar size={34} />
        <div>
          <div
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "var(--op-text-primary)",
              lineHeight: 1.2,
            }}
          >
            Опти
          </div>
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--op-text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginTop: 2,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--op-success)",
              }}
            />
            Онлайн · AI-консультант платформы
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.08) transparent",
          minHeight: 0,
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <MessageBubble key={i} msg={m} />
          ))}
        </AnimatePresence>

        {isTyping && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <OptiAvatar size={26} />
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--op-border)",
                borderRadius: "14px 14px 14px 4px",
              }}
            >
              <TypingDots />
            </div>
          </div>
        )}

        {/* Quick replies — show only until user sends first message */}
        {!quickRepliesUsed && messages.length === 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 4 }}>
            {QUICK_REPLIES.map((r) => (
              <button
                key={r}
                onClick={() => void sendMessage(r)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(232,32,32,0.35)",
                  borderRadius: 20,
                  padding: "5px 12px",
                  fontSize: "0.78rem",
                  color: "var(--op-accent)",
                  cursor: "pointer",
                  lineHeight: 1.4,
                  transition: "background 160ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(232,32,32,0.08)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* CTA link */}
      <div
        style={{
          padding: "10px 14px 0",
          flexShrink: 0,
          borderTop: "1px solid var(--op-border)",
        }}
      >
        <a
          href="/signup"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 16px",
            background: "var(--op-accent)",
            color: "#fff",
            borderRadius: "var(--op-radius-md)",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            transition: "background 150ms",
            width: "100%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--op-accent-hover)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--op-accent)"
          }}
        >
          Создать своего за 10 минут
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>

      {/* Privacy note */}
      <div
        style={{
          padding: "4px 14px 0",
          flexShrink: 0,
        }}
      >
        <p style={{ fontSize: 11, color: "var(--op-text-muted)", margin: 0, lineHeight: 1.4 }}>
          Диалог сохраняется.{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--op-text-muted)", textDecoration: "underline" }}
          >
            Политика конфиденциальности
          </a>
        </p>
      </div>

      {/* Input */}
      <div
        style={{
          padding: "10px 14px",
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          flexShrink: 0,
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Задайте вопрос про платформу…"
          rows={1}
          style={{
            flex: 1,
            background: "var(--op-bg-elevated)",
            border: "1px solid var(--op-border)",
            borderRadius: "var(--op-radius-md)",
            padding: "9px 12px",
            color: "var(--op-text-primary)",
            fontSize: "0.875rem",
            lineHeight: 1.5,
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
            maxHeight: 88,
            minHeight: 40,
            overflowY: "auto",
            transition: "border-color 160ms",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(232,32,32,0.4)"
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--op-border)"
          }}
        />
        <button
          onClick={() => void sendMessage(input)}
          disabled={!input.trim() || isTyping}
          aria-label="Отправить"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            cursor: input.trim() && !isTyping ? "pointer" : "default",
            background:
              input.trim() && !isTyping
                ? "var(--op-accent)"
                : "var(--op-bg-elevated)",
            color: input.trim() && !isTyping ? "#fff" : "var(--op-text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            opacity: input.trim() && !isTyping ? 1 : 0.5,
            transition: "background 0.15s ease, opacity 0.15s ease",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes optiDotLanding {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40%           { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
