import GroupView from "./pages/GroupView";
import SplitCellView from "./pages/SplitCellView";
import SplitTableView from "./pages/SplitTableView";
import UploadView from "./pages/UploadView";
import { useState } from "react";
import { CellsProvider } from "./context/cellContext";

function App() {
  const [imageUrls, setImageUrls] = useState([]);
  const [tableImages, setTableImages] = useState([]);
  const [stage, setStage] = useState(0);
  const [nameHotel, setNameHotel] = useState("");

  const stages = ["Upload", "Split Table", "Split Cell", "Group"];

  return (
    <CellsProvider>
      <div className="relative min-h-screen p-4">
        <div className="flex justify-center items-center mb-6 gap-2">
          {stages.map((label, i) => (
            <div key={i} className="flex items-center">
              <button
                onClick={() => setStage(i)}
                className={`w-32 text-center py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200
          ${stage === i ? "bg-blue-500 text-white shadow-md" : "bg-gray-300 text-gray-700 hover:bg-gray-400"}
        `}
              >
                {label}
              </button>
              {i < stages.length - 1 && <div className="w-8 h-1 bg-gray-400 mx-2"></div>}
            </div>
          ))}
        </div>

        {/* Render UI theo stage */}
        {stage === 0 && <UploadView imageUrls={imageUrls} nameHotel={nameHotel} setImageUrls={setImageUrls} setNameHotel={setNameHotel} />}
        {stage === 1 && <SplitTableView imageUrls={imageUrls} tableImages={tableImages} setTableImages={setTableImages} />}
        {stage === 2 && <SplitCellView imageUrls={imageUrls} tableImages={tableImages} nameHotel={nameHotel} />}
        {stage === 3 && <GroupView />}
        <div className="fixed bottom-6 left-0 right-0 flex justify-between px-6">
          {stage > 0 && (
            <button
              onClick={() => setStage(stage - 1)}
              className="bg-gray-500 text-white px-5 py-3 font-semibold rounded-lg shadow-md hover:bg-gray-600 transition"
            >
              Back
            </button>
          )}
          {stage < 3 && (
            <button
              onClick={() => setStage(stage + 1)}
              className="bg-blue-500 text-white px-5 py-3 font-semibold rounded-lg shadow-md hover:bg-blue-600 transition ml-auto"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </CellsProvider>
  );
}

export default App;
