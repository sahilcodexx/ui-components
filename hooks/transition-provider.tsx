"use client";

import { TransitionRouter } from "next-transition-router";
import { motion, useAnimation } from "motion/react";
import { useState } from "react";
import { ReactNode } from "react";

import { MacBootLoader } from "@/components/ui/mac-boot-loader";

export default function Providers({ children }: { children: ReactNode }) {
  const contentControls = useAnimation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(true);

  return (
    <TransitionRouter
      leave={async (next) => {
        if (!isInitialLoad) {
          // Page transition animation — commented out for now
          // await contentControls.start({
          //   opacity: 0,
          //   x: -50,
          //   transition: { duration: 0.4, ease: "easeInOut" },
          // });
        }

        setIsInitialLoad(false);
        next();
      }}
      enter={async (next) => {
        if (!isInitialLoad) {
          // Page transition animation — commented out for now
          // await contentControls.start({
          //   opacity: [0, 1],
          //   x: [50, 0],
          //   transition: { duration: 0.4, ease: "easeInOut" },
          // });
        }

        next();
      }}
    >
      {loaderVisible && (
        <MacBootLoader onComplete={() => setLoaderVisible(false)} />
      )}

      <motion.div animate={contentControls} initial={{ opacity: 1, x: 0 }}>
        {children}
      </motion.div>
    </TransitionRouter>
  );
}
