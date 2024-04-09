import React from "react";
import ToggleView from "./ToggleView";

export default function IPFS() {
  return (
    <div className="w-full flex items-center justify-center bg-neutral-800">
      <div className="w-full flex flex-col items-center max-w-4xl mx-10 p-10 shadow-2xl rounded-xl bg-neutral-700 min-h-[600px]">
        <h2 className="text-4xl text-white mb-5 w-full text-center">IPFS</h2>
        <ToggleView />
      </div>
    </div>
  );
}
