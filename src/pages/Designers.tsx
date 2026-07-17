import { DesignerGrid } from "@/components/DesignerGrid";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";

const Designers = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto max-w-[1458px] px-4">
      <HeroSection />
      <main>
        <DesignerGrid />
      </main>
    </div>
    <Footer />
  </div>
);

export default Designers;
