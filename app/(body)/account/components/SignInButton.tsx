"use client";
import React, { useState } from "react";
import Loading from "@/app/components/Loading";
import { useSession, signIn } from "next-auth/react";
import { createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";
import { GenerateNonceResponse } from "@/app/api/auth/nonce/route";

export default function SignInButton() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      if (!window.ethereum) {
        window.alert("Please install MetaMask first.");
        return;
      }

      const [publicAddress]: any = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const client = createWalletClient({
        account: publicAddress,
        chain: mainnet,
        transport: custom(window.ethereum),
      });

      // Send the public address to generate a nonce associates with our account
      const response = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicAddress,
        }),
      });
      const responseData: GenerateNonceResponse = await response.json();

      // Sign the received nonce
      const signedNonce = await client.signMessage({
        message: responseData.nonce,
        account: publicAddress,
      });

      // Use NextAuth to sign in with our address and the nonce
      const res = await signIn("crypto", {
        publicAddress,
        signedNonce,
        redirect: false,
      });

      if (res?.error) {
        window.alert("Error with signing, please try again.");
      }
    } catch (err) {
      window.alert("Error with signing, please try again.");
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  return (
    <button
      className="w-40 h-12 mb-5 bg-blue-500 rounded-md text-xl flex justify-center items-center"
      onClick={handleSignIn}
    >
      {isLoading ? <Loading /> : "Sign In / Up"}
    </button>
  );
}
