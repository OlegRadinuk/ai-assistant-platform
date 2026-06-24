// ЧЕРНОВИК — требует юридической вычитки перед публикацией

import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Политика конфиденциальности — Optisphere",
  description: "Политика обработки персональных данных в соответствии с 152-ФЗ",
}

const UPDATED = "24 июня 2026 г."

export default function PrivacyPage() {
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
          Политика конфиденциальности
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
            <h2 style={h2}>1. Общие положения</h2>
            <p>
              Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок
              обработки и защиты персональных данных физических лиц (далее — «субъекты ПД»),
              которые пользуются платформой Optisphere, расположенной в сети Интернет.
            </p>
            <p style={{ marginTop: 12 }}>
              <strong style={{ color: "var(--op-text-primary)" }}>Оператор персональных данных:</strong>{" "}
              Радинюк Олег Анатольевич, самозанятый (плательщик налога на профессиональный доход, НПД).
            </p>
            <p style={{ marginTop: 8 }}>
              <strong style={{ color: "var(--op-text-primary)" }}>ИНН:</strong> 910401189210
            </p>
            <p style={{ marginTop: 4 }}>
              <strong style={{ color: "var(--op-text-primary)" }}>Контактный email:</strong>{" "}
              <a href="mailto:radinuko@gmail.com" style={linkStyle}>radinuko@gmail.com</a>
            </p>
            <p style={{ marginTop: 4 }}>
              <strong style={{ color: "var(--op-text-primary)" }}>Telegram:</strong>{" "}
              <a href="https://t.me/aleg_rad" target="_blank" rel="noopener noreferrer" style={linkStyle}>@aleg_rad</a>
            </p>
            <p style={{ marginTop: 12 }}>
              Политика разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ
              «О персональных данных» и Федеральным законом от 21.07.2014 № 242-ФЗ
              «О внесении изменений в отдельные законодательные акты Российской Федерации в части
              уточнения порядка обработки персональных данных в информационно-телекоммуникационных сетях».
            </p>
          </section>

          <section>
            <h2 style={h2}>2. Какие персональные данные мы собираем</h2>
            <p>Оператор обрабатывает следующие категории персональных данных:</p>
            <ul style={ulStyle}>
              <li>
                <strong style={{ color: "var(--op-text-primary)" }}>При регистрации в сервисе:</strong>{" "}
                адрес электронной почты (email); имя (отображаемое имя) — при добровольном указании.
              </li>
              <li>
                <strong style={{ color: "var(--op-text-primary)" }}>В лид-формах AI-ассистентов</strong>{" "}
                (формы, встроенные в сайты клиентов платформы): имя и/или телефон/email — только те данные,
                которые субъект вводит самостоятельно.
              </li>
              <li>
                <strong style={{ color: "var(--op-text-primary)" }}>Технические данные:</strong>{" "}
                IP-адрес (для защиты от злоупотреблений и хранения факта согласия), дата и время обращения,
                тип браузера и устройства (в логах сервера).
              </li>
            </ul>
            <p style={{ marginTop: 12 }}>
              Оператор <strong style={{ color: "var(--op-text-primary)" }}>не собирает</strong>{" "}
              специальные категории персональных данных (расовое или этническое происхождение,
              политические взгляды, состояние здоровья и т.п.).
            </p>
          </section>

          <section>
            <h2 style={h2}>3. Цели обработки персональных данных</h2>
            <ul style={ulStyle}>
              <li>Регистрация и аутентификация пользователей на платформе.</li>
              <li>Оказание услуг по предоставлению доступа к платформе AI-ассистентов.</li>
              <li>
                Передача контактных данных (лидов) владельцам сайтов, использующим платформу, —
                для обратной связи с потенциальными клиентами.
              </li>
              <li>Обеспечение безопасности и предотвращение мошеннических действий.</li>
              <li>Исполнение обязательств по договору (публичной оферте).</li>
              <li>Ответы на обращения субъектов персональных данных.</li>
            </ul>
          </section>

          <section>
            <h2 style={h2}>4. Правовое основание обработки</h2>
            <p>
              Обработка персональных данных осуществляется на основании{" "}
              <strong style={{ color: "var(--op-text-primary)" }}>согласия субъекта персональных данных</strong>{" "}
              (ст. 6 ч. 1 п. 1, ст. 9 Федерального закона № 152-ФЗ).
            </p>
            <p style={{ marginTop: 12 }}>
              Согласие фиксируется в момент регистрации или заполнения лид-формы путём установки
              отметки в соответствующем чекбоксе. Дата, время и IP-адрес согласия сохраняются
              в базе данных.
            </p>
          </section>

          <section>
            <h2 style={h2}>5. Хранение и защита данных</h2>
            <p>
              Все персональные данные обрабатываются и хранятся исключительно на серверах,
              расположенных на территории Российской Федерации (хостинг-провайдер reg.ru),
              что соответствует требованиям ст. 18.1 Федерального закона № 242-ФЗ.
            </p>
            <p style={{ marginTop: 12 }}>
              Оператор применяет технические и организационные меры защиты персональных данных:
              шифрование хранимых паролей (bcrypt), TLS/HTTPS для передачи данных, ограничение
              доступа к базе данных.
            </p>
            <p style={{ marginTop: 12 }}>
              Персональные данные хранятся в течение срока действия учётной записи и
              не более 3 лет после её удаления, либо до момента отзыва согласия, если это не
              противоречит законодательным требованиям.
            </p>
          </section>

          <section>
            <h2 style={h2}>6. Передача данных третьим лицам</h2>
            <p>
              Оператор не передаёт персональные данные третьим лицам, за исключением:
            </p>
            <ul style={ulStyle}>
              <li>
                Владельцев сайтов (клиентов платформы) — в части контактных данных, переданных
                через лид-формы их ассистентов. Клиент платформы является самостоятельным получателем
                таких данных.
              </li>
              <li>
                Случаев, предусмотренных законодательством Российской Федерации (по запросу
                уполномоченных органов).
              </li>
            </ul>
            <p style={{ marginTop: 12 }}>
              Оператор не продаёт, не обменивает и не передаёт персональные данные в рекламных целях.
            </p>
          </section>

          <section>
            <h2 style={h2}>7. Файлы cookie</h2>
            <p>
              Сервис использует сессионные cookie для обеспечения аутентификации пользователей.
              Маркетинговые и аналитические cookie третьих сторон в настоящее время не применяются.
              Вы можете отключить cookie в настройках браузера, однако это может нарушить
              работу сервиса.
            </p>
          </section>

          <section>
            <h2 style={h2}>8. Права субъекта персональных данных</h2>
            <p>
              В соответствии с Федеральным законом № 152-ФЗ вы имеете право:
            </p>
            <ul style={ulStyle}>
              <li>Получить информацию об обработке ваших персональных данных.</li>
              <li>Потребовать уточнения, блокировки или уничтожения данных в случае их неполноты, устарелости, недостоверности или незаконного получения.</li>
              <li>Отозвать согласие на обработку персональных данных в любой момент.</li>
              <li>Обжаловать действия оператора в Роскомнадзоре (rkn.gov.ru).</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              Для реализации своих прав направьте запрос на email:{" "}
              <a href="mailto:radinuko@gmail.com" style={linkStyle}>radinuko@gmail.com</a>.
              Оператор рассмотрит обращение в течение 30 дней.
            </p>
          </section>

          <section>
            <h2 style={h2}>9. Изменение Политики</h2>
            <p>
              Оператор вправе вносить изменения в настоящую Политику. Актуальная версия
              размещается на данной странице. Продолжение использования сервиса после изменений
              означает согласие с новой редакцией Политики.
            </p>
          </section>

          <section>
            <h2 style={h2}>10. Контактная информация</h2>
            <p>По всем вопросам обработки персональных данных обращайтесь:</p>
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
          <Link href="/terms" style={footLinkStyle}>Пользовательское соглашение</Link>
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
