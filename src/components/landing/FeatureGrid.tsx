"use client"

import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "Ответ за секунды",
    text: "Клиент написал в 23:00 — AI ответил сразу. Время реакции: меньше 3 секунд. Больше не теряете обращения.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: "Знает ваш бизнес",
    text: "Берёт данные с вашего сайта в реальном времени — цены, услуги, время работы. Всегда актуально.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
    title: "Горячие лиды — сразу",
    text: "Задаёт 2–3 уточняющих вопроса, понимает запрос. Вы получаете имя, контакт и суть — не просто номер.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: "Виджет — одна строка",
    text: "Вставляете один тег на сайт — готово. Без программиста. Работает на Tilda, WordPress, любом конструкторе.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    title: "Заявки в Telegram",
    text: "Каждое обращение — мгновенное уведомление вам. С именем, контактом и запросом клиента.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Данные в безопасности",
    text: "Диалоги не передаются третьим лицам. Хранение по 152-ФЗ. Настройки — только у вас.",
  },
]

export default function FeatureGrid() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="features" style={{ padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 48, maxWidth: 560 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.18em", color: "var(--op-text-muted)", textTransform: "uppercase", marginBottom: 12 }}>
            01 · capabilities
          </div>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: "var(--op-text-primary)", lineHeight: 1.2, marginBottom: 12 }}>
            Что умеет ваш AI-сотрудник
          </h2>
          <p style={{ fontSize: 16, color: "var(--op-text-secondary)", lineHeight: 1.6 }}>
            Работает вместо сотрудника — отвечает, квалифицирует, собирает контакты.
            Не болеет, не уходит в отпуск, не просит повышения.
          </p>
        </div>

        <div
          ref={ref}
          className="features-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "var(--op-bg-card)",
                border: "1px solid var(--op-border)",
                borderRadius: "var(--op-radius-lg)",
                padding: "28px 24px",
                transition: "border-color 220ms, box-shadow 220ms",
              }}
              whileHover={shouldReduceMotion ? {} : {
                borderColor: "rgba(232,32,32,0.3)",
                boxShadow: "0 0 24px rgba(232,32,32,0.1)",
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(232,32,32,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--op-text-primary)", marginBottom: 10 }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--op-text-secondary)", lineHeight: 1.6 }}>
                {feature.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .features-grid { grid-template-columns: repeat(3, 1fr) !important; }
        @media (max-width: 900px) { .features-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .features-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
