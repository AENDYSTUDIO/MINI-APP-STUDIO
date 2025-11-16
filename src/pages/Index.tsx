import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedSection from "@/components/FeaturedSection";
import MemorialSection from "@/components/MemorialSection";
import StatsSection from "@/components/StatsSection";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main>
        <HeroSection />
        <FeaturedSection />
        <MemorialSection />
        <StatsSection />
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
