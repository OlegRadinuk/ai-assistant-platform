"use client"

import { useRef, useState } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"

const FAQS = [
  {
    q: "Сколько это стоит?",
    a: "Пробный период — 7 дней бесплатно, без карты. После триала: тариф «Авто-ассистент» — 3 990 ₽/мес (самостоятельно через кабинет), тариф «Интеграция под ключ» — от 7 000 ₽/мес (Олег настраивает и интегрирует с вашей CRM или МИС). После окончания триала ассистент останавливается до оплаты — честно, без сюрпризов.",
  },
  {
    q: "Нужен программист?",
    a: "Для создания ассистента — нет. Вы настраиваете его сами в кабинете за 10 минут: выбираете роль, описываете бизнес, получаете готового бота. Для установки виджета на сайт нужно вставить одну строку кода перед </body> — это делает ваш веб-разработчик за 2 минуты. Если разработчика нет — напишите Олегу, поможет: @aleg_rad / +7 978 576 84 51. Или Олег сделает сайт вместе с ассистентом под ключ.",
  },
  {
    q: "AI будет отвечать неправильно?",
    a: "AI отвечает на основе системного промпта, который вы настраиваете. При правильной настройке неточности — редкость; если бот не знает ответа, он честно скажет и предложит связаться напрямую. Вы всегда видите все диалоги в кабинете и можете скорректировать поведение.",
  },
  {
    q: "Что если клиент захочет поговорить с человеком?",
    a: "Ассистент поймёт такой запрос и соберёт контакт клиента. Вы получите уведомление в Telegram и сможете сами связаться. Вся история диалога видна в кабинете — ничего не потеряется.",
  },
  {
    q: "Работает для любой сферы?",
    a: "Да. Движок универсальный: клиника, отель, строительство, IT, аренда, образование — настраивается под вашу роль и сферу через онбординг-диалог за несколько минут.",
  },
  {
    q: "Как быстро запустить?",
    a: "Через 10 минут после регистрации у вас будет рабочий ассистент. Ещё 5 минут — и виджет стоит на сайте. Нажмите «Попробовать бесплатно» — убедитесь сами.",
  },
  {
    q: "Насколько безопасно — персональные данные?",
    a: "Данные хранятся на российских серверах. Диалоги не передаются третьим лицам. Работаем в соответствии с требованиями 152-ФЗ о персональных данных.",
  },
  {
    q: "Есть интеграция с нашей CRM / МИС?",
    a: "В тарифе «Авто» — стандартная настройка без прямых интеграций. Прямые интеграции (1С, МедФлекс, amoCRM и другие) — тариф «Интеграция под ключ». Напишите Олегу: @aleg_rad или +7 978 576 84 51, обсудим конкретную систему.",
  },
]

function FaqItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  return (
    <div
      style={{
        border: "1px solid var(--op-border)",
        borderRadius: "var(--op-radius-md)",
        background: open ? "var(--op-bg-elevated)" : "var(--op-bg-card)",
        transition: "background 220ms",
        overflow: "hidden",
      }}
    >
      <button
        onClick={onClick}
        aria-expanded={open}
        style={{
          width: "100%", background: "transparent", border: 0,
          padding: "20px 22px", display: "flex", alignItems: "center", gap: 16,
          textAlign: "left", color: "var(--op-text-primary)", minHeight: 56,
          cursor: "pointer",
        }}
      >
        <span style={{ flex: 1, fontSize: 16, fontWeight: 500, lineHeight: 1.4, letterSpacing: "-0.01em" }}>
          {q}
        </span>
        <span
          style={{
            width: 28, height: 28, borderRadius: 6, border: "1px solid var(--op-border)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            color: open ? "var(--op-accent)" : "var(--op-text-secondary)",
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 220ms, color 220ms",
          }}
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
      <div style={{ maxHeight: open ? 500 : 0, overflow: "hidden", transition: "max-height 320ms ease" }}>
        <p style={{
          fontSize: 15, color: "var(--op-text-secondary)",
          margin: 0, padding: "0 22px 22px", lineHeight: 1.65,
        }}>
          {a}
        </p>
      </div>
    </div>
  )
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "0px" })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="faq" style={{ padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 48 }}
        >
          <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.18em", color: "var(--op-text-muted)", textTransform: "uppercase", marginBottom: 12 }}>
            05 · faq
          </div>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: "var(--op-text-primary)", lineHeight: 1.2 }}>
            Частые вопросы
          </h2>
        </motion.div>

        <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 820 }}>
          {FAQS.map((faq, i) => (
            <FaqItem
              key={faq.q}
              q={faq.q}
              a={faq.a}
              open={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
