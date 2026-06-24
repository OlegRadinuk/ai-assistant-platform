import NavBar from "@/components/landing/NavBar"
import LandingHero from "@/components/landing/LandingHero"
import FeatureGrid from "@/components/landing/FeatureGrid"
import RoleNicheGrid from "@/components/landing/RoleNicheGrid"
import CasesSection from "@/components/landing/CasesSection"
import LiveSitesSection from "@/components/landing/LiveSitesSection"
import PricingSection from "@/components/landing/PricingSection"
import FaqSection from "@/components/landing/FaqSection"
import FinalCta from "@/components/landing/FinalCta"
import Footer from "@/components/landing/Footer"

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main>
        {/* 1. Hero с живым чатом Опти */}
        <LandingHero />
        {/* 2. Возможности платформы */}
        <FeatureGrid />
        {/* 3. Роли и ниши (без эмодзи) */}
        <RoleNicheGrid />
        {/* 4. Живые примеры сайтов */}
        <LiveSitesSection />
        {/* 5. Кейсы / результаты */}
        <CasesSection />
        {/* 6. Тарифы из API */}
        <PricingSection />
        {/* 7. FAQ */}
        <FaqSection />
        {/* 8. Финальный CTA + виджет инструкция */}
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
