"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: "Возможности", href: "#features" },
    { label: "Роли и сферы", href: "#roles" },
    { label: "Тарифы", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ]

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 clamp(20px,4vw,48px)",
          background: scrolled ? "rgba(10,10,15,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid var(--op-border)" : "none",
          transition: "all 220ms ease",
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}
        >
          <Image
            src="/optisphere-logo-dark.png"
            alt="Optisphere"
            width={140}
            height={32}
            style={{ height: 30, width: "auto" }}
            priority
          />
        </Link>

        <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 32, marginLeft: 48, flex: 1 }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{ fontFamily: "var(--op-font-body)", fontSize: 14, color: "var(--op-text-secondary)", textDecoration: "none", transition: "color 160ms" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--op-text-primary)" }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--op-text-secondary)" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/login" className="nav-login btn btn-ghost" style={{ height: 36, padding: "0 16px", fontSize: 14 }}>
            Войти
          </Link>
          <Link href="/signup" className="btn btn-primary" style={{ height: 40, padding: "0 20px", fontSize: 14 }}>
            Попробовать бесплатно
          </Link>
          <button
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setMenuOpen((v) => !v)}
            className="nav-hamburger"
            style={{
              display: "none",
              width: 40, height: 40,
              background: "transparent",
              border: "1px solid var(--op-border)",
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--op-text-primary)" strokeWidth="1.5" strokeLinecap="round">
              {menuOpen ? (
                <><line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" /></>
              ) : (
                <><line x1="3" y1="6" x2="17" y2="6" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="14" x2="17" y2="14" /></>
              )}
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 98 }}
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99,
                background: "var(--op-bg-card)", borderTop: "1px solid var(--op-border)",
                borderRadius: "20px 20px 0 0",
                padding: "24px 24px calc(24px + env(safe-area-inset-bottom))",
                display: "flex", flexDirection: "column", gap: 8,
              }}
            >
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: "var(--op-font-body)", fontSize: 18,
                    color: "var(--op-text-primary)", textDecoration: "none",
                    padding: "14px 0", borderBottom: "1px solid var(--op-border)",
                  }}
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.06 }}
                style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}
              >
                <Link href="/signup" className="btn btn-primary" onClick={() => setMenuOpen(false)} style={{ width: "100%", justifyContent: "center" }}>
                  Попробовать бесплатно
                </Link>
                <Link href="/login" className="btn btn-ghost" onClick={() => setMenuOpen(false)} style={{ width: "100%", justifyContent: "center" }}>
                  Войти
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 767px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-login { display: none !important; }
        }
      `}</style>
    </>
  )
}
