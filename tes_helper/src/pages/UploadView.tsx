import { useState } from "react";
import axios from "axios";

export default function UploadView(prop) {
  const { imageUrls, setImageUrls, nameHotel , setNameHotel } = prop;
  const urlBackend = import.meta.env.VITE_API_SERVER;
  const [fileType, setFileType] = useState("image");
  const [index, setIndex] = useState(0);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const fileIndex = selectedFile.name.lastIndexOf(".");
    const fileName = fileIndex !== -1 ? selectedFile.name.substring(0, fileIndex) : selectedFile.name;
    setNameHotel(fileName);

    console.log("fileName", fileName);
    console.log("urlBackend", urlBackend);
    console.log("file", selectedFile);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", fileType);
      formData.append("nameHotel", fileName);

      const response = await axios.post(`${urlBackend}/api/upload-img`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("response", response);
      setImageUrls(response.data.filePaths || []);
    } catch (error) {
      console.error(error);
      alert("Failed to process the file.");
    }
  };

  return (
    <div className="flex flex-col relative h-full">
      <h2 className="text-lg font-semibold mb-2 text-center">Upload File and Process</h2>
      <div className="flex flex-col p-4 relative">
        <div className="flex items-center gap-2">
          <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="p-2 border rounded flex-[1]">
            <option value="pdf">PDF</option>
            <option value="image">Image</option>
          </select>

          <input
            type="file"
            accept={fileType === "pdf" ? ".pdf" : "image/*"}
            onChange={handleFileChange}
            className="p-2 border rounded flex-[3] cursor-pointer"
          />
        </div>

        {imageUrls.length > 0 && (
          <div className="p-2">
            <strong className="text-sm">Name Hotel:</strong>
            <input type="text" value={nameHotel} className="w-full p-2 border rounded mb-2" readOnly />

            <div className="flex flex-col items-center">
              <div className="grid grid-cols-3 gap-1 mt-2">
                {imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={`${urlBackend}/public/${url}?time=${new Date().getTime()}`}
                    alt="Uploaded file"
                    className={`w-[100px] h-[100px] object-cover border rounded shadow-sm cursor-pointer 
                  ${i === index ? "ring-2 ring-blue-500" : ""}`}
                    onClick={() => setIndex(i)}
                  />
                ))}
              </div>

              <img
                src={`${urlBackend}/public/${imageUrls[index]}?time=${new Date().getTime()}`}
                alt="Uploaded file"
                className="w-full max-w-[800px] h-auto border rounded shadow-md mt-2"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
