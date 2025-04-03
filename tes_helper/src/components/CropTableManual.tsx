import { useState, useRef, useEffect } from "react";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function CropTableManual({ image ,tableImages, index, nameHotel, setDataItem }) {
  const [src, setSrc] = useState(image);
  const [crop, setCrop] = useState({
    
  });
  const [completedCrop, setCompletedCrop] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [preview, setPreview] = useState(null);
  const imgRef = useRef(null);

  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);

  const urlBackend = import.meta.env.VITE_API_SERVER ?? "";

  const onLoad = (img) => {
    imgRef.current = img;
  };

  const handleSplit = async () => {
    try {
      console.log("completedCrop", completedCrop);
      const [x,y,width,height] = [completedCrop.x, completedCrop.y, completedCrop.width, completedCrop.height];
      if (cols <= 0 || rows <= 0) {
        alert("Columns and Rows must be greater than 0");
        return;
      }
      const config = {
        x,
        y,
        width,
        height,
        cols,
        rows,
      };
      const response = await fetch(`${urlBackend}/api/split-cells`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: [tableImages[index]], config: config, nameHotel: nameHotel }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseJson = await response.json();
      

      let preview = responseJson[0].image;
      preview = `${urlBackend}/public/${preview}?time=${new Date().getTime()}`;
      setPreview(preview);
      setDataItem(index, responseJson[0]);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to process the file.");
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
        setCols(responseData.cols);
        setRows(responseData.rows);
        setCompletedCrop({
          x: responseData.x,
          y: responseData.y,
          width: responseData.width,
          height: responseData.height,
        });
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to fetch config data.");
      }
    };
    fetchConfig();
  }, [nameHotel]);

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-gray-100 h-full w-full">
      {/* Khu vực crop ảnh */}
      <div className="w-full overflow-hidden bg-white p-4 rounded-lg shadow">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={src}
            onLoad={(e) => onLoad(e.target)}
          />
        </ReactCrop>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {completedCrop && (
              <div className="flex p-4 gap-2">
                <p>X: {Math.round(completedCrop.x)}</p>
                <p>Y: {Math.round(completedCrop.y)}</p>
                <p>Width: {Math.round(completedCrop.width)}</p>
                <p>Height: {Math.round(completedCrop.height)}</p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2 items-center">
          <label>Columns</label>
          <input type="number" value={cols} onChange={(e) => setCols(e.target.value)} className="border p-2 rounded-md" />
          <label>Rows</label>
          <input type="number" value={rows} onChange={(e) => setRows(e.target.value)} className="border p-2 rounded-md" />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={() => {
              console.log(completedCrop);
              handleSplit();
            }}
          >
            Manual Crop
          </button>
        </div>
        
      </div>

      {/* Khu vực hiển thị preview */}
      <div className="w-full overflow-hidden bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Preview</h3>
        <img
          src={preview}
          className="w-full h-auto border border-gray-300"
          style={{
            display: preview ? 'block' : 'none',
          }}
        />
      </div>
    </div>
  );
}
