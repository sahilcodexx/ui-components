"use client";
import Link from "next/link";
import { Mascot } from "page-mascot";
import React from "react";
import { Button } from "./ui/button";

const Four0Four = () => {
  return (
    <section className="relative flex  w-full flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-xl flex-col items-center">
        {/* 4 - mascot - 4 */}
        <div
          className="rise flex items-center justify-center gap-0.5 sm:gap-2"
          style={{ animationDelay: "0ms" }}
        >
          <div>
            <Mascot
              directions="/mascots/cat-directions.webp"
              reactions="/mascots/cat-reactions.webp"
            />
          </div>
        </div>

        <div
          className="rise flex flex-col items-center  text-center "
          style={{ animationDelay: "80ms" }}
        >
          <div>
            <h1 className="text-4xl ">404</h1>
          </div>
          <h1 className="text-lg font-medium  text-zinc-900">
            Page not found
          </h1>
          <p className="max-w-[31ch] text-balance text-xs leading- text-muted-foreground">
            The page you’re looking for doesn’t exist or has been moved.
          </p>
        </div>

        <div
          className="rise mt-2 flex items-center gap-3"
          style={{ animationDelay: "160ms" }}
        >
          <Button size="sm" className="px-2 py-0.5">
            <Link href="/" className="text-[10px]">
              Go home
            </Link>
          </Button>
        </div>
      </div>

      <p
        className="rise absolute bottom-6 text-center font-mono text-[11px] tracking-wide text-zinc-600/60 sm:bottom-8"
        style={{ animationDelay: "320ms" }}
      >
        by sahilcodex
      </p>
    </section>
  );
};

export default Four0Four;
