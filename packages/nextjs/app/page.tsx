import { HeroSection } from "~~/components/HeroSection";
import { GamesCatalog } from "~~/components/GamesCatalog";
import { Leaderboard } from "~~/components/Leaderboard";
import { StarknetIntegration } from "~~/components/StarknetIntegration";

const Home = () => {
  return (
    <div className="min-h-screen bg-main">
      <main>
        <HeroSection />
        <GamesCatalog />
        <Leaderboard />
        <StarknetIntegration />
      </main>
    </div>
  );
};

export default Home;
