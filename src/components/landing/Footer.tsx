import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer style={{
      padding: "40px clamp(20px,4vw,48px)",
      borderTop: "1px solid var(--op-border)",
      background: "var(--op-bg)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Top row: logo + nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Image
              src="/optisphere-logo-dark.png"
              alt="Optisphere"
              width={120}
              height={28}
              style={{ height: 26, width: "auto" }}
            />
          </Link>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <a href="#features" style={{ fontSize: 14, color: "var(--op-text-muted)", textDecoration: "none" }}>Возможности</a>
            <a href="#pricing" style={{ fontSize: 14, color: "var(--op-text-muted)", textDecoration: "none" }}>Тарифы</a>
            <a href="#faq" style={{ fontSize: 14, color: "var(--op-text-muted)", textDecoration: "none" }}>FAQ</a>
            <Link href="/login" style={{ fontSize: 14, color: "var(--op-text-muted)", textDecoration: "none" }}>Войти</Link>
            <Link href="/signup" style={{ fontSize: 14, color: "var(--op-accent)", textDecoration: "none", fontWeight: 600 }}>Попробовать бесплатно</Link>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--op-border)", margin: "24px 0" }} />

        {/* Bottom row: requisites + legal links + copyright */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
          {/* Operator requisites */}
          <div style={{ fontSize: 12, color: "var(--op-text-muted)", lineHeight: 1.6 }}>
            <span style={{ color: "var(--op-text-secondary)", fontWeight: 600 }}>Радинюк Олег Анатольевич</span>
            {" · "}самозанятый (НПД)
            {" · "}ИНН 910401189210
            <br />
            <a href="mailto:radinuko@gmail.com" style={{ color: "var(--op-text-muted)", textDecoration: "none" }}>
              radinuko@gmail.com
            </a>
            {" · "}Данные на серверах в России (reg.ru)
          </div>

          {/* Legal links */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/privacy" style={{ fontSize: 12, color: "var(--op-text-muted)", textDecoration: "none" }}>Политика конфиденциальности</Link>
            <Link href="/terms" style={{ fontSize: 12, color: "var(--op-text-muted)", textDecoration: "none" }}>Соглашение</Link>
            <Link href="/offer" style={{ fontSize: 12, color: "var(--op-text-muted)", textDecoration: "none" }}>Оферта</Link>
            <span style={{ fontSize: 12, color: "var(--op-text-muted)" }}>152-ФЗ</span>
          </div>
        </div>

        {/* Copyright */}
        <p style={{ fontSize: 12, color: "var(--op-text-muted)", marginTop: 16 }}>
          &copy; 2026 Optisphere
        </p>
      </div>
    </footer>
  )
}
