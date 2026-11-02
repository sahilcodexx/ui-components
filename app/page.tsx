import UploadInput from "@/components/upload-input";
import { ModeToggle } from "@/components/common/mode-toggle";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#fcfcfc] px-5 py-16 font-sans dark:bg-[#161618]">
      <div className="absolute right-5 top-5">
        <ModeToggle />
      </div>
      <UploadInput />
    </main>
  );
}
