import Link from "next/link";
import React from "react";

export default function Header() {
  return (
    <div className="w-full bg-blue-950 text-white font-bold py-5 px-10 text-xl flex items-center justify-between font-jura">
      <Link href={"/"} className="flex flex-row space-x-3 items-center">
        <img src="/img/rocketShip.png" alt="rocketShip" className="w-12 h-12" />
        <div className="font-bold">IPFS App</div>
      </Link>
      <div className="flex items-center space-x-6 ">
        <Link href="/">Home</Link>
      </div>
    </div>
  );
}
