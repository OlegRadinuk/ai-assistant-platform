// ЧЕРНОВИК — требует юридической вычитки перед публикацией

import Link from "next/link"
import type { Metadata } from "next"
import { TRIAL_DAYS, PLAN_PRICES } from "@/lib/pricing"

export const metadata: Metadata = {
  title: "Публичная оферта — Optisphere",
  description: "Публичная оферта на оказание услуг платформы Optisphere",
}

const UPDATED = "24 июня 2026 г."

export default function OfferPage() {
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
          Публичная оферта
        </h1>
        <p style={{ fontSize: 14, color: "var(--op-text-muted)", marginBottom: 8 }}>
          Редакция от {UPDATED}
        </p>
        <p style={{ fontSize: 14, color: "var(--op-text-muted)", marginBottom: 48 }}>
          Настоящий документ является официальным предложением (публичной офертой) в соответствии
          со ст. 437 Гражданского кодекса Российской Федерации.
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
            <h2 style={h2}>1. Исполнитель</h2>
            <ul style={ulStyle}>
              <li><strong style={{ color: "var(--op-text-primary)" }}>Исполнитель:</strong> Радинюк Олег Анатольевич</li>
              <li><strong style={{ color: "var(--op-text-primary)" }}>Статус:</strong> самозанятый (плательщик налога на профессиональный доход, НПД)</li>
              <li><strong style={{ color: "var(--op-text-primary)" }}>ИНН:</strong> 910401189210</li>
              <li><strong style={{ color: "var(--op-text-primary)" }}>Email:</strong>{" "}
                <a href="mailto:radinuko@gmail.com" style={linkStyle}>radinuko@gmail.com</a>
              </li>
              <li><strong style={{ color: "var(--op-text-primary)" }}>Telegram:</strong>{" "}
                <a href="https://t.me/aleg_rad" target="_blank" rel="noopener noreferrer" style={linkStyle}>@aleg_rad</a>
              </li>
              <li><strong style={{ color: "var(--op-text-primary)" }}>Телефон:</strong>{" "}
                <a href="tel:+79785768451" style={linkStyle}>+7 978 576-84-51</a>
              </li>
            </ul>
            <p style={{ marginTop: 12 }}>
              Примечание: самозанятые граждане не имеют ОГРН и юридического адреса — настоящая
              оферта заключается на основании свидетельства плательщика НПД.
            </p>
          </section>

          <section>
            <h2 style={h2}>2. Предмет оферты</h2>
            <p>
              Исполнитель обязуется оказывать Заказчику услуги по предоставлению доступа к
              облачной платформе Optisphere (далее — «Сервис») для создания, настройки и
              размещения AI-ассистентов на интернет-ресурсах Заказчика.
            </p>
            <p style={{ marginTop: 12 }}>
              Акцептом настоящей оферты является регистрация на платформе и/или оплата услуг.
              С момента акцепта оферта имеет силу договора.
            </p>
          </section>

          <section>
            <h2 style={h2}>3. Пробный период</h2>
            <p>
              После регистрации Заказчику предоставляется бесплатный пробный период сроком{" "}
              <strong style={{ color: "var(--op-text-primary)" }}>{TRIAL_DAYS} (семь) календарных дней</strong>.
              В течение пробного периода доступны все основные функции платформы.
            </p>
            <p style={{ marginTop: 12 }}>
              По истечении пробного периода доступ к функциям ограничивается до оплаты
              одного из тарифов, указанных ниже.
            </p>
          </section>

          <section>
            <h2 style={h2}>4. Тарифы и стоимость услуг</h2>

            {/* Тариф Auto */}
            <div style={tariffBox}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--op-text-primary)" }}>
                    Тариф «Авто»
                  </div>
                  <div style={{ fontSize: 13, color: "var(--op-text-muted)", marginTop: 4 }}>
                    Самостоятельная настройка ассистента
                  </div>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--op-accent)", whiteSpace: "nowrap" }}>
                  {PLAN_PRICES.auto.toLocaleString("ru-RU")} ₽/мес
                </div>
              </div>
              <ul style={{ ...ulStyle, marginTop: 12 }}>
                <li>Создание AI-ассистента через визуальный конструктор</li>
                <li>Встраивание виджета на любой сайт</li>
                <li>Получение лидов из чата</li>
                <li>Ежемесячная подписка, автопродление</li>
              </ul>
            </div>

            {/* Тариф Integration */}
            <div style={{ ...tariffBox, marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--op-text-primary)" }}>
                    Тариф «Интеграция»
                  </div>
                  <div style={{ fontSize: 13, color: "var(--op-text-muted)", marginTop: 4 }}>
                    Настройка и сопровождение специалистом
                  </div>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--op-accent)", whiteSpace: "nowrap" }}>
                  от {PLAN_PRICES.integration.toLocaleString("ru-RU")} ₽/мес
                </div>
              </div>
              <ul style={{ ...ulStyle, marginTop: 12 }}>
                <li>Настройка ассистента специалистом Исполнителя</li>
                <li>Персонализация под бизнес-процессы Заказчика</li>
                <li>Интеграция с CRM и мессенджерами</li>
                <li>Техническая поддержка</li>
                <li>Цена согласовывается индивидуально (от {PLAN_PRICES.integration.toLocaleString("ru-RU")} ₽/мес)</li>
              </ul>
            </div>

            <p style={{ marginTop: 16, fontSize: 13, color: "var(--op-text-muted)" }}>
              Исполнитель вправе изменять тарифы. Об изменении действующих подписок Заказчик
              уведомляется не менее чем за 14 дней по указанному email.
            </p>
          </section>

          <section>
            <h2 style={h2}>5. Порядок оплаты</h2>
            <p>
              Оплата производится в рублях Российской Федерации на основании выставляемого
              Исполнителем счёта или реквизитов для перевода. Исполнитель выдаёт чек через
              приложение «Мой налог» (режим НПД).
            </p>
            <p style={{ marginTop: 12 }}>
              Для оплаты или уточнения реквизитов обращайтесь:{" "}
              <a href="mailto:radinuko@gmail.com" style={linkStyle}>radinuko@gmail.com</a>{" "}
              или{" "}
              <a href="https://t.me/aleg_rad" target="_blank" rel="noopener noreferrer" style={linkStyle}>@aleg_rad</a>.
            </p>
            <p style={{ marginTop: 12 }}>
              При наличии системы автоматических платежей условия списания средств описываются
              в личном кабинете. Списание производится ежемесячно в дату, соответствующую
              дате начала подписки.
            </p>
          </section>

          <section>
            <h2 style={h2}>6. Возврат средств</h2>
            <p>
              Возврат оплаченных средств производится по письменному обращению Заказчика
              на radinuko@gmail.com в течение 14 дней с даты оплаты, если услуги не были
              фактически использованы. При частичном использовании возврат осуществляется
              пропорционально неиспользованному периоду.
            </p>
          </section>

          <section>
            <h2 style={h2}>7. Условия оказания услуг</h2>
            <ul style={ulStyle}>
              <li>Услуги оказываются дистанционно посредством доступа к Сервису через интернет.</li>
              <li>Исполнитель обеспечивает функционирование Сервиса с разумными усилиями.</li>
              <li>
                Исполнитель не является оператором связи и не несёт ответственности за перебои
                в работе интернета, хостинга и сторонних API (в том числе Anthropic Claude).
              </li>
              <li>
                Качество AI-ответов зависит от модели Anthropic Claude. Исполнитель не несёт
                ответственности за содержание генерируемых ответов.
              </li>
            </ul>
          </section>

          <section>
            <h2 style={h2}>8. Ограничение ответственности</h2>
            <p>
              Максимальная ответственность Исполнителя по настоящей оферте ограничена суммой,
              фактически уплаченной Заказчиком за последний расчётный период. Исполнитель
              не несёт ответственности за упущенную выгоду и косвенные убытки.
            </p>
          </section>

          <section>
            <h2 style={h2}>9. Персональные данные</h2>
            <p>
              Обработка персональных данных Заказчика осуществляется в соответствии с{" "}
              <Link href="/privacy" style={linkStyle}>Политикой конфиденциальности</Link>.
              Данные хранятся на серверах в Российской Федерации (reg.ru).
            </p>
          </section>

          <section>
            <h2 style={h2}>10. Срок действия оферты</h2>
            <p>
              Настоящая оферта вступает в силу с момента публикации и действует бессрочно
              до её отзыва Исполнителем. Исполнитель вправе изменить или отозвать оферту,
              опубликовав новую редакцию на данной странице.
            </p>
          </section>

          <section>
            <h2 style={h2}>11. Применимое право</h2>
            <p>
              Настоящая оферта регулируется законодательством Российской Федерации.
              Споры разрешаются путём переговоров, а при недостижении согласия —
              в судебном порядке.
            </p>
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
          <Link href="/terms" style={footLinkStyle}>Пользовательское соглашение</Link>
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

const ulStyle: React.CSSProperties = {
  paddingLeft: 20,
  marginTop: 8,
  display: "flex",
  flexDirection: "column",
  gap: 6,
}

const tariffBox: React.CSSProperties = {
  background: "var(--op-bg-card)",
  border: "1px solid var(--op-border)",
  borderRadius: "var(--op-radius-lg)",
  padding: "20px 24px",
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
