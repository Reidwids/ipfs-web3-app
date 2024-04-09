"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useBalance, useAccount } from "wagmi";
import { formatUnits } from "viem";
import Loading from "./components/Loading";

export default function Home() {
  const { address } = useAccount();
  const balance = useBalance({
    address: address,
  });

  return (
    <main className="w-full flex items-center justify-center bg-neutral-800">
      <div className="w-full flex flex-col items-center max-w-4xl mx-10 p-10 shadow-2xl rounded-xl bg-neutral-700">
        <h2 className="text-4xl text-white mb-10 w-full text-center">
          Wallet Details
        </h2>
        <div className="space-y-3">
          <div className="flex space-x-3">
            <p>ETH Balance:</p>
            <AnimatePresence>
              {balance?.data?.value ? (
                <motion.p
                  key={1}
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 2 }}
                >
                  {formatUnits(balance.data?.value, balance.data?.decimals)}
                </motion.p>
              ) : (
                <motion.div
                  key={2}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, delay: 1 }}
                >
                  <Loading />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
