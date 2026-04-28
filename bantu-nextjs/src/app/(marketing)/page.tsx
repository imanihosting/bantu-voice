import { Navbar } from "@/features/marketing/components/navbar";
import { HeroSection } from "@/features/marketing/components/hero-section";
import { AfricaMapSection } from "@/features/marketing/components/africa-map-section";
import { FeaturesSection } from "@/features/marketing/components/features-section";
import { Footer } from "@/features/marketing/components/footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <AfricaMapSection />
      <FeaturesSection />
      <Footer />
    </>
  );
}
