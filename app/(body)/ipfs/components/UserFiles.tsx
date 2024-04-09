"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DownloadFileResponse } from "@/app/api/ipfs/download/route";

export default function UserFiles() {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>();
  const [files, setFiles] = useState<DownloadFileResponse[]>([]);

  async function fetchUserFiles() {
    let url = "/api/users/files";
    if (fromDate) {
      url += `?fromdate=${fromDate.getTime()}`;
    }
    const files = await fetch(url).then((res) => res.json());
    setFiles(files);
  }
  useEffect(() => {
    fetchUserFiles();
  }, [fromDate]);

  return (
    <div className="flex flex-col w-full max-w-xl">
      <div className="flex justify-between items-center w-full mb-5">
        <p className="text-xl font-semibold">Your IPFS Files</p>
        <select
          className="bg-white text-black rounded-md p-1 cursor-pointer"
          onChange={(e) =>
            e.target.value
              ? setFromDate(new Date(e.target.value))
              : setFromDate(null)
          }
        >
          <option value="">All Time</option>
          <option value={new Date(Date.now() - 86400000).toISOString()}>
            Last Day
          </option>
          <option value={new Date(Date.now() - 604800000).toISOString()}>
            Last Week
          </option>
          <option value={new Date(Date.now() - 2592000000).toISOString()}>
            Last Month
          </option>
          <option value={new Date(Date.now() - 31536000000).toISOString()}>
            Last Year
          </option>
        </select>
      </div>
      <div className="max-h-[250px] overflow-y-auto">
        <table className="w-full bg-neutral-800 rounded-md table-fixed border-separate border-spacing-3 max-h-[400px] overflow-y-scroll ">
          <thead>
            <tr className="p-5">
              <th className="text-left">Filename</th>
              <th className="text-left">CID</th>
              <th className="text-left">Uploaded At</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => (
              <tr key={file.id}>
                <td>
                  {file.filename.length > 15
                    ? file.filename.slice(0, 15) + "..."
                    : file.filename}
                </td>
                <td className="flex ">
                  {file.cid.slice(0, 3) + "..." + file.cid.slice(-3)}
                  <div className="relative">
                    <motion.img
                      alt="copy"
                      src={"/img/copy.svg"}
                      width={20}
                      height={20}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 0.9 }}
                      className="cursor-pointer ml-2 relative"
                      onClick={() => {
                        navigator.clipboard.writeText(file.cid);
                        setTooltipIndex(index);
                        setTimeout(() => {
                          setTooltipIndex(null);
                        }, 1000);
                      }}
                    />
                    <AnimatePresence>
                      {tooltipIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-[-30px] -right-4 text-white p-1 rounded-md text-xs"
                        >
                          Copied!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </td>
                <td>
                  {new Date(file.uploadedAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
