"use client";
import React, { useState } from "react";
import { useBalance, useAccount, useDisconnect, useSignMessage } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { AnimatePresence, motion } from "framer-motion";
import { formatUnits } from "viem";
import Loading from "@/app/components/Loading";
import Image from "next/image";

export default function WalletActions() {
  const { address } = useAccount();
  const balance = useBalance({
    address: address,
  });
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const { signMessage } = useSignMessage();
  const [signature, setSignature] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleSign = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = form.get("message") as string;
    if (!message) {
      alert("Please enter a message");
      return;
    }
    if (!window.ethereum) {
      window.alert("Please install MetaMask first.");
      return;
    }
    signMessage(
      {
        account: address,
        message: message,
      },
      {
        onError: (error) => {
          console.error(error);
          setError("Error signing message");
        },
        onSuccess: (signature) => {
          setSignature(signature);
        },
      }
    );
  };
  return (
    <>
      {!address ? (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-3 py-4 bg-blue-500 rounded-md text-white text-lg font-semibold"
          onClick={() => open()}
        >
          Connect Wallet
        </motion.button>
      ) : (
        <>
          <div className="flex space-x-3 mb-5 w-44">
            <p className="whitespace-nowrap">ETH Balance:</p>
            <AnimatePresence>
              {balance.data !== undefined ? (
                <motion.p
                  key={1}
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 2 }}
                >
                  {balance.data?.value
                    ? formatUnits(balance.data?.value!, balance.data?.decimals!)
                    : "0.00"}
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

          <form onSubmit={handleSign}>
            <input
              type="text"
              name="message"
              placeholder="Sign a message"
              className="w-80 px-2 py-2 rounded-md text-black"
            />
            <button
              type="submit"
              className="px-2 py-2 bg-blue-500 rounded-md text-white text-lg font-semibold"
            >
              Submit
            </button>
          </form>
          <div className="h-12 flex items-center text-sm">
            {signature ? (
              <div className="whitespace-nowrap flex">
                <p>
                  Signature:{" "}
                  {signature.slice(0, 3) + "..." + signature.slice(-3)}
                </p>
                <motion.img
                  alt="copy"
                  src={copied ? "/img/checkmark.svg" : "/img/copy.svg"}
                  width={20}
                  height={20}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 0.9 }}
                  className="cursor-pointer ml-2"
                  onClick={() => {
                    setCopied(true);
                    navigator.clipboard.writeText(signature);
                  }}
                />
              </div>
            ) : error ? (
              <p className="whitespace-nowrap text-red-500">{error}</p>
            ) : (
              <></>
            )}
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-2 py-2 bg-red-500 rounded-md text-white text-lg font-semibold"
            onClick={() => disconnect()}
          >
            Disconnect Wallet
          </motion.button>
        </>
      )}
    </>
  );
}
