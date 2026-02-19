import { Button } from "../ui/button";
import { Film, Lightbulb, Link2, TrendingUp, Zap } from "lucide-react";

const PricingBox = () => {
  const features = [
    { icon: <Film size={18} />, text: "10 videos / month" },
    { icon: <Link2 size={18} />, text: "Unlimited app integrations" },
    { icon: <Lightbulb size={18} />, text: "Smart prompt ideas" },
    { icon: <TrendingUp size={18} />, text: "Advanced dashboard analytics" },
    { icon: <Zap size={18} />, text: "AI-powered script generator" },
  ];

  const proFeatures = [
    { icon: <Film size={18} />, text: "Unlimited videos / month" },
    { icon: <Link2 size={18} />, text: "Unlimited app integrations" },
    { icon: <Lightbulb size={18} />, text: "Smart prompt ideas" },
    { icon: <TrendingUp size={18} />, text: "Advanced dashboard analytics" },
    { icon: <Zap size={18} />, text: "AI-powered script generator" },
    { icon: <Zap size={18} />, text: "Priority support" },
  ];

  return (
    <div className="flex flex-col md:flex-row  gap-16">
      <div className="shadow-xl dark:shadow-neutral-900/10 bg-white dark:bg-black dark:ring-neutral-700/40 dark:ring px-5 py-6 rounded-4xl z-10 overflow-hidden border-3 border-transparent ">
        <div className="flex flex-col items-start gap-2 px- pb-3   ">
          <h2 className="font-bold text-xl">Free</h2>
          <span className="flex items-center gap-2 ">
            <h2 className="font-bold text-5xl">$0</h2>
            <p className="tracking-tight leading-tight">
              Free editor <br /> month
            </p>
          </span>
          <span className="mt-4 w-full z-20">
            <Button className="w-full py-5.5 text-base shadow-md border border-neutral-400/50 hover:bg-neutral-300 cursor-pointer text-black rounded-xl inset-shadow-white bg-neutral-200  inset-shadow-2xs ">
              Get Started
            </Button>
          </span>
        </div>
        <div className="h-px bg-neutral-300 my-3 mask-x-from-60% "></div>
        <div className="  py-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center mt-2 text-base font-semibold text-neutral-700 justify-start gap-2"
            >
              {feature.icon}
              <div className="ml-1">{feature.text}</div>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-500/70">
            Need higher limits?
          </h3>
        </div>
      </div>
      <div className="shadow-xl bg-white dark:bg-linear-to-bl dark:from-black/95  dark:via-neutral-950 dark:to-black dark:ring-neutral-700/40 dark:ring px-5 py-6 rounded-4xl z-10 overflow-hidden border-3 border-transparent  ">
        <div className="flex flex-col items-start gap-2 px- pb-3 relative ">
          <div className="bg-blue-400 dark:bg-blue-400/50 h-32 w-42 absolute -top-29 right-15 rounded-full blur-2xl "></div>
          <div className="bg-orange-400 dark:bg-orange-400/40 h-10 w-20 absolute bottom-0 -left-10  blur-xl "></div>
          <div className="bg-orange-400 dark:bg-orange-400/40  h-10 w-20 absolute bottom-0 -right-10  blur-xl "></div>
          <h2 className="font-bold text-xl">Plus</h2>
          <span className="flex items-center gap-2 ">
            <h2 className="font-bold text-5xl">$15</h2>
            <p className="tracking-tight leading-tight">
              per editor / month <br /> billed annually{" "}
            </p>
          </span>
          <span className="mt-4 w-full z-20">
            <Button className="w-full py-5.5 text-base shadow rounded-xl inset-shadow-white dark:inset-shadow-neutral-600 bg-neutral-900 dark:bg-neutral-200 inset-shadow-xs ">
              Get Started
            </Button>
          </span>
        </div>
        <div className="mt-4  py-6">
          {proFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex items-center mt-2 text-base font-semibold text-neutral-700 justify-start gap-2"
            >
              {feature.icon}
              <div className="ml-1">{feature.text}</div>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-500/70">
            Need higher limits?
          </h3>
        </div>
      </div>
    </div>
  );
};

export default PricingBox;
