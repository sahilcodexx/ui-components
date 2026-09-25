import Image from "next/image";
import React from "react";

const Walletui = () => {
  return (
    <div>
      <div className="bg-neutral-800 h-100 w-165 border-neutral-600 ring ring-neutral-900 dark:bg-white rounded-[50px] p-2 flex flex-col  items-start overflow-hidden">
        <div className="p-5 pt-3 w-full h-full flex-1">
          <h2 className="text-white dark:text-black text-[28px] ">Wallet</h2>
          <p className="text-muted-foreground">Mastercard ending 6969</p>
        </div>
        <div className="bg-[url('/wallet.png')] w-full h-full bg-cover bg-center bg-no-repeat rounded-[40px] flex flex-col items-start justify-between p-7 border border-neutral-400">
          <div>
            <span className="inline-block h-12 w-12 rounded-full bg-white/20 border border-gray-300/90"></span>
            <span className=" -ml-6 inline-block h-12 w-12 rounded-full bg-white/70 border border-gray-300/90"></span>
          </div>
          <div>
            <h5 className="text-5xl text-white font-sans font-light text-shadow ">
              $1269.67
            </h5>
            <p className="text-white/80 text-lg ml-1">Total Balance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Walletui;
