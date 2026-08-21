import { AppleHelloEffectEnglish } from "@/components/apple-hello-effect-english";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 dark:bg-neutral-950/70 text-white selection:bg-neutral-800">
      <AppleHelloEffectEnglish className={"stroke-black dark:stroke-white"} />
    </main>
  );
}
