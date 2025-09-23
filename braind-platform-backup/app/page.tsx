import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { GamesCatalog } from "@/components/games-catalog"
import { Leaderboard } from "@/components/leaderboard"
import { StarknetIntegration } from "@/components/starknet-integration"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <GamesCatalog />
        <Leaderboard />
        <StarknetIntegration />
      </main>
      <Footer />
    </div>
  )
}
