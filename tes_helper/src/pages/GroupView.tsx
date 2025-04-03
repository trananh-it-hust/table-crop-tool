import { useEffect, useState } from "react";
import axios from "axios";
import { useCells } from "@/context/cellContext";

export default function GroupView(prop) {
  const { cells, addCell } = useCells();
  const [groupedCells, setGroupedCells] = useState([]);
  const [mappedCells, setMappedCells] = useState([]);
  const [cellsView, setCellsView] = useState([]);
  const urlBackend = import.meta.env.VITE_API_SERVER ?? "";

  useEffect(() => {
    const updatedCellsView: Array<Array<Array<string[]>>> = [];
    if (cells) for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (cell) for (let j = 0; j < cell.length; j++) {
        const cellItem = cell[j];
        if (cellItem) for (let k = 0; k < cellItem.length; k++) {
          const cellData = cellItem[k];
          if (cellData) {
            const { group_row, group_column, path } = cellData;
            if (!updatedCellsView[k]) {
              updatedCellsView[k] = [];
            }
            if (!updatedCellsView[k][group_row]) {
              updatedCellsView[k][group_row] = [];
            }
            if (!updatedCellsView[k][group_row][group_column]) {
              updatedCellsView[k][group_row][group_column] = [];
            }
            updatedCellsView[k][group_row][group_column].push(path);
          }
        }
      }
    }
    setCellsView(updatedCellsView);
  }, [cells]);

  const handleGroup = async () => {
    try {
      const paths = [];
      for (let i = 0; i < cellsView.length; i++) {
        const cell = cellsView[i];
        if (cell) for (let j = 0; j < cell.length; j++) {
          const cellItem = cell[j];
          if (cellItem) for (let k = 0; k < cellItem.length; k++) {
            const cellData = cellItem[k];
            if (cellData) for (let l = 0; l < cellData.length; l++) {
              const path = cellData[l];
              if (path) {
                paths.push(path);
              }
            }
          }
        }
      }
      const response = await axios.post(`${urlBackend}/api/group-cells`, {
        paths: paths,
      });
      const responseData = response.data;
      console.log("responseData", responseData);
      setGroupedCells(responseData);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to process the file.");
    }
  };

  return (
    <div className="flex flex-col relative h-full">
        <h2 className="text-lg font-semibold mb-2 text-center">Group View</h2>
        <button
          onClick={handleGroup}
          className="bg-blue-500 text-white px-5 py-3 font-semibold rounded-lg shadow-md hover:bg-blue-600 transition mb-4"
        >
          Group Cells
        </button>
        {
          groupedCells && Object.keys(groupedCells).length > 0 ? (
            <div className="flex flex-col gap-4">
              {Object.entries(groupedCells).map(([key, images]) => (
                <div key={key} className="border p-2">
                  <h3 className="text-lg font-semibold">{key}</h3>
                  <div className="flex flex-wrap gap-2">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        src={`${urlBackend}/public/${image}?time=${new Date().getTime()}`}
                        alt={`Image ${index}`}
                        className="w-[20px] h-[20px] object-cover"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No images available.</p>
          )
        }
    </div>
  );
}
