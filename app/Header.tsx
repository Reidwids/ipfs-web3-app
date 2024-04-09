"use client";
import Link from "next/link";
import React from "react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import Image from "next/image";
import { useAccount, useDisconnect } from "wagmi";
import { AnimatePresence, motion } from "framer-motion";

export default function Header() {
  const { open } = useWeb3Modal();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="w-full bg-blue-950 text-white font-bold py-5 px-10 text-xl flex items-center justify-between font-jura">
      <Link href={"/"} className="flex flex-row space-x-5 items-center">
        <img src="/img/rocketShip.png" alt="rocketShip" className="w-12 h-12" />
        <div className="font-bold">IPFS App</div>
      </Link>
      <div className="flex items-center space-x-8 ">
        <Link href="/">Home</Link>
        <Link href="/account">Account</Link>
        <Link href="/ipfs">IPFS</Link>
        <div className="flex items-center space-x-4 ">
          <AnimatePresence>
            {address ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-20 text-sm flex flex-col items-center justify-center cursor-pointer"
                onClick={() => disconnect()}
              >
                <div>Account:</div>
                <div> {address.slice(0, 3) + "..." + address.slice(-3)}</div>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-20 px-3 py-1 bg-blue-500 rounded-md text-white text-sm"
                onClick={() => open()}
              >
                Connect Wallet
              </motion.button>
            )}
          </AnimatePresence>
          <button onClick={() => open({ view: "Networks" })}>
            <Image
              src={"/img/network.svg"}
              alt={"Network Icon"}
              width="32"
              height="32"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
