import Navbar from "@/components/common/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeatureSection from "@/components/landing/FeatureSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ImpactPreview from "@/components/landing/ImpactPreview";
import Footer from "@/components/common/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <ImpactPreview />
      <Footer />
    </>
  );
}
