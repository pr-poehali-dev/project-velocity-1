import { Header } from "@/components/Header"
import { HeroSection } from "@/components/HeroSection"
import { PartnersSection } from "@/components/PartnersSection"
import { FeaturesSection } from "@/components/FeaturesSection"

export default function Index() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <HeroSection />
      <PartnersSection />
      <FeaturesSection />
      <footer className="py-8 text-center text-sm text-gray-400">
        Играй ответственно — LuckyAce Casino является демо-платформой.{" "}
        <span className="font-medium text-white">18+ Играй в своё удовольствие.</span>
      </footer>
    </main>
  )
}