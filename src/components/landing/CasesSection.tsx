"use client"

import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"

const CASES = [
  {
    name: "«София Апартаменты»",
    role: "Администратор",
    industry: "Аренда / Апартаменты",
    result: "В первые 2 недели ассистент принял 47 заявок от клиентов. Менеджер разгрузился — перестал отвечать на однотипные вопросы про наличие и цены.",
    metric: "47",
    metricLabel: "заявок за 2 недели",
  },
  {
    name: "«Клиника МедКомфорт»",
    role: "Администратор + Консультант",
    industry: "Клиника / Медицина",
    result: "AI-администратор принимает запись 24/7. Конверсия из чата в заявку выросла с 18% до 34%. Ночные обращения больше не теряются.",
    metric: "34%",
    metricLabel: "конверсия в заявку",
  },
  {
    name: "«СтройГрупп»",
    role: "Консультант по продажам",
    industry: "Строительство",
    result: "Менеджер по продажам разговаривает только с квалифицированными лидами. AI отфильтровал нерелевантные обращения и собрал данные о бюджетах.",
    metric: "3x",
    metricLabel: "меньше холодных звонков",
  },
]

export default function CasesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="cases" style={{ padding: "96px 0", background: "var(--op-bg-card)", position: "relative" }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(232,32,32,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.18em", color: "var(--op-text-muted)", textTransform: "uppercase", marginBottom: 12 }}>
            03 · case studies
          </div>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: "var(--op-text-primary)", lineHeight: 1.2, marginBottom: 12 }}>
            Реальные результаты
          </h2>
          <p style={{ fontSize: 16, color: "var(--op-text-secondary)", lineHeight: 1.6, maxWidth: 520 }}>
            Цифры из первых недель работы — разные сферы, один движок.
          </p>
        </div>

        <div ref={ref} className="cases-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {CASES.map((c, i) => (
            <motion.div
              key={c.name}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "var(--op-bg-elevated)",
                border: "1px solid var(--op-border)",
                borderRadius: "var(--op-radius-lg)",
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Metric */}
              <div style={{
                display: "flex", alignItems: "baseline", gap: 8,
                paddingBottom: 16, borderBottom: "1px solid var(--op-border)",
              }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: "var(--op-accent)", lineHeight: 1, fontFamily: "monospace" }}>
                  {c.metric}
                </span>
                <span style={{ fontSize: 13, color: "var(--op-text-secondary)" }}>
                  {c.metricLabel}
                </span>
              </div>

              {/* Names */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--op-text-primary)", marginBottom: 4 }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--op-accent)", fontWeight: 500 }}>
                  {c.role}
                </div>
                <div style={{ fontSize: 12, color: "var(--op-text-muted)" }}>
                  {c.industry}
                </div>
              </div>

              {/* Result */}
              <p style={{ fontSize: 14, color: "var(--op-text-secondary)", lineHeight: 1.6, flex: 1 }}>
                {c.result}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .cases-grid { grid-template-columns: repeat(3, 1fr) !important; }
        @media (max-width: 900px) { .cases-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
