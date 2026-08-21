"use client";
import { ModeToggle } from "../common/mode-toggle";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Link } from "next-transition-router";

const MotionSpan = motion.span;
const MotionDiv = motion.div;

const Navbar = () => {
  const [hoverd, setHoverd] = useState<number | null>(null);
  const pathname = usePathname();
  const links = [
    { name: "Home", href: "/" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
  ];

  return (
    <div className="mt-6 fixed top-6 z-50 m-auto w-full">
      <div className="flex items-center gap-2 md:gap-5 justify-center dark:bg-neutral-900 w-fit m-auto  rounded-full px-1.5 py-1.5 border-transparent ring dark:ring-neutral-700/60 ring-neutral-300 bg-white shadow inset-shadow">
        <div className="flex gap-3 md:gap-1 items-center">
          {links.map((link, index) => (
            <MotionDiv key={link.href}>
              <Link
                onMouseEnter={() => setHoverd(index)}
                onMouseLeave={() => setHoverd(null)}
                className=" relative block group text-center px-2  py-2 md:px-6 md:py-2.5 text-xs md:text-sm"
                href={link.href}
              >
                <AnimatePresence>
                  {(hoverd === index || pathname === link.href) && (
                    <MotionDiv
                      layoutId="hoverd"
                      className="absolute  bg-black/9 dark:bg-neutral-700/60 inset-0 rounded-full  "
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
                <span
                  className={`relative z-10 font-medium tracking-wide ${pathname === link.href ? "dark:text-white" : "dark:text-neutral-400 text-neutral-400"} group-hover:text-black dark:group-hover:text-white`}
                >
                  {link.name}
                </span>
              </Link>
            </MotionDiv>
          ))}
        </div>
        <div className="border-l  px-2 md:px-4">
          <ModeToggle />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
