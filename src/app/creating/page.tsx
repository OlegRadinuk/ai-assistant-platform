"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

// ── Types ─────────────────────────────────────────────────────────────────────

type StepStatus = "pending" | "active" | "done"

interface ProvisionResult {
  id: number
  slug: string
  name: string
  chatUrl: string
  widgetSnippet: string
}

// ── Build step item ───────────────────────────────────────────────────────────

function BuildStepItem({ label, detail, status }: { label: string; detail: string; status: StepStatus }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "var(--op-bg-card)",
        border: `1px solid ${status === "active" ? "rgba(232,32,32,0.4)" : "var(--op-border)"}`,
        borderRadius: "var(--op-radius-md)", padding: "14px 18px",
        display: "flex", alignItems: "center", gap: 14,
        transition: "border-color 300ms",
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: status === "done" ? "rgba(34,197,94,0.1)" : status === "active" ? "rgba(232,32,32,0.1)" : "rgba(255,255,255,0.06)",
        animation: status === "active" ? "stepRing 1.2s ease-in-out infinite" : "none",
      }}>
        {status === "done" ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : status === "active" ? (
          <div style={{ display: "flex", gap: 3 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                display: "block", width: 4, height: 4, borderRadius: "50%",
                background: "var(--op-accent)",
                animation: `optiDot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        ) : (
          <span style={{ display: "block", width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
        )}
      </div>
      <div>
        <div style={{
          fontSize: 15,
          color: status === "done" ? "var(--op-text-secondary)" : status === "active" ? "var(--op-text-primary)" : "var(--op-text-muted)",
          fontWeight: status === "active" ? 600 : 400,
        }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: "var(--op-text-muted)", marginTop: 2 }}>
          {status === "done" ? "Готово" : detail}
        </div>
      </div>
    </motion.div>
  )
}

// ── Widget snippet ─────────────────────────────────────────────────────────────

function WidgetSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore — code is visible, user can copy manually
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ position: "relative" }}>
        <div style={{
          display: "block", background: "var(--op-bg)", border: "1px solid var(--op-border)",
          borderRadius: 8, padding: "12px 52px 12px 16px",
          fontFamily: "monospace", fontSize: 13, color: "var(--op-text-primary)",
          overflowX: "auto", whiteSpace: "nowrap",
        }}>
          {code}
        </div>
        <button
          onClick={handleCopy}
          aria-label="Копировать код"
          style={{
            position: "absolute", top: 8, right: 8,
            background: "var(--op-bg-elevated)", border: "1px solid var(--op-border)",
            borderRadius: 6, padding: "4px 10px", fontSize: 12,
            color: copied ? "#22c55e" : "var(--op-text-secondary)",
            transition: "color 0.2s", whiteSpace: "nowrap",
          }}
        >
          {copied ? (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Скопировано
            </span>
          ) : "Копировать"}
        </button>
      </div>
      <p style={{ fontSize: 13, color: "var(--op-text-secondary)", lineHeight: 1.6, margin: 0 }}>
        Вставьте этот код на сайт перед <code style={{ fontFamily: "monospace", color: "var(--op-accent)", fontSize: 12 }}>&lt;/body&gt;</code>.{" "}
        Не знаете как — передайте код вашему веб-разработчику или напишите Олегу:{" "}
        <a href="https://t.me/aleg_rad" target="_blank" rel="noopener noreferrer" style={{ color: "var(--op-accent)", textDecoration: "none" }}>@aleg_rad</a>
        {" / "}
        <a href="tel:+79785768451" style={{ color: "var(--op-accent)", textDecoration: "none" }}>+79785768451</a>
      </p>
    </div>
  )
}

// ── Telegram connect button ───────────────────────────────────────────────────

type TgState = "idle" | "loading" | "done" | "error"

function TelegramConnect({ assistantId }: { assistantId: number }) {
  const [state, setState] = useState<TgState>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleConnect = async () => {
    setState("loading")
    try {
      const res = await fetch(`/api/telegram/start-link?clientId=${assistantId}`)
      if (!res.ok) throw new Error("Не удалось получить ссылку")
      const data = await res.json() as { url: string }
      window.open(data.url, "_blank", "noopener,noreferrer")
      setState("done")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Ошибка")
      setState("error")
    }
  }

  if (state === "done") {
    return (
      <div style={{
        background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
        borderRadius: "var(--op-radius-md)", padding: "14px 16px",
        display: "flex", alignItems: "flex-start", gap: 12,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#22c55e", marginBottom: 2 }}>Telegram открыт</div>
          <div style={{ fontSize: 13, color: "var(--op-text-secondary)", lineHeight: 1.5 }}>
            Нажмите <strong>Старт</strong> в боте — и заявки начнут приходить вам в Telegram.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button
        onClick={handleConnect}
        disabled={state === "loading"}
        className="btn btn-ghost"
        style={{
          width: "100%", justifyContent: "center", height: 44, fontSize: 14,
          display: "flex", alignItems: "center", gap: 8,
          opacity: state === "loading" ? 0.7 : 1,
        }}
      >
        {state === "loading" ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ animation: "spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Подключаем…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Подключить Telegram
          </>
        )}
      </button>
      {state === "error" && (
        <p role="alert" style={{ fontSize: 13, color: "var(--op-danger)", margin: 0 }}>{errorMsg}</p>
      )}
      <p style={{ fontSize: 12, color: "var(--op-text-muted)", margin: 0, lineHeight: 1.5 }}>
        Получайте заявки мгновенно. Нажмите «Старт» в боте после перехода.
      </p>
    </div>
  )
}

// ── Build steps ───────────────────────────────────────────────────────────────

const BUILD_STEPS = [
  { label: "Создаю проект", detail: "Регистрирую ассистент в системе", startAt: 0 },
  { label: "Пишу системный промпт", detail: "Настраиваю личность и знания о бизнесе", startAt: 2500 },
  { label: "Подключаю виджет", detail: "Генерирую код для вашего сайта", startAt: 5200 },
  { label: "Финальная проверка", detail: "Тестирую ответы ассистента", startAt: 7500 },
]
const DONE_AT = 9500

// ── Main ─────────────────────────────────────────────────────────────────────

export default function CreatingPage() {
  const shouldReduceMotion = useReducedMotion()
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(["pending", "pending", "pending", "pending"])
  const [isDone, setIsDone] = useState(false)
  const [progressWidth, setProgressWidth] = useState(0)
  const [result, setResult] = useState<ProvisionResult | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const configStr = sessionStorage.getItem("onboarding_config")
    if (!configStr) {
      setErrorMsg("Конфигурация не найдена. Вернитесь к онбордингу.")
      return
    }

    // Start animation + API call in parallel
    const animPromise = runAnimation()
    const apiPromise = fetch("/api/assistants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: configStr,
    }).then(async (res) => {
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      return res.json() as Promise<ProvisionResult>
    })

    Promise.all([animPromise, apiPromise]).then(([, data]) => {
      setResult(data)
      sessionStorage.removeItem("onboarding_config")
      setIsDone(true)
    }).catch((err: Error) => {
      setErrorMsg(err.message)
      // Still show done state with error
    })
  }, [])

  function runAnimation(): Promise<void> {
    return new Promise((resolve) => {
      if (shouldReduceMotion) {
        setStepStatuses(["done", "done", "done", "done"])
        setTimeout(resolve, 200)
        return
      }

      // Progress bar via rAF
      const startTime = Date.now()
      let rafId: number
      const tick = () => {
        const elapsed = Date.now() - startTime
        const pct = Math.min(100, (elapsed / DONE_AT) * 100)
        setProgressWidth(pct)
        if (pct < 100) rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)

      BUILD_STEPS.forEach((step, i) => {
        const t1 = setTimeout(() => {
          setStepStatuses((prev) => { const n = [...prev] as StepStatus[]; n[i] = "active"; return n })
        }, step.startAt)
        timersRef.current.push(t1)

        if (i < BUILD_STEPS.length - 1) {
          const t2 = setTimeout(() => {
            setStepStatuses((prev) => { const n = [...prev] as StepStatus[]; n[i] = "done"; return n })
          }, BUILD_STEPS[i + 1].startAt - 100)
          timersRef.current.push(t2)
        }
      })

      const finalTimer = setTimeout(() => {
        cancelAnimationFrame(rafId)
        setStepStatuses(["done", "done", "done", "done"])
        setTimeout(resolve, 400)
      }, DONE_AT)
      timersRef.current.push(finalTimer)
    })
  }

  // Error state
  if (errorMsg && !result) {
    return (
      <main style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--op-danger)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 12, color: "var(--op-danger)" }}>
            Ошибка создания
          </h2>
          <p style={{ color: "var(--op-text-secondary)", marginBottom: 24 }}>{errorMsg}</p>
          <Link href="/onboarding" className="btn btn-primary">Попробовать снова</Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <style>{`
        @keyframes optiDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes stepRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232,32,32,0.4); }
          50% { box-shadow: 0 0 0 4px rgba(232,32,32,0); }
        }
        @keyframes buildPulse {
          0%, 100% { box-shadow: 0 0 48px rgba(232,32,32,0.4); }
          50% { box-shadow: 0 0 64px rgba(255,74,74,0.6); }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Grid bg */}
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "48px 48px", pointerEvents: "none", zIndex: 0,
      }} />

      {/* Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 10,
        height: 57, display: "flex", alignItems: "center",
        padding: "0 clamp(20px,4vw,48px)",
        borderBottom: "1px solid var(--op-border)",
        background: "rgba(10,10,15,0.85)", backdropFilter: "blur(16px)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <Image src="/optisphere-logo-dark.png" alt="Optisphere" width={120} height={26} style={{ height: 24, width: "auto" }} />
        </Link>
      </header>

      <div style={{
        minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 1, padding: "80px clamp(20px,4vw,48px) 40px",
      }}>
        <div style={{ width: "100%", maxWidth: 560 }}>
          <AnimatePresence mode="wait">
            {!isDone ? (
              <motion.div
                key="building"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}
              >
                {/* Pulsing sphere */}
                <div
                  aria-hidden="true"
                  style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: "linear-gradient(135deg, #e82020, #ff4a4a)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "buildPulse 1.5s ease-in-out infinite",
                  }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /><path d="M7 8h.01M12 8h.01M17 8h.01M7 11h10" />
                  </svg>
                </div>

                <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--op-text-primary)", textAlign: "center" }}>
                  Создаём вашего ассистента...
                </h1>

                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                  {BUILD_STEPS.map((step, i) =>
                    stepStatuses[i] !== "pending" ? (
                      <BuildStepItem key={step.label} label={step.label} detail={step.detail} status={stepStatuses[i]} />
                    ) : (
                      <div key={step.label} style={{
                        background: "var(--op-bg-card)", border: "1px solid var(--op-border)",
                        borderRadius: "var(--op-radius-md)", padding: "14px 18px",
                        display: "flex", alignItems: "center", gap: 14, opacity: 0.4,
                      }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 15, color: "var(--op-text-muted)" }}>{step.label}</div>
                          <div style={{ fontSize: 12, color: "var(--op-text-muted)", marginTop: 2 }}>{step.detail}</div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div style={{ width: "100%", height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }}>
                  <div style={{
                    height: "100%", background: "linear-gradient(90deg, #e82020, #ff4a4a)",
                    borderRadius: 1, width: `${progressWidth}%`, transition: "width 200ms linear",
                  }} />
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%" }}
              >
                {/* Animated checkmark */}
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-label="Готово">
                  <circle cx="36" cy="36" r="34" stroke="rgba(34,197,94,0.25)" strokeWidth="2" />
                  <circle cx="36" cy="36" r="34" stroke="#22c55e" strokeWidth="2" strokeDasharray="213" strokeDashoffset="213" style={{ animation: "drawCheck 0.6s ease forwards 0.1s" }} />
                  <path d="M20 36l12 12 20-22" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50" strokeDashoffset="50" style={{ animation: "drawCheck 0.4s ease forwards 0.5s" }} />
                </svg>

                <div style={{ textAlign: "center" }}>
                  <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--op-text-primary)" }}>
                    {result.name} — готов!
                  </h1>
                  <p style={{ fontSize: 15, color: "var(--op-text-secondary)", marginTop: 8 }}>
                    Проверьте демо и добавьте виджет на сайт.
                  </p>
                </div>

                {/* Chat URL */}
                <div style={{
                  background: "var(--op-bg-card)", border: "1px solid var(--op-border)",
                  borderRadius: "var(--op-radius-lg)", padding: 20, width: "100%",
                }}>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--op-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                    Ваша демо-ссылка
                  </div>
                  <div style={{
                    fontFamily: "monospace", fontSize: 14, color: "var(--op-accent)",
                    background: "var(--op-bg-elevated)", padding: "10px 14px",
                    borderRadius: 8, marginBottom: 12, wordBreak: "break-all",
                  }}>
                    {result.chatUrl}
                  </div>
                  <Link
                    href={result.chatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center", height: 44, fontSize: 14 }}
                  >
                    Открыть ассистента
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </Link>
                </div>

                {/* Widget snippet */}
                <div style={{
                  background: "var(--op-bg-card)", border: "1px solid var(--op-border)",
                  borderRadius: "var(--op-radius-lg)", padding: 20, width: "100%",
                }}>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--op-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                    Код виджета для вашего сайта
                  </div>
                  <WidgetSnippet code={result.widgetSnippet} />
                </div>

                {/* Telegram connect */}
                <div style={{
                  background: "var(--op-bg-card)", border: "1px solid var(--op-border)",
                  borderRadius: "var(--op-radius-lg)", padding: 20, width: "100%",
                }}>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--op-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                    Уведомления в Telegram
                  </div>
                  <TelegramConnect assistantId={result.id} />
                </div>

                {/* Dashboard link */}
                <Link
                  href="/dashboard"
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", height: 52, fontSize: 16, fontWeight: 700 }}
                >
                  Перейти в кабинет →
                </Link>
              </motion.div>
            ) : (
              // API responded with error but animation done
              <motion.div key="error-after-anim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
                <p style={{ color: "var(--op-danger)", marginBottom: 16 }}>{errorMsg}</p>
                <Link href="/onboarding" className="btn btn-primary">Попробовать снова</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
