import React from "react";

type Proptypes = {
  file: File | undefined;
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
};

export default function FileSelector({ file, setFile }: Proptypes) {
  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      if (event.target.files[0].size > 10000000) {
        alert("File is too big!");
        return;
      }
      setFile(event.target.files[0]);
    }
  };
  return (
    <div className="relative border-dashed border-2 border-gray-400 rounded-lg h-40 flex justify-center items-center">
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
        className="h-full w-full opacity-0 cursor-pointer"
        id="file"
        onChange={handleFile}
      />
    </div>
  );
}
