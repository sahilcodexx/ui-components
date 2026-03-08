import PricingBox from "@/components/layout/pricing-box";
import HeroSection from "@/components/ui/hero-section";
import NameLetter from "@/components/ui/letter-ui";
import LoaderAnimation from "@/components/ui/loader-animation";

export default function Home() {
  return (
    <div className="h-screen w-full">
      <HeroSection />
      <PricingBox />
      <NameLetter />
      <LoaderAnimation />
    </div>
  );
}
