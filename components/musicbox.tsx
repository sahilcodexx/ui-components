import { Play, Share } from "lucide-react";
import Image from "next/image";
import React from "react";

const Musicbox = () => {
  return (
    <div>
      <div
        className="bg-neutral-800 rounded-[34px] h-40 w-38 flex flex-col items-center text-white p-2.5 gap-4"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.62'/%3E%3C/svg%3E\")",
          backgroundBlendMode: "overlay",
          backgroundSize: "72px 72px",
        }}
      >
        <div className="rounded-t-[28px] h-20  bg-neutral-950 overflow-hidden border rounded-b-sm border-neutral-700 ">
          <Image
            src={"/musicbox.jpeg"}
            alt="musicbox"
            height={1200}
            width={400}
          />
        </div>
        <div className="flex  gap-0.5 bg-black h-fit items-center justify-center p-[1.5px] w-fit rounded-b-2xl rounded-[3px]">
          <div
            className="bg-linear-to-bl from-neutral-800/80 via-blue-neutral-700 to-neutral-800 w-9 h-9 flex items-center justify-center rounded-bl-2xl rounded-xs border-r-[0.5px] border-t-[0.5px] border-neutral-600/70"
          >
            <Play size={10} />
          </div>
          <div className="bg-linear-to-bl from-neutral-800/80 via-blue-neutral-700 to-neutral-800 w-9 h-9 flex items-center justify-center rounded-xs border-r-[0.5px] border-t-[0.5px] border-neutral-600/70">
            <Share size={10} />
          </div>
          <div className="bg-linear-to-bl from-neutral-800/80 via-blue-neutral-700 to-neutral-800 w-9 h-9 flex items-center justify-center rounded-br-2xl rounded-xs border-t-[0.5px] border-neutral-600/70 border-r-[0.5px]">
            <Share size={10} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Musicbox;
