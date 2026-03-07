"use client";

import { TransitionRouter } from "next-transition-router";
import { motion, useAnimation } from "motion/react";
import LoaderAnimation from "@/components/ui/loader-animation";
import { useState, useEffect } from "react";

export default function Providers({ children }) {
  const controls = useAnimation();
  const [loaderVisible, setLoaderVisible] = useState(true);

  // Initial 3 sec loader on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      controls.start({ opacity: 0, y: -80, transition: { duration: 0.8 } });
      setLoaderVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <TransitionRouter
      leave={async (next) => {
        // Immediately show loader (already mounted)
        setLoaderVisible(true);

        // Exit animation for 0.8 sec
        await controls.start({
          opacity: 0,
          y: -80,
          transition: { duration: 0.8, ease: "easeInOut" },
        });

        next(); // page change after animation
      }}
      enter={async (next) => {
        // Reset loader for next route
        controls.set({ opacity: 1, y: 0 });
        setLoaderVisible(false);
        next();
      }}
      auto
    >
      {loaderVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={controls}
          className="fixed inset-0 z-999 bg-white dark:bg-black flex items-center justify-center pointer-events-none"
        >
          <LoaderAnimation />
        </motion.div>
      )}

      {children}
    </TransitionRouter>
  );
}
