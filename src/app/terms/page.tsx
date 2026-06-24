// ЧЕРНОВИК — требует юридической вычитки перед публикацией

import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Пользовательское соглашение — Optisphere",
  description: "Условия использования сервиса Optisphere",
}

const UPDATED = "24 июня 2026 г."

export default function TermsPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--op-bg)",
        color: "var(--op-text-primary)",
      }}
    >
      {/* Grid bg */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "clamp(32px, 5vw, 72px) clamp(20px, 4vw, 48px)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            color: "var(--op-text-muted)",
            textDecoration: "none",
            marginBottom: 32,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          На главную
        </Link>

        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          Пользовательское соглашение
        </h1>
        <p style={{ fontSize: 14, color: "var(--op-text-muted)", marginBottom: 48 }}>
          Редакция от {UPDATED}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 40,
            fontSize: 15,
            lineHeight: 1.75,
            color: "var(--op-text-secondary)",
          }}
        >
          <section>
            <h2 style={h2}>1. Стороны соглашения</h2>
            <p>
              Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong style={{ color: "var(--op-text-primary)" }}>Исполнителем</strong>:{" "}
                Радинюк Олег Анатольевич, самозанятый (плательщик НПД), ИНН 910401189210,
                email: radinuko@gmail.com — владелец платформы Optisphere.
              </li>
              <li>
                <strong style={{ color: "var(--op-text-primary)" }}>Пользователем</strong>:{" "}
                физическое или юридическое лицо, прошедшее регистрацию на платформе
                и принявшее условия настоящего Соглашения.
              </li>
            </ul>
            <p style={{ marginTop: 12 }}>
              Регистрация на платформе означает полное и безоговорочное принятие условий
              настоящего Соглашения.
            </p>
          </section>

          <section>
            <h2 style={h2}>2. Предмет соглашения</h2>
            <p>
              Исполнитель предоставляет Пользователю доступ к платформе Optisphere —
              SaaS-сервису для создания и размещения AI-ассистентов на сайтах клиентов.
              Услуги оказываются дистанционно, в режиме «как есть» (as-is).
            </p>
          </section>

          <section>
            <h2 style={h2}>3. Регистрация и учётная запись</h2>
            <ul style={ulStyle}>
              <li>Для использования сервиса необходима регистрация с указанием действующего email.</li>
              <li>Пользователь несёт ответственность за сохранность учётных данных (логин, пароль).</li>
              <li>Передача учётных данных третьим лицам запрещена.</li>
              <li>Исполнитель вправе заблокировать учётную запись при нарушении условий Соглашения.</li>
              <li>При регистрации Пользователь даёт согласие на обработку персональных данных
              в соответствии с <Link href="/privacy" style={linkStyle}>Политикой конфиденциальности</Link>.</li>
            </ul>
          </section>

          <section>
            <h2 style={h2}>4. Пробный период и тарифы</h2>
            <p>
              После регистрации Пользователю предоставляется бесплатный пробный период
              сроком <strong style={{ color: "var(--op-text-primary)" }}>7 дней</strong>, в течение которого
              доступны все основные функции платформы.
            </p>
            <p style={{ marginTop: 12 }}>
              После окончания пробного периода для продолжения использования необходимо
              перейти на платный тариф. Актуальные тарифы и условия оплаты указаны в{" "}
              <Link href="/offer" style={linkStyle}>Публичной оферте</Link>.
            </p>
          </section>

          <section>
            <h2 style={h2}>5. Права и обязанности сторон</h2>
            <h3 style={h3}>Пользователь обязуется:</h3>
            <ul style={ulStyle}>
              <li>Не использовать платформу для распространения незаконного или вредоносного контента.</li>
              <li>Не предпринимать действий, нарушающих работу платформы или создающих избыточную нагрузку.</li>
              <li>Не передавать третьим лицам доступ к кабинету без разрешения Исполнителя.</li>
              <li>Своевременно оплачивать услуги в соответствии с выбранным тарифом.</li>
              <li>Самостоятельно обеспечивать соблюдение требований законодательства при использовании
              ассистентов на своих ресурсах, в том числе в части обработки персональных данных
              посетителей своих сайтов.</li>
            </ul>
            <h3 style={{ ...h3, marginTop: 16 }}>Исполнитель обязуется:</h3>
            <ul style={ulStyle}>
              <li>Обеспечивать функционирование платформы с разумными усилиями.</li>
              <li>Уведомлять о плановых технических работах заблаговременно.</li>
              <li>Не раскрывать данные Пользователя третьим лицам (кроме случаев, предусмотренных законом).</li>
            </ul>
          </section>

          <section>
            <h2 style={h2}>6. Ограничение ответственности</h2>
            <p>
              Платформа предоставляется «как есть». Исполнитель не гарантирует непрерывную
              и безошибочную работу сервиса. Максимальный размер ответственности Исполнителя
              не превышает суммы фактически оплаченных Пользователем за последний расчётный период услуг.
            </p>
            <p style={{ marginTop: 12 }}>
              Исполнитель не несёт ответственности за содержание AI-диалогов, генерируемых моделями
              третьих сторон (Anthropic Claude), а также за действия Пользователей платформы
              в отношении их посетителей.
            </p>
          </section>

          <section>
            <h2 style={h2}>7. Интеллектуальная собственность</h2>
            <p>
              Все права на платформу, её дизайн, программный код и брендинг принадлежат
              Исполнителю. Пользователю предоставляется ограниченное непередаваемое право
              использования платформы в рамках настоящего Соглашения.
            </p>
          </section>

          <section>
            <h2 style={h2}>8. Расторжение</h2>
            <p>
              Пользователь вправе в любое время отказаться от использования сервиса, удалив
              учётную запись или направив соответствующий запрос на{" "}
              <a href="mailto:radinuko@gmail.com" style={linkStyle}>radinuko@gmail.com</a>.
              Уже оплаченные периоды не возвращаются, если иное не установлено тарифом.
            </p>
            <p style={{ marginTop: 12 }}>
              Исполнитель вправе расторгнуть Соглашение в одностороннем порядке при нарушении
              Пользователем его условий, без возврата оплаченных средств.
            </p>
          </section>

          <section>
            <h2 style={h2}>9. Изменение соглашения</h2>
            <p>
              Исполнитель вправе изменять условия Соглашения. Актуальная редакция публикуется
              на данной странице. Продолжение использования сервиса после изменений означает
              принятие новых условий.
            </p>
          </section>

          <section>
            <h2 style={h2}>10. Применимое право</h2>
            <p>
              Настоящее Соглашение регулируется законодательством Российской Федерации.
              Споры разрешаются в порядке переговоров, а при недостижении согласия —
              в судебном порядке по месту нахождения Исполнителя.
            </p>
          </section>

          <section>
            <h2 style={h2}>11. Контакты</h2>
            <ul style={ulStyle}>
              <li>Email: <a href="mailto:radinuko@gmail.com" style={linkStyle}>radinuko@gmail.com</a></li>
              <li>Telegram: <a href="https://t.me/aleg_rad" target="_blank" rel="noopener noreferrer" style={linkStyle}>@aleg_rad</a></li>
              <li>Телефон: <a href="tel:+79785768451" style={linkStyle}>+7 978 576-84-51</a></li>
            </ul>
          </section>
        </div>

        <div
          style={{
            marginTop: 56,
            paddingTop: 32,
            borderTop: "1px solid var(--op-border)",
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <Link href="/privacy" style={footLinkStyle}>Политика конфиденциальности</Link>
          <Link href="/offer" style={footLinkStyle}>Публичная оферта</Link>
          <Link href="/" style={footLinkStyle}>На главную</Link>
        </div>
      </div>
    </main>
  )
}

const h2: React.CSSProperties = {
  fontSize: "1.2rem",
  fontWeight: 700,
  color: "var(--op-text-primary)",
  marginBottom: 12,
  letterSpacing: "-0.01em",
}

const h3: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "var(--op-text-primary)",
  marginBottom: 8,
}

const ulStyle: React.CSSProperties = {
  paddingLeft: 20,
  marginTop: 8,
  display: "flex",
  flexDirection: "column",
  gap: 6,
}

const linkStyle: React.CSSProperties = {
  color: "var(--op-accent)",
  textDecoration: "none",
}

const footLinkStyle: React.CSSProperties = {
  fontSize: 14,
  color: "var(--op-text-muted)",
  textDecoration: "none",
}
