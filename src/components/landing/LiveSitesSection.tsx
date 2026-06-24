// Server component — static section with live-site reference cards.
// TODO (Олег): заполни реальными URL и скринами когда появятся клиенты.

import { CONTACT } from "@/lib/pricing"

// ── Data ─────────────────────────────────────────────────────────────────────
// TODO: заменить placeholder-URL на реальные ссылки на сайты клиентов.
// Для добавления нового референса — добавь объект в массив LIVE_SITES.

interface SiteRef {
  name: string
  /** Краткое описание роли ассистента */
  assistantRole: string
  /** Ниша / сфера */
  industry: string
  /** Реальный URL сайта. Пока null → показывается плейсхолдер "Скоро". */
  url: string | null
  /** Имя ассистента, которым пользуется клиент */
  assistantName: string
}

const LIVE_SITES: SiteRef[] = [
  {
    name: "Love Lifestyle",
    assistantRole: "Консультант: подбор туров и экскурсий по Крыму, ответы 24/7",
    industry: "Лайфстайл / Туризм",
    url: "https://lovelifestyle.ru",
    assistantName: "Ассистент",
  },
  {
    name: "Vladen Crimea",
    assistantRole: "Менеджер: аренда апартаментов, наличие и цены",
    industry: "Аренда / Недвижимость",
    url: "https://vladen-crimea.ru",
    assistantName: "Ассистент",
  },
  {
    name: "Optisphere",
    assistantRole: "AI-консультант платформы: подбор тарифа, демо",
    industry: "IT / SaaS",
    url: "https://optisphere.tech",
    assistantName: "Опти",
  },
]

// ── Industry icon helper ──────────────────────────────────────────────────────
function IndustryIcon({ industry }: { industry: string }) {
  if (industry.includes("Аренд") || industry.includes("Апарт")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  }
  if (industry.includes("Клиник") || industry.includes("Медицин")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    )
  }
  // Строительство default
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="3 22 21 22 12 3 3 22" />
      <line x1="12" y1="14" x2="12" y2="18" />
    </svg>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────
function SiteCard({ site }: { site: SiteRef }) {
  return (
    <div
      style={{
        background: "var(--op-bg-card)",
        border: "1px solid var(--op-border)",
        borderRadius: "var(--op-radius-lg)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Visual placeholder — TODO: replace with real screenshot */}
      <div
        style={{
          height: 140,
          background: "var(--op-bg-elevated)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          flexShrink: 0,
        }}
        aria-label={`Превью сайта: ${site.name}`}
      >
        {/* Browser chrome imitation */}
        <div
          style={{
            position: "absolute", top: 12, left: 12, right: 12,
            display: "flex", alignItems: "center", gap: 6,
          }}
          aria-hidden="true"
        >
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>
          <div
            style={{
              flex: 1, height: 14, borderRadius: 4,
              background: "rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center",
              paddingLeft: 8,
              fontSize: 9, color: "var(--op-text-muted)",
              fontFamily: "monospace",
            }}
          >
            {site.url ?? "— ссылка появится скоро —"}
          </div>
        </div>

        {/* Placeholder content */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(232,32,32,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 8px",
              color: "var(--op-text-muted)",
            }}
          >
            <IndustryIcon industry={site.industry} />
          </div>
          <div style={{ fontSize: 11, color: "var(--op-text-muted)", fontFamily: "monospace" }}>
            {site.url ? "live" : "TODO: скрин"}
          </div>
        </div>

        {/* Live indicator */}
        {site.url && (
          <div
            style={{
              position: "absolute", top: 36, right: 14,
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 10, color: "var(--op-success)",
              fontFamily: "monospace", letterSpacing: "0.1em",
            }}
            aria-label="Сайт работает"
          >
            <span
              style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "var(--op-success)",
                display: "inline-block",
              }}
            />
            LIVE
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--op-text-primary)", marginBottom: 2 }}>
            {site.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--op-accent)", fontFamily: "monospace", letterSpacing: "0.08em" }}>
            {site.industry}
          </div>
        </div>

        <p style={{ fontSize: 13, color: "var(--op-text-secondary)", lineHeight: 1.5, flex: 1 }}>
          Ассистент <strong style={{ color: "var(--op-text-primary)" }}>{site.assistantName}</strong>:
          {" "}{site.assistantRole}
        </p>

        {site.url ? (
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, color: "var(--op-accent)", textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Открыть сайт
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        ) : (
          <div style={{ fontSize: 12, color: "var(--op-text-muted)", fontStyle: "italic" }}>
            Ссылка появится скоро
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function LiveSitesSection() {
  return (
    <section
      id="live-sites"
      style={{
        padding: "96px 0",
        background: "var(--op-bg-card)",
        position: "relative",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(232,32,32,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 48, maxWidth: 640 }}>
          <div style={{
            fontFamily: "monospace", fontSize: 11, letterSpacing: "0.18em",
            color: "var(--op-text-muted)", textTransform: "uppercase", marginBottom: 12,
          }}>
            03 · уже в работе
          </div>
          <h2 style={{
            fontSize: "clamp(28px,4vw,40px)", fontWeight: 700,
            color: "var(--op-text-primary)", lineHeight: 1.2, marginBottom: 12,
          }}>
            Уже работает на сайтах
          </h2>
          <p style={{ fontSize: 16, color: "var(--op-text-secondary)", lineHeight: 1.6 }}>
            AI-ассистенты, которые прямо сейчас общаются с клиентами наших партнёров.
          </p>
        </div>

        {/* Cards */}
        <div
          className="live-sites-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 40,
          }}
        >
          {LIVE_SITES.map((site) => (
            <SiteCard key={site.name} site={site} />
          ))}
        </div>

        {/* CTA strip */}
        <div
          style={{
            padding: "24px 28px",
            background: "var(--op-bg-elevated)",
            border: "1px solid var(--op-border)",
            borderRadius: "var(--op-radius-lg)",
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--op-text-primary)", marginBottom: 4 }}>
              Нет сайта? Сделаем сайт + ассистента под ключ
            </div>
            <div style={{ fontSize: 13, color: "var(--op-text-secondary)" }}>
              Олег сделает продающий сайт и настроит AI-ассистента — всё вместе, за фиксированную стоимость.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href={`https://t.me/${CONTACT.telegram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ height: 44, padding: "0 20px", fontSize: 14, fontWeight: 600 }}
            >
              {CONTACT.telegram}
            </a>
            <a
              href={`tel:${CONTACT.phone}`}
              className="btn btn-ghost"
              style={{ height: 44, padding: "0 20px", fontSize: 14 }}
            >
              {CONTACT.phone}
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .live-sites-grid { grid-template-columns: repeat(3, 1fr) !important; }
        @media (max-width: 900px) {
          .live-sites-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .live-sites-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
