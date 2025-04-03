import TableSplitView from "@/components/TableSplitView";
import { useEffect, useState } from "react";
import { useCells } from "@/context/cellContext";

export default function SplitCellView({ imageUrls = [], tableImages = [], nameHotel }) {
  const urlBackend = import.meta.env.VITE_API_SERVER ?? "";
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({});
  const [index, setIndex] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const {deleteCell} = useCells();
  const handleSplit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${urlBackend}/api/split-cells-aws`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: tableImages}),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      console.log("responseData", responseData);
      setData(responseData || []);
      deleteCell();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to process the file.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${urlBackend}/api/config/${nameHotel}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const responseData = await response.json();
        setConfig(responseData || {});
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to fetch config data.");
      }
    };
    fetchConfig();
  }, [nameHotel]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const setDataItem = (index, item) => {
    console.log("setDataItem", index, item);
    console.log("data", data);
    setData(prevData => {
        const newData = [...prevData];
        newData[index] = item;
        return newData;
    });
};


  return (
    <div className="flex flex-col min-h-screen p-4 relative">
      <div className="flex flex-col items-center ">
      <h2 className="font-bold text-gray-800 mb-6">Split Cell View</h2>
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
      <button
        className="bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 mb-8"
        onClick={handleSplit}
      >
        Split Cell
      </button>
      </div>
      {
        data.length > 0 && (
          <div className="flex flex-col gap-4">
            {data.map((url, i) => (<TableSplitView key={i} index={i} item={url} config={config} tableImages = {tableImages} nameHotel = {nameHotel} setDataItem={setDataItem}/>
            ))}
          </div>
        )
      }

    </div>
  );
}
