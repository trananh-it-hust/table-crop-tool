import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import CropTableManual from "./CropTableManual";
import { useCells } from "../context/cellContext";

export default function TableSplitView({ index, item, config, tableImages, nameHotel, setDataItem }) {
  if (!item || !item.cells) {
    console.error(`Invalid item at index ${index}:`, item);
    return <div className="text-red-500">Error: Invalid Data</div>;
  }
  const [nameRoom] = useState(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]);
  const urlBackend = import.meta.env.VITE_API_SERVER ?? "";
  const [image, setImage] = useState(item.image);
  const { cells: cellContext, addCell } = useCells();

  const [showCropPopup, setShowCropPopup] = useState(false);
  const [cells, setCells] = useState(null);
  const [originalCells, setOriginalCells] = useState(null);
  const handleOpenPopup = () => {
    setShowCropPopup(true);
  };

  const handleClosePopup = () => {
    setShowCropPopup(false);
  };

  const handleApply = async () => {
    console.log("tableImages", item.image);
    setImage(item.image);
    setShowCropPopup(false);
  };

  const handleDeleteRow = (row) => {
    const newCells = cells.filter((_, i) => i !== row);
    setCells(newCells);
    addCell(index, newCells);
  };

  const handleDeleteColumn = (col) => {
    const newCells = cells.map((r) => r.filter((_, i) => i > col));
    setCells(newCells);
    addCell(index, newCells);
  };

  const resetCells = () => {
    setCells(originalCells);
    addCell(index, originalCells);
  };

  useEffect(() => {
    const maxCols = Math.max(...item.cells.map((cell: any) => cell.group_column));
    const maxRows = Math.max(...item.cells.map((cell: any) => cell.group_row));
    const newcells = Array.from({ length: maxRows + 1 }, () => Array.from({ length: maxCols + 1 }, () => null));
    item.cells.forEach((cell: any) => {
      newcells[cell.group_row][cell.group_column] = cell;
    });
    setCells(newcells);
    addCell(index, newcells);
    setOriginalCells(newcells);
  }, [item]);


  return (
    <div className="flex flex-col relative border p-4 rounded-lg shadow-md">
      <div className="inline-block relative">
        <img src={`${urlBackend}/public/${image}?time=${new Date().getTime()}`} alt="Uploaded file" className="w-auto h-auto border shadow-md" />
      </div>
      <div className="flex flex-row gap-4">
        <div className="flex flex-col gap-2 items-center justify-center p-5">
          <div className="flex flex-row gap-3 items-center justify-center">
            <div className="flex flex-col relative h-full">
              {/* Button to open popup */}
              <button
                onClick={handleOpenPopup}
                className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
              >
                Open Crop Tool
              </button>

              {/* Popup overlay */}
              {showCropPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-gray-100 rounded-lg p-6 w-[80vw] h-[95vh] mx-4 flex flex-col justify-around">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Crop Image Manual</h2>
                      <button onClick={handleClosePopup} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="relative w-full h-[85%]">
                      <CropTableManual
                        image={`${urlBackend}/public/${tableImages[index]}?time=${new Date().getTime()}`}
                        nameHotel={nameHotel}
                        tableImages={tableImages}
                        index={index}
                        setDataItem={setDataItem}
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button onClick={handleClosePopup} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                        Cancel
                      </button>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={handleApply}>
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        {cells && (
          <div className="relative">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-48"></th> {/* Empty cell for room selection column */}
                    {cells && cells[0] ? cells[0].map((_, j) => (
                    <th key={`column-${j}`} className="p-2">
                      <button className="text-xs bg-red-500 text-white hover:bg-red-600 px-2 py-1" onClick={() => handleDeleteColumn(j)}>
                      X
                      </button>
                    </th>
                    )) : null}
                  <th className="w-24"></th> {/* Empty cell for delete row column */}
                </tr>
              </thead>
              <tbody>
                {cells.map((row, i) => {
                  if (cells[i].length === 0) {
                    return null;
                  }
                  return (
                    <tr key={i} className="border-b">
                      <td className="p-2">
                        <select
                          className="w-full border p-2 rounded-md"
                          value={nameRoom[i]}
                          onChange={(e) => {
                            const newName = e.target.value;
                            const newCells = cells.map((row, j) =>
                              row.map((cell) => (cell && cell.group_row === i ? { ...cell, name: newName } : cell)),
                            );
                            setCells(newCells);
                          }}
                        >
                          <option value="">Select Room</option>
                          {nameRoom.map((name, j) => (
                            <option key={j} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </td>
                      {row.map((cell, j) => (
                        <td key={j} className="p-2">
                          {cell && (
                            <div className="flex items-center justify-center">
                              <div>
                                <img
                                  src={`${urlBackend}/public/${cell.path}?time=${new Date().getTime()}`}
                                  alt="Uploaded file"
                                  className="max-w-full h-auto shadow-md"
                                />
                              </div>
                            </div>
                          )}
                        </td>
                      ))}
                      <td className="p-1">
                        <button className="text-xs bg-red-500 text-white hover:bg-red-600 px-2 py-1" onClick={() => handleDeleteRow(i)}>
                          X
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-4">
              <button
                className="bg-blue-500 text-white font-semibold py-1 px-6 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
                onClick={resetCells}
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
