import Link from "next/link";

const HeroSection = () => {
  return (
    <div className=" bg-neutral-200  w-full flex flex-col gap-96 justify-between items-center relative overflow-hidden mb-30">
      <div className="h-320 w-full rounded-2xl bg-[radial-gradient(#ec4899,#a855f7,transparent)] blur-3xl opacity-70 absolute -bottom-210 "></div>
      <div className="h-40 w-120 absolute bottom-60 blur-3xl  bg-purple-500  opacity-65  "></div>
      <div className="h-180 w-180  bg-pink-600 opacity-70 rounded-full blur-3xl absolute -bottom-110"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-size-[200px_100%]"></div>

      <div className="max-w-7xl w-full px-10 py-3 z-10">
        <CustomHeader />
      </div>
      <div className="z-20 mb-20 flex flex-col items-center gap-5">
        <div className=" shadow text-xs border border-pink-200 text-white  py-1 px-4 rounded-2xl">
          DESIGNED FOR WHAT'S NEXT
        </div>
        <div className="flex flex-col items-center text-white gap-4">
          <h3 className="text-6xl  [font-family:var(--font-playfair)] text-center ">
            Where Ideas
            <h4 className="italic">Come Alive</h4>
          </h3>
          <p className="max-w-lg text-center leading-none ">
            A new kind of creative platform built to help you move faster, think
            deeper, and make something unforgettable.
          </p>
        </div>
        <button className=" bg-white shadow-[inset_0_-4px_6px_rgba(236,72,153,0.3)] inset-shadow-pink-500 inset-shadow-xs  text-sm px-4 py-1 rounded-2xl cursor-pointer">
          Get Started
        </button>
      </div>
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
            className="hover:text-pink-600 cursor-pointer text-sm "
          >
            {item.name}
          </Link>
        ))}
      </div>
      <button className=" cursor-pointer shadow-[inset_0_-4px_6px_rgba(236,72,153,0.3)] inset-shadow-pink-500 inset-shadow-xs  text-sm px-4 py-1 rounded-2xl ">
        Contact Us
      </button>
    </div>
  );
};
