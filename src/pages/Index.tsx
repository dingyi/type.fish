import { Footer } from "@/components/Footer";
import { FoundryTable } from "@/components/FoundryTable";
import { HeroSection } from "@/components/HeroSection";

const Index = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto max-w-[1458px] px-4">
      <HeroSection />
      <main>
        <FoundryTable />
      </main>
    </div>
    <Footer />
  </div>
);

export default Index;
