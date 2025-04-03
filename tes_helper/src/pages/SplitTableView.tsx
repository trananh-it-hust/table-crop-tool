import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";

export default function SplitTableView(prop) {
  const { imageUrls, tableImages, setTableImages } = prop;
  const [index, setIndex] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const urlBackend = import.meta.env.VITE_API_SERVER;

  const splitTable = async () => {
    try {
      const response = await axios.post(`${urlBackend}/api/split-table`, { filePaths: imageUrls });
      console.log("response", response);
      setTableImages(response.data.filePaths || []);
    } catch (error) {
      console.error(error);
      alert("Failed to process the file.");
    }
  };

  const handleDeleteTable = (i) => {
    if (confirm("Are you sure you want to delete this table?")) {
      const updatedTables = tableImages.filter((_, idx) => idx !== i);
      setTableImages(updatedTables);
    }
  };

  return (
    <div className="flex flex-col relative h-full">
      <h2 className="text-lg font-semibold mb-2 text-center">Split Table View</h2>
      <div className="flex justify-center mb-4">
        <Button variant="contained" color="primary" onClick={splitTable}>
          Split Table
        </Button>
      </div>

      <div className="flex flex-row w-full h-full">
        {!isHidden && imageUrls.length > 0 && (
          <div className="w-[300px] flex flex-col items-center absolute top-0 right-0 p-4 border-l bg-white shadow-lg z-50 transition-transform">
            <button
              onClick={() => setIsHidden(true)}
              className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full shadow-md hover:bg-gray-600 transition"
            >
              &lt;
            </button>
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-3 gap-1 mt-2">
                {imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={`${urlBackend}/public/${url}?time=${new Date().getTime()}`}
                    alt="Uploaded file"
                    className={`w-[70px] h-[70px] object-cover border rounded shadow-sm cursor-pointer ${i === index ? "ring-2 ring-blue-500" : ""}`}
                    onClick={() => setIndex(i)}
                  />
                ))}
              </div>
              <img
                src={`${urlBackend}/public/${imageUrls[index]}?time=${new Date().getTime()}`}
                alt="Uploaded file"
                className="w-full max-w-[400px] h-auto border rounded shadow-md mt-2"
              />
            </div>
          </div>
        )}
        {isHidden && (
          <button
            onClick={() => setIsHidden(false)}
            className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full shadow-md hover:bg-gray-600 transition"
          >
            &gt;
          </button>
        )}

        <div className="flex-1 flex flex-col items-center p-4 space-y-6">
          {tableImages.map((url, i) => (
            <div key={i} className="relative w-full max-w-3xl flex justify-center">
              <button
                onClick={() => handleDeleteTable(i)}
                className="absolute top-0 -right-9 bg-red-500 text-white text-sm px-2 py-1 rounded-full shadow-md hover:bg-red-600 transition z-10"
              >
                🗑
              </button>
              <img
                src={`${urlBackend}/public/${url}?time=${new Date().getTime()}`}
                alt="Image didn't split"
                className="w-full h-auto max-h-[1000px] border-4 border-blue-400 shadow-lg object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
