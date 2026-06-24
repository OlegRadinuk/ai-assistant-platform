"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

// ── Types ──────────────────────────────────────────────────────────────────────

type MsgRole = "user" | "assistant"
interface Msg { role: MsgRole; content: string }

type UIStep = "welcome" | "role" | "industry" | "name" | "site" | "telegram" | "summary"

interface Config {
  role: string
  customRoleText?: string
  industry: string
  name: string
  websiteUrl?: string
  telegramConnected: boolean
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function OptiAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #e82020 0%, #ff4a4a 100%)",
        boxShadow: "0 0 10px rgba(232,32,32,0.45)",
        animation: "optiPulse 2.5s ease-in-out infinite",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", width: "36%", height: "36%", borderRadius: "50%", background: "rgba(255,255,255,0.22)", top: "14%", left: "17%" }} />
    </div>
  )
}

// ── Typing dots ───────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "12px 16px" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          display: "block", width: 8, height: 8, borderRadius: "50%",
          background: "var(--op-text-muted)",
          animation: `optiDot 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user"
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      style={{ display: "flex", gap: 8, flexDirection: isUser ? "row-reverse" : "row", alignItems: "flex-end" }}
    >
      {!isUser && <OptiAvatar size={28} />}
      <div style={{
        maxWidth: "85%", padding: "10px 14px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? "rgba(232,32,32,0.18)" : "rgba(255,255,255,0.04)",
        border: isUser ? "1px solid rgba(232,32,32,0.35)" : "1px solid rgba(255,255,255,0.08)",
        color: "var(--op-text-primary)",
        fontSize: "0.875rem", lineHeight: 1.6, wordBreak: "break-word", whiteSpace: "pre-wrap",
      }}>
        {msg.content}
      </div>
    </motion.div>
  )
}

// ── Quick reply chips ─────────────────────────────────────────────────────────

function QuickReplyChips({ chips, onSelect }: { chips: string[]; onSelect: (c: string) => void }) {
  return (
    <div role="group" aria-label="Варианты ответа" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {chips.map((chip) => (
        <button
          key={chip}
          onClick={() => onSelect(chip)}
          style={{
            fontSize: 14, padding: "8px 16px", borderRadius: 9999,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "var(--op-text-secondary)", whiteSpace: "nowrap",
            transition: "all 160ms",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(232,32,32,0.4)"; e.currentTarget.style.color = "var(--op-text-primary)" }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "var(--op-text-secondary)" }}
        >
          {chip}
        </button>
      ))}
    </div>
  )
}

// ── Progress sidebar ──────────────────────────────────────────────────────────

const STEP_ICONS: React.ReactNode[] = [
  // Settings / Role
  <svg key="role" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
  // Building / Industry
  <svg key="industry" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  // File / Name
  <svg key="name" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  // Globe / Site
  <svg key="site" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  // Message / Telegram
  <svg key="tg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  // Zap / Create
  <svg key="create" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
]

const STEP_LABELS: { label: string }[] = [
  { label: "Роль ассистента" },
  { label: "Сфера бизнеса" },
  { label: "Название бизнеса" },
  { label: "Сайт (опц.)" },
  { label: "Telegram" },
  { label: "Создание" },
]

const STEP_NUMS: Record<UIStep, number> = {
  welcome: 1, role: 2, industry: 3, name: 4, site: 5, telegram: 6, summary: 7,
}

function OnboardingProgress({ step }: { step: UIStep }) {
  const num = STEP_NUMS[step]
  const pct = Math.round((Math.max(0, num - 2) / 5) * 100)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--op-text-muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
          Архитектор · Шаг {Math.max(1, num - 1)} из 6
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--op-text-primary)", marginBottom: 8 }}>
          Настраиваем AI-сотрудника
        </h2>
        <p style={{ fontSize: 14, color: "var(--op-text-secondary)", lineHeight: 1.6 }}>
          Займёт 3–5 минут. По итогам создадим ассистента, который знает ваш бизнес.
        </p>
      </div>

      <div>
        <div style={{ fontSize: 12, color: "var(--op-text-muted)", marginBottom: 6 }}>
          {Math.max(1, num - 1)} из 6 шагов
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: "100%", background: "linear-gradient(90deg, #e82020, #ff4a4a)" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {STEP_LABELS.map((s, i) => {
          const stepNum = i + 2
          const isDone = num > stepNum + 1
          const isActive = num === stepNum
          return (
            <div key={s.label} style={{
              display: "flex", alignItems: "center", gap: 12, fontSize: 14,
              color: isDone ? "var(--op-text-muted)" : isActive ? "var(--op-text-primary)" : "rgba(255,255,255,0.2)",
              fontWeight: isActive ? 600 : 400,
            }}>
              <span style={{ width: 20, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isDone ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : STEP_ICONS[i]}
              </span>
              {s.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Chip sets ─────────────────────────────────────────────────────────────────

const ROLE_CHIPS = ["Администратор", "Консультант", "Продажи", "Поддержка", "Свой вариант"]
const INDUSTRY_CHIPS = ["Клиника / Медицина", "Отель / Гостиница", "Салон красоты", "Строительство", "Апартаменты / Аренда", "Образование", "Свой вариант"]
const SITE_CHIPS = ["Есть сайт, дам ссылку", "Сайта нет"]
const TG_CHIPS = ["Подключить Telegram", "Пропустить"]

function getChips(step: UIStep): string[] {
  if (step === "welcome") return ["Да, поехали!", "Расскажи подробнее"]
  if (step === "role") return ROLE_CHIPS
  if (step === "industry") return INDUSTRY_CHIPS
  if (step === "site") return SITE_CHIPS
  if (step === "telegram") return TG_CHIPS
  return []
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
  const [messages, setMessages] = useState<Msg[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [currentStep, setCurrentStep] = useState<UIStep>("welcome")
  const [showFreeInput, setShowFreeInput] = useState(false)
  const [config, setConfig] = useState<Config>({
    role: "", industry: "", name: "", telegramConnected: false,
  })
  const [keyboardOffset, setKeyboardOffset] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasStarted = useRef(false)

  // iOS keyboard
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return
    const vv = window.visualViewport!
    const update = () => {
      setKeyboardOffset(Math.max(0, window.innerHeight - vv.height - vv.offsetTop))
    }
    update()
    vv.addEventListener("resize", update)
    vv.addEventListener("scroll", update)
    return () => { vv.removeEventListener("resize", update); vv.removeEventListener("scroll", update) }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" })
  }, [messages, isTyping])

  const addBotMessage = (text: string, delay = 800) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [...prev, { role: "assistant", content: text }])
    }, delay)
  }

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    addBotMessage(
      "Привет! Я Опти — настрою вашего AI-сотрудника для бизнеса.\n\nЗаймёт 3–5 минут. По итогам получите готового ассистента, который будет отвечать клиентам и собирать заявки — прямо сейчас, без программиста.\n\nНачнём?",
      600,
    )
  }, [])

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { role: "user", content: text }])
  }

  const handleChipSelect = (chip: string) => {
    addUserMessage(chip)

    if (currentStep === "welcome") {
      if (chip === "Расскажи подробнее") {
        addBotMessage("Конечно! Настроим AI-сотрудника под вашу роль и сферу бизнеса: администратор, консультант, продажи или поддержка — для любой отрасли. Бесплатно. Поехали?")
        setTimeout(() => setCurrentStep("role"), 1600)
      } else {
        setCurrentStep("role")
        addBotMessage("Отлично! Для начала — какую роль будет выполнять AI-сотрудник?")
      }
      return
    }

    if (currentStep === "role") {
      if (chip === "Свой вариант") {
        setShowFreeInput(true)
        return
      }
      const roleMap: Record<string, string> = {
        "Администратор": "admin", "Консультант": "consultant",
        "Продажи": "sales", "Поддержка": "support",
      }
      setConfig((c) => ({ ...c, role: roleMap[chip] ?? chip }))
      setCurrentStep("industry")
      addBotMessage(`${chip} — хороший выбор! В какой сфере работает ваш бизнес?`)
      return
    }

    if (currentStep === "industry") {
      if (chip === "Свой вариант") {
        setShowFreeInput(true)
        return
      }
      setConfig((c) => ({ ...c, industry: chip }))
      setCurrentStep("name")
      addBotMessage(`Понял. И как называется ваша компания / бизнес?`)
      setShowFreeInput(true)
      return
    }

    if (currentStep === "site") {
      if (chip === "Есть сайт, дам ссылку") {
        setShowFreeInput(true)
        textareaRef.current?.focus()
        return
      }
      // "Сайта нет" — show offer
      setConfig((c) => ({ ...c, websiteUrl: undefined }))
      setCurrentStep("telegram")
      addBotMessage(
        "Хорошо! Кстати, если захотите — Олег сделает сайт + ассистента под ключ.\nСвяжитесь: @aleg_rad / +79785768451\n\nА пока продолжим. Куда отправлять заявки от клиентов? Telegram — удобнее всего, уведомление приходит мгновенно.",
        1200,
      )
      setShowFreeInput(false)
      return
    }

    if (currentStep === "telegram") {
      if (chip === "Подключить Telegram") {
        addBotMessage("Отлично! После создания ассистента — найдите @OptisphereLeadsBot в Telegram и нажмите /start. Пока пропустим и настроим ассистента.")
        const newConfig = { ...config, telegramConnected: true }
        setConfig(newConfig)
        goToSummary(newConfig)
      } else {
        const newConfig = { ...config, telegramConnected: false }
        setConfig(newConfig)
        goToSummary(newConfig)
      }
      return
    }
  }

  const goToSummary = (cfg: Config) => {
    setCurrentStep("summary")
    const roleLabel: Record<string, string> = {
      admin: "Администратор", consultant: "Консультант",
      sales: "Продажи", support: "Поддержка",
    }
    addBotMessage(
      `Отлично! Всё готово для создания:\n\n▸ Роль: ${roleLabel[cfg.role] ?? cfg.role}\n▸ Сфера: ${cfg.industry}\n▸ Название: ${cfg.name}\n▸ Сайт: ${cfg.websiteUrl ?? "не указан"}\n▸ Telegram: ${cfg.telegramConnected ? "подключим" : "пропустим"}\n\nГотов создать ассистента — займёт ~10 секунд.`,
      1200,
    )
  }

  const handleFreeInput = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    setInputValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.placeholder = "Напишите ответ..."
    }
    setShowFreeInput(false)
    addUserMessage(trimmed)

    if (currentStep === "role") {
      setConfig((c) => ({ ...c, role: trimmed }))
      setCurrentStep("industry")
      addBotMessage(`${trimmed} — отличная роль! В какой сфере работает ваш бизнес?`)
      return
    }

    if (currentStep === "industry") {
      setConfig((c) => ({ ...c, industry: trimmed }))
      setCurrentStep("name")
      addBotMessage("Понял. Как называется ваша компания / бизнес?")
      setShowFreeInput(true)
      return
    }

    if (currentStep === "name") {
      setConfig((c) => ({ ...c, name: trimmed }))
      setCurrentStep("site")
      addBotMessage(`«${trimmed}» — записал!\n\nЕсть ли у вас сайт? Если да — ассистент сам разберётся в ваших услугах, ценах и режиме работы.`)
      setShowFreeInput(false)
      return
    }

    if (currentStep === "site") {
      const isUrl = trimmed.startsWith("http")
      if (isUrl) {
        addBotMessage("Записал ссылку — ассистент будет брать актуальные данные прямо с сайта.")
        setConfig((c) => ({ ...c, websiteUrl: trimmed }))
        setCurrentStep("telegram")
        setTimeout(() => {
          addBotMessage("Куда отправлять заявки от клиентов? Telegram — удобнее всего.")
        }, 900)
      } else {
        // Not a URL — treat as "no site", show offer
        addBotMessage(
          "Хорошо, обойдёмся без сайта.\n\nКстати, если понадобится — Олег сделает сайт + ассистента под ключ: @aleg_rad / +79785768451\n\nКуда отправлять заявки от клиентов? Telegram — удобнее всего.",
          1200,
        )
        setConfig((c) => ({ ...c, websiteUrl: undefined }))
        setCurrentStep("telegram")
      }
      return
    }
  }

  const handleCreate = () => {
    sessionStorage.setItem("onboarding_config", JSON.stringify({
      name: config.name,
      role: config.role,
      industry: config.industry,
      websiteUrl: config.websiteUrl,
      telegramConnected: config.telegramConnected,
    }))
    router.push("/creating")
  }

  const chips = getChips(currentStep)
  const showChips = chips.length > 0 && !showFreeInput
  const showInput = showFreeInput || (currentStep !== "summary" && currentStep !== "welcome" && chips.length === 0)

  const progressPct = Math.round(
    (["welcome", "role", "industry", "name", "site", "telegram", "summary"].indexOf(currentStep) / 6) * 100,
  )

  const mobileLabel = {
    welcome: "Шаг 1 из 6 · Начало",
    role: "Шаг 2 из 6 · Роль",
    industry: "Шаг 3 из 6 · Сфера",
    name: "Шаг 4 из 6 · Название",
    site: "Шаг 5 из 6 · Сайт",
    telegram: "Шаг 6 из 6 · Telegram",
    summary: "Готово · Создаём",
  }[currentStep]

  return (
    <>
      <style>{`
        @keyframes optiPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(232,32,32,0.5); }
          50% { box-shadow: 0 0 22px rgba(255,74,74,0.7); }
        }
        @keyframes optiDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100svh", flexDirection: "column" }}>
        {/* Header */}
        <header style={{
          height: 57, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 clamp(20px,4vw,48px)", borderBottom: "1px solid var(--op-border)", flexShrink: 0,
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Image src="/optisphere-logo-dark.png" alt="Optisphere" width={130} height={28} style={{ height: 26, width: "auto" }} />
          </Link>
          <Link href="/" className="btn btn-ghost" style={{ height: 36, padding: "0 16px", fontSize: 13 }}>
            ← На главную
          </Link>
        </header>

        {/* Mobile progress */}
        <div className="onboarding-mobile-progress" style={{
          display: "none", position: "sticky", top: 57, zIndex: 10,
          background: "var(--op-bg-card)", borderBottom: "1px solid var(--op-border)",
          padding: "10px clamp(16px,4vw,24px)",
        }}>
          <div style={{ fontSize: 13, color: "var(--op-text-secondary)", marginBottom: 6 }}>
            {mobileLabel}
          </div>
          <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
            <div style={{
              height: "100%", background: "linear-gradient(90deg, #e82020, #ff4a4a)",
              width: `${progressPct}%`, transition: "width 400ms ease",
            }} />
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Sidebar (desktop) */}
          <aside className="onboarding-sidebar" style={{
            width: "40%", maxWidth: 360, borderRight: "1px solid var(--op-border)",
            background: "var(--op-bg-card)", padding: "48px 40px",
            position: "sticky", top: 57, height: "calc(100svh - 57px)",
            overflowY: "auto", flexShrink: 0,
          }}>
            <OnboardingProgress step={currentStep} />
          </aside>

          {/* Chat area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
            {/* Messages */}
            <div style={{
              flex: 1, overflowY: "auto",
              padding: "clamp(20px,3vw,40px) clamp(16px,3vw,32px)",
              display: "flex", flexDirection: "column", gap: 12, scrollbarWidth: "thin",
            }}>
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
              </AnimatePresence>

              {isTyping && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <OptiAvatar size={28} />
                  <div style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px 16px 16px 4px",
                  }}>
                    <TypingDots />
                  </div>
                </div>
              )}

              {/* Summary CTA */}
              {currentStep === "summary" && !isTyping && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginTop: 8 }}
                >
                  <button
                    onClick={handleCreate}
                    className="btn btn-primary"
                    style={{ width: "100%", maxWidth: 360, height: 56, fontSize: 17, fontWeight: 700, justifyContent: "center", gap: 10 }}
                  >
                    Создать AI-сотрудника
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </button>
                  <p style={{ fontSize: 12, color: "var(--op-text-muted)", textAlign: "center" }}>
                    Бесплатно · Без карты · ~10 секунд
                  </p>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            {currentStep !== "summary" && (
              <div style={{
                borderTop: "1px solid var(--op-border)",
                padding: "12px 16px",
                background: "rgba(0,0,0,0.12)",
                backdropFilter: "blur(8px)",
                position: "sticky", bottom: 0,
                display: "flex", flexDirection: "column", gap: 8,
                paddingBottom: `calc(12px + ${keyboardOffset}px + env(safe-area-inset-bottom))`,
              }}>
                {showChips && (
                  <QuickReplyChips chips={chips} onSelect={handleChipSelect} />
                )}

                {(showInput || showFreeInput) && (
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value)
                        const ta = e.currentTarget
                        ta.style.height = "auto"
                        ta.style.height = `${Math.min(ta.scrollHeight, 80)}px`
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleFreeInput() }
                      }}
                      placeholder="Напишите ответ..."
                      rows={1}
                      style={{
                        flex: 1, background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                        padding: "10px 14px", color: "var(--op-text-primary)",
                        fontSize: "0.875rem", lineHeight: 1.5, resize: "none",
                        outline: "none", fontFamily: "inherit", maxHeight: 80, overflowY: "auto",
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,32,32,0.5)" }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)" }}
                    />
                    <button
                      onClick={handleFreeInput}
                      disabled={!inputValue.trim()}
                      aria-label="Отправить"
                      style={{
                        width: 44, height: 44, borderRadius: "50%", border: "none",
                        background: inputValue.trim() ? "linear-gradient(135deg, #e82020, #ff4a4a)" : "rgba(255,255,255,0.07)",
                        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, opacity: inputValue.trim() ? 1 : 0.45,
                        transition: "background 0.15s ease, opacity 0.15s ease",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .onboarding-sidebar { display: none !important; }
          .onboarding-mobile-progress { display: block !important; }
        }
      `}</style>
    </>
  )
}
