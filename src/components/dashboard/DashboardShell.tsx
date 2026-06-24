"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { DashboardTour } from "@/components/dashboard/DashboardTour"

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconBarChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)
const IconBot = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /><line x1="12" y1="3" x2="12" y2="11" /><circle cx="12" cy="16" r="1" />
  </svg>
)

const NAV_ITEMS = [
  { label: "Обзор", href: "/dashboard", icon: <IconHome />, tourKey: undefined },
  { label: "Ассистенты", href: "/dashboard/assistants", icon: <IconBot />, tourKey: undefined },
  { label: "Заявки", href: "/dashboard/leads", icon: <IconUsers />, tourKey: "tour-nav-leads" },
  { label: "Аналитика", href: "/dashboard/analytics", icon: <IconBarChart />, tourKey: "tour-nav-analytics" },
]

// ── Sidebar nav item ──────────────────────────────────────────────────────────

function SidebarItem({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 20px", borderRadius: "0 8px 8px 0",
        background: active ? "rgba(232,32,32,0.08)" : "transparent",
        borderLeft: active ? "2px solid var(--op-accent)" : "2px solid transparent",
        textDecoration: "none", transition: "background 160ms",
        marginRight: 8,
        color: active ? "var(--op-text-primary)" : "var(--op-text-secondary)",
      }}
      aria-current={active ? "page" : undefined}
    >
      <span style={{ color: active ? "var(--op-accent)" : "inherit" }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{label}</span>
    </Link>
  )
}

// ── Bottom nav ─────────────────────────────────────────────────────────────────

function BottomNav({ activePath }: { activePath: string }) {
  return (
    <nav
      aria-label="Навигация"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "var(--op-bg-card)", borderTop: "1px solid var(--op-border)",
        height: 60, display: "flex", justifyContent: "space-around", alignItems: "center",
        zIndex: 50, paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = activePath === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "4px 12px", textDecoration: "none",
              color: active ? "var(--op-accent)" : "var(--op-text-secondary)",
              opacity: active ? 1 : 0.65,
            }}
          >
            {item.icon}
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

// ── Main shell ────────────────────────────────────────────────────────────────

interface Props {
  children: React.ReactNode
  userEmail?: string
  hasAssistants?: boolean
}

export default function DashboardShell({ children, userEmail, hasAssistants = false }: Props) {
  const pathname = usePathname()
  const [logoutLoading, setLogoutLoading] = useState(false)

  async function handleLogout() {
    setLogoutLoading(true)
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <>
      <style>{`
        .dash-sidebar { display: flex !important; }
        .dash-bottom-nav { display: none !important; }
        @media (max-width: 767px) {
          .dash-sidebar { display: none !important; }
          .dash-bottom-nav { display: flex !important; }
          .dash-content { margin-left: 0 !important; padding-bottom: 80px !important; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100svh" }}>
        {/* Sidebar */}
        <aside
          className="dash-sidebar"
          style={{
            width: 240, background: "var(--op-bg-card)",
            borderRight: "1px solid var(--op-border)",
            position: "sticky", top: 0, height: "100svh",
            overflowY: "auto", flexDirection: "column", flexShrink: 0, padding: "24px 0",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", padding: "0 20px", marginBottom: 32, textDecoration: "none" }}>
            <Image src="/optisphere-logo-dark.png" alt="Optisphere" width={130} height={28} style={{ height: 26, width: "auto" }} />
          </Link>

          {/* Nav */}
          <nav style={{ flex: 1 }}>
            {NAV_ITEMS.map((item) => (
              <div key={item.href} data-tour={item.tourKey}>
                <SidebarItem href={item.href} label={item.label} icon={item.icon} active={pathname === item.href} />
              </div>
            ))}
          </nav>

          {/* Bottom */}
          <div style={{ padding: "24px 20px 0", marginTop: "auto" }}>
            {userEmail && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "var(--op-text-muted)", marginBottom: 2 }}>Вы вошли как</div>
                <div style={{ fontSize: 13, color: "var(--op-text-secondary)", wordBreak: "break-all" }}>{userEmail}</div>
              </div>
            )}
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="btn btn-ghost"
              style={{ width: "100%", justifyContent: "center", height: 36, fontSize: 13 }}
            >
              {logoutLoading ? "Выходим…" : "Выйти"}
            </button>
            <Link
              href="/onboarding"
              data-tour="tour-create-btn"
              className="btn btn-primary"
              style={{ display: "flex", width: "100%", justifyContent: "center", height: 40, fontSize: 13, marginTop: 10 }}
            >
              + Новый ассистент
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main
          className="dash-content"
          style={{ flex: 1, padding: "32px clamp(20px,3vw,40px)", overflowX: "hidden", minWidth: 0 }}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="dash-bottom-nav">
        <BottomNav activePath={pathname} />
      </div>

      {/* Interactive tour */}
      <DashboardTour hasAssistants={hasAssistants} />
    </>
  )
}
