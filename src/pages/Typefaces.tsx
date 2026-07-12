import { useSearchParams } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { TypefaceGrid } from "@/components/TypefaceGrid";

const Typefaces = () => {
  const [searchParams] = useSearchParams();
  const isOpenSource = searchParams.get("license") === "open-source";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-[1458px] px-4">
        <HeroSection />
        <main>
          {isOpenSource && (
            <p className="mb-6 max-w-2xl text-foreground/80 text-sm leading-relaxed">
              Open-source typefaces released under libre licenses (principally
              the SIL Open Font License). Usable and modifiable by anyone.
            </p>
          )}
          <TypefaceGrid />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Typefaces;
