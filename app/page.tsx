"use client";

import { MacDock } from "@/components/ui/mac-dock";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center pb-8  text-white">
      {/* Dock UI Component */}
      <MacDock />
    </main>
  );
}
