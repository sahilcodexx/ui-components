"use client";
import Container from "../common/container";
import { ModeToggle } from "../common/mode-toggle";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
const MotionSpan = motion.span;
const MotionDiv = motion.div;

const Navbar = () => {
  const [hoverd, setHoverd] = useState<number | null>(null);
  const links = [
    { name: "Home", href: "/" },
    { name: "Convert", href: "/convert" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
  ];

  return (
    <Container className="mt-6  sticky top-6 z-50 w-full ">
      <div className="flex items-center gap-5 justify-center dark:bg-black/60 w-fit m-auto  rounded-full px-1.5 py-1.5 border-transparent ring dark:ring-neutral-800/60 ring-neutral-300 bg-white shadow inset-shadow">
        <div className="flex gap-8 items-center">
          {links.map((link, index) => (
            <MotionSpan key={link.href}>
              <Link
                onMouseEnter={() => setHoverd(index)}
                onMouseLeave={() => setHoverd(null)}
                className=" relative block group text-center px-3 py-2.5 text-sm"
                href={link.href}
              >
                <AnimatePresence>
                  {(hoverd === index ||
                    window.location.pathname === link.href) && (
                    <MotionDiv
                      layoutId="hoverd"
                      className="absolute  bg-black/9 dark:bg-neutral-800/70 inset-0 rounded-full "
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
                  className={`relative z-10 font-medium tracking-wide ${window.location.pathname === link.href ? "dark:text-white" : "dark:text-neutral-600 text-neutral-400"} group-hover:text-black dark:group-hover:text-white`}
                >
                  {link.name}
                </span>
              </Link>
            </MotionSpan>
          ))}
        </div>
        <div className="border-l  px-4">
          <ModeToggle />
        </div>
      </div>
    </Container>
  );
};

export default Navbar;
