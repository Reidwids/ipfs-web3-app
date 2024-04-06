"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";
import { createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";
import { GenerateNonceResponse } from "@/app/api/auth/nonce/route";

export default function Account() {
  const { data: session, status } = useSession();

  const handleSignIn = async () => {
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
    }
  };

  return (
    <div className="w-full flex items-center justify-center bg-neutral-800">
      <div className="w-full flex flex-col items-center max-w-4xl mx-10 p-10 shadow-2xl rounded-xl bg-neutral-700">
        <h2 className="text-4xl mb-10 w-full text-center">
          {status === "authenticated"
            ? "Account Details"
            : "Login to your account"}
        </h2>
        <div className="flex flex-col items-center space-y-5">
          {status === "unauthenticated" ? (
            <button
              className="px-5 py-3 bg-blue-500 rounded-md text-xl"
              onClick={handleSignIn}
            >
              Sign In
            </button>
          ) : (
            <div className="flex flex-col items-center space-y-5">
              <p>User ID: {status}</p>
              <button
                className="px-5 py-3 bg-blue-500 rounded-md text-xl"
                onClick={() =>
                  signOut({
                    callbackUrl: "/",
                  })
                }
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
