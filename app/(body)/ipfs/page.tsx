"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { DownloadFileResponse } from "@/app/api/ipfs/download/route";
import { GenerateNonceResponse } from "@/app/api/auth/nonce/route";
import { createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";

export default function IPFS() {
  const [file, setFile] = useState<File>();
  const [uploading, setUploading] = useState(false);
  const { data: session, status } = useSession() as any;

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      if (event.target.files[0].size > 10000000) {
        alert("File is too big!");
        return;
      }
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const isPrivate = form.get("private");
    const formData = new FormData();
    if (!file) {
      return;
    }

    setUploading(true);

    // If the file is private, encrypt it before uploading
    if (isPrivate) {
      const fileData = await readFileData(file);
      if (!window.ethereum) {
        window.alert("Please install MetaMask first.");
        return;
      }

      // We will use a signed nonce to derive an AES-GCM key
      const [publicAddress]: any = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Create the signed nonce
      const nonce = crypto.getRandomValues(new Uint8Array(32));
      const nonceHex = Buffer.from(nonce).toString("hex");
      const client = createWalletClient({
        account: publicAddress,
        chain: mainnet,
        transport: custom(window.ethereum),
      });
      const signedNonce = await client.signMessage({
        message: nonceHex,
        account: publicAddress,
      });

      // Use the nonce to create the AES GCM key
      const aesKey = await deriveAesGcmKey(signedNonce);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ivHex = Buffer.from(iv).toString("hex");
      const algorithm = { name: "AES-GCM", iv: iv };

      // Encrypt the data with the key
      const encryptedData = await crypto.subtle.encrypt(
        algorithm,
        aesKey,
        fileData
      );

      // Upload the encrypted data
      formData.append("file", new Blob([new Uint8Array(encryptedData)]));
      formData.append("filename", file.name);
      formData.append("privateKey", nonceHex + ivHex);
    } else {
      // If the file is not private, simply upload it
      formData.append("file", file);
      formData.append("filename", file.name);
    }

    const data = await fetch("/api/ipfs/upload", {
      method: "POST",
      body: formData,
    });

    const response = await data.json();
    if (response.error) {
      alert("Failed to upload file");
    }
    setUploading(false);
  };

  const handleDownload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const cid = form.get("cid");

    // Fetch the file data from the database
    const response = await fetch("/api/ipfs/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cid }),
    });
    const fileData = (await response.json()) as DownloadFileResponse;

    // Fetch the file from IPFS using Pinata
    const fileRes = await fetch(
      process.env.NEXT_PUBLIC_PINATA_GATEWAY + `/ipfs/${fileData.cid}`
    );
    let blob = await fileRes.blob();

    // If the file has a private key, decrypt it
    if (fileData.privateKey) {
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
      const [nonceHex, ivHex] = fileData.privateKey.match(/.{1,64}/g) || [];

      const signedNonce = await client.signMessage({
        message: nonceHex!,
        account: publicAddress,
      });

      const iv = Buffer.from(ivHex!, "hex");

      const aesKey = await deriveAesGcmKey(signedNonce);
      const algorithm = { name: "AES-GCM", iv: iv };
      const decryptedData = await crypto.subtle.decrypt(
        algorithm,
        aesKey,
        new Uint8Array(await blob.arrayBuffer())
      );

      blob = new Blob([new Uint8Array(decryptedData)]);
    }

    // Download the file for the user
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileData.filename;
    a.click();
  };

  const readFileData = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  async function deriveAesGcmKey(signedNonce: string) {
    const signedNonceBuffer = new TextEncoder().encode(signedNonce);
    const hashBuffer = await crypto.subtle.digest("SHA-256", signedNonceBuffer);
    return crypto.subtle.importKey(
      "raw",
      hashBuffer,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  }

  return (
    <div className="w-full flex items-center justify-center bg-neutral-800">
      <div className="w-full flex flex-col items-center max-w-4xl mx-10 p-10 shadow-2xl rounded-xl bg-neutral-700">
        <h2 className="text-4xl text-white mb-10 w-full text-center">IPFS</h2>
        <form onSubmit={handleUpload}>
          <div>
            <label className="text-gray-700 font-bold mb-2" htmlFor="file">
              Choose a file to upload
            </label>
            <div className="relative border-dashed border-2 border-gray-400 rounded-lg h-64 flex justify-center items-center">
              <div className="absolute">
                <div className="flex flex-col items-center">
                  <svg
                    className="w-10 h-10 text-gray-400 group-hover:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    ></path>
                  </svg>
                  <span className="text-gray-400 group-hover:text-gray-600 mt-2">
                    {file ? file.name : "Select a file"}
                  </span>
                </div>
              </div>
              <input
                type="file"
                className="h-full w-full opacity-0"
                id="file"
                onChange={handleFile}
              />
            </div>
            <div>
              <input
                className="me-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-black/25 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-white after:shadow-switch-2 after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-blue-300 checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ms-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:shadow-switch-1 checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-switch-3 focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:before:ms-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-switch-3 checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-white/25 dark:after:bg-surface-dark"
                type="checkbox"
                role="switch"
                id="private"
                name="private"
                value={"private"}
              />
              <label
                className="inline-block ps-[0.15rem] hover:cursor-pointer"
                htmlFor="private"
              >
                Private File
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={!file || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
        <form onSubmit={handleDownload}>
          <div>
            <label className="text-gray-700 font-bold mb-2" htmlFor="cid">
              Enter your cid
            </label>
            <input
              type="text"
              id="cid"
              name="cid"
              className="w-full border border-gray-400 text-black rounded-lg p-2"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Download
          </button>
        </form>
      </div>
    </div>
  );
}
