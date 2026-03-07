"use client";

import { TransitionRouter } from "next-transition-router";
import { motion, useAnimation } from "motion/react";
import LoaderAnimation from "@/components/ui/loader-animation";
import { useState, useEffect } from "react";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const loaderControls = useAnimation();
  const contentControls = useAnimation();
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      loaderControls.start({ opacity: 0, transition: { duration: 0.8 } });
      setLoaderVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <TransitionRouter
      leave={async (next) => {
        if (!isInitialLoad) {
          await contentControls.start({
            opacity: 0,
            x: -50,
            transition: { duration: 0.4, ease: "easeInOut" },
          });
        }

        setIsInitialLoad(false);
        next();
      }}
      enter={async (next) => {
        if (!isInitialLoad) {
          await contentControls.start({
            opacity: [0, 1],
            x: [50, 0],

            transition: { duration: 0.4, ease: "easeInOut" },
          });
        }

        setLoaderVisible(false);
        next();
      }}
    >
      {loaderVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={loaderControls}
          className="fixed inset-0 z-9999 bg-white dark:bg-black flex items-center justify-center pointer-events-none"
        >
          <LoaderAnimation />
        </motion.div>
      )}

      <motion.div animate={contentControls} initial={{ opacity: 1, x: 0 }}>
        {children}
      </motion.div>
    </TransitionRouter>
  );
}
