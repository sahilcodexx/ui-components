import { CountryPicker } from "@/components/country-picker";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center p-6 bg-[#F2F2F0] dark:bg-neutral-950">
      {/* Centered picker */}
      <div className="w-full max-w-[400px] flex justify-center">
        <CountryPicker />
      </div>
    </main>
  );
}
