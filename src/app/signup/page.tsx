"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [pdConsent, setPdConsent] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pdConsent) {
      setError("Необходимо согласие на обработку персональных данных")
      return
    }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName, pdConsent: true, consentVersion: "1.0" }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Ошибка регистрации")
        return
      }
      router.push("/onboarding")
    } catch {
      setError("Ошибка сети. Попробуйте снова.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Grid bg */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Header */}
      <header style={{ height: 60, display: "flex", alignItems: "center", padding: "0 clamp(20px,4vw,48px)", borderBottom: "1px solid var(--op-border)", flexShrink: 0, position: "relative", zIndex: 10 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <Image src="/optisphere-logo-dark.png" alt="Optisphere" width={130} height={30} style={{ height: 28, width: "auto" }} />
        </Link>
        <div style={{ marginLeft: "auto" }}>
          <Link href="/login" style={{ fontSize: 14, color: "var(--op-text-secondary)", textDecoration: "none" }}>
            Уже есть аккаунт? <span style={{ color: "var(--op-accent)" }}>Войти</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative", zIndex: 10 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
            Создайте аккаунт
          </h1>
          <p style={{ color: "var(--op-text-secondary)", marginBottom: 32, fontSize: 15 }}>
            Бесплатный пробный период. Ассистент — через 10 минут.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label htmlFor="displayName" style={labelStyle}>
                Ваше имя <span style={{ color: "var(--op-text-muted)" }}>(опционально)</span>
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Иван"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--op-border-focus)" }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--op-border)" }}
              />
            </div>
            <div>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--op-border-focus)" }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--op-border)" }}
              />
            </div>
            <div>
              <label htmlFor="password" style={labelStyle}>Пароль (мин. 6 символов)</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••"
                autoComplete="new-password"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--op-border-focus)" }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--op-border)" }}
              />
            </div>

            {/* 152-ФЗ Consent checkbox — required */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={pdConsent}
                onChange={(e) => setPdConsent(e.target.checked)}
                required
                style={{
                  width: 18, height: 18, marginTop: 2,
                  accentColor: "var(--op-accent)",
                  flexShrink: 0,
                }}
                aria-required="true"
              />
              <span style={{ fontSize: 13, color: "var(--op-text-secondary)", lineHeight: 1.5 }}>
                Согласен на обработку персональных данных и принимаю{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--op-accent)", textDecoration: "none" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Политику конфиденциальности
                </a>
              </span>
            </label>

            {error && (
              <p role="alert" aria-live="polite" style={{ color: "var(--op-danger)", fontSize: "0.875rem", margin: 0 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !pdConsent}
              style={{ marginTop: 4, opacity: (!pdConsent || loading) ? 0.6 : 1, transition: "opacity 0.15s" }}
            >
              {loading ? "Создаём аккаунт…" : "Зарегистрироваться"}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 12, color: "var(--op-text-muted)", textAlign: "center", lineHeight: 1.5 }}>
            Регистрируясь, вы принимаете условия использования сервиса.
            Данные хранятся на серверах в России.
          </p>
        </div>
      </div>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.875rem", color: "var(--op-text-secondary)", marginBottom: 6,
}
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  background: "var(--op-bg-elevated)",
  border: "1px solid var(--op-border)",
  borderRadius: "var(--op-radius-md)",
  color: "var(--op-text-primary)",
  fontSize: "0.9375rem", outline: "none",
  transition: "border-color 0.15s",
}
