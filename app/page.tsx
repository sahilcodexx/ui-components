import Conatiner from "@/components/common/container";

import PricingBox from "@/components/layout/pricing-box";
import HeroSection from "@/components/ui/hero-section";

export default function Home() {
  return (
    <div className="h-screen w-full">
      <HeroSection/>
      <PricingBox />
    </div>
  );
}
