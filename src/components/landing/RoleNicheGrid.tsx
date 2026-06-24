"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView, useReducedMotion } from "framer-motion"

const ROLES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    role: "admin",
    label: "Администратор",
    desc: "Записи, расписание, типовые вопросы. Работает как приёмная без перерывов.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    role: "consultant",
    label: "Консультант",
    desc: "Помогает выбрать продукт/услугу, отвечает на содержательные вопросы.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    role: "sales",
    label: "Продажи",
    desc: "Квалифицирует лидов, показывает ценность, доводит до заявки.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    role: "support",
    label: "Поддержка",
    desc: "Решает типовые проблемы, эскалирует сложные случаи живому оператору.",
  },
]

// Niche icons — line-style SVG, neutral for dark theme
const NICHES = [
  {
    label: "Клиника / Медицина",
    slug: "clinics",
    example: "Запись, цены, врачи",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    label: "Отель / Гостиница",
    slug: "hotels",
    example: "Бронирование, условия",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="15" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    label: "Салон красоты",
    slug: "beauty",
    example: "Мастера, услуги, слоты",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    label: "Строительство",
    slug: "construction",
    example: "Сметы, объекты, сроки",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="3 22 21 22 12 3 3 22" />
        <line x1="12" y1="14" x2="12" y2="18" />
      </svg>
    ),
  },
  {
    label: "Апартаменты / Аренда",
    slug: "apartments",
    example: "Наличие, цены, заезд",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Школа / Образование",
    slug: "education",
    example: "Курсы, расписание, цены",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    label: "Доставка / Логистика",
    slug: "delivery",
    example: "Статус, тарифы, зоны",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    label: "IT / SaaS",
    slug: "it",
    example: "Онбординг, фичи, поддержка",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
]

export default function RoleNicheGrid() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="roles" style={{ padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>

        {/* Section header */}
        <div style={{ marginBottom: 56, maxWidth: 640 }}>
          <div style={{
            fontFamily: "monospace", fontSize: 11, letterSpacing: "0.18em",
            color: "var(--op-text-muted)", textTransform: "uppercase", marginBottom: 12,
          }}>
            02 · roles &amp; niches
          </div>
          <h2 style={{
            fontSize: "clamp(28px,4vw,40px)", fontWeight: 700,
            color: "var(--op-text-primary)", lineHeight: 1.2, marginBottom: 12,
          }}>
            Под любую роль — в любой сфере
          </h2>
          <p style={{ fontSize: 16, color: "var(--op-text-secondary)", lineHeight: 1.6 }}>
            Один движок — четыре роли — десятки сфер. Настройте под свой бизнес за несколько шагов.
          </p>
        </div>

        {/* Roles row */}
        <div ref={ref} className="roles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 40 }}>
          {ROLES.map((r, i) => (
            <motion.div
              key={r.role}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "var(--op-bg-card)",
                border: "1px solid var(--op-border)",
                borderRadius: "var(--op-radius-lg)",
                padding: "24px 20px",
                transition: "border-color 200ms, box-shadow 200ms",
              }}
              whileHover={shouldReduceMotion ? {} : {
                borderColor: "rgba(232,32,32,0.35)",
                boxShadow: "0 0 24px rgba(232,32,32,0.12)",
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "rgba(232,32,32,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 14,
              }}>
                {r.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--op-text-primary)", marginBottom: 8 }}>
                {r.label}
              </h3>
              <p style={{ fontSize: 13, color: "var(--op-text-secondary)", lineHeight: 1.5 }}>
                {r.desc}
              </p>
              <Link
                href={`/signup?role=${r.role}`}
                style={{
                  display: "inline-block", marginTop: 14,
                  fontSize: 13, color: "var(--op-accent)", textDecoration: "none",
                }}
              >
                Попробовать
                <span aria-hidden="true"> →</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--op-border)", margin: "8px 0 36px" }} />

        {/* Niches grid */}
        <div style={{ marginBottom: 24 }}>
          <p style={{
            color: "var(--op-text-muted)", marginBottom: 20,
            fontFamily: "monospace", letterSpacing: "0.1em",
            textTransform: "uppercase", fontSize: 11,
          }}>
            Примеры ниш — нажмите, чтобы перейти к созданию
          </p>
          <div className="niches-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {NICHES.map((n, i) => (
              <motion.div
                key={n.slug}
                initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.96 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={`/signup?industry=${encodeURIComponent(n.label)}`}
                  style={{
                    display: "block",
                    background: "var(--op-bg-elevated)",
                    border: "1px solid var(--op-border)",
                    borderRadius: "var(--op-radius-md)",
                    padding: "14px 16px",
                    textDecoration: "none",
                    transition: "border-color 160ms, background 160ms",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = "rgba(232,32,32,0.3)"
                    el.style.background = "var(--op-bg-hover)"
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = "var(--op-border)"
                    el.style.background = "var(--op-bg-elevated)"
                  }}
                >
                  <div
                    style={{
                      color: "var(--op-text-secondary)",
                      marginBottom: 8,
                      display: "flex",
                    }}
                  >
                    {n.icon}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--op-text-primary)", marginBottom: 3 }}>
                    {n.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--op-text-muted)" }}>
                    {n.example}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .roles-grid { grid-template-columns: repeat(4, 1fr) !important; }
        .niches-grid { grid-template-columns: repeat(4, 1fr) !important; }
        @media (max-width: 1024px) {
          .roles-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .niches-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .roles-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .niches-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 500px) {
          .roles-grid { grid-template-columns: 1fr !important; }
          .niches-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
