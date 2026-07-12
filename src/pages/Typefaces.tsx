import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";

const Typefaces = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-[1458px] px-4">
        <HeroSection />
        <main className="py-10">
          <p className="font-mono text-muted-foreground text-xs">Coming soon</p>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Typefaces;
