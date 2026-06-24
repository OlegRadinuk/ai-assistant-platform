"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"

const HeroChatPanel = dynamic(() => import("./HeroChatPanel"), { ssr: false })

const heroVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}
const itemVariant = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const trustChips = [
  { text: "Триал 7 дней бесплатно" },
  { text: "Запуск за 10 минут" },
  { text: "Работает 24/7" },
  { text: "Данные в России" },
]

export default function LandingHero() {
  const shouldReduceMotion = useReducedMotion()
  const [showScroll, setShowScroll] = useState(true)

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY < 100)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section
      style={{
        position: "relative",
        minHeight: "92vh",
        display: "flex",
        alignItems: "center",
        paddingTop: 80,
        paddingBottom: 40,
        overflow: "hidden",
      }}
    >
      {/* Grid bg */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />
      {/* Red glow left */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 55% 65% at 20% 55%, rgba(232,32,32,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* Subtle right glow behind chat */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 40% 60% at 78% 50%, rgba(232,32,32,0.04) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="hero-container"
        style={{
          position: "relative", zIndex: 1,
          maxWidth: 1280, width: "100%",
          margin: "0 auto",
          padding: "0 clamp(20px,4vw,48px)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(32px, 5vw, 64px)",
          alignItems: "center",
        }}
      >
        {/* ── LEFT: offer ── */}
        <motion.div
          variants={shouldReduceMotion ? {} : heroVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Label */}
          <motion.div
            variants={shouldReduceMotion ? {} : itemVariant}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 11, letterSpacing: "0.2em", color: "var(--op-text-muted)",
              textTransform: "uppercase", marginBottom: 20,
            }}
          >
            <span
              style={{
                display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                background: "var(--op-accent)",
                animation: "heroPulse 2s ease-in-out infinite",
              }}
            />
            AI-платформа · Любой бизнес · Без программиста
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={shouldReduceMotion ? {} : itemVariant}
            style={{
              fontSize: "clamp(32px,4.5vw,60px)",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "var(--op-text-primary)",
              marginBottom: 20,
              letterSpacing: "-0.02em",
            }}
          >
            Наймите{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #e82020, #ff4a4a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              AI-сотрудника
            </span>
            <br />за 10 минут
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={shouldReduceMotion ? {} : itemVariant}
            style={{
              fontSize: "clamp(15px,1.6vw,18px)",
              color: "var(--op-text-secondary)",
              lineHeight: 1.65,
              maxWidth: 480,
              marginBottom: 36,
            }}
          >
            Настраиваете ассистента под вашу сферу — администратор, консультант,
            продажи, поддержка. Отвечает клиентам, собирает заявки, встраивается
            на сайт одной строкой кода.
          </motion.p>

          {/* CTA */}
          <motion.div variants={shouldReduceMotion ? {} : itemVariant}>
            <div className="hero-cta">
              <Link
                href="/signup"
                className="btn btn-primary"
                style={{
                  height: 52, padding: "0 28px", fontSize: 15, fontWeight: 600,
                  justifyContent: "center", gap: 10,
                }}
              >
                Попробовать бесплатно
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <a
                href="#contact"
                className="btn btn-ghost"
                style={{ height: 52, padding: "0 24px", fontSize: 14, justifyContent: "center" }}
              >
                Сделаем под ключ
              </a>
            </div>
            <p style={{ fontSize: 11, color: "var(--op-text-muted)", marginTop: 10 }}>
              7 дней бесплатно — без кредитной карты
            </p>
          </motion.div>

          {/* Trust chips */}
          <motion.div variants={shouldReduceMotion ? {} : itemVariant} style={{ marginTop: 36 }}>
            <div className="hero-trust">
              {trustChips.map((chip) => (
                <div key={chip.text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--op-text-secondary)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {chip.text}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── RIGHT: live chat ── */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="hero-chat-col"
          style={{ height: "clamp(420px, 55vh, 560px)" }}
        >
          <HeroChatPanel />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      {showScroll && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute", bottom: 24, left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <svg
            width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="var(--op-text-muted)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: "heroBounce 2s ease-in-out infinite" }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      )}

      <style>{`
        @keyframes heroPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232,32,32,0.4); }
          50% { box-shadow: 0 0 0 4px rgba(232,32,32,0); }
        }
        @keyframes heroBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        .hero-cta {
          display: flex; gap: 10px; flex-wrap: wrap;
        }
        .hero-trust {
          display: grid; grid-template-columns: repeat(2, auto);
          gap: 10px 20px; justify-content: start;
        }
        /* Mobile: stack offer above chat */
        @media (max-width: 900px) {
          .hero-container {
            grid-template-columns: 1fr !important;
          }
          .hero-chat-col {
            height: clamp(380px, 60vw, 480px) !important;
          }
          .hero-trust {
            grid-template-columns: repeat(2, auto) !important;
            justify-content: center !important;
          }
          .hero-cta {
            justify-content: center;
          }
        }
        @media (max-width: 640px) {
          .hero-cta { flex-direction: column; }
          .hero-cta .btn { justify-content: center; }
        }
      `}</style>
    </section>
  )
}
