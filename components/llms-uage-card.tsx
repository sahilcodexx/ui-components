import Image from "next/image";
import React from "react";

const LlmsUsageCard = () => {
  return (
    <div className="h-100 w-80 bg-white rounded-2xl border shadow-xs p-4 gap-3">
      <div className=" flex items-start justify-between  ">
        <div className="flex items-center gap-2">
          <Image
            src="/codex-color.svg"
            alt="codex"
            width={50}
            height={30}
            className="border rounded-xl shadow-xs"
          />
          <div>
            <h2 className="text-base font-medium">Codex</h2>
            <p className="capitalize text-[10px] leading-tight text-muted-foreground ">
              Coding agent
            </p>
          </div>
        </div>
        <div>...</div>
      </div>
      <div className="py-3">
        <p className="text-xs leading-tight text-muted-foreground pr-2">
          Helps you write, debug, and ship code. Understands your codebase,
          creates pull requests, and works with your tools.
        </p>
      </div>
      <div
        className="h-[0.5px] bg-muted-foreground/10 my-1 rounded-2xl
        "
      ></div>
      <div className="flex items-center justify-between my-2">
        <div className="text-xs text-muted-foreground">Usage</div>
        <div className="text-xs bg-green-100 py-0.5 px-2.5 rounded-lg">
          Active
        </div>
      </div>
      <div>
        <h2 className="text-sm flex gap-1 items-center">Tokens <p className="text-[7px] text-muted-foreground pt-1"> (Today)</p> </h2>
        420k/1M
        <div></div>
      </div>
    </div>
  );
};

export default LlmsUsageCard;
