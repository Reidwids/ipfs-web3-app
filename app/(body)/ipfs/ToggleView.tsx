"use client";
import React from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useSession } from "next-auth/react";
import SignInButton from "../account/components/SignInButton";
import IPFSHandler from "./components/IPFSHandler";
import UserFiles from "./components/UserFiles";

export default function ToggleView() {
  const { data: session, status } = useSession();
  const [selectedTab, setSelectedTab] = useState("ipfs");
  return (
    <>
      {status === "unauthenticated" ? (
        <div className="flex flex-col items-center">
          <SignInButton />
          <p className="text-sm">You must be signed in to use IPFS Services!</p>
        </div>
      ) : (
        <>
          <div className="flex mb-5">
            <motion.div
              className="flex justify-center items-center w-32 h-8 rounded-l-lg cursor-pointer"
              variants={{
                user: {
                  backgroundColor: "#333",
                },
                ipfs: { backgroundColor: "#3B82F6" },
              }}
              transition={{ duration: 0.2 }}
              animate={selectedTab}
              onClick={() => setSelectedTab("ipfs")}
            >
              IPFS
            </motion.div>
            <motion.div
              className="flex justify-center items-center w-32 h-8 rounded-r-lg cursor-pointer"
              variants={{
                user: {
                  backgroundColor: "#3B82F6",
                },
                ipfs: { backgroundColor: "#333" },
              }}
              transition={{ duration: 0.2 }}
              animate={selectedTab}
              onClick={() => setSelectedTab("user")}
            >
              User Files
            </motion.div>
          </div>
          {selectedTab === "ipfs" ? <IPFSHandler /> : <UserFiles />}
        </>
      )}
    </>
  );
}
