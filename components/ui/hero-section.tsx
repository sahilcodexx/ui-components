import Link from "next/link";


const HeroSection = () => {
  return (
    <div className="min-h-screen bg-neutral-200  w-full flex flex-col justify-between items-center relative overflow-hidden mb-30">
      <div className="h-290 w-full rounded-full bg-[radial-gradient(circle,#ec4899,#a855f7,transparent)] blur-3xl opacity-70 absolute -bottom-210 "></div>

      <div className="h-150 w-180  bg-pink-600 opacity-80 rounded-full blur-3xl absolute -bottom-110"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-size-[200px_100%]"></div>

      <div className="max-w-7xl w-full px-10 py-3 z-10">
        <CustomHeader />
      </div>
      <div>2</div>
    </div>
  );
};

export default HeroSection;

const navLinks = [
  { name: "Product", link: "#product" },
  { name: "Features", link: "#features" },
  { name: "Pricing", link: "#pricing" },
  { name: "Docs", link: "#docs" },
];
const CustomHeader = () => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="text-2xl [font-family:var(--font-nunito)] font-semibold ">
        Flōra
      </div>
      <div className="flex gap-15">
        {navLinks.map((item) => (
          <Link
            key={item.name}
            href={item.link}
            className="hover:text-pink-600 cursor-pointer text-sm font-semibold"
          >
            {item.name}
          </Link>
        ))}
      </div>
      <button>Contact Us</button>

    </div>
  );
};
