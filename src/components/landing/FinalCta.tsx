import Link from "next/link"
import { CONTACT } from "@/lib/pricing"

export default function FinalCta() {
  return (
    <section
      id="contact"
      style={{
        padding: "96px 0",
        background: "var(--op-bg-card)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 50% 80% at 50% 50%, rgba(232,32,32,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "var(--op-text-primary)", lineHeight: 1.15, marginBottom: 16 }}>
          Запустите AI-сотрудника сегодня
        </h2>
        <p style={{ fontSize: 16, color: "var(--op-text-secondary)", lineHeight: 1.6, marginBottom: 36 }}>
          10 минут настройки. 7 дней бесплатно. Первая заявка — уже сегодня вечером.
        </p>

        <div className="final-cta-btns" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/signup"
            className="btn btn-primary"
            style={{ height: 52, padding: "0 32px", fontSize: 16, fontWeight: 600 }}
          >
            Попробовать бесплатно — 7 дней
          </Link>
          <a
            href={`https://t.me/${CONTACT.telegram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ height: 52, padding: "0 28px", fontSize: 15 }}
          >
            Сделаем под ключ
          </a>
        </div>

        <p style={{ fontSize: 12, color: "var(--op-text-muted)", marginTop: 16 }}>
          Без кредитной карты · После триала ассистент ждёт оплаты · Отмена в любой момент
        </p>

        {/* Widget install hint */}
        <div
          style={{
            marginTop: 32,
            padding: "20px 24px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--op-border)",
            borderRadius: "var(--op-radius-md)",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--op-text-primary)" }}>
              Установка виджета на сайт
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--op-text-secondary)", lineHeight: 1.6, margin: 0 }}>
            После создания ассистента вы получите одну строку кода. Вставьте её на ваш сайт перед{" "}
            <code
              style={{
                fontFamily: "monospace", fontSize: 12,
                background: "rgba(255,255,255,0.06)",
                padding: "1px 5px", borderRadius: 4,
                color: "var(--op-text-primary)",
              }}
            >
              &lt;/body&gt;
            </code>
            . Не знаете как — передайте код вашему веб-разработчику или напишите Олегу:{" "}
            <a
              href={`https://t.me/${CONTACT.telegram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--op-accent)", textDecoration: "none" }}
            >
              {CONTACT.telegram}
            </a>
            {" "}/ {" "}
            <a
              href={`tel:${CONTACT.phone}`}
              style={{ color: "var(--op-accent)", textDecoration: "none" }}
            >
              {CONTACT.phone}
            </a>
          </p>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: 16, padding: "12px 20px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--op-border)",
          borderRadius: "var(--op-radius-md)",
          display: "inline-block",
          fontSize: 13, color: "var(--op-text-muted)",
        }}>
          Хотите сначала посмотреть?{" "}
          <Link href="/login" style={{ color: "var(--op-accent)", textDecoration: "none" }}>
            Войти как демо
          </Link>
          {" "}(demo@example.com / demo1234)
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .final-cta-btns { flex-direction: column; align-items: stretch; }
          .final-cta-btns .btn { justify-content: center; }
        }
      `}</style>
    </section>
  )
}
