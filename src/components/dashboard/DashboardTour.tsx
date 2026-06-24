"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

// ── Types ─────────────────────────────────────────────────────────────────────

interface TourStep {
  target: string       // data-tour attribute value
  title: string
  body: string
}

interface Rect { top: number; left: number; width: number; height: number }

// ── Steps ─────────────────────────────────────────────────────────────────────

const TOUR_STEPS: TourStep[] = [
  {
    target: "tour-stats",
    title: "Статистика одним взглядом",
    body: "Здесь — ассистенты, новые заявки и диалоги. Красный счётчик = требует вашего внимания прямо сейчас.",
  },
  {
    target: "tour-leads",
    title: "Горячие заявки",
    body: "Новые заявки от клиентов. Нажмите «Открыть» — увидите контакт и историю переписки с ботом.",
  },
  {
    target: "tour-assistants",
    title: "Ваши AI-сотрудники",
    body: "Список ассистентов со статусом оплаты: Триал, Активен или Остановлен. Можно открыть чат и протестировать.",
  },
  {
    target: "tour-nav-leads",
    title: "Раздел «Заявки»",
    body: "Все заявки с фильтром по статусу. Меняйте статус — «Новая», «В работе», «Закрыта» — прямо из дашборда.",
  },
  {
    target: "tour-nav-analytics",
    title: "Аналитика",
    body: "Графики активности и источников заявок. Видно, в какие часы клиенты пишут чаще всего.",
  },
  {
    target: "tour-create-btn",
    title: "Создайте первого ассистента",
    body: "Займёт 3–5 минут. Ответите на несколько вопросов — и готовый бот для вашего сайта.",
  },
]

const STORAGE_KEY = "op_tour_done"

// ── Helpers ────────────────────────────────────────────────────────────────────

const PAD = 8

function getEl(target: string): Element | null {
  return document.querySelector(`[data-tour="${target}"]`)
}

function getRect(el: Element): Rect {
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function clampX(left: number, tipW: number): number {
  const margin = 12
  const vw = window.innerWidth
  if (left < margin) return margin
  if (left + tipW > vw - margin) return vw - tipW - margin
  return left
}

function calcTipPos(rect: Rect, tipH: number, tipW: number) {
  const spaceBelow = window.innerHeight - (rect.top + rect.height + PAD)
  const spaceAbove = rect.top - PAD
  const prefBelow = spaceBelow >= tipH + 16
  const prefAbove = !prefBelow && spaceAbove >= tipH + 16
  let top: number
  if (prefBelow) {
    top = rect.top + rect.height + PAD + 12
  } else if (prefAbove) {
    top = rect.top - PAD - tipH - 12
  } else {
    top = Math.max(8, rect.top + rect.height / 2 - tipH / 2)
  }
  return { top, left: clampX(rect.left + rect.width / 2 - tipW / 2, tipW) }
}

// ── Tour overlay ───────────────────────────────────────────────────────────────

function TourOverlay({ active, onClose, onFinish }: {
  active: boolean
  onClose: () => void
  onFinish: () => void
}) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [tipPos, setTipPos] = useState<{ top: number; left: number } | null>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useRef(false)

  useEffect(() => {
    prefersReduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  useEffect(() => {
    if (active) setStep(0)
  }, [active])

  const recalc = useCallback(() => {
    if (!active) return
    const current = TOUR_STEPS[step]
    if (!current) return
    const el = getEl(current.target)
    if (!el) { setRect(null); setTipPos(null); return }

    el.scrollIntoView({ block: "center", behavior: prefersReduced.current ? "instant" : "smooth" })

    const measure = () => {
      const r = getRect(el)
      setRect(r)
      const tipW = Math.min(320, window.innerWidth - 24)
      const pos = calcTipPos(r, 160, tipW)
      setTipPos(pos)
    }
    const t = setTimeout(measure, prefersReduced.current ? 0 : 350)
    return () => clearTimeout(t)
  }, [active, step])

  // Refine tip position once tooltip is rendered
  useEffect(() => {
    if (!tipRef.current || !rect) return
    const { offsetHeight, offsetWidth } = tipRef.current
    const tipW = Math.min(offsetWidth, window.innerWidth - 24)
    setTipPos(calcTipPos(rect, offsetHeight, tipW))
  }, [rect])

  useEffect(() => { recalc() }, [recalc])

  useEffect(() => {
    if (!active) return
    const handler = () => recalc()
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [active, recalc])

  // Keyboard
  useEffect(() => {
    if (!active) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight" && step < TOUR_STEPS.length - 1) setStep((s) => s + 1)
      if (e.key === "ArrowLeft" && step > 0) setStep((s) => s - 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, step, onClose])

  if (!active) return null

  const isFirst = step === 0
  const isLast = step === TOUR_STEPS.length - 1
  const current = TOUR_STEPS[step]

  const vw = typeof window !== "undefined" ? window.innerWidth : 1280
  const vh = typeof window !== "undefined" ? window.innerHeight : 800
  const tipW = Math.min(320, vw - 24)

  const sp = rect ? {
    x: Math.max(0, rect.left - PAD),
    y: Math.max(0, rect.top - PAD),
    w: rect.width + PAD * 2,
    h: rect.height + PAD * 2,
    r: 10,
  } : null

  return (
    <>
      {/* SVG dim overlay */}
      <svg
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 3010, pointerEvents: "none" }}
      >
        <defs>
          <mask id="op-tour-mask">
            <rect x="0" y="0" width={vw} height={vh} fill="white" />
            {sp && <rect x={sp.x} y={sp.y} width={sp.w} height={sp.h} rx={sp.r} fill="black" />}
          </mask>
        </defs>
        <rect x="0" y="0" width={vw} height={vh} fill="rgba(0,0,0,0.6)" mask="url(#op-tour-mask)" />
        {sp && (
          <rect x={sp.x} y={sp.y} width={sp.w} height={sp.h} rx={sp.r} fill="none" stroke="rgba(232,32,32,0.7)" strokeWidth="2" />
        )}
      </svg>

      {/* Backdrop click-blocker */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 3011 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Tooltip card */}
      {tipPos && (
        <div
          ref={tipRef}
          role="dialog"
          aria-modal="false"
          aria-label={`Обучалка: шаг ${step + 1} из ${TOUR_STEPS.length}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed", top: tipPos.top, left: tipPos.left, width: tipW,
            zIndex: 3020,
            background: "var(--op-bg-card)", border: "1px solid var(--op-border)",
            borderRadius: "var(--op-radius-lg)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(232,32,32,0.15)",
            padding: "18px 20px",
            display: "flex", flexDirection: "column", gap: 12,
            transition: prefersReduced.current ? "none" : "top 250ms ease, left 250ms ease",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, fontFamily: "monospace",
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--op-accent)",
            }}>
              {step + 1} / {TOUR_STEPS.length}
            </span>
            <button
              aria-label="Закрыть гайд"
              onClick={onClose}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: "var(--op-text-muted)", display: "flex", alignItems: "center",
                justifyContent: "center", width: 28, height: 28, borderRadius: 6,
                flexShrink: 0, padding: 2,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--op-text-primary)", marginBottom: 6, lineHeight: 1.3 }}>
              {current.title}
            </h3>
            <p style={{ fontSize: 13, color: "var(--op-text-secondary)", lineHeight: 1.6, margin: 0 }}>
              {current.body}
            </p>
          </div>

          {/* Nav buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            {!isFirst && (
              <button
                onClick={() => setStep((s) => s - 1)}
                aria-label="Предыдущий шаг"
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: "transparent", color: "var(--op-text-secondary)",
                  border: "1px solid var(--op-border)", borderRadius: "var(--op-radius-md)",
                  padding: "8px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer",
                  minHeight: 40, flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Назад
              </button>
            )}
            <button
              onClick={() => {
                if (isLast) { onFinish(); onClose() }
                else setStep((s) => s + 1)
              }}
              style={{
                flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                background: "linear-gradient(135deg, #e82020, #ff4a4a)", color: "#fff",
                border: "none", borderRadius: "var(--op-radius-md)",
                padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                minHeight: 40,
              }}
            >
              {isLast ? "Готово" : (
                <>
                  Далее
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </>
              )}
            </button>
            {!isLast && (
              <button
                onClick={onClose}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "transparent", color: "var(--op-text-muted)",
                  border: "1px solid var(--op-border)", borderRadius: "var(--op-radius-md)",
                  padding: "8px 12px", fontSize: 13, cursor: "pointer",
                  minHeight: 40, flexShrink: 0,
                }}
              >
                Пропустить
              </button>
            )}
          </div>

          {/* Dot indicators */}
          <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === step ? 16 : 6, height: 6, borderRadius: 3,
                  background: i === step ? "#e82020" : "rgba(255,255,255,0.15)",
                  transition: "width 200ms, background 200ms",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ── Tour trigger button ────────────────────────────────────────────────────────

export function DashboardTour({ hasAssistants }: { hasAssistants: boolean }) {
  const router = useRouter()
  const [active, setActive] = useState(false)

  // Auto-launch on first visit
  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // Small delay so dashboard elements mount
        const t = setTimeout(() => setActive(true), 800)
        return () => clearTimeout(t)
      }
    } catch { /* localStorage may be blocked */ }
  }, [])

  const handleFinish = () => {
    try { localStorage.setItem(STORAGE_KEY, "1") } catch { /* ignore */ }
    if (!hasAssistants) {
      router.push("/onboarding")
    }
  }

  const handleClose = () => {
    setActive(false)
    try { localStorage.setItem(STORAGE_KEY, "1") } catch { /* ignore */ }
  }

  return (
    <>
      {/* Floating guide button */}
      <button
        onClick={() => setActive(true)}
        aria-label="Открыть гайд"
        title="Открыть гайд"
        style={{
          position: "fixed", bottom: 80, right: 20, zIndex: 200,
          width: 44, height: 44, borderRadius: "50%",
          background: "var(--op-bg-card)", border: "1px solid var(--op-border)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--op-text-secondary)",
          transition: "border-color 160ms, color 160ms",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(232,32,32,0.4)"
          e.currentTarget.style.color = "var(--op-accent)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--op-border)"
          e.currentTarget.style.color = "var(--op-text-secondary)"
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </button>

      <TourOverlay active={active} onClose={handleClose} onFinish={handleFinish} />
    </>
  )
}
