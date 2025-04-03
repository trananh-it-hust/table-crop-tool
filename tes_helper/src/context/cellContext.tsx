import { createContext, useContext, useState } from "react";

const CellsContext = createContext(null);

export const CellsProvider = ({ children }) => {
    const [cells, setCells] = useState([]);
    
    const addCell = (index,cell) => {
        setCells((prevCells) => {
            const newCells = [...prevCells];
            newCells[index] = cell;
            return newCells;
        });
    }
    const deleteCell = () => {
        setCells([]);
    }

    return (
        <CellsContext.Provider value={{ cells, addCell, deleteCell }}>
            {children}
        </CellsContext.Provider>
    );
};

export const useCells = () => {
    const context = useContext(CellsContext);
    if (!context) {
        throw new Error("useCells must be used within a CellsProvider");
    }
    return context;
};
