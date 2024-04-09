"use client";
import React from "react";
import FileSelector from "@/app/(body)/ipfs/components/FileSelector";
import { AnimatePresence, motion } from "framer-motion";
import { DownloadFileResponse } from "@/app/api/ipfs/download/route";
import { createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";
import { UploadFileResponse } from "@/app/api/ipfs/upload/route";
import { useState } from "react";

export default function IPFSHandler() {
  const [file, setFile] = useState<File>();
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>();
  const [cid, setCid] = useState<string>("");

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(0);
    const form = new FormData(event.currentTarget);
    const isPrivate = form.get("private");
    const formData = new FormData();
    if (!file) {
      handleError("No file selected");
      setLoading(null);
      return;
    }

    // If the file is private, encrypt it before uploading
    if (isPrivate) {
      setLoading(10);
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
      setLoading(20);
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
      setLoading(30);

      // Upload the encrypted data
      formData.append("file", new Blob([new Uint8Array(encryptedData)]));
      formData.append("filename", file.name);
      formData.append("privateKey", nonceHex + ivHex);
    } else {
      // If the file is not private, simply upload it
      formData.append("file", file);
      formData.append("filename", file.name);
    }
    setLoading(40);

    const data = await fetch("/api/ipfs/upload", {
      method: "POST",
      body: formData,
    });

    setLoading(80);
    const response: UploadFileResponse = await data.json();
    if (response.error) {
      if (response.error.includes("cid")) {
        handleError("File with the same CID already exists");
      } else {
        handleError("Failed to upload file");
      }
      setLoading(null);
      return;
    }

    setCid(response.cid);
    setLoading(100);
    setTimeout(() => {
      setLoading(null);
    }, 1000);
  };

  const handleError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  const handleDownload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(0);

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
    setLoading(30);
    // Fetch the file from IPFS using Pinata
    const fileRes = await fetch(
      process.env.NEXT_PUBLIC_PINATA_GATEWAY + `/ipfs/${fileData.cid}`
    );
    let blob = await fileRes.blob();
    setLoading(50);

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
    setLoading(80);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileData.filename;
    a.click();

    setLoading(100);
    setTimeout(() => {
      setLoading(null);
    }, 1000);
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
    <div className="flex flex-col items-center">
      <form onSubmit={handleUpload}>
        <FileSelector file={file} setFile={setFile} />
        <div className="flex mt-3 justify-between items-center">
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
              Encrypt File
            </label>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 cursor-pointer text-white font-bold py-2 px-8 rounded focus:outline-none focus:shadow-outline transition-all"
            disabled={!file || loading !== null}
          >
            Upload
          </button>
        </div>
      </form>
      <div className="flex items-center justify-center w-60 h-10 mt-5">
        <AnimatePresence>
          {error ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-red-500 text-sm "
            >
              {"error"}
            </motion.p>
          ) : loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-2 bg-blue-500 rounded-lg"
            >
              <div
                className="h-2 bg-blue-700 rounded-lg transition-all duration-200"
                style={{ width: `${loading ?? 0}%` }}
              ></div>
            </motion.div>
          ) : cid ? (
            <>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm"
              >
                {`CID: ${cid.slice(0, 3) + "..." + cid.slice(-3)}`}
              </motion.p>
              <motion.img
                alt="copy"
                src={"/img/copy.svg"}
                width={20}
                height={20}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 0.9 }}
                className="cursor-pointer ml-2"
                onClick={() => {
                  navigator.clipboard.writeText(cid);
                }}
              />
            </>
          ) : (
            <></>
          )}
        </AnimatePresence>
      </div>
      <form onSubmit={handleDownload} className="flex flex-col items-center">
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
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer transition-all"
        >
          Download
        </button>
      </form>
    </div>
  );
}
