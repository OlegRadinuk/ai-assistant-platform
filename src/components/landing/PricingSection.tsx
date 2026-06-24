// Server component — fetches pricing data at request time
import { TRIAL_DAYS, PLAN_PRICES, CONTACT } from "@/lib/pricing"

function PricingCard({
  title,
  subtitle,
  price,
  priceFrom,
  period,
  features,
  cta,
  ctaHref,
  ctaIsContact,
  accent,
}: {
  title: string
  subtitle: string
  price: number
  priceFrom?: boolean
  period: string
  features: string[]
  cta: string
  ctaHref: string
  ctaIsContact?: boolean
  accent?: boolean
}) {
  return (
    <div
      style={{
        background: accent ? "var(--op-bg-elevated)" : "var(--op-bg-card)",
        border: accent
          ? "1px solid rgba(232,32,32,0.35)"
          : "1px solid var(--op-border)",
        borderRadius: "var(--op-radius-xl)",
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        position: "relative",
        boxShadow: accent ? "0 0 40px rgba(232,32,32,0.08)" : "none",
      }}
    >
      {accent && (
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: 2,
            background: "linear-gradient(90deg, var(--op-accent), #ff6b35)",
            borderRadius: "var(--op-radius-xl) var(--op-radius-xl) 0 0",
          }}
        />
      )}

      <div>
        <div
          style={{
            fontSize: 11, fontFamily: "monospace", letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: accent ? "var(--op-accent)" : "var(--op-text-muted)",
            marginBottom: 8,
          }}
        >
          {accent ? "Популярный" : "Корпоративный"}
        </div>
        <h3
          style={{
            fontSize: "clamp(18px,2vw,22px)", fontWeight: 700,
            color: "var(--op-text-primary)", marginBottom: 6,
          }}
        >
          {title}
        </h3>
        <p style={{ fontSize: 13, color: "var(--op-text-secondary)", lineHeight: 1.5 }}>
          {subtitle}
        </p>
      </div>

      {/* Price */}
      <div style={{ borderTop: "1px solid var(--op-border)", paddingTop: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          {priceFrom && (
            <span style={{ fontSize: 13, color: "var(--op-text-muted)" }}>от</span>
          )}
          <span
            style={{
              fontSize: "clamp(32px,4vw,42px)", fontWeight: 800,
              color: "var(--op-text-primary)", lineHeight: 1,
              fontFamily: "monospace",
            }}
          >
            {price.toLocaleString("ru-RU")} ₽
          </span>
        </div>
        <div style={{ fontSize: 13, color: "var(--op-text-muted)", marginTop: 4 }}>
          {period}
        </div>
      </div>

      {/* Features */}
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {features.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "var(--op-text-secondary)", lineHeight: 1.5 }}>
            <svg
              style={{ flexShrink: 0, marginTop: 2 }}
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="var(--op-accent)" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {ctaIsContact ? (
        <a
          href={`https://t.me/${CONTACT.telegram.replace("@", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
          style={{
            width: "100%", justifyContent: "center",
            height: 48, fontSize: 15,
          }}
        >
          {cta}
        </a>
      ) : (
        <a
          href={ctaHref}
          className="btn btn-primary"
          style={{
            width: "100%", justifyContent: "center",
            height: 48, fontSize: 15, fontWeight: 600,
          }}
        >
          {cta}
        </a>
      )}
    </div>
  )
}

export default function PricingSection() {
  const trialDays = TRIAL_DAYS
  const autoPrice = PLAN_PRICES.auto
  const integrationPrice = PLAN_PRICES.integration

  return (
    <section
      id="pricing"
      style={{
        padding: "96px 0",
        background: "var(--op-bg)",
        position: "relative",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(232,32,32,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 56, maxWidth: 640 }}>
          <div style={{
            fontFamily: "monospace", fontSize: 11, letterSpacing: "0.18em",
            color: "var(--op-text-muted)", textTransform: "uppercase", marginBottom: 12,
          }}>
            04 · тарифы
          </div>
          <h2 style={{
            fontSize: "clamp(28px,4vw,40px)", fontWeight: 700,
            color: "var(--op-text-primary)", lineHeight: 1.2, marginBottom: 12,
          }}>
            Честные цены
          </h2>
          <p style={{ fontSize: 16, color: "var(--op-text-secondary)", lineHeight: 1.6 }}>
            {trialDays} дней бесплатно — без карты, без подвохов. После пробного периода
            ассистент останавливается до оплаты.
          </p>
        </div>

        {/* Trial banner */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "16px 24px",
            background: "rgba(232,32,32,0.07)",
            border: "1px solid rgba(232,32,32,0.2)",
            borderRadius: "var(--op-radius-md)",
            marginBottom: 32,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p style={{ fontSize: 14, color: "var(--op-text-secondary)", margin: 0 }}>
            <strong style={{ color: "var(--op-text-primary)" }}>
              Пробный период {trialDays} дней — бесплатно
            </strong>
            {" "}— без кредитной карты. Ассистент полностью работает. После окончания триала
            — ждёт оплаты, клиентам не отвечает.
          </p>
        </div>

        {/* Cards grid */}
        <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <PricingCard
            title="Авто-ассистент"
            subtitle="Самостоятельная настройка. Создаёте и управляете сами через кабинет."
            price={autoPrice}
            period="в месяц после триала"
            features={[
              `Пробный период ${trialDays} дней бесплатно`,
              "Онбординг за 10 минут без программиста",
              "Виджет на сайт — одна строка кода",
              "Лиды в Telegram мгновенно",
              "Кабинет: история диалогов, статистика",
              "Поддержка по email",
            ]}
            cta={`Начать бесплатно — ${trialDays} дней`}
            ctaHref="/signup"
            accent
          />
          <PricingCard
            title="Интеграция под ключ"
            subtitle="Олег настраивает за вас. Интеграция с МИС, CRM, 1С и другими системами."
            price={integrationPrice}
            priceFrom
            period="в месяц, по договорённости"
            features={[
              "Всё из тарифа «Авто»",
              "Интеграция с МИС / CRM / 1С",
              "Настройка и обучение Олегом",
              "Белый лейбл (ваш брендинг)",
              "Приоритетная поддержка",
              "Персональный SLA",
            ]}
            cta="Обсудить проект"
            ctaHref={`https://t.me/${CONTACT.telegram.replace("@", "")}`}
            ctaIsContact
          />
        </div>

        {/* Contact hint under cards */}
        <p
          style={{
            marginTop: 24, fontSize: 13, color: "var(--op-text-muted)",
            textAlign: "center",
          }}
        >
          Вопросы по тарифам или нужна интеграция?{" "}
          <a
            href={`https://t.me/${CONTACT.telegram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--op-accent)", textDecoration: "none" }}
          >
            {CONTACT.telegram}
          </a>
          {" "}или{" "}
          <a
            href={`tel:${CONTACT.phone}`}
            style={{ color: "var(--op-accent)", textDecoration: "none" }}
          >
            {CONTACT.phone}
          </a>
        </p>
      </div>

      <style>{`
        .pricing-grid { grid-template-columns: 1fr 1fr !important; }
        @media (max-width: 768px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
