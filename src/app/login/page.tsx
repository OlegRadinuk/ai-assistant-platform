"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Ошибка входа")
        return
      }
      router.push("/dashboard")
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
          <Link href="/signup" style={{ fontSize: 14, color: "var(--op-text-secondary)", textDecoration: "none" }}>
            Нет аккаунта? <span style={{ color: "var(--op-accent)" }}>Создать бесплатно</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative", zIndex: 10 }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
            Добро пожаловать
          </h1>
          <p style={{ color: "var(--op-text-secondary)", marginBottom: 32, fontSize: 15 }}>
            Войдите в кабинет, чтобы управлять ассистентами.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="demo@example.com"
                autoComplete="email"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--op-border-focus)" }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--op-border)" }}
              />
            </div>
            <div>
              <label htmlFor="password" style={labelStyle}>Пароль</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••"
                autoComplete="current-password"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--op-border-focus)" }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--op-border)" }}
              />
            </div>
            {error && (
              <p role="alert" aria-live="polite" style={{ color: "var(--op-danger)", fontSize: "0.875rem", margin: 0 }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? "Входим…" : "Войти"}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: 12, color: "var(--op-text-muted)", textAlign: "center" }}>
            <Link href="/privacy" style={{ color: "var(--op-text-muted)", textDecoration: "underline" }}>
              Политика конфиденциальности
            </Link>
          </p>

          <div style={{
            marginTop: 16, padding: "14px 16px",
            background: "var(--op-bg-elevated)",
            border: "1px solid var(--op-border)",
            borderRadius: "var(--op-radius-md)",
            fontSize: 13, color: "var(--op-text-muted)",
          }}>
            <strong style={{ color: "var(--op-text-secondary)", display: "block", marginBottom: 8 }}>Хотите посмотреть без регистрации?</strong>
            <button
              type="button"
              onClick={() => {
                setEmail("demo@example.com")
                setPassword("demo1234")
              }}
              style={{
                display: "block", width: "100%", textAlign: "center",
                padding: "8px 14px", borderRadius: "var(--op-radius-md)",
                background: "rgba(232,32,32,0.1)", border: "1px solid rgba(232,32,32,0.25)",
                color: "var(--op-accent)", fontSize: 13, fontWeight: 600,
                cursor: "pointer", marginBottom: 6, transition: "background 160ms",
              }}
            >
              Войти как демо
            </button>
            <span style={{ fontSize: 12, color: "var(--op-text-muted)" }}>demo@example.com / demo1234</span>
          </div>
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
